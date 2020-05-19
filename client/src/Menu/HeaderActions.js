import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import SearchBox from './SearchBox';
import { Button } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    position: 'fixed',
    width: '100%',
    left: 0,
    top: '50px',
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: '2%',
    zIndex: 1,
    height: '55px',
  },
  search: {
    padding: '0.5%',
    marginLeft: 'auto',
    width: '20%',
  },
  button: {
    padding: '0.5% 2%',
  },
  buttonSpecial: {
      marginLeft: 'auto',
      marginRight: 'auto',
      padding: '0.5% 2%',
  }
});

export default function HeaderActions(props) {
  const classes = useStyles();

  const onButtonClick = (event) => {
    if (event.currentTarget.value === "editAdmin"){
        props.changeAdminPrivileges();
    } else if (event.currentTarget.value === "exportData"){
        props.exportData();
    } else if (event.currentTarget.value === "exportFiles"){
        props.exportFiles();
    } else {
        props.openPopup(event.currentTarget.value);
    }

  }

  const handleSearchChange = (value) => {
      props.handleSearchChange(value);
  }

  return (
    <Paper className={classes.root} square={true}>
        {props.menu === "people" || props.menu === "files" ?
            <Button className={classes.button} color="primary" value="add" onClick={onButtonClick}>
                Añadir
            </Button>
            : null
        }
        {props.menu === "people" || props.menu === "files" ?
            <Button className={classes.button} color="primary" value="edit" onClick={onButtonClick} disabled={props.disabled}>
                Editar Información
            </Button>
            : null
        }
        {props.menu === "people" ? 
            <Button className={classes.button} color="primary" value="editRelations" onClick={onButtonClick} disabled={props.disabled}>
            Editar Relaciones
            </Button>
            : null
        }
        {props.menu === "people" ? 
            <Button className={classes.button} color="primary" value="seeFiles" onClick={props.changeToPersonFilesMenu} disabled={props.disabled}>
                Ver archivos
            </Button>
            : null
        }
        {props.menu === 'files' ?
            <Button className={classes.button} color="primary" value="viewFile" onClick={onButtonClick} disabled={props.disabled}>
                Ver archivo
            </Button>
            : null
        }
        {props.menu === "people" || props.menu === "files" ?
            <Button className={classes.button} color="secondary" value="delete" onClick={onButtonClick} disabled={props.disabled}>
                Eliminar
            </Button>
            : null
        }
        {props.menu === "people" ? 
            <Button className={classes.buttonSpecial} color="primary" value="seeRelations" onClick={onButtonClick}>
                Consultas
            </Button>
            : null
        }
        {props.menu === "admin" ?
            <Button className={classes.button} color="primary" value="editAdmin" onClick={onButtonClick} disabled={props.disabled}>
                Cambiar privilegios de administrador
            </Button>
            : null
        }
        {/* {props.menu === "admin" ?
            <Button className={classes.buttonSpecial} color="primary" value="exportData" onClick={onButtonClick}>
                Exportar base de datos
            </Button>
            : null
        } */}
        {props.menu === "admin" ?
            <Button className={classes.buttonSpecial} color="primary" value="exportFiles" onClick={onButtonClick}>
                Exportar archivos
            </Button>
            : null
        }
        {props.menu === "admin" ?
            <Button className={classes.buttonSpecial} color="primary" value="importFiles" onClick={onButtonClick}>
                Importar archivos
            </Button>
            : null
        }
        <div className={classes.search}>
            <SearchBox
                size = "small"
                personList = {props.personList}
                fileList = {props.fileList}
                userList = {props.userList}
                handleSearchChange = {handleSearchChange}
                {...(props.menu === "people" && {label: "Buscar persona", personSearch: true})}
                {...(props.menu === "files" && {label: "Buscar archivo", fileSearch: true})}
                {...(props.menu === "admin" && {label: "Buscar usuario", userSearch: true})}
            />
        </div>
    </Paper>
  );
}