const amqp = require('amqplib');
const { request } = require('graphql-request');
require('dotenv').config();

const MUTATION = `
  mutation CreatePost($title: String!, $content: String!) {
    createPost(title: $title, content: $content) {
      id
      title
      content
    }
  }
`;

async function startConsumer() {
  const amqp = require('amqplib');
  const { GraphQLClient } = await import('graphql-request'); 
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();
  
  await channel.assertQueue(process.env.QUEUE_NAME, { durable: true });

  channel.consume(process.env.QUEUE_NAME, async (msg) => {
    const post = JSON.parse(msg.content.toString());
    
    try {
      const result = await request(process.env.GRAPHQL_SERVER_URL, MUTATION, post);
      console.log(`💾 Persisted post ID: ${result.createPost.id}`);
      channel.ack(msg);
    } catch (error) {
      console.error(`❌ Error persisting post: ${error.message}`);
      channel.nack(msg);
    }
  });
}

startConsumer().catch(console.error);
