import React from 'react';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import PersonItem from './PersonItem';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    borderRight: 'solid rgb(225, 225, 225) 1px',
    height: '100%',
    paddingTop: '1%',
    textAlign: 'center',
    width: '280px',
    left: 0,
    background: 'rgb(245, 245, 245)',
  },
  list: {
    height: '95%',
    overflowY: 'scroll',
    margin: '1%',
  },
  textContainer: {
    height: '4%',
  }
}));

export default function PersonList(props) {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
        <div className={classes.textContainer}>
            <Typography gutterBottom>Lista de personas</Typography>
        </div>
        <div className={classes.list}>
            {props.personList.map( person => (
                <PersonItem 
                    key = {person.getID()}
                    person = {person}
                    selected = {props.selectedPerson === person}
                    setSelected = {props.setSelected}
                    owned = {props.currentUser.getID() === person.getCreatedBy()}
                    isResult = {props.resultList.includes(person.getID())}
                />
            ))}
        </div>
    </div>
  );
}