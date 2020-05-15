import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import SearchBox from '../Menu/SearchBox';
import FormGroup from '@material-ui/core/FormGroup';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

const useStyles = makeStyles((theme) => ({
  title: {
    textAlign: 'center',
  },
  dialogContent: {
    display: 'flex',
    backgroundColor: 'rgb(240, 240, 240)',
    margin: '0 2%',
    borderRadius: 10,
  },
  fileDisplay: {
    width: 750,
    height: 595,
    display: 'flex',
    marginLeft: -15,
  },
  file: {
    maxWidth: '80%',
    maxHeight: '100%',
    display: 'block',
    margin: 'auto',
    boxShadow: '1px 1px 6px 0px rgba(0,0,0,0.75)',
    textAlign: 'center',
  },
  linkImage: {
    width: '40%',
    padding: '5% 0',
    margin: 'auto',
  },
  linkText: {
    maxWidth: '90%',
    margin: 'auto',
    wordBreak: 'break-all',
  },
  figure: {
    margin: '0px',
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'white',
  },
  fileInfo: {
    width: 300,
    height: 595,
    marginLeft: '2%',
    marginRight: -15,
    paddingRight: '1.5%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
  addButton: {
    marginLeft: 'auto',
    maxWidth: '13%',
    maxHeight: '100%',
    minWidth: '13%',
    minHeight: '100%',
  },
  search: {
    width: '82%',
  },
  relationList: {
    marginTop: theme.spacing(1),
  },
  relationGroup: {
    marginBottom: theme.spacing(1),
    display: 'flex',
  },
  relationName: {
    paddingTop: theme.spacing(1),
  },
  deleteButton: {
    marginLeft: 'auto',
    maxWidth: '13%',
    maxHeight: '100%',
    minWidth: '13%',
    minHeight: '100%',
  },
}));

export default function PopupViewFile(props) {
  const [open, setOpen] = React.useState(true);
  const [file, setFile] = React.useState(props.file);
  const [relatedPerson, setRelatedPerson] = React.useState(null);
  const [personError, setPersonError] = React.useState(false);
  const [reRender, setReRender] = React.useState(false); // Usado para limpiar searchBox
  const [fileList] = React.useState(props.fileList);

  const classes = useStyles();


  const handleClose = () => {
    props.closePopup(props.type);
    setOpen(false);
  };

  const handleSearchChange = (value) => {
    setRelatedPerson(value);
    setPersonError(false);
  }

  const addRelation = () => {
    if (relatedPerson === null){
      setPersonError(true);
    } else {
      props.addRelation(file, relatedPerson);
      setRelatedPerson(null);
      setReRender(!reRender);
    }
  }

  const deleteRelation = (event) => {
    event.preventDefault();   // Para evitar que se recargue la página al hacer submit
    props.deleteRelation(file, event.target.id);
  }

  const previousFile = () => {
    let index = fileList.indexOf(file);
    setFile(fileList[index - 1]);
  }

  const nextFile = () => {
    let index = fileList.indexOf(file);
    setFile(fileList[index + 1]);
  }

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
      >
        <DialogTitle className={classes.title}>{file.getTitle()}</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <div className={classes.fileDisplay}>
            <Button onClick={previousFile} disabled={fileList.indexOf(file) === 0}>
              <ArrowBackIosIcon/>
            </Button>
            {file.getType() === "application/pdf" ?
              <embed width="100%" height="100%" src={`${props.serverName}/files/${file.getFilename()}`} type="application/pdf"/>
              : null
            }
            {file.getType().includes("image") ? 
              <img className={classes.file} alt={file.getTitle()} src={`${props.serverName}/files/${file.getFilename()}`}/>
              : null
            }
            {file.getType() === "video/mp4" ? 
              <video className={classes.file} controls>
                <source src={`${props.serverName}/files/${file.getFilename()}`} type={file.getType()}/>
              </video>
              : null
            }
            {file.getType() === "link" ?
              <a className={classes.file} href={file.getFilename()} target="_blank" rel="noopener noreferrer">
                <figure className={classes.figure}>
                  <img alt="" className={classes.linkImage} src="text_placeholder.png"/>
                  {/* <Typography className={classes.linkText}>{file.getFilename()}</Typography> */}
                  <figcaption className={classes.linkText}>{file.getFilename()}</figcaption>
                </figure>
              </a>   
              : null
            }
            <Button onClick={nextFile} disabled={fileList.indexOf(file) === fileList.length-1}>
              <ArrowForwardIosIcon/>
            </Button>
          </div>
          <div className={classes.fileInfo}>
            <Typography gutterBottom color={"textSecondary"}>
              Subido el {file.getFormattedDate()} por {file.getUploadedBy() ? 
                (props.userList.find(u => u.getID() === file.getUploadedBy())).getEmail()
                :
                "desconocido"
              }
            </Typography>
            <Typography gutterBottom align={"justify"}>
              {file.getDescription()}
            </Typography>
            <Typography gutterBottom variant="h6">
              Personas relacionadas
            </Typography>
            <div>
              {props.currentUser.getID() === file.getUploadedBy() || props.currentUser.getRole() === 'admin' ?
                <FormGroup row>
                  <div className={classes.search}>
                    <SearchBox
                      size = "small"
                      reRender = {reRender}
                      personList = {props.personList}
                      handleSearchChange = {handleSearchChange}
                      error = {personError}
                      label = "Persona relacionada"
                      viewingFile = {file}
                      personSearch = {true}
                    />
                  </div>
                  <Button className={classes.addButton} variant="contained" color="primary" onClick={addRelation}>
                      <AddIcon/>
                  </Button>
                  {personError ?
                    <Typography color={"error"}>Selecciona una persona</Typography> 
                    : null
                  }
                </FormGroup>
                : null
              }
              <div className={classes.relationList}>
                {file.getRelations().map( relation => {
                  return props.personList.find(p => p === relation.getTo()) ? ( // No se muestran las personas borradas recientemente
                    <form key={relation.getID()} id={relation.getID()} onSubmit={deleteRelation}>
                      <FormGroup row className={classes.relationGroup}>
                        <Typography gutterBottom className={classes.relationName}>{relation.getTo().getFullName()}</Typography>
                        {props.currentUser.getID() === file.getUploadedBy() || props.currentUser.getRole() === 'admin' ?
                          <Button className={classes.deleteButton} type="submit" variant="contained" color="secondary">
                            <RemoveIcon/>
                          </Button>
                          : null
                        }
                      </FormGroup>
                    </form> )
                    : 
                    (null)
                })}
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" autoFocus>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}