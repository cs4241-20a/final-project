import React, { useState } from 'react';
import { TextField, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { FunctionComponent } from "react";
import { handleChange } from '../util';

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(2)
    },
}));

export const CreateChallenge: FunctionComponent = () => {
    const classes = useStyles();

    const [title, setTitle] = useState("New Challenge");

    return (
        <div className={classes.root}>
            <TextField
                variant="filled"
                label="Challenge Title"
                value={title}
                onChange={handleChange(setTitle)}
                fullWidth/>
        </div>
    );
};