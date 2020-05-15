import React from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  gender: {
    marginTop: theme.spacing(3),
  }
}));

export default function RadioButtonsGroup(props) {
  const classes = useStyles();
  const [value, setValue] = React.useState(props.selected);

  const handleChange = (event) => {
    setValue(event.target.value);
    props.handleGenderChange(event.target.value);
  };

  return (
    <div className={classes.gender}>
      <FormLabel component="legend">Género</FormLabel>
      <RadioGroup row aria-label="gender" name="gender" value={value} onChange={handleChange}>
        <FormControlLabel value="male" control={<Radio />} label="Masculino" />
        <FormControlLabel value="female" control={<Radio />} label="Femenino" />
        <FormControlLabel value="other" control={<Radio />} label="Otro" />
      </RadioGroup>
    </div>
  );
}