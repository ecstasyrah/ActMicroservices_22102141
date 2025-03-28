const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const typeDefs = `#graphql
  type Post {
    id: Int!
    title: String!
    content: String!
    createdAt: String!
  }

  type Query {
    posts: [Post]
    post(id: Int!): Post
  }

  type Mutation {
    createPost(title: String!, content: String!): Post
    updatePost(id: Int!, title: String, content: String): Post
    deletePost(id: Int!): Post
    truncatePosts: Boolean
  }
`;

const resolvers = {
  Query: {
    posts: async () => {
      try {
        const posts = await prisma.post.findMany();
        console.log('Fetched posts:', posts);
        return posts;
      } catch (error) {
        console.error('Error fetching posts:', error);
        throw new Error(`Failed to fetch posts: ${error.message}`);
      }
    },
    post: async (_, { id }) => {
      try {
        const post = await prisma.post.findUnique({ where: { id } });
        console.log('Fetched post:', post);
        if (!post) {
          throw new Error(`Post with ID ${id} not found`);
        }
        return post;
      } catch (error) {
        console.error('Error fetching post:', error);
        throw new Error(`Failed to fetch post: ${error.message}`);
      }
    },
  },
  Mutation: {
    createPost: async (_, { title, content }) => {
      try {
        if (!title || !content) {
          throw new Error('Title and content are required');
        }
        const newPost = await prisma.post.create({ data: { title, content } });
        console.log('Created post:', newPost);
        return newPost;
      } catch (error) {
        console.error('Error creating post:', error);
        throw new Error(`Failed to create post: ${error.message}`);
      }
    },
    updatePost: async (_, { id, ...data }) => {
      try {
        const updatedPost = await prisma.post.update({ where: { id }, data });
        console.log('Updated post:', updatedPost);
        return updatedPost;
      } catch (error) {
        console.error('Error updating post:', error);
        throw new Error(`Failed to update post: ${error.message}`);
      }
    },
    deletePost: async (_, { id }) => {
      try {
        const deletedPost = await prisma.post.delete({ where: { id } });
        console.log('Deleted post:', deletedPost);
        return deletedPost;
      } catch (error) {
        console.error('Error deleting post:', error);
        throw new Error(`Failed to delete post: ${error.message}`);
      }
    },
    truncatePosts: async () => {
      try {
        // Truncate the Post table and reset the auto-increment counter
        await prisma.$executeRaw`TRUNCATE TABLE "Post" RESTART IDENTITY;`;
        console.log('Truncated Post table and reset auto-increment counter');
        return true;
      } catch (error) {
        console.error('Error truncating posts:', error);
        throw new Error(`Failed to truncate posts: ${error.message}`);
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return error;
  },
});

async function startServer() {
  await startStandaloneServer(server, {
    listen: { port: 4002 },
  }).then(({ url }) => {
    console.log(`Posts service ready at ${url}`);
  }).catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

startServer();