const { ApolloServer, PubSub } = require('apollo-server');
const { v4: uuidv4 } = require('uuid');

const pubsub = new PubSub();
const POST_ADDED = 'POST_ADDED';

let users = [
  { id: '1', name: 'John' },
  { id: '2', name: 'Alice' }
];

let posts = [
    { id: '101', title: 'First Post', content: 'This is the first post.', userId: '1' },
    { id: '102', title: 'Second Post', content: 'This is the second post.', userId: '2' }
];

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
    posts: [Post!]!
  }

  type Mutation {
    createPost(title: String!, content: String!, userId: ID!): Post!
    deletePost(id: ID!): Post!
    updatePost(id: ID!, title: String!, content: String!): Post!
  }

  type Subscription {
    postAdded: Post!
  }
`;

const resolvers = {
  Query: {
    users: () => users,
    posts: () => posts,
  },
  Mutation: {
    createPost: (_, { title, content, userId }) => {
      const newPost = { id: uuidv4(), title, content, userId };
      posts.push(newPost);
      pubsub.publish(POST_ADDED, { postAdded: newPost });
      return newPost;
    },
    deletePost: (_, { id }) => {
        const postIndex = posts.findIndex(post => post.id === id);
        if (postIndex === -1) {
            throw new Error(`Post with ID ${id} not found`);
        }
        const deletedPost = posts.splice(postIndex, 1)[0];
        return deletedPost;
    },
    updatePost: (_, { id, title, content }) => {
        const postIndex = posts.findIndex(post => post.id === id);
        if (postIndex === -1) {
            throw new Error(`Post with ID ${id} not found`);
        }
        posts[postIndex] = { ...posts[postIndex], title, content };
        return posts[postIndex];
    }
  },
  Subscription: {
    postAdded: {
      subscribe: () => pubsub.asyncIterator([POST_ADDED])
    }
  },
  User: {
    posts: (user) => posts.filter(post => post.userId === user.id)
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen(4000).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
