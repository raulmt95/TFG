import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import SelectGender from "./SelectGender";
import { Typography, FormGroup, FormControlLabel, Checkbox } from '@material-ui/core';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  dateGroup: {
    display: 'flex',
    width: 400,
  },
  checkboxGroup: {
    marginLeft: 'auto',
    marginTop: '4px',
  },
  formText: {
    width: 400,
  }
}));

export default function PopupAddPerson(props) {
  const [open, setOpen] = React.useState(true);
  const [name, setName] = React.useState(props.personName);
  const [surname, setSurname] = React.useState(props.personSurname);
  const [birthdate, setBirthdate] = React.useState(props.birthdate);
  const [estimatedDate, setEstimatedDate] = React.useState(props.estimatedDate);
  const [gender, setGender] = React.useState(props.personGender);
  const [emptyNameError, setEmptyNameError] = React.useState(false);
  const [inputNameError, setInputNameError] = React.useState(false);
  const [inputSurnameError, setInputSurnameError] = React.useState(false);
  const [emptyBirthdateError, setEmptyBirthdateError] = React.useState(false);
  const [inputBirthdateError, setInputBirthdateError] = React.useState(false);
  const [type] = React.useState(props.type);

  const classes = useStyles();

  let title = "";
  if (type === "edit"){
    title = "Editar persona";
  } else {
    title = "Añadir persona";
  }

  const handleClose = () => {
    props.closePopup(type);

    setOpen(false);
  };

  const handleChange = (event) => {
    switch (event.target.name){
        case "name":
            setName(event.target.value);
            setEmptyNameError(false);
            break;
        case "surname":
            setSurname(event.target.value);
            break;
        case "checkbox":
            setEstimatedDate(!estimatedDate);
            break;
        default:
    }
  }

  const handleGenderChange = (gender) => {
    setGender(gender);
  }

  const handleDateChange = (date) => {
    setBirthdate(date);
    setEmptyBirthdateError(false);
  }

  const handleDateError = (value) => {
    if (value !== ""){
      setInputBirthdateError(true);
    } else {
      setInputBirthdateError(false);
    }
  }

  const handleConfirm = () => {
    let symbols = /[!$%^&*()_+|~=`{}[\]:";'<>?,./]/;

    if (name === ""){
      setEmptyNameError(true);
    }
    if (name.match(symbols)){
      setInputNameError(true);
    } else {
      setInputNameError(false);
    }
    if (surname.match(symbols)){
      setInputSurnameError(true);
    } else {
      setInputSurnameError(false);
    }
    if (birthdate === null){
      setEmptyBirthdateError(true);
    }
     
    if (name !== "" && !name.match(symbols) && !surname.match(symbols) && birthdate !== null && inputBirthdateError === false){
      if (type === "edit"){
        if (typeof(birthdate) === "number"){
          props.editPerson(name, surname, birthdate, estimatedDate, gender);
        } else {
          props.editPerson(name, surname, birthdate.getTime(), estimatedDate, gender);
        }
      } else{ 
        props.addPerson(name, surname, birthdate.getTime(), estimatedDate, gender);
      }

      handleClose();
    }
  }

  return (
    <div>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Introduzca los siguientes datos
          </DialogContentText>
          <FormGroup className={classes.formText}>
            <TextField
              autoFocus
              margin = "dense"
              variant = "outlined"
              name = "name"
              label = "Nombre"
              type = "text"
              value = {name}
              onChange = {handleChange}
              error = {emptyNameError || inputNameError}
              fullWidth
              required
            />
            {emptyNameError === true ? <Typography color="error">El nombre no puede estar vacío</Typography> : null}
            {inputNameError === true ? <Typography color="error">No se permiten caracteres especiales excepto '-'</Typography> : null}
          </FormGroup>
          <FormGroup className={classes.formText}>
            <TextField
              margin = "dense"
              variant = "outlined"
              name = "surname"
              label = "Apellidos"
              type = "text"
              value = {surname}
              onChange = {handleChange}
              error = {inputSurnameError}
              fullWidth
            />
            {inputSurnameError === true ? <Typography color="error">No se permiten caracteres especiales excepto '-'</Typography> : null}
          </FormGroup>
          <FormGroup row className={classes.dateGroup}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                disableToolbar
                inputVariant = "outlined"
                invalidDateMessage = "Formato de fecha inválido"
                minDate = {"1000/01/01"}
                minDateMessage = "La fecha no debe ser anterior al 01/01/1000"
                maxDateMessage = "La fecha no debe ser posterior al 01/01/2100"
                format = "dd/MM/yyyy"
                margin = "dense"
                label = "Fecha de nacimiento"
                value = {birthdate}
                onChange = {handleDateChange}
                onError = {handleDateError}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
                required
              />
            </MuiPickersUtilsProvider>
            <FormGroup row className={classes.checkboxGroup}>
              <FormControlLabel
                control={<Checkbox onChange={handleChange} name="checkbox" checked={estimatedDate}/>}
                label="Aproximada"
              />
            </FormGroup>
            {emptyBirthdateError === true ? <Typography color="error">La fecha de nacimiento no puede estar vacía</Typography> : null}
          </FormGroup>
          {type === "edit" ? 
          <SelectGender handleGenderChange={handleGenderChange} selected={gender}/>
          : 
          <SelectGender handleGenderChange={handleGenderChange} selected='male'/>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}