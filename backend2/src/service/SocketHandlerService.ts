import * as moment from 'moment';
import SocketEvents from '../config/SocketEvents';
import Player from '../entity/Player';
import {gameToDto, getGame, getGameForPlayer, getPlayer, getPlayerForSocketId, joinPlayer, leavePlayer} from './GameService';
import Game from '../entity/Game';
import {Socket} from 'socket.io';
import GameState from '../entity/GameState';

const handleUpdateGame = (socket: Socket, game: Game) => {
  if (!game) return;

  const gameDto = gameToDto(game);

  socket.emit(SocketEvents.GAME_UPDATE, gameDto);
  socket.broadcast.to(game.gameKey).emit(SocketEvents.GAME_UPDATE, gameDto);
};

const handleJoinGame = (socket: Socket) => (props: { userId: string, userName: string, gameKey: string }, callback: Function) => {
  console.log(`${moment().format()}: ${SocketEvents.JOIN_GAME} ${JSON.stringify(props)}`);
  const { userId, userName, gameKey } = props;
  if (!userId || !userName || !gameKey) {
    return callback({ error: 'missing props' });
  }

  const player: Player = getPlayer(userId, userName, socket.id);

  const game: Game = getGame(gameKey);
  if (!game) {
    return callback({ error: 'game doesn\'t exist' });
  }

  joinPlayer(player, game);

  socket.join(game.gameKey);
  handleUpdateGame(socket, game);

  callback({});
};

const handleChangeState = (socket: Socket) => (props: {gameKey: string, gameState: GameState}) => {
  console.log(`${moment().format()}: ${SocketEvents.CHANGE_STATE} ${JSON.stringify(props)}`);
  const { gameKey, gameState } = props;
  const game = getGame(gameKey);
  game.state = gameState;
  if (game.state === GameState.STARTING) {
    startGameTimer(socket, game);
  }
  handleUpdateGame(socket, game);
};

const startGameTimer = (socket: Socket, game: Game) => {
  game.timer = 5;
  const intervalId = setInterval(() => {
    updateGameTimer(socket, game, intervalId);
  },                             1000);
};

const updateGameTimer = (socket: Socket, game: Game, intervalId: NodeJS.Timeout) => {
  if (game.state === GameState.STARTING) {
    if (game.timer > 0) {
      // game start timer in progress
      game.timer = game.timer - 1;
    } else {
      // start timer over, start game now
      game.startGame();
    }
  } else if (game.state === GameState.IN_PROGRESS) {
    if (game.timer > 0) {
      // game is in progress
      game.timer = game.timer - 1;
    } else {
      // game is over, time has expired
      game.state = GameState.TIME_UP;
    }
  } else {
    clearInterval(intervalId);
  }

  handleUpdateGame(socket, game);
};

const handleDisconnectGame = (socket: Socket) => () => {
  const socketId = socket.id;
  console.log(moment().format() + ': disconnected - ' + socketId);

  const player = getPlayerForSocketId(socketId);
  const game = getGameForPlayer(player);

  leavePlayer(socketId);

  handleUpdateGame(socket, game);
};

export {
    handleJoinGame,
    handleChangeState,
    handleDisconnectGame,
};
