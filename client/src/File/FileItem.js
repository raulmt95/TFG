import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    width: 220,
    height: 220,
    margin: '0.5%',
    float: 'left',
  },
  selected: {
    backgroundColor: 'rgb(225, 225, 225)',
    transform: 'scale(1.03)',
  },
  unselected:{
    transition: 'transform 0.1s',
    '&:hover': {
      transform: 'scale(1.03)',
    }
  },
  owned: {
    border: 'outset gold 2px',
  },
  filePreview: {
    maxWidth: '90%',
    maxHeight: '90%',
    display: 'block',
    margin: 'auto',
    boxShadow: '2.5px 2.5px 8px 0.5px rgba(0,0,0,0.75)',
    textAlign: 'center',
    cursor: 'pointer',
    background: 'white',
  },
  linkImage: {
    maxWidth: '70%',
    maxHeight: '70%',
    display: 'block',
    margin: 'auto',
    padding: '5% 0',
  },
  linkText: {
    width: '80%',
    margin: 'auto',
  }
}));

export default function FileItem(props) {
  const classes = useStyles();

  const handleClick = () => {
    props.parentHandler(props.file);
  }

  let isSelected = "";
  if (props.selected){
    isSelected = classes.selected;
  } else {
    isSelected = classes.unselected
  }

  let isOwned = "";
  if(props.owned){
    isOwned = classes.owned;
  }

  return (
    <div className={`${classes.container} ${isSelected}`} onClick={handleClick}>
      {props.file.getType() === "application/pdf" ?
        <embed className={`${classes.filePreview} ${isOwned}`} src={`${props.serverName}/files/${props.file.getFilename()}`} type="application/pdf"/>
        : null
      }
      {props.file.getType().includes("image") ? 
        <img className={`${classes.filePreview} ${isOwned}`} alt={props.file.getTitle()} src={`${props.serverName}/files/${props.file.getFilename()}`}/>
        : null
      }
      {props.file.getType() === "video/mp4" ? 
        <video className={`${classes.filePreview} ${isOwned}`}>
          <source src={`${props.serverName}/files/${props.file.getFilename()}`} type={props.file.getType()}/>
        </video>
        : null
      }
      {props.file.getType() === "link" ?
        <figure className={`${classes.filePreview} ${isOwned}`}>
          <img className={classes.linkImage} alt={props.file.getTitle()} src="text_placeholder.png"/>
          <Typography noWrap className={classes.linkText}>{props.file.getTitle()}</Typography>
        </figure>
        : null
      }
    </div>
  );
}