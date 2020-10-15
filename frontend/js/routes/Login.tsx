import React, { FunctionComponent, useState } from 'react';
import { Button, TextField, Box, Link as MaterialLink, Typography } from "@material-ui/core";
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';

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
        margin: theme.spacing(3, 0, 2),
    },
}));

  

export const Login: FunctionComponent = () => {
  
    const [isSignup, setIsSignup] = useState(false);

    const classes = useStyles();
    return (
        <div className={classes.root}>
            <form className={classes.form} action={isSignup ? "/login" : "/register"} method="post" noValidate>
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
                    {isSignup ? "Register" : "Sign in"}
                </Button>
                <Grid container>
                    <Grid item xs>
                    </Grid>
                    <Grid item>
                    <MaterialLink variant="body2" onClick={() => setIsSignup(!isSignup)}>
                        {isSignup ? "Already registered?" : "Don't have an account?"}
                    </MaterialLink>
                    </Grid>
                </Grid>
            </form>
        </div>
    );
};