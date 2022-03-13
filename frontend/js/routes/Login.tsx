import React, { FunctionComponent, useState } from 'react';
import { Button, TextField, Box, Link as MaterialLink, Typography, Snackbar } from "@material-ui/core";
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory, useLocation } from 'react-router-dom';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%"
    },
    form: {
        width: `min(400px, calc(100% - ${theme.spacing(2) * 2}px))`
    },
    submit: {
        margin: theme.spacing(3, 0, 2)
    },
    toggleRegisterBtn: {
        color: theme.palette.text.primary,
        cursor: "pointer"
    }
}));

const reasonTable = {
    login_fail: "Incorrect username or password",
    register_fail: "A user with that username already exists"
};

export const Login: FunctionComponent = () => {
    const classes = useStyles();
    const location = useLocation();
    const history = useHistory();

    const [reason, setReason] = useState<string | undefined>(new URLSearchParams(location.search).get('reason') ?? undefined);
    const [showError, setShowError] = useState(reason !== undefined);

    const [isSignup, setIsSignup] = useState(reason === 'register_fail');

    function handleCloseSnackbar() {
        setShowError(false);
        history.replace("/login");
    }

    return (
        <div className={classes.root}>
            <form className={classes.form} action={isSignup ? "/register" : "/login"} method="post" noValidate>
                <TextField
                    fullWidth
                    variant="filled"
                    margin="normal"
                    name="username"
                    label="Username"
                    required
                    autoFocus
                />
                <TextField
                    fullWidth
                    variant="filled"
                    margin="normal"
                    type="password"
                    name="password"
                    label="Password"
                    required
                />
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                >
                    {isSignup ? "Register" : "Login"}
                </Button>
                <Grid container>
                    <Grid item xs>
                    </Grid>
                    <Grid item>
                    <MaterialLink variant="body2" className={classes.toggleRegisterBtn} onClick={() => setIsSignup(!isSignup)}>
                        {isSignup ? "Already registered?" : "Don't have an account?"}
                    </MaterialLink>
                    </Grid>
                </Grid>
            </form>
            <Snackbar open={showError} onClose={handleCloseSnackbar} anchorOrigin={{vertical: "bottom", horizontal: "center"}}>
                <Alert variant="filled" severity="error">{reasonTable[reason ?? ""]}</Alert>
            </Snackbar>
        </div>
    );
};