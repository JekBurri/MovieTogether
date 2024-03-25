const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

const server = http.createServer(app);

const room = {
    players: [
        { id: 1, name: 'Player 1', score: 0, color: 'red' },
    ],
    chatMessages: [
        { id: 1, message: 'Hello', senderId: 1 },
    ],
    movie: {
        playing: false,
        timestamp: 0,
    }
}

const VIDEO_PATH = './MOVIE_HERE/21.mp4'

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User: ' + socket.id + ' connected');
  io.emit('updatemessages', room.chatMessages);
  io.emit('updatemovie', room.movie);



  socket.on('disconnect', () => {
    console.log('User: ' + socket.id + ' disconnected');
  });

  socket.on('chat message', (message) => {
    console.log('message: ' + message);
    io.emit('chat message', message);
  });

  socket.on('play video', (timestamp) => {
    console.log('play video: ' + timestamp);
    room.movie.playing = true;
    room.timestamp = timestamp;
    io.emit('play video', room);
  });

  socket.on('pause video', (timestamp) => {
    console.log('pause video: ' + timestamp);
    room.movie.playing = false;
    room.timestamp = timestamp;
    io.emit('pause video', room);
  });

  socket.on('sendmessage', (message) => {
    console.log('sendmessage: ' + JSON.stringify(message));
    room.chatMessages.push(message);
    io.emit('updatemessages', room.chatMessages);
  });
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/video', (req, res) => {
    const videoPath = path.resolve(__dirname, 'MOVIE_HERE', '21.mp4'); // Adjust the path accordingly
    const videoSize = fs.statSync(videoPath).size;
    const range = req.headers.range;
  
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
  
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': videoSize,
        'Content-Type': 'video/mp4',
      };
  
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  });


server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
