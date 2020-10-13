import React, { FunctionComponent } from 'react';
import { Avatar, Button, Typography, TextField, Box } from "@material-ui/core";
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

const useStyles = makeStyles((theme) => ({
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export const Login: FunctionComponent = () => {
    const classes = useStyles();
    return (
        <Box margin="auto">
            <form className={classes.form} noValidate>
            <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
            />
            <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
            >
                Sign In
            </Button>
            <Grid container>
                <Grid item xs>
                <Typography component={Link} to="/" variant="body2">
                    Forgot password?
                </Typography>
                </Grid>
                <Grid item>
                <Typography component={Link} to="/" variant="body2">
                    {"Don't have an account? Sign Up"}
                </Typography>
                </Grid>
            </Grid>
            </form>
        </Box>
    );
};