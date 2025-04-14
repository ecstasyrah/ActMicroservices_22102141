// Add at the top with other imports
const { RateLimiter } = require('limiter');
const limiter = new RateLimiter({ tokensPerInterval: 1, interval: "second" });

// In your mutation resolvers
const resolvers = {
  Mutation: {
    createPost: async (_, args) => {
      await limiter.removeTokens(1);
      // ... rest of createPost code ...
    },
    updatePost: async (_, { id, title, content }) => {
      await limiter.removeTokens(1);
      // ... rest of updatePost code ...
    },
    deletePost: async (_, { id }) => {
      await limiter.removeTokens(1);
      // ... rest of deletePost code ...
    },
  },
  // ... other resolvers ...
};