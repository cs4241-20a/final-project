import React, { useState } from 'react';
import { Button, Paper, TextField, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { FunctionComponent } from "react";
import { handleChange } from '../util';
import SplitPane from 'react-split-pane';
import Pane from 'react-split-pane/lib/Pane';
import '../../css/react-split-pane.css';
import Editor from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { Send as SendIcon } from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(2),
        display: "flex",
        flexDirection: "column",
        flexGrow: 1
    },
    editors: {
        flexGrow: 1
    },
    codeContainer: {
        margin: theme.spacing(2),
        padding: theme.spacing(2),
        display: "flex",
        flexDirection: "column",
        height: `calc(50% - ${theme.spacing(3)}px)`
    },
    challengeControlsHeader: {
        display: "flex",
        alignItems: "center",
        "& > :first-child": {
            flexGrow: 1
        },
        "& > :not(:last-child)": {
            marginRight: theme.spacing(2)
        }
    }
}));

export const CreateChallenge: FunctionComponent = () => {
    const classes = useStyles();

    const [title, setTitle] = useState("New Challenge");

    const editorOptions: editor.IEditorConstructionOptions = {
        minimap: { enabled: false },
        renderLineHighlight: "none",
        lineNumbersMinChars: 3,
    };

    const editors: editor.IStandaloneCodeEditor[] = [];

    return (
        <div className={classes.root}>
            <div className={classes.challengeControlsHeader}>
                <TextField
                    variant="filled"
                    label="Challenge Title"
                    value={title}
                    onChange={handleChange(setTitle)}
                />
                <span><Button variant="contained" color="secondary" size="large" endIcon={<SendIcon/>}>Publish</Button></span>
            </div>
            <SplitPane className={classes.editors} split="vertical" onChange={() => editors.forEach(x => x.layout())}>
                <Pane minSize="300px">
                    <Paper className={classes.codeContainer}>
                        <Typography variant="h6">Explain the Challenge</Typography>
                        <Editor language="markdown" options={editorOptions} editorDidMount={(_, e) => editors.push(e)}/>
                    </Paper>
                    <Paper className={classes.codeContainer}>
                        <Typography variant="h6">Starter Code</Typography>
                        <Editor language="javascript" options={editorOptions} editorDidMount={(_, e) => editors.push(e)}/>
                    </Paper>
                </Pane>
                <Pane minSize="300px">
                    <Paper className={classes.codeContainer}>
                        <Typography variant="h6">Sample Solution</Typography>
                        <Editor language="javascript" options={editorOptions} editorDidMount={(_, e) => editors.push(e)}/>
                    </Paper>
                    <Paper className={classes.codeContainer}>
                        <Typography variant="h6">Test Code</Typography>
                        <Editor language="javascript" options={editorOptions} editorDidMount={(_, e) => editors.push(e)}/>
                    </Paper>
                </Pane>
            </SplitPane>
        </div>
    );
};