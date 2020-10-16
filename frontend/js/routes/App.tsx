import { CssBaseline, useMediaQuery } from "@material-ui/core";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import React, { createContext, FunctionComponent, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, match, Route, Switch, useHistory } from 'react-router-dom'; 
import { TopBar } from "../components/TopBar";
import { FourOhFour } from "./404";
import { Home } from "./Home";
import { CreateChallenge } from "./CreateChallenge";
import "../../css/main.css";
import { blue, pink } from "@material-ui/core/colors";
import { Login } from "./Login";
import DialogProvider from "../components/DialogProvider";
import { PlayChallenge } from "./PlayChallenge";
import { useWebsocket } from "../components/WebSocketProvider";
import { ListChallenges } from "./ListChallenges";

export interface SiteSettings {
    theme: 'light' | 'dark';
    currentUser: string | null;
    currentLobbyId: string | null;
    isLobbyOwner: boolean;
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
    const [siteSettings, setSiteSettings] = useState<SiteSettings>({
        theme: prefersDarkTheme ? 'dark' : 'light',
        currentUser: null,
        currentLobbyId: null,
        isLobbyOwner: false
    });

    function changeSiteSettings(settings: Partial<SiteSettings>) {
        setSiteSettings({...siteSettings, ...settings});
    }

    const theme = React.useMemo(() =>
        createMuiTheme({
            palette: {
                ...(siteSettings.theme === 'dark' ? {
                    type: 'dark',
                    primary: { main: blue[700] },
                    secondary: { main: pink[200] },
                } : 
                {
                    type: 'light',
                    primary: { main: blue[700] },
                    secondary: { main: pink[400] },
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

    const history = useHistory();
    const ws = useWebsocket();

    useEffect(() => {
        (async () => {
            const response = await fetch('/api/me');
            if (response.ok) {
                changeSiteSettings({currentUser: await response.json()});
            }
        })();

        ws.addEventListener("message", e => {
            const data = JSON.parse(e.data);
            switch (data.type) {
                case "joinLobby":
                    changeSiteSettings({
                        currentLobbyId: data.lobbyId,
                        isLobbyOwner: data.owner
                    });
                    break;
                case "startChallenge":
                    history.push(`/play/${data.challenge}`);
                    break;
            }
        });
    }, []);

    return (
        <ThemeProvider theme={theme}>
        <DialogProvider>
            <CssBaseline/>
            <TopBar siteSettings={siteSettings} setSiteSettings={setSiteSettings}/>
            <Switch>
                <Route exact path="/">
                    <ListChallenges siteSettings={siteSettings}/>
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
        </DialogProvider>
        </ThemeProvider>
    );
}

if (typeof window !== 'undefined') {
    ReactDOM.render(<Router><App /></Router>, document.getElementById('root'));
}