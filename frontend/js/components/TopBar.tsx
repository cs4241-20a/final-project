import React, { ReactElement, useState } from 'react';
import { AppBar, Button, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemIcon, ListItemText, Paper, SwipeableDrawer, TextField, Toolbar, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Brightness4, Brightness7, Brush as BrushIcon, ExitToApp as ExitToAppIcon, Home as HomeIcon, Menu as MenuIcon } from "@material-ui/icons"
import { FunctionComponent } from "react";
import { Link } from 'react-router-dom';
import { SiteSettings } from '../routes/App';
import { useWebsocket } from './WebSocketProvider';
import { useDialog } from './DialogProvider';

const useStyles = makeStyles(theme => ({
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
    drawerList: {
        width: 250
    },
    topBar: {
        "& > .MuiButton-root": {
            margin: theme.spacing(0, 1)
        }
    },
    inheritColor: {
        color: "inherit",
        '&.Mui-disabled': {
            color: "inherit",
            borderColor: "inherit"
        }
    }
}));

interface TopBarProps {
    siteSettings: SiteSettings;
    setSiteSettings: (siteSettings: SiteSettings) => void;
}

export const TopBar: FunctionComponent<TopBarProps> = ({
    siteSettings,
    setSiteSettings
}) => {
    const classes = useStyles();
    const ws = useWebsocket();
    const [openDialog, closeDialog] = useDialog();

    const [drawerOpen, setDrawerOpen] = useState(false);

    const openDrawer = () => setDrawerOpen(true);
    const closeDrawer = () => setDrawerOpen(false);

    function toggleDarkMode() {
        const newTheme = siteSettings.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('prefers-color-scheme', newTheme);
        setSiteSettings({...siteSettings, theme: newTheme});
    }

    async function logout() {
        const response = await fetch('/logout', { method: "POST" });
        if (response.ok) {
            location.assign('/login');
        }
    }

    function createGroup() {
        ws.send(JSON.stringify({
            type: "createLobby"
        }));
    }

    function showJoinGroupDialog() {
        function Dialog() {
            const [groupCode, setGroupCode] = useState("");

            function handleGroupCodeChange(e: any) {
                setGroupCode((e.target.value as string).match(/^[A-Za-z]{0,4}/)?.[0]?.toUpperCase() ?? "");
            }

            function joinGroup() {
                closeDialog();
                ws.send(JSON.stringify({
                    type: "joinLobby",
                    lobbyId: groupCode
                }));
            }

            return <>
                <DialogTitle>Join Group</DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle1">Enter the group code:</Typography>
                    <TextField
                        size="small"
                        variant="outlined"
                        value={groupCode}
                        onChange={handleGroupCodeChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" onClick={closeDialog}>Cancel</Button>
                    <Button color="secondary" onClick={joinGroup}>Join</Button>
                </DialogActions>
            </>;
        }
        openDialog({
            children: <Dialog/>
        });
    }
    
    return <>
        <AppBar position="static">
            <Toolbar className={classes.topBar}>
                <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={openDrawer}>
                    <MenuIcon/>
                </IconButton>
                <Typography variant="h6" className={classes.title}>Website Name</Typography>
                {siteSettings.currentLobbyId
                    ? <Button variant="outlined" className={classes.inheritColor} disabled>{siteSettings.currentLobbyId}</Button>
                    : <>
                        <Button variant="outlined" color="inherit" onClick={createGroup}>Create Group</Button>
                        <Button variant="outlined" color="inherit" onClick={showJoinGroupDialog}>Join Group</Button>
                    </>
                }
                <IconButton color="inherit" aria-label="toggle dark theme" onClick={toggleDarkMode}>
                    {siteSettings.theme === 'light' ? <Brightness4/> : <Brightness7/>}
                </IconButton>
            </Toolbar>
        </AppBar>
        <SwipeableDrawer
            anchor="left"
            open={drawerOpen}
            onOpen={openDrawer}
            onClose={closeDrawer}
        >
            <List className={classes.drawerList}>
                {siteSettings.currentUser !== null ?
                    <ListItem button onClick={logout}>
                        <ListItemIcon><ExitToAppIcon/></ListItemIcon>
                        <ListItemText primary="Log out"/>
                    </ListItem>
                : undefined}
                {([
                    siteSettings.currentUser == null ? ["/login", "Login/Register", <React.Fragment/>] : undefined,
                    ["/", "Home", <HomeIcon/>],
                    siteSettings.currentUser !== null ? ["/create", "Create", <BrushIcon/>] : undefined,
                ].filter(x => x) as ([string, string, ReactElement])[]).map(option =>
                    <ListItem button component={Link} to={option[0]} onClick={closeDrawer}>
                        <ListItemIcon>{option[2]}</ListItemIcon>
                        <ListItemText primary={option[1]}/>
                    </ListItem>
                )}
            </List>
        </SwipeableDrawer>
    </>;
};