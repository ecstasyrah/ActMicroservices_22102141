const { io } = require('socket.io-client');
const axios = require('axios');

const socket = io('http://localhost:3001');

socket.on('post-created', async (post) => {
  try {
    const mutation = `
      mutation {
        createPost(title: "${post.title}", content: "${post.content}") {
          id
          title
          content
        }
      }
    `;

    await axios.post('http://localhost:4002/graphql', {
      query: mutation
    });

    console.log('Post persisted:', post);
  } catch (error) {
    console.error('Error persisting post:', error.message);
  }
});