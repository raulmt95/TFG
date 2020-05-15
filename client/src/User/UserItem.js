import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  container: {
    width: 250,
    boxShadow: '0.5px 0.5px 6px 0px rgba(0,0,0,0.75)',
    textAlign: 'center',
    padding: 10,
    margin: 10,
    float: 'left',
    cursor: 'pointer',
  },
  selected: {
    background: 'rgba(225, 225, 225, 0.5)',
    outline: 'solid lightgrey 2px',
  },
}));

export default function UserItem(props) {
  const classes = useStyles();

  const handleClick = () => {
    props.setSelected(props.user);
  }

  let selected_class = "";
  if (props.selected){
    selected_class = classes.selected;
  } else {
    selected_class = "";
  }

  return (
    <div className={`${classes.container} ${selected_class}`} onClick={handleClick}>
      <Typography>{props.user.getEmail()}</Typography>
      <Typography>Tipo: {props.user.getRole()}</Typography>
    </div>
  );
}