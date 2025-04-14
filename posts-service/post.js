const express = require("express");
const http = require("http");
const cors = require("cors");
const { expressMiddleware } = require("@apollo/server/express4");
const { ApolloServer } = require("@apollo/server");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");
const bodyParser = require("body-parser");
const { PrismaClient } = require("@prisma/client");
const pubsub = require("./pubsub");

const prisma = new PrismaClient();
const app = express(); 
app.use(express.json()); 

const PORT = 4002;

app.post('/example', (req, res) => {
  console.log(req.body);
  res.send('Body received');
});

const typeDefs = `
  type Post {
    id: ID!
    title: String!
    content: String!
  }

  type Query {
    posts: [Post]
    post(id: ID!): Post
  }

  type Mutation {
    createPost(title: String!, content: String!): Post
    updatePost(id: ID!, title: String!, content: String!): Post
    deletePost(id: ID!): Post
    resetPostSequence: Boolean
  }

  type Subscription {
    postAdded: Post
    postUpdated: Post
    postDeleted: Post
  }
`;

const resolvers = {
  Query: {
    posts: async () => await prisma.post.findMany(),
    post: async (_, { id }) => await prisma.post.findUnique({ where: { id: parseInt(id) } }),
  },
  Mutation: {
    createPost: async (_, args) => {
      try {
        const newPost = await prisma.post.create({ data: args });
        pubsub.publish('POST_ADDED', { postAdded: newPost });
        return newPost;
      } catch (error) {
        console.error("Error creating post:", error.message);
        throw new Error("Failed to create post.");
      }
    },

    updatePost: async (_, { id, title, content }) => {
      try {
        const updatedPost = await prisma.post.update({
          where: { id: parseInt(id) },
          data: {
            ...(title && { title }),
            ...(content && { content })
          },
        });
        pubsub.publish('POST_UPDATED', { postUpdated: updatedPost });
        return updatedPost;
      } catch (error) {
        console.error("Error updating post:", error.message);
        throw new Error(`Failed to update post: ${error.message}`);
      }
    },

    deletePost: async (_, { id }) => {
      try {
        const existingPost = await prisma.post.findUnique({
          where: { id: parseInt(id) },
        });
        
        if (!existingPost) {
          throw new Error(`Post with ID ${id} not found`);
        }

        const deletedPost = await prisma.post.delete({
          where: { id: parseInt(id) },
        });
        pubsub.publish('POST_DELETED', { postDeleted: deletedPost });
        return deletedPost;
      } catch (error) {
        console.error("Error deleting post:", error.message);
        throw new Error(`Failed to delete post: ${error.message}`);
      }
    },
    
    resetPostSequence: async () => {
      try {
        // Delete all posts
        await prisma.post.deleteMany();
        
        // Reset the sequence
        await prisma.$executeRaw`ALTER SEQUENCE "Post_id_seq" RESTART WITH 1`;
        
        return true;
      } catch (error) {
        console.error("Error resetting sequence:", error);
        throw new Error("Failed to reset sequence");
      }
    },
  },
  Subscription: {
    postAdded: {
      subscribe: () => pubsub.asyncIterableIterator('POST_ADDED'),
    },
    postUpdated: {
      subscribe: () => pubsub.asyncIterableIterator('POST_UPDATED'),
    },
    postDeleted: {
      subscribe: () => pubsub.asyncIterableIterator('POST_DELETED'),
    },
  },
};

async function startApolloServer() {
  app.use(cors());
  app.use(bodyParser.json());

  const httpServer = http.createServer(app);
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const serverCleanup = useServer({ schema }, wsServer);

  const apolloServer = new ApolloServer({
    schema,
    plugins: [{
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          }
        };
      }
    }]
  });

  await apolloServer.start();
  app.use("/graphql", expressMiddleware(apolloServer));

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`📡 Subscriptions ready at ws://localhost:${PORT}/graphql`);
  });
}

startApolloServer();
