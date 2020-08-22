import express from 'express'
import socketio from 'socket.io'
import http from 'http'
import moment from 'moment'
import path from 'path'
import {PORT, SocketEvents} from "./config";

let app = express();
const server = http.createServer(app);
const io = socketio(server, { path: "/api/socket.io" });

app.use((request, result, next) => {
    result.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

// serve UI
app.use(express.static(path.join(__dirname, "web/build")));
app.get("*", (req, res, next) => {
    res.sendFile(path.join(__dirname + "/web/build/index.html"));
});

io.on(SocketEvents.CONNECTION, (socket) => {
    console.log(moment().format() + ": connected - " + socket.id);

    socket.on(SocketEvents.JOIN_GAME, (props, callback) => {
        console.log(`${moment().format()}: ${SocketEvents.JOIN_GAME} ${JSON.stringify(props)}`);
        const { userId, userName } = props;
        if (!userId || !userName) {
            callback({ error: "missing props" });
            return;
        }

        // socket.emit(SocketEvents.GAME_UPDATE, game);
        // socket.join(gameKey);
        // socket.broadcast.to(gameKey).emit(SocketEvents.GAME_UPDATE, game);

        callback({});
    });

    socket.on(SocketEvents.DISCONNECT, () => {
        console.log(moment().format() + ": disconnected - " + socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`${moment().format()}: Server has been started on port ${PORT}`)
});
