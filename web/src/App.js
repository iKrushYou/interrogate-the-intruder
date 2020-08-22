import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import CssBaseline from "@material-ui/core/CssBaseline";
import TheGamePage from "./Pages/TheGamePage";

function App() {
    return (
        <Router>
            <CssBaseline />
            <Route path={"/"} exact component={HomePage} />
            <Route path={"/game"} exact component={TheGamePage} />
            {/*<Route path={"/game/admin"} exact component={GameAdminPage} />*/}
        </Router>
    )
}

export default App;
