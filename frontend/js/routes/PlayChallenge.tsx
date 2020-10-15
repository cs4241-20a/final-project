import React, { useEffect, useRef, useState } from 'react';
import { Button, DialogActions, DialogContent, DialogTitle, Paper, Snackbar, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { FunctionComponent } from "react";
import { handleChange, handleChangeWithValue } from '../utils/util';
import SplitPane from 'react-split-pane';
import Pane from 'react-split-pane/lib/Pane';
import { ControlledEditor as Editor, EditorDidMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { Send as SendIcon } from '@material-ui/icons';
import { SiteSettings } from './App';
import { useHistory } from 'react-router-dom';
import { useDialog } from '../components/DialogProvider';
import { Challenge } from '../types/challenge';
import { initMonaco } from '../utils/monaco';
import { Markdown } from '../components/Markdown';

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
    descriptionContainer: {
        overflow: 'auto'
    },
    panePaper: {
        ...(theme.palette.type === 'dark' ? {
            color: '#d4d4d4',
            backgroundColor: '#202124',
        } : {}),
        margin: theme.spacing(2),
        padding: theme.spacing(2),
        display: "flex",
        flexDirection: "column",
        height: `calc(100% - ${theme.spacing(3)}px)`,
    },
    challengeTitle: {
        lineHeight: 1
    },
    challengeControlsHeader: {
        display: "flex",
        alignItems: "flex-end",
        margin: `0 ${theme.spacing(2)}px`,
        "& > :first-child": {
            flexGrow: 1
        },
        "& > :not(:last-child)": {
            marginRight: theme.spacing(2)
        }
    },
    sectionTitle: {
        lineHeight: 1,
        textOverflow: "ellipsis"
    },
    sectionCaption: {
        lineHeight: 1.2,
        margin: "0.3em 0 0.5em"
    }
}));

initMonaco();

interface PlayChallengeProps {
    siteSettings: SiteSettings;
    challengeId: string;
}

export const PlayChallenge: FunctionComponent<PlayChallengeProps> = ({siteSettings, challengeId}) => {
    const classes = useStyles();
    const history = useHistory();
    const [openDialog, closeDialog] = useDialog();

    const [challenge, setChallenge] = useState<Omit<Challenge, 'solution' | 'tests'> | undefined>();
    const [solution, setSolution] = useState("");

    useEffect(() => {
        (async () => {
            const response = await fetch(`/api/challenge/${challengeId}`);
            if (response.ok) {
                const challenge: Omit<Challenge, 'solution' | 'tests'> = await response.json();
                setChallenge(challenge);
                setSolution(challenge.starterCode);
                editor.current?.updateOptions({readOnly: false})
            }
            else {
                history.replace('/404');
            }
        })();
    }, []);

    const [isVerifyingSolution, setIsVerifyingSolution] = useState(false);

    async function submit() {
        setIsVerifyingSolution(true);
        const response = await fetch(`/api/challenge/${challengeId}/solve`, {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                solution
            })
        });
        const responseText = await response.text();
        setIsVerifyingSolution(false);
        const [responseTitle, responseMessage] = {
            "OK": ["Solved!", "You solved this challenge. Good job!"],
            "AssertionError": ["Not quite there...", "Your solution didn't manage to pass the provided tests. Keep trying!"],
            "SyntaxError": ["Syntax Error", "Your solution has a syntax error! Fix it and try to re-submit."],
            "Timeout": ["Timeout", "The server timed out while trying to run your code. This could be because of an infinite loop, or your solution may need to be made more performant."],
        }[responseText] ?? ["Error", "An unexpected error occurred: " + responseText];
        openDialog({
            children: <>
                <DialogTitle>{responseTitle}</DialogTitle>
                <DialogContent>{responseMessage}</DialogContent>
                <DialogActions>
                    <Button color="secondary" onClick={closeDialog}>Close</Button>
                </DialogActions>
            </>
        });
    }

    const editorOptions: editor.IEditorConstructionOptions = {
        minimap: { enabled: false },
        renderLineHighlight: "none",
        lineNumbersMinChars: 3,
        renderWhitespace: 'none'
    };

    const editor = useRef<editor.IStandaloneCodeEditor>();

    const handleEditorMount: EditorDidMount = (_, e) => {
        editor.current = e;
        if (challenge === undefined) {
            e.updateOptions({readOnly: true});
        }
    };

    return (
        <div className={classes.root}>
            <div className={classes.challengeControlsHeader}>
                <Typography className={classes.challengeTitle} variant="h4">{challenge?.title}</Typography>
                <Button variant="contained" color="secondary" size="large" endIcon={<SendIcon/>} onClick={submit}>Submit</Button>
            </div>
            <SplitPane className={classes.editors} split="vertical" onChange={() => editor.current?.layout()}>
                <Pane minSize="300px" initialSize="30%">
                    <Paper className={`${classes.panePaper} ${classes.descriptionContainer}`}>
                        <Markdown source={challenge?.description} />
                    </Paper>
                </Pane>
                <Pane minSize="300px">
                    <Paper className={classes.panePaper}>
                        <Typography className={classes.sectionTitle} variant="h6">Your Solution</Typography>
                        <Typography className={classes.sectionCaption} variant="caption" component="div">Enter your code here.</Typography>
                        <Editor
                            language="javascript"
                            theme={siteSettings.theme}
                            options={editorOptions}
                            value={solution}
                            onChange={handleChangeWithValue(setSolution)}
                            editorDidMount={handleEditorMount}
                        />
                    </Paper>
                </Pane>
            </SplitPane>
            <Snackbar open={isVerifyingSolution} anchorOrigin={{vertical: "bottom", horizontal: "left"}} message="Verifying solution..."/>
        </div>
    );
};