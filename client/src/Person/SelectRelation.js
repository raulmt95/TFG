import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: 170,
    marginRight: theme.spacing(2),
  },
}));

export default function SelectRelation(props) {
  const classes = useStyles();
  const [relationType, setRelationType] = React.useState('');

  const handleChange = (event) => {
    setRelationType(event.target.value);
    props.handleSelectChange(event.target.value);
  };

  let parentOfText = "";
  let childOfText = "";

  if (props.person){
    if (props.person.getGender() === "male"){
      parentOfText = "Padre de";
      childOfText = "Hijo de";
    } else if (props.person.getGender() === "female"){
      parentOfText = "Madre de";
      childOfText = "Hija de";
    } else {
      parentOfText = "Padre/Madre de";
      childOfText = "Hijo/Hija de";
    }
  }


  return (
    <div>
      <FormControl variant="outlined" className={classes.formControl} error={props.error}>
      
        <InputLabel id="demo-simple-select-outlined-label">Tipo</InputLabel>
        <Select
          labelId="demo-simple-select-outlined-label"
          id="demo-simple-select-outlined"
          value={relationType}
          onChange={handleChange}
          label="Tipo"
          MenuProps={{style: {maxHeight: '400px'}}}
        >
          {props.allRelations ? 
          [
            <MenuItem value={"parent"}>Padres de</MenuItem>,
            <MenuItem value={"child"}>Hijos de</MenuItem>,
            <MenuItem value={"partners"}>Parejas de</MenuItem>,
            <MenuItem value={"siblings"}>Hermanos de</MenuItem>,
            <MenuItem value={"grandparent"}>Abuelos de</MenuItem>,
            <MenuItem value={"grandchild"}>Nietos de</MenuItem>,
            <MenuItem value={"uncle"}>Tíos de</MenuItem>,
            <MenuItem value={"nephew"}>Sobrinos de</MenuItem>,
            <MenuItem value={"cousin"}>Primos de</MenuItem>,
            <MenuItem value={"siblingInLaw"}>Cuñados de</MenuItem>,
            <MenuItem value={"childInLaw"}>Yernos de</MenuItem>,
            <MenuItem value={"parentInLaw"}>Suegros de</MenuItem>,
            <MenuItem value={"ancestor"}>Antepasados de</MenuItem>,
            <MenuItem value={"descendant"}>Descendientes de</MenuItem>
          ]
          :
          [
            <MenuItem value={"parentOf"}>{parentOfText}</MenuItem>,
            <MenuItem value={"childOf"}>{childOfText}</MenuItem>,
            <MenuItem value={"partnerOf"}>Pareja</MenuItem>,
          ]
          }
        </Select>
      </FormControl>
    </div>
  );
}