import Player from "./Player";

export default class Game {
    gameCode: String;
    players: Player[];

    constructor(gameCode: String) {
        this.gameCode = gameCode;
    }
}
