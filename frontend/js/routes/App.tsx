import { CssBaseline, Typography, useMediaQuery } from "@material-ui/core";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import React, { FunctionComponent, useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'; 
import { FourOhFour } from "./404";
import { Home } from "./Home";

const App: FunctionComponent = props => {
    // const prefersDarkTheme = useMediaQuery('(prefers-color-scheme: dark)', {noSsr: true});
    const prefersDarkTheme = false;
    const [useDarkTheme, setUseDarkTheme] = useState(prefersDarkTheme);

    const theme = React.useMemo(() =>
        createMuiTheme({
            palette: useDarkTheme ? {
                type: 'dark',
            } : 
            {
                type: 'light',
            }
        }),
        [useDarkTheme],
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Router>
                <Switch>
                    <Route exact path="/">
                        <Home/>
                    </Route>
                    <Route path="*">
                        <FourOhFour/>
                    </Route>
                </Switch>
            </Router>
        </ThemeProvider>
    );
}

if (typeof window !== 'undefined') {
    ReactDOM.render(<App />, document.getElementById('root'));
}