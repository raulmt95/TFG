import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

export default function CustomizedSnackbars(props) {
  const classes = useStyles();
  const [type] = React.useState(props.type);


  const handleClose = (event, reason) => {
    props.closeNotification();

    if (reason === 'clickaway') {
      return;
    }
  };


  let message = "";
  if (type === "getPersonDataFailure"){
      message = "Ha ocurrido un error recuperando los datos de personas"
  } else if (type === "getPersonRelationsFailure"){
      message = "Ha ocurrido un error recuperando las relaciones entre personas";
  } else if (type === "getFileDataFailure"){
      message = "Ha ocurrido un error recuperando los archivos";
  } else if (type === "getFileRelationsFailure"){
      message = "Ha ocurrido un error recuperando las relaciones con archivos";
  } else if (type === "addPersonSuccess"){
      message = "Persona insertada con éxito";
  } else if (type === "addPersonFailure"){
      message = "Ha ocurrido un error insertando la persona";
  } else if (type === "editPersonSuccess"){
      message = "Información editada con éxito";
  } else if (type === "editPersonFailure"){
      message = "Ha ocurrido un error editando la información la persona";
  } else if (type === "deletePersonSuccess"){
      message = "Persona eliminada con éxito";
  } else if (type === "deletePersonFailure"){
      message = "Ha ocurrido un error eliminando la persona";
  } else if (type === "addRelationSuccess"){
      message = "Relación añadida con éxito";
  } else if (type === "addRelationFailure"){
      message = "Ha ocurrido un error añadiendo la relación";
  } else if (type === "deleteRelationSuccess"){
      message = "Relación eliminada con éxito";
  } else if (type === "deleteRelationFailure"){
      message = "Ha ocurrido un error eliminando la relación";
  } else if (type === "findRelationFailure"){
      message = "Ha ocurrido un error buscando la relación";
  } else if (type === "uploadFileSuccess"){
      message = "Archivo subido con éxito";
  } else if (type === "uploadFileFailure"){
      message = "Ha ocurrido un error subiendo el archivo";
  } else if (type === "editFileSuccess"){
      message = "Información editada con éxito";
  } else if (type === "editFileFailure"){
      message = "Ha ocurrido un error editando la información del archivo";
  } else if (type === "deleteFileSuccess"){
      message = "Archivo eliminado con éxito";
  } else if (type === "deleteFileFailure"){
      message = "Ha ocurrido un error eliminando el archivo";
  } else if (type === "getNodeHeightFailure"){
      message = "Ha ocurrido un error obteniendo la altura de los nodos";
  } else if (type === "createTreeFailure"){
      message = "Ha ocurrido un error creando el árbol";
  } else if (type === "checkIfUserExistsFailure"){
      message = "Ha ocurrido un error buscando si el usuario existe";
  } else if (type === "addUserSuccess"){
      message = "Usuario registrado con éxito. Inicia sesión para acceder.";
  } else if (type === "addUserFailure"){
      message = "Ha ocurrido un error durante el registro";
  } else if (type === "checkPasswordFailure"){
      message = "Ha ocurrido un error comprobando la contraseña";
  } else if (type === "rememberFailure"){
      message = "Ha ocurrido un error recordando los credenciales";
  } else if (type === "logOutFailure"){
      message = "Ha ocurrido un error cerrando la sesión";
  } else if (type === "getUserDataFailure"){
      message = "Ha ocurrido un error recuperando la información de usuarios";
  } else if (type === "changeAdminPrivilegesFailure"){
      message = "Ha ocurrido un error cambiando los privilegios del usuario";
  } else if (type === "editUserSuccess"){
      message = "Se han cambiado los privilegios de administrador";
  } else if (type === "treeBuildFailure"){
      message = "Ha ocurrido un error creando el árbol";
  } else if (type === "addToQueryListFailure"){
      message = "Ha ocurrido un error actualizando la lista de consultas pasadas";
  } else if (type === "getUserQueryDataFailure"){
      message = "Ha ocurrido un error recuperando la lista de consultas pasadas";
  } else if (type === "exportDataFailure"){
      message = "Ha ocurrido un error exportando los datos";
  } else if (type === "exportFilesFailure"){
      message = "Ha ocurrido en un error exportando los archivos";
  }

  return (
    <div className={classes.root}>
      <Snackbar open={true} autoHideDuration={5000} onClose={handleClose}>
        {type.includes("Success") ?
            <Alert onClose={handleClose} severity="success">
                {message}
            </Alert>
        :
            <Alert onClose={handleClose} severity="error">
                {message}
            </Alert>
        }
      </Snackbar>
    </div>
  );
}