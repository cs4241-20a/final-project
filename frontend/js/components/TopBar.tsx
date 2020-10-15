import React, { ReactElement, useState } from 'react';
import { AppBar, IconButton, List, ListItem, ListItemIcon, ListItemText, SwipeableDrawer, Toolbar, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Brightness4, Brightness7, Brush as BrushIcon, Home as HomeIcon, Menu as MenuIcon } from "@material-ui/icons"
import { FunctionComponent } from "react";
import { Link } from 'react-router-dom';
import { SiteSettings } from '../routes/App';

const useStyles = makeStyles(theme => ({
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
    drawerList: {
        width: 250
    }
}));

interface TopBarProps {
    user: {username: string} | null;
    siteSettings: SiteSettings;
    setSiteSettings: (siteSettings: SiteSettings) => void;
}

export const TopBar: FunctionComponent<TopBarProps> = ({
    user,
    siteSettings,
    setSiteSettings
}) => {
    const classes = useStyles();

    const [drawerOpen, setDrawerOpen] = useState(false);

    const openDrawer = () => setDrawerOpen(true);
    const closeDrawer = () => setDrawerOpen(false);

    function toggleDarkMode() {
        const newTheme = siteSettings.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('prefers-color-scheme', newTheme);
        setSiteSettings({...siteSettings, theme: newTheme});
    }

    return <>
        <AppBar position="static">
            <Toolbar>
                <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={openDrawer}>
                    <MenuIcon/>
                </IconButton>
                <Typography variant="h6" className={classes.title}>Website Name</Typography>
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
            {([
                user == null ? ["/login", "Login", <React.Fragment/>] : undefined,
                ["/", "Home", <HomeIcon/>],
                ["/create", "Create", <BrushIcon/>],
            ].filter(x => x) as ([string, string, ReactElement])[]).map(option =>
                <ListItem button component={Link} to={option[0]} onClick={closeDrawer}>
                    <ListItemIcon>{option[2]}</ListItemIcon>
                    <ListItemText primary={option[1]}/>
                </ListItem>)}
            </List>
        </SwipeableDrawer>
    </>;
};