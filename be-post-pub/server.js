const { io } = require('socket.io-client');
const { faker } = require('@faker-js/faker');
const Post = require('./models/Post');

const socket = io('http://localhost:3001');

function generatePost() {
    return new Post(
        faker.lorem.sentence(),
        faker.lorem.paragraph()
    );
}

setInterval(() => {
    const post = generatePost();
    socket.emit('new-post', post);
    console.log('Published post:', post);
}, 1000);