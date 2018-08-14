const http = require('http');
const app = require('./app');
const openSocket = require('socket.io');
const generateName = require('sillyName');

const port = process.env.PORT || 8000;

const server = http.createServer(app);

const io = openSocket(server);

server.listen(port);

var clients = [];

io.on('connection', socket => {
  console.log(`client connected: ${socket.request.connection.remoteAddress}`);
  clients.push({
    socket: socket,
    name: generateName() + " (Anonymous)"
  });
  console.log(clients.map(c => c.name));
  io.sockets.emit('connectionChanges', clients.map(c => c.name));
  socket.on('giveChange', changes => {
    socket.broadcast.emit('receivedChange', changes);
  });
  socket.on('disconnect', () => {
    console.log(`client disconnected: ${socket.request.connection.remoteAddress}`);
    clients = clients.filter(c => c.socket != socket);
    console.log(clients.map(c => c.name));
    io.sockets.emit('connectionChanges', clients.map(c => c.name));
  });
});