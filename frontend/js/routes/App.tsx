import { CssBaseline, Typography, useMediaQuery } from "@material-ui/core";
import { createMuiTheme, makeStyles, ThemeProvider } from "@material-ui/core/styles";
import React, { FunctionComponent, useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'; 
import { TopBar } from "../components/TopBar";
import { FourOhFour } from "./404";
import { Home } from "./Home";
import { CreateChallenge } from "./CreateChallenge";
import "../../css/main.css";
import { blue, pink } from "@material-ui/core/colors";
import { Login } from "./Login";
import DialogProvider from "../components/DialogProvider";

export interface SiteSettings {
    theme: 'light' | 'dark';
}

const App: FunctionComponent = props => {
    // const prefersDarkTheme = useMediaQuery('(prefers-color-scheme: dark)', {noSsr: true});
    const prefersDarkTheme = false;
    const [siteSettings, setSiteSettings] = useState({
        theme: prefersDarkTheme ? 'dark' : 'light'
    } as SiteSettings);

    const theme = React.useMemo(() =>
        createMuiTheme({
            palette: {
                primary: { main: blue[700] },
                secondary: { main: pink[400] },
                ...(siteSettings.theme === 'dark' ? {
                    type: 'dark'
                } : 
                {
                    type: 'light'
                })
            },
            overrides: {
                MuiCssBaseline: {
                    '@global': {
                        a: {
                            color: 'inherit',
                            textDecoration: 'inherit'
                        }
                    }
                }
            }
        }),
        [siteSettings],
    );

    return (
        <ThemeProvider theme={theme}>
        <DialogProvider>
            <CssBaseline/>
            <Router>
                <TopBar siteSettings={siteSettings} setSiteSettings={setSiteSettings}/>
                <Switch>
                    <Route exact path="/">
                        <Home/>
                    </Route>
                    <Route path="/login">
                        <Login/>
                    </Route>
                    <Route path="/create">
                        <CreateChallenge siteSettings={siteSettings}/>
                    </Route>
                    <Route path="*">
                        <FourOhFour/>
                    </Route>
                </Switch>
            </Router>
        </DialogProvider>
        </ThemeProvider>
    );
}

if (typeof window !== 'undefined') {
    ReactDOM.render(<App />, document.getElementById('root'));
}