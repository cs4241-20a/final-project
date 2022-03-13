/**
 * Originally by boganegru on Github, with various modifications
 * https://gist.github.com/boganegru/a4da0b0da0b1233d30b10063b10efa8a
 */

import React, { FunctionComponent } from 'react';
import ReactMarkdown, { ReactMarkdownProps } from 'react-markdown';
import { makeStyles } from '@material-ui/core/styles';
import {TableHead, TableRow, TableCell, TableBody, TypographyProps, Typography, TableContainer, Table, Paper, Link as MaterialLink} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    list: {
        margin: 0
    },
    listItem: {
        marginTop: theme.spacing(1),
    },
    header: {
        marginTop: theme.spacing(2),
        marginBottom: 0,
        "&:first-child": {
            marginTop: 0
        }
    }
}));

const MarkdownHeading: FunctionComponent<{level: number}> = ({level, ...props}) => {
    const classes = useStyles();

    const variant: TypographyProps['variant'] = ([
        "", "h6", "subtitle1", "subtitle2" 
    ] as TypographyProps['variant'][])[level] ?? "subtitle2";

    return <Typography className={classes.header} gutterBottom variant={variant}>{props.children}</Typography>;
};

const MarkdownParagraph: FunctionComponent = props => <Typography>{props.children}</Typography>;

const MarkdownList: FunctionComponent<{ordered: boolean}> = ({ordered, ...props}) => {
    const classes = useStyles();
    return ordered ? (
        <ol className={classes.list}>{props.children}</ol>
    ) : (
        <ul className={classes.list}>{props.children}</ul>
    );
};

const MarkdownListItem: FunctionComponent = ({ ...props }) => {
    const classes = useStyles();
    return (
        <li className={classes.listItem}>
            <Typography component="span">{props.children}</Typography>
        </li>
    );
};

const MarkdownTable: FunctionComponent = props => (
    <TableContainer component={Paper}>
        <Table size="small" aria-label="a dense table">{props.children}</Table>
    </TableContainer>
);

const MarkdownTableCell: FunctionComponent = props => <TableCell><Typography>{props.children}</Typography></TableCell>;

const MarkdownTableRow: FunctionComponent = props => <TableRow>{props.children}</TableRow>;

const MarkdownTableBody: FunctionComponent = props => <TableBody>{props.children}</TableBody>;

const MarkdownTableHead: FunctionComponent = props => <TableHead>{props.children}</TableHead>;

const renderers: ReactMarkdownProps['renderers'] = {
    heading: MarkdownHeading,
    paragraph: MarkdownParagraph,
    link: MaterialLink,
    list: MarkdownList,
    listItem: MarkdownListItem,
    table: MarkdownTable,
    tableHead: MarkdownTableHead,
    tableBody: MarkdownTableBody,
    tableRow: MarkdownTableRow,
    tableCell: MarkdownTableCell,
};

export const Markdown: FunctionComponent<ReactMarkdownProps> = props => {
    return <ReactMarkdown escapeHtml={false} renderers={renderers} {...props} />;
}