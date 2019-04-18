const auth = require('./auth');
const express = require("express");
const app = express();
const socket = require('socket.io')

app.use('/', auth)
console.log('Listening on 8888');

// The queue of songs for the app
const queue= [];
const previousQueue = [];

// Returns the index of a song in an array
// of songs based on the uri
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

let playSong = (song) => {
  io.emit('playSong', song);
}

// Sends the search query to the
// authenticated client 
let getSong = (songQuery) => {
  io.emit('getSongFromClient', (songQuery));
}

let updateQueue = (queue) => {
  io.emit('queueUpdated', queue);
}

// Locally hosts the server
const server = app.listen(8888, '0.0.0.0');

// Creates the socket on that server
var io = socket(server);


io.on('connection', (socket) => {
  console.log("MADE A CONNECTION");

  // Pushes the queue to new connections
  updateQueue();

  // Recieves the request for a song search and
  // attaches the socketID to the search so the
  // server knows where to send the data back to
  socket.on('getSong', (songQuery) => {
    let songSearch = {
      socketId: socket.id,
      query: songQuery
    }
    getSong(songSearch);
  });
  
  // Gets the results from the search query and 
  // passes it back to the client that requested it
  socket.on('songResults', (songResults) => {
    io.to(`${songResults.socketId}`).emit('songResults', songResults.result);
  });

  // Adds a song to the queue. Ensures that the 
  // song is not alread in the queue.
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

  // When the queue is requested it will sort it to
  // ensure that the votes are in the correct order
  // then it will pass it back to the users
  socket.on('getQueue', () => {
    queue.sort((a, b) => {
      return b.votes - a.votes
    })
    updateQueue(queue)
  })

  // Handles the user voting. It takes in 
  // voteData which contains an uri and a 
  // delta to change the votes on that song by
  socket.on('vote', (voteData) => {
    let uri = voteData.uri;
    let index = findSong(queue, uri);
    queue[index].votes = queue[index].votes + voteData.vote;
    queue.sort((a, b) => {
      return b.votes - a.votes
    })
    updateQueue(queue);
  })

  socket.on('previous', (currentSong) => {
    queue.unshift(currentSong);
    queue.sort((a, b) => {
      return b.votes - a.votes
    })
    const newSong = previousQueue.shift()
    playSong(newSong);
    updateQueue(queue)
  });

  socket.on('next', (currentSong) => {
    previousQueue.unshift(currentSong);
    console.log(previousQueue);
    const newSong = queue.shift();
    queue.sort((a, b) => {
      return b.votes - a.votes
    })
    playSong(newSong);
    updateQueue(queue);
  });
});
