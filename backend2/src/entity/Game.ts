import Player from './Player';
import GameState from './GameState';

export default class Game {
  gameKey: string;
  players: Set<Player>;
  state: GameState;
  gameTime: number;
  timer: number;
  spyId: string;
  locations: Set<string>;
  location: string;

  constructor(gameKey: string) {
    this.gameKey = gameKey.toUpperCase();
    this.players = new Set<Player>();
    this.state = GameState.LOBBY;
    this.gameTime = 5 * 60;
    this.timer = 10;
  }

  joinPlayer(player: Player) {
    this.players.add(player);
  }

  private randomizeSpy() {
    const spyIndex = Math.floor(Math.random() * this.players.size);
    this.spyId = [...this.players][spyIndex].id;
  }

  private randomizeLocation() {
    const locationIndex = Math.floor(Math.random() * this.locations.size);
    this.location = [...this.locations][locationIndex];
  }

  startGame() {
    this.timer = this.gameTime;
    this.state = GameState.IN_PROGRESS;

    this.randomizeSpy();
    this.randomizeLocation();
  }
}
