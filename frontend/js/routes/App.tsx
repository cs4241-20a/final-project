import { CssBaseline, useMediaQuery } from "@material-ui/core";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import React, { FunctionComponent, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, match, Route, Switch } from 'react-router-dom'; 
import { TopBar } from "../components/TopBar";
import { FourOhFour } from "./404";
import { Home } from "./Home";
import { CreateChallenge } from "./CreateChallenge";
import "../../css/main.css";
import { blue, pink } from "@material-ui/core/colors";
import { Login } from "./Login";
import DialogProvider from "../components/DialogProvider";
import { PlayChallenge } from "./PlayChallenge";

export interface SiteSettings {
    theme: 'light' | 'dark';
}

const App: FunctionComponent = props => {
    let prefersDarkTheme: boolean;
    const storedThemePreference = localStorage.getItem('prefers-color-scheme');
    const browserThemePreference = useMediaQuery('(prefers-color-scheme: dark)', {noSsr: true});
    if (storedThemePreference) {
        prefersDarkTheme = storedThemePreference === 'dark';
    }
    else {
        prefersDarkTheme = browserThemePreference;
    }
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

    const [currentUser, setCurrentUser] = useState<{username: string} | null>(null);
    useEffect(() => {
        (async () => {
            const response = await fetch('/api/me');
            if (response.ok) {
                setCurrentUser(await response.json());
            }
        })();
    }, []);

    return (
        <ThemeProvider theme={theme}>
        <DialogProvider>
            <CssBaseline/>
            <Router>
                <TopBar user={currentUser} siteSettings={siteSettings} setSiteSettings={setSiteSettings}/>
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
                    <Route path="/play/:id" render={({match}) => (
                        <PlayChallenge challengeId={(match as match<{id: string}>).params.id} siteSettings={siteSettings}/>
                    )}/>
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