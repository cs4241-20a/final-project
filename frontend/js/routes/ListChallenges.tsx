import React, { useEffect, useState } from 'react';
import { Typography } from "@material-ui/core";
import { FunctionComponent } from "react";
import { Link } from 'react-router-dom';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            flexWrap: 'wrap',
            '& > *': {
                margin: "auto",
                width: "40%",
                padding: theme.spacing(2),
                height: theme.spacing(16),
            },
        },
    }),
);

export const ListChallenges: FunctionComponent = () => {

    const classes = useStyles();
    const [challenges, setChallenges] = useState([]);

    useEffect(() => {
        (async () => {
            await fetch('/api/challenge/all')
                .then((response) => response.json())
                .then((challenges) => {
                    setChallenges(challenges);
                    console.log(challenges);
                });
        })();
    }, []);

    return (
        <div>
            <Typography variant="h1">User Created Challenges</Typography>
            <br /><br /> <br />
            <div>
                {challenges.map(challenge => (
                    <div className={classes.root}>
                        <Paper elevation={3}><h1>Title: {challenge.title}</h1>
                            <h3>Author: {challenge.author}</h3>
                        </Paper>
                    </div>
                ))}
            </div>
        </div>);
};
