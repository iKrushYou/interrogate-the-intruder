import React, {useEffect, useState} from 'react'
import useLocalStorage from "../functions/useLocalStorage";
import {useHistory} from 'react-router-dom'
import { uuid } from "uuidv4";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import useSearchParams from "../functions/useSearchParams";

export default function HomePage() {

    const [userName, setUserName] = useLocalStorage("userName", "")
    const [gameKey, setGameKey] = useLocalStorage("gameKey", "")

    const startGameDisabled = !userName || gameKey.length > 0;
    const joinGameDisabled = !userName || gameKey.length < 4;

    const history = useHistory();
    const params = useSearchParams();

    useEffect(() => {
        if (!!params.get('gameKey')) {
            setGameKey(params.get('gameKey'))
        }
    }, [])

    const handleStartNewGame = () => {
        setGameKey('NEW')
        history.push('/game')
    }

    const handleJoinGame = () => {
        if (joinGameDisabled) return;
        history.push('/game')
    }

    return (
        <Container maxWidth={'md'}>
            <AppBar position={"fixed"}>
                <Toolbar style={{display: 'flex'}}>
                    <Typography variant="h6" style={{flex: 1, textAlign: 'center'}}>
                        Interrogate the Intruder
                    </Typography>
                </Toolbar>
            </AppBar>
            <Toolbar/>
            <Grid container spacing={2} style={{marginTop: 8}}>
                <Grid item xs={12}>
                    <Typography variant={'h6'}>Who are you?</Typography>
                    <TextField label="Name" fullWidth autoFocus value={userName} onChange={event => setUserName(event.target.value)} />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant={'h6'}>Join an existing game</Typography>
                    <TextField label="Game Code" fullWidth value={gameKey} onChange={event => setGameKey(event.target.value)} />
                </Grid>
                <Grid item xs={12}>
                    <Button variant={"outlined"} color={"primary"} fullWidth disabled={joinGameDisabled} onClick={handleJoinGame}>Join Game</Button>
                </Grid>
                <Grid item xs={12}>
                    <Button variant={"outlined"} fullWidth disabled={startGameDisabled} onClick={handleStartNewGame}>New Game</Button>
                </Grid>
            </Grid>
        </Container>
    )
}
