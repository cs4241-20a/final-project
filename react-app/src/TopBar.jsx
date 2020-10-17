import React from 'react';
import './App.css';
import Button from '@material-ui/core/Button';
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';

const theme = createMuiTheme({
    spacing: 8,
    palette: {
        type: 'dark',
        primary: {
            main: "#7e57c2", //purple
        },
        secondary: {
            main: '#ba68c8', //green
        },
    },
});

export default function TopBar(props) {
    let links = [{name: 'Home Page', url: '/'}
        , {name: 'Browse Completed Stories', url: '/completedStories'}
        , {name: 'Make a Story', url: '/CreateStory'}
        , {name: 'Contribute', url: '/contribute'}];
    const [isLoggedIn, changeLoginStatus] = React.useState(false)
    React.useEffect(() => {
        fetch('/currentUser').then(function (response) {
            return response.json()
        }).then(function (json) {
            console.log(json)
            changeLoginStatus(json.user !== null)
        })
    })

    function logOut() {
        fetch('/logOut', {
            method: 'POST'
        }).then(() => {
            window.open('/', "_self");
        })
    }

    function jumpToPage(url) {
        window.open(url, "_self");
    }

    return (
        <ThemeProvider theme={theme}>
            <div className="TopBar" style={{marginBottom: '10px', display: 'flex', justifyContent: 'space-between'}}>
                <div>
                    {links.map(function (link) {
                        return (<Button
                            key={link.name}
                            style={{fontSize: '16px'}}
                            onClick={() => {
                                jumpToPage(link.url)
                            }}
                            variant="contained">{link.name}</Button>)
                    })}
                </div>
                {isLoggedIn ? <Button style={{fontSize: '16px'}} variant="contained" onClick={logOut}>Log out</Button> :
                    <Button style={{fontSize: '16px'}} variant="contained" onClick={() => {
                        jumpToPage('/login')
                    }}>Log in</Button>}

            </div>
        </ThemeProvider>
    );
}
