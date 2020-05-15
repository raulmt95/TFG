import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { Button } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    position: 'fixed',
    width: '100%',
    top: 0,
    left: 0,
    flexGrow: 1,
    height: '50px'
  },
  logout: {
    position: 'fixed',
    top: 5,
    right: 5,
  }
});

export default function CenteredTabs(props) {
  const classes = useStyles();
  const [value, setValue] = React.useState(props.selected);

  useEffect (() => {
    setValue(props.selected);
  }, [props.selected]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    props.menuChangedHandler(newValue);
  };

  return (
    <Paper className={classes.root} elevation={0} square={true}>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        <Tab label="Personas"/>
        <Tab label="Archivos"/>
        {props.currentUser.getRole() === "admin" ?
          <Tab label="Administración"/>
          : null
        }
      </Tabs>
      <Button color="primary" variant="outlined" className={classes.logout} onClick={props.handleLogOut}>Cerrar sesión</Button>
    </Paper>
  );
}