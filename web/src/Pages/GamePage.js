import React, {useEffect, useState} from 'react'
import useLocalStorage from "../functions/useLocalStorage";
import io from "socket.io-client";
import {useHistory} from 'react-router-dom'
import {SOCKET_URL, SocketEvents} from '../functions/config'
import useToggle from "../functions/useToggle";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import {makeStyles} from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";

let socket;

export default function GamePage() {

    const [userName] = useLocalStorage("userName")
    const [userId] = useLocalStorage("userId")
    const [gameKey, setGameKey] = useLocalStorage("gameKey")

    const [game, setGame] = useState(null)

    const history = useHistory();

    const handleLeaveGame = () => {
        history.push("/");
    };

    useEffect(() => {
        if (game) setGameKey(game.gameKey)
    }, [game, setGameKey])

    useEffect(() => {
        if (!userId && !userName) handleLeaveGame();

        socket = io(SOCKET_URL, {path: "/api/socket.io"});

        socket.on(SocketEvents.CONNECT, () => {
            console.log('joining game', {userId, userName, gameKey})
            socket.emit(SocketEvents.JOIN_GAME, {userId, userName, gameKey}, ({error}) => {
                if (error) {
                    alert(error);
                    handleLeaveGame();
                }
            });
        });

        socket.on(SocketEvents.GAME_UPDATE, (gameUpdate) => {
            setGame(gameUpdate);
        });

        // socket.on(SocketEvents.END_GAME, () => {
        //     handleLeaveGame();
        // });

        return () => {
            console.log('cleanup')
            socket.emit(SocketEvents.DISCONNECT);
            socket.off();
        };
    }, [userId, userName, gameKey]);

    const [showDebug, toggleDebug] = useToggle(false)

    function GamePageSwitch({game}) {
        console.log({game})
        if (!game) return <h1>Game doesn't exist</h1>
        if (game.state === "LOBBY") return <GameLobby game={game} handleLeaveGame={handleLeaveGame}/>;
        else if (game.state === "IN_PROGRESS") return <GameInProgress game={game}/>
        else return <h1>unknown state</h1>;
    }

    return (
        <Container maxWidth={'md'}>
            <AppBar position="fixed">
                <Toolbar>
                    <Typography variant="h6">
                        Interrogate the Intruder
                    </Typography>
                </Toolbar>
            </AppBar>
            <Toolbar/>
            <GamePageSwitch game={game}/>
            <div style={{position: 'absolute', bottom: 10}}>
                {showDebug && (
                    <pre>
                {JSON.stringify(game, null, 2)}
            </pre>
                )}
                <button onClick={toggleDebug}>{showDebug ? 'hide' : 'show'} debug</button>
            </div>
        </Container>
    )
}

function GameLobby({game, handleLeaveGame}) {

    const [userName] = useLocalStorage("userName")
    const [gameKey] = useLocalStorage("gameKey")

    const handleStartGame = () => {
        socket.emit(SocketEvents.CHANGE_STATE, {gameKey, gameState: "IN_PROGRESS"})
    }

    return (
        <>
            <div style={{marginTop: 8, marginBottom: 16}}>
                <Typography variant={'h5'}>Welcome Agent {userName}</Typography>
                <Typography>Game Key: {gameKey}</Typography>
            </div>
            <Typography>Awaiting other agents:</Typography>
            <Grid container spacing={1}>
                {game?.players?.map(player => {
                    const online = player.socketIds.length > 0;

                    const classes = makeStyles(theme => ({
                        playerCard: ({online}) => ({
                            padding: 8,
                            opacity: online ? 1.0 : 0.3,
                        })
                    }))({online});

                    return (
                        <Grid item xs={6}>
                            <Card className={classes.playerCard}>
                                <Typography variant={'h6'}>{player.name}</Typography>
                            </Card>
                        </Grid>
                    )
                })}
            </Grid>
            <div style={{position: 'fixed', bottom: 16, width: '100%'}}>
                <Grid container spacing={1}>
                    <Grid item xs={6}>
                        <Button onClick={handleLeaveGame} fullWidth variant={'contained'}>Back to Lobby</Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button onClick={handleStartGame} fullWidth variant={'contained'}>Start Game</Button>
                    </Grid>
                </Grid>
            </div>
        </>
    )
}

function GameInProgress({game}) {
    return (
        <>
            Game in progress
        </>
    )
}
