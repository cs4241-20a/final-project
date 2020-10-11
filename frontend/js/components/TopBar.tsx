import React, { useState } from 'react';
import { AppBar, IconButton, List, ListItem, ListItemIcon, ListItemText, SwipeableDrawer, Toolbar, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Brush as BrushIcon, Home as HomeIcon, Menu as MenuIcon } from "@material-ui/icons"
import { FunctionComponent } from "react";
import { Link } from 'react-router-dom';

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

export const TopBar: FunctionComponent = () => {
    const classes = useStyles();

    const [drawerOpen, setDrawerOpen] = useState(false);

    const openDrawer = () => setDrawerOpen(true);
    const closeDrawer = () => setDrawerOpen(false);

    return <>
        <AppBar position="static">
            <Toolbar>
                <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={openDrawer}>
                    <MenuIcon/>
                </IconButton>
                <Typography variant="h6" className={classes.title}>Website Name</Typography>
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
                ["/login", "Login", <React.Fragment/>],
                ["/", "Home", <HomeIcon/>],
                ["/create", "Create", <BrushIcon/>],
            ] as const).map(option =>
                <ListItem button component={Link} to={option[0]} onClick={closeDrawer}>
                    <ListItemIcon>{option[2]}</ListItemIcon>
                    <ListItemText primary={option[1]}/>
                </ListItem>)}
            </List>
        </SwipeableDrawer>
    </>;
};