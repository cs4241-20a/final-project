import { CssBaseline, Typography, useMediaQuery } from "@material-ui/core";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import React, { FunctionComponent, useState } from "react";
import ReactDOM from "react-dom";

const App: FunctionComponent = props => {
    const prefersDarkTheme = useMediaQuery('(prefers-color-scheme: dark)', {noSsr: true});
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
            <Typography variant="h1">Hello, World!</Typography>
        </ThemeProvider>
    );
}

if (typeof window !== 'undefined') {
    ReactDOM.render(<App />, document.getElementById('root'));
}