const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const VIDEO_PATH = './nameofking.mkv';
const PORT = 6969;

let videoState = {
  isPlaying: false,
  currentTime: 0
};

app.get('/public/style.css', (req, res) => {
  res.set('Content-Type', 'text/css');
  res.sendFile(__dirname + '/public/style.css');
});
app.use(express.static('public', {extended: true}));

app.get('/video', (req, res) => {
  const videoPath = path.resolve(VIDEO_PATH);
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
      'Content-Type': 'video/mkv',
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

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
  console.log(`Socket ${socket.id} connected`);

  socket.emit('video state', videoState);

  socket.on('chat message', (message) => {
    console.log(`Socket ${socket.id} sent message: ${message}`);
    io.emit('chat message', message);
  });

  socket.on('play video', () => {
    videoState.isPlaying = true;
    io.emit('video state', videoState);
  });

  socket.on('pause video', () => {
    videoState.isPlaying = false;
    io.emit('video state', videoState);
  });

  socket.on('set current time', (currentTime) => {
    videoState.currentTime = currentTime;
    io.emit('video state', videoState);
  });

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
