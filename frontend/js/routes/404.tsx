import React from 'react';
import { Typography } from "@material-ui/core";
import { FunctionComponent } from "react";
import { Link } from 'react-router-dom';

export const FourOhFour: FunctionComponent = () => {
    return (<>
        <Typography variant="h1">404!</Typography>
        <Typography variant="body1">
            The page you're trying to visit does not exist! <Link to="/">Click here to return to the home page.</Link>
        </Typography>
    </>);
};