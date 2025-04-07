const amqp = require('amqplib');
require('dotenv').config();

function generatePost() {
  return {
    title: `Post ${Date.now()}`,
    content: `Content ${Math.random().toString(36).substring(7)}`
  };
}

async function startPublisher() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();
  
  await channel.assertQueue(process.env.QUEUE_NAME, { durable: true });

  setInterval(() => {
    const post = generatePost();
    channel.sendToQueue(
      process.env.QUEUE_NAME,
      Buffer.from(JSON.stringify(post)),
      { persistent: true }
    );
    console.log(`📤 Published: ${post.title}`);
  }, 3000);
}

startPublisher().catch(console.error);
