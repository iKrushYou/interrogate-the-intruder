import Game from '../entity/Game';
import Player from '../entity/Player';
import locations from '../config/locations';

const games: Map<string, Game> = new Map<string, Game>();
const players: Map<string, Player> = new Map<string, Player>();
const socketIdPlayerIdMap: Map<string, string> = new Map<string, string>();
const playerIdGameKeyMap: Map<string, string> = new Map<string, string>();

const generateGameKey = () => {
  let gameKey: string = null;
  do {
    gameKey = Math.random().toString(36).slice(-4).toUpperCase();
    if (games.has(gameKey)) gameKey = null;
  } while (!gameKey);
  return gameKey;
};

function createGame(): Game {
  const game = new Game(generateGameKey());
  console.log('creating new game: ' + game.gameKey);
  game.locations = new Set(locations.default);
  games.set(game.gameKey, game);
  return game;
}

function getGame(gameKey: string): Game {
  if (!gameKey) return null;
  gameKey = gameKey.toUpperCase();
  if (gameKey === 'NEW') return createGame();
  if (games.has(gameKey)) return games.get(gameKey);
  return null;
}

function createPlayer(userId: string, userName: string, socketId: string): Player {
  const player: Player = new Player(userId, userName);
  players.set(userId, player);
  updateSocketId(player, socketId);
  return player;
}

function updateSocketId(player: Player, socketId: string) {
  if (!player || !socketId) return;
  player.socketIds.add(socketId);
  socketIdPlayerIdMap.set(socketId, player.id);
}

function getPlayer(userId: string, userName?: string, socketId?: string): Player {
  let player = players.get(userId);

  if (player) {
    updateSocketId(player, socketId);
    return player;
  }

  player = createPlayer(userId, userName, socketId);
  players.set(userId, player);

  return player;
}

function joinPlayer(player: Player, game: Game): void {
  game.joinPlayer(player);
  playerIdGameKeyMap.set(player.id, game.gameKey);
}

function getPlayerForSocketId(socketId: string): Player {
  const playerId = socketIdPlayerIdMap.get(socketId);
  return players.get(playerId);
}

function getGameForPlayer(player: Player): Game {
  if (!player) return null;
  const gameKey = playerIdGameKeyMap.get(player.id);
  return games.get(gameKey);
}

function leavePlayer(socketId: string): void {
  const playerId = socketIdPlayerIdMap.get(socketId);
  const player = players.get(playerId);
  if (!player) return;
  player.socketIds.delete(socketId);
  playerIdGameKeyMap.delete(player.id);
}

function gameToDto(game: Game) {
  if (!game) return null;
  return JSON.parse(JSON.stringify(game, (key, value) => value instanceof Set ? [...value] : value));
}

export { getGame, createGame, getPlayer, getPlayerForSocketId, getGameForPlayer, joinPlayer, leavePlayer, gameToDto };
