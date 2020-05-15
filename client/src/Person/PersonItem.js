import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  container:{
    width: 270,
    display: 'flex',
  },
  box: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    padding: 10,
    margin: 10,
    background: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    borderRadius: '5px',
  },
  male: {
    boxShadow: '0.5px 0.5px 6px 2px rgb(255, 155, 155)',
  },
  female: {
    boxShadow: '0.5px 0.5px 6px 2px rgb(155, 155, 255)',
  },
  other: {
    boxShadow: '0.5px 0.5px 6px 2px rgb(155, 255, 155)',
  },
  selected: {
    background: 'rgb(210, 210, 210)',
    transform: 'scale(1.03)'
  },
  unselected: {
    transition: 'transform 0.1s',
    '&:hover': {
      transform: 'scale(1.03)',
    }
  },
  owned: {
    border: 'outset gold 3px',
  },
  result: {
    background: 'lightblue',
  }
}));

export default function PersonItem(props) {
  const classes = useStyles();

  if (props.person){
    const handleClick = () => {
      props.setSelected(props.person);
    }

    let isSelected = "";
    if (props.selected){
      isSelected = classes.selected;
    } else {
      isSelected = classes.unselected;
    }

    let gender_class = "";
    if (props.person.getGender() === "male"){
      gender_class = classes.male;
    } else if (props.person.getGender() === "female"){
      gender_class = classes.female;
    } else {
      gender_class = classes.other;
    }

    let isOwned = "";
    if (props.owned){
      isOwned = classes.owned;
    }

    let isResult = "";
    if (props.isResult){
      isResult = classes.result;
    }

    return (
      <div className={`${classes.container} ${isSelected}`}>
        <div className={`${classes.box} ${gender_class} ${isOwned} ${isResult}`} onClick={handleClick}>
          <Typography>{props.person.getFullName()}</Typography>
          {props.person.getEstimatedDate() ? 
            <Typography color={"textSecondary"}>{props.person.getEstimatedBirthYear()}</Typography>
            :
            <Typography color={"textSecondary"}>{props.person.getFormattedBirthdate()}</Typography>
          }
        </div>
      </div>
    );
  } else {
    return (<div></div>);
  }
}