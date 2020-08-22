import Game from "./entity/Game";

const games: Map<String, Game> = new Map<String, Game>();

const generateGameKey = () => {
    let gameKey = null;
    do {
        gameKey = Math.random().toString(36).slice(-4).toUpperCase();
        if (games.has(gameKey)) gameKey = null;
    } while (!gameKey);
    return gameKey;
};

function createGame() {
    const gameKey = generateGameKey();

    const game: Game = new Game(gameKey);

}

