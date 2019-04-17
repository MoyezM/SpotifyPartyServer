const auth = require('./auth');
const express = require("express");
const app = express();
const socket = require('socket.io')

app.use('/', auth)
console.log('Listening on 8888');

const queue= [];

// Finds songs in the queue
let findSong = (songArray, uri) => {
  if (!songArray) {
    return -1;
  }
  for (let i in songArray) {
    if (songArray[i].uri === uri) {
      return i
    }
  }
  return -1
}

let getSong = (songQuery) => {
  io.emit('getSongFromClient', (songQuery));
}

let updateQueue = (queue) => {
  io.emit('queueUpdated', queue)
}

// Creates the server on port 8888
const server = app.listen(8888, '0.0.0.0');

// Creates the socket on that server
var io = socket(server);


io.on('connection', (socket) => {
  console.log("MADE A CONNECTION")
  console.log(socket.id);

  updateQueue();

  socket.on('getSong', (songQuery) => {
    console.log(songQuery);
    let songSearch = {
      socketId: socket.id,
      query: songQuery
    }
    getSong(songSearch);
  });

  socket.on('songResults', (songResults) => {
    console.log(songResults.socketId)
    io.to(`${songResults.socketId}`).emit('songResults', songResults.result);
  })

  socket.on('addToQueue', (song) => {
    let isInQueue = false;
    for (let QueueSong of queue) {
      if (QueueSong.song === song.song) {
        isInQueue = true;
      }
    }
    if (!isInQueue) {
      queue.push(song);
    }
    updateQueue(queue);
  })

  socket.on('getQueue', () => {
    updateQueue(queue)
  })

  socket.on('vote', (voteData) => {
    console.log(voteData)
    let uri = voteData.uri;
    let index = findSong(queue, uri);
    console.log(queue[index]);
    queue[index].votes = queue[index].votes + voteData.vote;
    console.log(queue[index]);
    updateQueue(queue);
  })
})

