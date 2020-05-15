import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import SearchBox from '../Menu/SearchBox';
import SelectRelation from './SelectRelation';
import FormGroup from '@material-ui/core/FormGroup'
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    addButton: {
      marginLeft: theme.spacing(2),
    },
    errorLabel: {
      marginTop: theme.spacing(1),
    },
    deleteText: {
      marginTop: theme.spacing(3),
    },
    relationGroup: {
      marginBottom: theme.spacing(1),
      display: 'flex',
    },
    relationText: {
      paddingTop: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    deleteButton: {
      marginLeft: 'auto',
    },
    search: {
      width: 300,
    }
}));

export default function PopupEditRelations(props) {
  const [open, setOpen] = React.useState(true);
  const [relatedPerson, setRelatedPerson] = React.useState(null);
  const [relationType, setRelationType] = React.useState("");
  const [relationError, setRelationError] = React.useState(false);
  const [personError, setPersonError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [reRender, setReRender] = React.useState(false);    // Se utiliza para vaciar el SearchBox al añadir una relación

  const classes = useStyles();

  const handleClose = () => {
    props.closePopup("editRelations");
    setOpen(false);
  };

  const handleSearchChange = (value) => {
      setRelatedPerson(value);
      setPersonError(false);
  }

  const handleSelectChange = (value) => {
      setRelationType(value);
      setRelationError(false);
  }

  const addRelation = () => {
    if (relationType === "" && relatedPerson === null){
      setRelationError(true);
      setPersonError(true);
      setErrorMessage("Debes seleccionar el tipo de relación y a la persona relacionada");
    } else if (relationType === ""){
      setRelationError(true);
      setErrorMessage("Debes seleccionar el tipo de relación");
    } else if (relatedPerson === null){
      setPersonError(true);
      setErrorMessage("Debes seleccionar a la persona relacionada");
    } else {
      props.addRelation(props.selectedPerson, relationType, relatedPerson);
      setRelatedPerson(null);
      setReRender(!reRender);
    }
  }

  const deleteRelation = (event) => {
    event.preventDefault();   // Para evitar que se recargue la página al hacer submit
    props.deleteRelation(props.selectedPerson, event.target.id);
  }

  return (
    <div>
      <Dialog maxWidth={'md'} open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Editar relaciones de {props.selectedPerson.getFullName()}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Añadir relaciones
          </DialogContentText>
          <FormGroup row>
            <SelectRelation
                error = {relationError}
                handleSelectChange = {handleSelectChange}
                person = {props.selectedPerson}
                partnerDisabled = {props.selectedPerson.getRelations().find(relation => relation.getType() === "partnerOf")}
            />
            <div className={classes.search}>
              <SearchBox
                  size = "medium"
                  reRender = {reRender}
                  personList = {props.personList}
                  selectedPerson = {props.selectedPerson}
                  handleSearchChange = {handleSearchChange}
                  error = {personError}
                  label = "Persona relacionada"
                  hasDisabledList = {true}
                  findRelation = {props.findRelation}
                  personSearch = {true}
              />
            </div>
            <Button className={classes.addButton} variant="contained" color="primary" onClick={addRelation}>
                Añadir
            </Button>
          </FormGroup>
          {personError || relationError ? <Typography color="error" className={classes.errorLabel} error>{errorMessage}</Typography> : null}
          <DialogContentText className={classes.deleteText}>
            Eliminar relaciones
          </DialogContentText>
          {props.selectedPerson.getRelations().map( relation => (
            <form key={relation.getID()} id={relation.getID()} onSubmit={deleteRelation}>
              <FormGroup row className={classes.relationGroup}>
                <Typography className={classes.relationText} gutterBottom>{relation.getRelation()}</Typography>
                <Button type="submit" className={classes.deleteButton} variant="contained" color="secondary">
                  Eliminar
                </Button>
              </FormGroup>
            </form>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}