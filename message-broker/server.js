const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const cors = require('cors');

app.use(cors());
app.use(express.json());

const PORT = 3001;

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('new-post', (post) => {
    io.emit('post-created', post);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

http.listen(PORT, () => {
  console.log(`Message broker running on port ${PORT}`);
});