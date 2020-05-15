/* eslint-disable no-use-before-define */
import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';


export default function SearchBox(props) {
  let disabledList = [];
  
  // Lista de personas deshabilitadas en ver y editar relaciones
  // Aquellas personas con una relación calculable con findRelation aparecen deshabilitadas
  if(props.selectedPerson !== null){
    disabledList.push(props.selectedPerson);

    if (props.hasDisabledList){
      props.personList.forEach(person => {
        props.findRelation(props.selectedPerson, person)
        .then(function(result){
          if (result !== false){
            disabledList.push(person);
          }
        });
        
      });
    }
  }

  // Lista de personas deshabilitadas en PopupViewFile
  // Aquellas personas que ya están relacionadas con el archivo aparecen deshabilitadas
  if (props.viewingFile){
    props.viewingFile.getRelations().forEach(relation => {
      disabledList.push(relation.getTo());
    });
  }  
  
  const handleChange = (event, value) => {
      props.handleSearchChange(value);
  }

  return (
    <Autocomplete
      style={{width: '100%'}}
      size={props.size}
      key={props.reRender ? props.reRender : undefined}
      id="combo-box-demo"
      {...(props.personSearch && {options: props.personList, getOptionLabel: (option) => option.getFullName()})}
      {...(props.fileSearch && {options: props.fileList, getOptionLabel: (option) => option.getTitle()})}
      {...(props.userSearch && {options: props.userList, getOptionLabel: (option) => option.getEmail()})}
      {...(props.default && {value: props.default})}
      getOptionDisabled={(option) => disabledList.includes(option)}
      renderInput={(params) => <TextField {...params} error={props.error} label={props.label} variant="outlined"/>}
      onChange={handleChange}
    />
  );
}