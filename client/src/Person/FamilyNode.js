import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PersonItem from './PersonItem';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'absolute',
        display: 'flex',
        padding: '10px',
        textAlign: 'center'
    },
    inner: {
        display: 'flex',
        flex: '1',
        flexDirection: 'column',
        boxShadow: '0.5px 0.5px 6px 0px rgba(0,0,0,0.75)',
        padding: 10,
        margin: 10,
        background: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        borderRadius: '5px'
    },
    sub: {
        position: 'absolute',
        top: '6px',
        right: '14px',
        width: '14px',
        height: '10px',
        border: '1px solid rgba(0, 0, 0, 0.2)',
        borderRadius: '4px 0',
        background: '#fff',
        cursor: 'pointer',
    },
    selected: {
        background: 'rgb(225, 225, 225)',
    },
  }));
  
export default function FamilyNode(props){
    const classes = useStyles();

    const changeSubtree = () => {
        props.changeSubtree(props.person);
    }

    if (props.person){
        return (
            <div className={classes.root} style={props.style}>
                <PersonItem
                    key = {props.person.getID()}
                    person = {props.person}
                    selected = {props.selected}
                    setSelected = {props.setSelected}
                    owned = {props.currentUser.getID() === props.person.getCreatedBy()}
                    isResult = {props.resultList.includes(props.person.getID())}
                />
                {props.node.hasSubTree && (
                <div
                    className = {classes.sub}
                    onClick = {changeSubtree}
                />
                )}
            </div>
            );
    } else {
        return (
        <div className={classes.root} style={props.style}>
            <div className={classes.inner}>
                <Typography>Antepasado</Typography>
            </div>
            {props.node.hasSubTree && (
            <div
                className={classes.sub}
            />
            )}
        </div>
        );
    }
}

