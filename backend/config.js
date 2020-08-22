const PORT = process.env.PORT || 8080;
const SocketEvents = {
        CONNECTION: "connection",
        DISCONNECT: "disconnect",
        JOIN_GAME: "join",
        // CAST_VOTE: "CAST_VOTE",
        // CHANGE_QUESTION: "CHANGE_QUESTION",
        // FINISH_QUESTION: "FINISH_QUESTION",
        // LEAVE_GAME: "LEAVE_GAME",
        // GAME_UPDATE: "GAME_UPDATE",
        // UPDATE_SCORE: "UPDATE_SCORE",
        // RESET_GAME: "RESET_GAME",
        // END_GAME: "END_GAME",
    };


module.exports = {PORT, SocketEvents}
