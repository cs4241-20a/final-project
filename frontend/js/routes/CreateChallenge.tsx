import React, { useState } from 'react';
import { Button, DialogActions, DialogContent, DialogTitle, Paper, Snackbar, TextField, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { FunctionComponent } from "react";
import { handleChange, handleChangeWithValue } from '../utils/util';
import SplitPane from 'react-split-pane';
import Pane from 'react-split-pane/lib/Pane';
import { ControlledEditor as Editor } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { Send as SendIcon } from '@material-ui/icons';
import { SiteSettings } from './App';
import { useHistory } from 'react-router-dom';
import { useDialog } from '../components/DialogProvider';
import { Challenge } from '../types/challenge';
import { initMonaco } from '../utils/monaco';

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(2),
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        maxHeight: `calc(100vh - 64px)`
    },
    editors: {
        flexGrow: 1
    },
    codeContainer: {
        ...(theme.palette.type === 'dark' ? {
            color: '#d4d4d4',
            backgroundColor: '#1e1e1e',
        } : {}),
        margin: theme.spacing(2),
        padding: theme.spacing(2),
        display: "flex",
        flexDirection: "column",
        height: `calc(50% - ${theme.spacing(3)}px)`,
    },
    challengeControlsHeader: {
        display: "flex",
        alignItems: "center",
        margin: `0 ${theme.spacing(2)}px`,
        "& > :first-child": {
            flexGrow: 1
        },
        "& > :not(:last-child)": {
            marginRight: theme.spacing(2)
        }
    },
    sectionTitle: {
        lineHeight: 1
    },
    sectionCaption: {
        lineHeight: 1.2,
        margin: "0.3em 0 0.5em"
    }
}));

initMonaco();

export const CreateChallenge: FunctionComponent<{siteSettings: SiteSettings}> = ({siteSettings}) => {
    const classes = useStyles();
    const history = useHistory();
    const [openDialog, closeDialog] = useDialog();

    const [title, setTitle] = useState("New Challenge");

    const [description, setDescription] = useState(
`# Summary
In this challenge, you will have to write a Hello, World function.

# Objectives
- Write a function \`helloWorld\` which returns the string \`"Hello, World!"\`
- You can also require the presence of variables with certain values, and check for them in your test code!`);

    const [starterCode, setStarterCode] = useState(
`function helloWorld() {
    // Write your code here:
\ \ \ \ 
}`);

    const [solution, setSolution] = useState(
`function helloWorld() {
    return "Hello, World!";
}`);

    const [tests, setTests] = useState(
`// The tests will fail if any error is thrown
assert(helloWorld() == "Hello, World!");`);

    const [isPublishing, setIsPublishing] = useState(false);

    async function publish() {
        setIsPublishing(true);
        const response = await fetch('/api/challenge', {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                title,
                description,
                starterCode,
                solution,
                tests
            } as Omit<Challenge, 'id' | 'author'>)
        });
        setIsPublishing(false);
        if (response.ok) {
            const body = await response.json();
            console.log(body);
            history.push(`/play/${body.id}`);
        }
        else {
            openDialog({
                children: <>
                    <DialogTitle>Publish Failed</DialogTitle>
                    <DialogContent>
                        {await response.text() ?? "An unexpected error occurred"}
                    </DialogContent>
                    <DialogActions>
                        <Button color="secondary" onClick={closeDialog}>Close</Button>
                    </DialogActions>
                </>
            });
        }
    }

    const editorOptions: editor.IEditorConstructionOptions = {
        minimap: { enabled: false },
        renderLineHighlight: "none",
        lineNumbersMinChars: 3,
        renderWhitespace: 'none',
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
                <span><Button variant="contained" color="secondary" size="large" endIcon={<SendIcon/>} onClick={publish}>Publish</Button></span>
            </div>
            <SplitPane className={classes.editors} split="vertical" onChange={() => editors.forEach(x => x.layout())}>
                <Pane minSize="300px">
                    <Paper className={classes.codeContainer}>
                        <Typography className={classes.sectionTitle} variant="h6">Explain the Challenge</Typography>
                        <Typography className={classes.sectionCaption} variant="caption" component="div">Tell the user what their objective is in precise detail</Typography>
                        <Editor
                            language="markdown"
                            theme={siteSettings.theme === 'dark' ? 'vs-dark' : 'light'}
                            options={{...editorOptions, wordWrap: 'on'}}
                            value={description}
                            onChange={handleChangeWithValue(setDescription)}
                            editorDidMount={(_, e) => editors.push(e)}
                        />
                    </Paper>
                    <Paper className={classes.codeContainer}>
                        <Typography className={classes.sectionTitle} variant="h6">Starter Code</Typography>
                        <Typography className={classes.sectionCaption} variant="caption" component="div">Give the user some code to work with when they begin</Typography>
                        <Editor
                            language="javascript"
                            theme={siteSettings.theme === 'dark' ? 'vs-dark' : 'light'}
                            options={editorOptions}
                            value={starterCode}
                            onChange={handleChangeWithValue(setStarterCode)}
                            editorDidMount={(_, e) => editors.push(e)}/>
                    </Paper>
                </Pane>
                <Pane minSize="300px">
                    <Paper className={classes.codeContainer}>
                        <Typography className={classes.sectionTitle} variant="h6">Sample Solution</Typography>
                        <Typography className={classes.sectionCaption} variant="caption" component="div">Provide a working solution to your challenge. The user will not see this</Typography>
                        <Editor
                            language="typescript"
                            theme={siteSettings.theme === 'dark' ? 'vs-dark' : 'light'}
                            options={editorOptions}
                            value={solution}
                            onChange={handleChangeWithValue(setSolution)}
                            editorDidMount={(_, e) => editors.push(e)}
                        />
                    </Paper>
                    <Paper className={classes.codeContainer}>
                        <Typography className={classes.sectionTitle} variant="h6">Test Code</Typography>
                        <Typography className={classes.sectionCaption} variant="caption" component="div">Provide some code to verify that the user's solution is correct</Typography>
                        <Editor
                            language="typescript"
                            theme={siteSettings.theme === 'dark' ? 'vs-dark' : 'light'}
                            options={editorOptions}
                            value={tests}
                            onChange={handleChangeWithValue(setTests)}
                            editorDidMount={(_, e) => editors.push(e)}
                        />
                    </Paper>
                </Pane>
            </SplitPane>
            <Snackbar open={isPublishing} anchorOrigin={{vertical: "bottom", horizontal: "left"}} message="Publishing..."/>
        </div>
    );
};