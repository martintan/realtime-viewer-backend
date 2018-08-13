const http = require('http');
const app = require('./app');
const openSocket = require('socket.io');

const port = process.env.PORT || 8000;

const server = http.createServer(app);

const io = openSocket(server);

server.listen(port);

io.on('connection', socket => {
  console.log(`client connected: ${socket.request.connection.remoteAddress}`);
  socket.on('giveChange', changes => {
    socket.broadcast.emit('receivedChange', changes);
  });
});