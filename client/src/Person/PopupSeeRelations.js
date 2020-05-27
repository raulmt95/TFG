import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import SearchBox from '../Menu/SearchBox';
import FormGroup from '@material-ui/core/FormGroup';
import QueryItem from '../User/QueryItem';

import { makeStyles } from '@material-ui/core/styles';
import { FormLabel, Typography, TextField } from '@material-ui/core';
import SelectRelation from './SelectRelation';

const useStyles = makeStyles((theme) => ({
    errorLabel: {
      marginTop: theme.spacing(2),
    },
    relationInfo: {
      marginTop: theme.spacing(2),
      maxWidth: 700,
      maxHeight: 55,
      overflowY: 'scroll',
    },
    search: {
      width: 300,
      marginRight: theme.spacing(2),
    },
    queryList: {
      maxHeight: 110,
      overflowY: 'scroll',
    }
}));

export default function PopupEditRelations(props) {
  const [open, setOpen] = React.useState(true);
  const [firstPerson, setFirstPerson] = React.useState(props.selectedPerson);
  const [secondPerson, setSecondPerson] = React.useState(null);
  const [thirdPerson, setThirdPerson] = React.useState(props.selectedPerson);
  const [firstPersonError, setFirstPersonError] = React.useState(false);
  const [secondPersonError, setSecondPersonError] = React.useState(false);
  const [thirdPersonError, setThirdPersonError] = React.useState(false);
  const [relationInfo, setRelationInfo] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [secondErrorMessage, setSecondErrorMessage] = React.useState("");
  const [relationType, setRelationType] = React.useState("");
  const [relationError, setRelationError] = React.useState(false);
  const [searchByRelationResult, setSearchByRelationResult] = React.useState("");
  const [nameForSearch, setNameForSearch] = React.useState("");
  const [emptyNameError, setEmptyNameError] = React.useState(false);
  const [searchByNameResult, setSearchByNameResult] = React.useState("");

  const classes = useStyles();

  const getGenderedNoun = (type, gender) => {
    switch (type) {
        case "parent":
            switch (gender) {
                case "male":
                    return "PADRE";
                case "female":
                    return "MADRE";
                default:
                    return "PADRE/MADRE";
            }
        case "child":
            switch (gender) {
                case "male":
                    return "HIJO";
                case "female":
                    return "HIJA";
                default:
                    return "HIJO/HIJA";
            }
        case "siblings":
            switch (gender) {
                case "male":
                    return "HERMANO";
                case "female":
                    return "HERMANA";
                default:
                    return "HERMANO/HERMANA";
            }
        case "grandparent":
            switch (gender) {
                case "male":
                    return "ABUELO";
                case "female":
                    return "ABUELA";
                default:
                    return "ABUELO/ABUELA";
            }
        case "grandchild":
            switch (gender) {
                case "male":
                    return "NIETO";
                case "female":
                    return "NIETA";
                default:
                    return "NIETO/NIETA";
            }
        case "uncle":
            switch (gender) {
                case "male":
                    return "TÍO";
                case "female":
                    return "TÍA";
                default:
                    return "TÍO/TÍA";
            }
        case "nephew":
            switch (gender) {
                case "male":
                    return "SOBRINO";
                case "female":
                    return "SOBRINA";
                default:
                    return "SOBRINO/SOBRINA";
            }
        case "parentInLaw":
            switch (gender) {
                case "male":
                    return "SUEGRO";
                case "female":
                    return "SUEGRA";
                default:
                    return "SUEGRO/SUEGRA";
            }
        case "siblingInLaw":
            switch (gender) {
                case "male":
                    return "CUÑADO";
                case "female":
                    return "CUÑADA";
                default:
                    return "CUÑADO/CUÑADA";
            }
        case "childInLaw":
            switch (gender) {
                case "male":
                    return "YERNO";
                case "female":
                    return "NUERA";
                default:
                    return "YERNO/NUERA";
            }
        case "cousin":
            switch (gender) {
                case "male":
                    return "PRIMO";
                case "female":
                    return "PRIMA";
                default:
                    return "PRIMO/PRIMA";
            }
        case "ancestor":
            return "ANTEPASADO";
        case "descendant":
            return "DESCENDIENTE";
        default:
    }
  }

  const handleClose = () => {
    props.closePopup("seeRelations");
    setOpen(false);
  };

  const handleFirstSearchChange = (value) => {
    setFirstPerson(value);
    setFirstPersonError(false);
  }

  const handleSecondSearchChange = (value) => {
    setSecondPerson(value);
    setSecondPersonError(false);
  }

  const handleThirdSearchChange = (value) => {
    setThirdPerson(value);
    setThirdPersonError(false);
  }

  const handleSelectChange = (value) => {
    setRelationType(value);
    setRelationError(false);
  }

  const handleTextFieldChange = (event) => {
    switch (event.target.name){
        case "name":
            setNameForSearch(event.target.value);
            setEmptyNameError(false);
            break;
        default:
    }
  }

  /**
   * Busca la relación entre dos personas y la imprime
   * @param {PersonObject} onePerson Persona origen de la relación
   * @param {PersonObject} anotherPerson Person fin de la relación
   * @param {Boolean} isRepeated Indica si la consulta se está realizando desde la lista de consultas anteriores
   */
  const calculateRelation = (onePerson, anotherPerson, isRepeated) => {
    if (onePerson === null && anotherPerson === null){
        setFirstPersonError(true);
        setSecondPersonError(true);
        setErrorMessage("Debes rellenar los campos");
    } else if (onePerson === null){
        setFirstPersonError(true);
        setErrorMessage("Debes rellenar el primer campo");
    } else if (anotherPerson === null){
        setSecondPersonError(true);
        setErrorMessage("Debes rellenar el segundo campo");
    } else {
        setErrorMessage("");
        if (!isRepeated){
            props.addToQueryList("findRelation", onePerson.getID(), anotherPerson.getID());
        }
        props.findRelation(onePerson, anotherPerson)
        .then(function(result){
            if (result === false){
                props.setResultList([]);
                setRelationInfo(`${onePerson.getFullName()} y ${anotherPerson.getFullName()} no están relacionados`);
            } else {
                props.setResultList([onePerson.getID(), anotherPerson.getID()]);
                if (result === "partners"){
                    setRelationInfo(`${onePerson.getFullName()} y ${anotherPerson.getFullName()} son PAREJA`);
                } else {
                    setRelationInfo(`${onePerson.getFullName()} es ${getGenderedNoun(result, onePerson.getGender())} de ${anotherPerson.getFullName()}`);
                }
            }
        })
        .catch(err => console.log(err));
    }
  }

  /**
   * Busca todas las personas con un mismo tipo de relación con una persona
   * @param {String} type Tipo de relación
   * @param {PersonObject} person Persona sobre la cual se realiza la búsqueda
   * @param {Boolean} isRepeated Indica si la consulta se está realizando desde la lista de consultas anteriores
   */
  const findByRelationType = (type, person, isRepeated) => {
    if (type === "" && person === null){
        setRelationError(true);
        setThirdPersonError(true);
        setSecondErrorMessage("Debes seleccionar el tipo de relación y la persona");
    } else if (type === ""){
        setRelationError(true);
        setSecondErrorMessage("Debes seleccionar el tipo de relación");
    } else if (person === null){
        setThirdPersonError(true);
        setSecondErrorMessage("Debes seleccionar una persona");
    } else {
        if (!isRepeated){
            props.addToQueryList("findByRelationType", type, person.getID());
        }
        let relatedList = "";
        let IDList = [];
        let itemsProcessed = 0;
        props.personList.forEach(p => {
            props.findRelation(p, person)
            .then(function(result){
                if (result === type){
                    if (relatedList.length === 0){
                        relatedList = p.getFullName();
                    } else {
                        relatedList += ", " + p.getFullName();
                    }
                    IDList.push(p.getID());
                }
                itemsProcessed++;
                if (itemsProcessed === props.personList.length){ // En la última iteración se rellena la lista del estado
                    if (relatedList.length === 0){
                        setSearchByRelationResult("No hay resultados");
                        props.setResultList([]);
                    } else {
                        setSearchByRelationResult(relatedList);
                        props.setResultList(IDList);
                    }
                }
            })
            .catch(err => console.log(err));
        });
    }
  }

  /**
   * Busca las personas cuyo nombre o apellido contiene la cadena de texto introducida
   * @param {String} name Cadena de texto introducida
   * @param {Boolean} isRepeated Indica si la consulta se está realizando desde la lista de consultas anteriores
   */
  const findByName = (name, isRepeated) => {
    if (name === ""){
        setEmptyNameError(true);
    } else {
        if (!isRepeated){
            props.addToQueryList("findByName", name, "");
        }
        let resultList = "";
        let IDList = [];
        props.personList.forEach(function(person){
            if (person.getFullName().toLowerCase().includes(name.toLowerCase())){
                if (resultList.length === 0){
                    resultList = person.getFullName();
                } else {
                    resultList += ", " + person.getFullName();
                }
                IDList.push(person.getID());
            }
        });
        if (resultList.length === 0){
            setSearchByNameResult("No hay resultados");
            props.setResultList([]);
        } else {
            setSearchByNameResult(resultList);
            props.setResultList(IDList);
        }
    }
  }

  /**
   * Realiza una consulta a partir de la lista de consultas anteriores
   * Los parámetros cambian según el tipo de consulta:
   * - Tipo: findRelation -> firstParameter: personID, secondParameter: personID
   * - Tipo: findByRelationType -> firstParameter: relationType, secondParameter: personID
   * - Tipo: findByName -> firstParameter: name, secondParameter: vacío
   * @param {String} type Tipo de consulta
   * @param {String} firstParameter Primer parámetro de la consulta
   * @param {String} secondParameter Segundo parámetro de la consulta
   */
  const executeQuery = (type, firstParameter, secondParameter) => {
      if (type === "findRelation"){
          let onePerson = props.personList.find(p => p.getID() === firstParameter);
          let anotherPerson = props.personList.find(p => p.getID() === secondParameter);
          calculateRelation(onePerson, anotherPerson, true);
      } else if (type === "findByRelationType"){
          let person = props.personList.find(p => p.getID() === secondParameter);
          findByRelationType(firstParameter, person, true);
      } else if (type === "findByName"){
          findByName(firstParameter, true);
      }
  }

  return (
    <div>
      <Dialog maxWidth={'md'} open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Consultas</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Relación entre 2 personas
          </DialogContentText>
          <FormGroup row>
            <div className={classes.search}>
                <SearchBox
                    default = {firstPerson}
                    personList = {props.personList}
                    selectedPerson = {secondPerson}
                    handleSearchChange = {handleFirstSearchChange}
                    error = {firstPersonError}
                    label = "Persona 1"
                    personSearch = {true}
                />
            </div>
            <div className={classes.search}>
                <SearchBox
                    personList = {props.personList}
                    selectedPerson = {firstPerson}
                    handleSearchChange = {handleSecondSearchChange}
                    error = {secondPersonError}
                    label = "Persona 2"
                    personSearch = {true}
                />
            </div>
            <Button variant="contained" color="primary" onClick={() => calculateRelation(firstPerson, secondPerson, false)}>
                Comprobar
            </Button>
          </FormGroup>
          {errorMessage !== "" ? <FormLabel className={classes.errorLabel} error>{errorMessage}</FormLabel> : null}
          <Typography className={classes.relationInfo} gutterBottom>{relationInfo}</Typography>

          <DialogContentText>
            Por tipo de relación
          </DialogContentText>
          <FormGroup row>
              <SelectRelation
                error = {relationError}
                handleSelectChange = {handleSelectChange}
                allRelations = {true}
              />
              <div className={classes.search}>
                <SearchBox
                    personList = {props.personList}
                    default = {thirdPerson}
                    handleSearchChange = {handleThirdSearchChange}
                    error = {thirdPersonError}
                    label = "Persona"
                    personSearch = {true}
                />
              </div>
              <Button variant="contained" color="primary" onClick={() => findByRelationType(relationType, thirdPerson, false)}>
                Buscar
              </Button>
          </FormGroup>
          {secondErrorMessage !== "" ? <FormLabel className={classes.errorLabel} error>{secondErrorMessage}</FormLabel> : null}

          <Typography className={classes.relationInfo} gutterBottom>{searchByRelationResult}</Typography>

          <DialogContentText>
            Por nombre
          </DialogContentText>
          <FormGroup row>
              <div className={classes.search}>
                <TextField
                    variant = "outlined"
                    name = "name"
                    label = "Nombre"
                    type = "text"
                    value = {nameForSearch}
                    onChange = {handleTextFieldChange}
                    error = {emptyNameError}
                    fullWidth
                />
              </div>
              <Button variant="contained" color="primary" onClick={() => findByName(nameForSearch, false)}>
                Buscar
              </Button>
          </FormGroup>
          {emptyNameError ? <FormLabel className={classes.errorLabel} error>El nombre no puede estar vacío</FormLabel> : null}

          <Typography className={classes.relationInfo} gutterBottom>{searchByNameResult}</Typography>
          <DialogContentText>
            Consultas anteriores
          </DialogContentText>
          <div className={classes.queryList}>
            {props.userQueryList.map( userQuery => (
                <QueryItem 
                    key = {userQuery.getID()}
                    query = {userQuery}
                    executeQuery = {executeQuery}
                    personList = {props.personList}
                />
            ))}
          </div>
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