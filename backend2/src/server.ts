import 'dotenv';
import * as express from 'express';
import * as socketio from 'socket.io';
import * as http from 'http';
import * as moment from 'moment';
import * as path from 'path';
import SocketEvents from './config/SocketEvents';
import { Socket } from 'socket.io';
import { handleChangeState, handleDisconnectGame, handleJoinGame } from './service/SocketHandlerService';

const app = express();
const server = http.createServer(app);
const io = socketio(server, { path: '/api/socket.io' });

app.use((request, result, next) => {
  result.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// serve UI
app.use(express.static(path.join(__dirname, 'web')));
app.get('*', (req, res, next) => {
  res.sendFile(path.join(__dirname + '/web/index.html'));
});

io.on(SocketEvents.CONNECTION, (socket: Socket) => {
  console.log(moment().format() + ': connected - ' + socket.id);

  socket.on(SocketEvents.JOIN_GAME, handleJoinGame(socket));

  socket.on(SocketEvents.CHANGE_STATE, handleChangeState(socket));

  socket.on(SocketEvents.DISCONNECT, handleDisconnectGame(socket));
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`${moment().format()}: Server has been started on port ${PORT}`);
});
