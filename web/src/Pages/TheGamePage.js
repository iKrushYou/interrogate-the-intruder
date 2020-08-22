import React, {useEffect, useState} from 'react'
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import useLocalStorage from "../functions/useLocalStorage";
import Grid from "@material-ui/core/Grid";
import {useHistory} from "react-router-dom";
import io from "socket.io-client";
import {SOCKET_URL, SocketEvents} from "../functions/config";
import Chip from "@material-ui/core/Chip";
import Button from "@material-ui/core/Button";
import useToggle from "../functions/useToggle";
import GameState from "../entity/GameState";
import {CardContent} from "@material-ui/core";
import Card from "@material-ui/core/Card";
import ButtonBase from "@material-ui/core/ButtonBase";
import copy from 'copy-to-clipboard';

let socket;

function Layout({children}) {
    return (
        <>
            <AppBar position={"fixed"}>
                <Toolbar style={{display: 'flex'}}>
                    <Typography variant="h6" style={{flex: 1, textAlign: 'center'}}>
                        Interrogate the Intruder
                    </Typography>
                </Toolbar>
            </AppBar>
            <Toolbar/>
            {children}
        </>
    )
}

export default function TheGamePage() {

    const [userName] = useLocalStorage("userName")
    const [userId] = useLocalStorage("userId")
    const [gameKey, setGameKey, deleteGameKey] = useLocalStorage("gameKey")

    const [game, setGame] = useState(null)

    const history = useHistory();

    const handleLeaveGame = () => {
        socket.disconnect();
        deleteGameKey();
        history.push('/')
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

        return () => {
            socket.disconnect();
        };
    }, [userId, userName, gameKey]);

    const [showDebug, toggleDebug] = useToggle(false)
    const Debug = () => (
        <div style={{position: 'absolute', bottom: 60}}>
            {showDebug && (
                <pre>
                {JSON.stringify(game, null, 2)}
            </pre>
            )}
            <button onClick={toggleDebug}>{showDebug ? 'hide' : 'show'} debug</button>
        </div>
    )

    const handleStartGame = () => {
        socket.emit(SocketEvents.CHANGE_STATE, {gameKey, gameState: GameState.STARTING})
    }

    const handleReturnToLobby = () => {
        socket.emit(SocketEvents.CHANGE_STATE, {gameKey, gameState: GameState.LOBBY})
    }

    return (
        <Layout>
            {/*<ScreenSwitch game={game}/>*/}
            {game?.state === GameState.LOBBY && (
                <LobbyScreen gameKey={gameKey} game={game} userName={userName}
                             handleLeaveGame={handleLeaveGame}
                             handleStartGame={handleStartGame}/>
            )}
            {game?.state === GameState.STARTING && (
                <CountdownScreen game={game}/>
            )}
            {game?.state === GameState.IN_PROGRESS && (
                <GamePlayScreen game={game} handleReturnToLobby={handleReturnToLobby}/>
            )}
            {game?.state === GameState.TIME_UP && (
                <GameOverScreen game={game} handleReturnToLobby={handleReturnToLobby}/>
            )}
            {/*<Debug/>*/}
        </Layout>
    )
}

function LobbyScreen({gameKey, game, userName, handleLeaveGame, handleStartGame}) {

    const handleCopyGameLink = () => {
        const url = `${window.location.protocol}//${window.location.host}?gameKey=${gameKey}`
        copy(url)
    }

    return (
        <>
            <Container maxWidth={'md'} style={{paddingTop: 16, paddingBottom: 16}}>
                <Grid container spacing={1} style={{marginTop: 8}}>
                    <Grid item xs={12}>
                        <Typography variant={'h4'}>Welcome, Agent {userName}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Button onClick={handleCopyGameLink}>Game Code: {gameKey}</Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant={'h5'}>Players</Typography>
                    </Grid>
                    {game?.players?.map(player => {
                        const online = player.socketIds.length > 0;
                        return (
                            <Grid item key={player.id}>
                                <Chip label={player.name} color={online ? "primary" : "default"}/>
                            </Grid>
                        )
                    })}
                    <Grid item xs={12}>
                        <Typography variant={'h5'}>Locations</Typography>
                    </Grid>
                    {game?.locations?.map(location => (
                        <Grid item xs={6} key={location}>
                            <Card style={{height: '100%'}}>
                                <CardContent>
                                    <Typography variant={'h6'}>{location}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
            <Toolbar/>
            <AppBar position={"fixed"} style={{top: 'auto', bottom: 0}} color={'white'}>
                <Toolbar style={{display: 'flex'}}>
                    <Button style={{flex: 1}} onClick={handleLeaveGame}>Leave Game</Button>
                    <Button style={{flex: 1}} color={'primary'} variant={'contained'} onClick={handleStartGame}>Start
                        Game</Button>
                </Toolbar>
            </AppBar>
        </>
    )
}

function CountdownScreen({game}) {
    return (
        <>
            <Container maxWidth={'md'} style={{paddingTop: 16, paddingBottom: 16}}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant={'h4'} style={{textAlign: 'center'}}>Game starting in...</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant={'h1'} style={{textAlign: 'center'}}>{game.timer}</Typography>
                    </Grid>
                </Grid>
            </Container>
        </>
    )
}

function GamePlayScreen({game, handleReturnToLobby}) {

    const [userId] = useLocalStorage("userId")

    const locationString = game.spyId === userId ? "???" : game.location;

    const [showLocation, toggleShowLocation] = useToggle(false);

    const [locationToggle, setLocationToggle] = useState(new Array(game.locations.length).fill(1))
    const toggleLocation = locationIndex => {
        setLocationToggle(prev => {
            prev[locationIndex] = !prev[locationIndex]
            return prev;
        })
    }

    return (
        <>
            <Container maxWidth={"md"} style={{paddingTop: 16, paddingBottom: 16}}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant={'h5'}>Timer: {game.timer}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant={'h5'}>Location: <Button
                            onClick={toggleShowLocation}>{showLocation ? locationString : "Tap To Show"}</Button></Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant={'h5'}>Locations</Typography>
                    </Grid>
                    {game?.locations?.map((location) => (
                        <Grid item xs={6} key={location}>
                            <TogglingCard title={location}/>
                        </Grid>
                    ))}
                </Grid>
            </Container>
            <Toolbar/>
            <AppBar position={"fixed"} style={{top: 'auto', bottom: 0}} color={'white'}>
                <Toolbar style={{display: 'flex'}}>
                    <div style={{flex: 1}}></div>
                    <Button style={{flex: 1}} color={'error'} variant={'contained'}
                            onClick={handleReturnToLobby}>End</Button>
                </Toolbar>
            </AppBar>
        </>
    )
}

function TogglingCard({title}) {

    const [active, toggleActive] = useToggle(true)

    return (
        <Card style={{height: '100%', opacity: active ? 1.0 : 0.3}}>
            <ButtonBase onClick={toggleActive} style={{width: '100%'}}>
                <CardContent>
                    <Typography variant={'h6'}>{title}</Typography>
                </CardContent>
            </ButtonBase>
        </Card>
    )
}

function GameOverScreen({game, handleReturnToLobby}) {
    return (
        <>
            <Container maxWidth={'md'} style={{paddingTop: 16, paddingBottom: 16}}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant={'h4'} style={{textAlign: 'center'}}>Times Up!</Typography>
                    </Grid>
                </Grid>
            </Container>
            <Toolbar/>
            <AppBar position={"fixed"} style={{top: 'auto', bottom: 0}} color={'white'}>
                <Toolbar style={{display: 'flex'}}>
                    <div style={{flex: 1}}></div>
                    <Button style={{flex: 1}} color={'error'} variant={'contained'}
                            onClick={handleReturnToLobby}>End</Button>
                </Toolbar>
            </AppBar>
        </>
    )
}
