const { ApolloServer, PubSub } = require('apollo-server');
const { v4: uuidv4 } = require('uuid');

const pubsub = new PubSub();
const POST_ADDED = 'POST_ADDED';

const users = [
  { id: '1', name: 'John' },
  { id: '2', name: 'Alice' }
];

const posts = [];

const typeDefs = `
  type User {
    id: ID!
    name: String!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    userId: ID!
  }

  type Query {
    users: [User!]!
    posts(userId: ID!): [Post!]!
  }

  type Mutation {
    createPost(title: String!, content: String!, userId: ID!): Post!
  }

  type Subscription {
    postAdded: Post!
  }
`;

const resolvers = {
  Query: {
    users: () => users,
    posts: (_, { userId }) => posts.filter(post => post.userId === userId)
  },
  Mutation: {
    createPost: (_, { title, content, userId }) => {
      const newPost = { id: uuidv4(), title, content, userId };
      posts.push(newPost);
      pubsub.publish(POST_ADDED, { postAdded: newPost });
      return newPost;
    }
  },
  Subscription: {
    postAdded: {
      subscribe: () => pubsub.asyncIterator([POST_ADDED])
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen(4000).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
