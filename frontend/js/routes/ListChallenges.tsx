import React, { useEffect, useState } from 'react';
import { Button, Typography } from "@material-ui/core";
import { FunctionComponent } from "react";
import { Link } from 'react-router-dom';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { ChallengeShort } from '../types/challenge';
import { SiteSettings } from './App';
import { Group as GroupIcon, Send as SendIcon } from '@material-ui/icons';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            textAlign: 'center',
            padding: theme.spacing(2, 0)
        },
        sectionTitle: {
            margin: theme.spacing(2, 0)
        },
        challengesHolder: {
            display: 'flex',
            flexDirection: 'column',
            width: `min(500px, calc(100% - ${theme.spacing(2) * 2}px))`,
            margin: "auto",
            "& > *": {
                marginTop: theme.spacing(2),
                marginBottom: theme.spacing(2)
            }
        },
        challengeCard: {
            textAlign: 'left',
            padding: theme.spacing(2),
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
        }
    }),
);

export const ListChallenges: FunctionComponent<{siteSettings: SiteSettings}> = ({siteSettings}) => {
    const classes = useStyles();
    const [challenges, setChallenges] = useState<ChallengeShort[]>([]);

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
        <div className={classes.root}>
            <Typography className={classes.sectionTitle} variant="h3">Challenges</Typography>
            <div className={classes.challengesHolder}>
                {challenges.map(challenge => (
                    <Paper className={classes.challengeCard} elevation={3}>
                        <div>
                            <Typography variant="h6">{challenge.title}</Typography>
                            <Typography variant="subtitle2">By {challenge.author}</Typography>
                        </div>
                        <div>
                            <Link to={`/play/${challenge.id}`}><Button variant="text" color="secondary" size="large" endIcon={<SendIcon/>}>Attempt</Button></Link>
                        </div>
                    </Paper>
                ))}
            </div>
        </div>);
};
