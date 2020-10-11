import React, { useState } from 'react';
import { Button, Paper, TextField, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { FunctionComponent } from "react";
import { handleChange } from '../util';
import SplitPane from 'react-split-pane';
import Pane from 'react-split-pane/lib/Pane';
import { ControlledEditor as Editor, monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { Send as SendIcon } from '@material-ui/icons';
import '../../css/react-split-pane.css';
import editorTypes from '!!raw-loader!../../assets/challengelib.d.ts';

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
    },
    sectionTitle: {
        lineHeight: 1
    },
    sectionCaption: {
        lineHeight: 1.2,
        margin: "0.3em 0 0.5em"
    }
}));

monaco.config({
    paths: {
        vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.21.2/min/vs'
    }
})

monaco.init().then(async monaco => {
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        ...monaco.languages.typescript.javascriptDefaults.getCompilerOptions(),
        lib: ["es2019"]
    });
    monaco.languages.typescript.javascriptDefaults.addExtraLib(editorTypes, "challengelib.d.ts");
});

export const CreateChallenge: FunctionComponent = () => {
    const classes = useStyles();

    const [title, setTitle] = useState("New Challenge");

    const [description, setDescription] = useState(
`# Summary
In this challenge, you will have to write a Hello, World function.

# Objectives
- Write a function \`helloWorld\` which returns the string \`"Hello, World!"\``);

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
console.assert(helloWorld() == "Hello, World!");`);

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
                <span><Button variant="contained" color="secondary" size="large" endIcon={<SendIcon/>}>Publish</Button></span>
            </div>
            <SplitPane className={classes.editors} split="vertical" onChange={() => editors.forEach(x => x.layout())}>
                <Pane minSize="300px">
                    <Paper className={classes.codeContainer}>
                        <Typography className={classes.sectionTitle} variant="h6">Explain the Challenge</Typography>
                        <Typography className={classes.sectionCaption} variant="caption" component="div">Tell the user what their objective is in precise detail</Typography>
                        <Editor
                            language="markdown"
                            options={{...editorOptions, wordWrap: 'on'}}
                            value={description}
                            onChange={handleChange(setDescription)}
                            editorDidMount={(_, e) => editors.push(e)}
                        />
                    </Paper>
                    <Paper className={classes.codeContainer}>
                        <Typography className={classes.sectionTitle} variant="h6">Starter Code</Typography>
                        <Typography className={classes.sectionCaption} variant="caption" component="div">Give the user some code to work with when they begin</Typography>
                        <Editor
                            language="javascript"
                            options={editorOptions}
                            value={starterCode}
                            onChange={handleChange(setStarterCode)}
                            editorDidMount={(_, e) => editors.push(e)}/>
                    </Paper>
                </Pane>
                <Pane minSize="300px">
                    <Paper className={classes.codeContainer}>
                        <Typography className={classes.sectionTitle} variant="h6">Sample Solution</Typography>
                        <Typography className={classes.sectionCaption} variant="caption" component="div">Provide a working solution to your challenge. The user will not see this</Typography>
                        <Editor
                            language="javascript"
                            options={editorOptions}
                            value={solution}
                            onChange={handleChange(setSolution)}
                            editorDidMount={(_, e) => editors.push(e)}
                        />
                    </Paper>
                    <Paper className={classes.codeContainer}>
                        <Typography className={classes.sectionTitle} variant="h6">Test Code</Typography>
                        <Typography className={classes.sectionCaption} variant="caption" component="div">Provide some code to verify that the user's solution is correct</Typography>
                        <Editor
                            language="javascript"
                            options={editorOptions}
                            value={tests}
                            onChange={handleChange(setTests)}
                            editorDidMount={(_, e) => editors.push(e)}
                        />
                    </Paper>
                </Pane>
            </SplitPane>
        </div>
    );
};