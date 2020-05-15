import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function AlertDialog(props) {
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    props.closePopup(props.type);
    setOpen(false);
  };

  const handleConfirm = () => {
    switch (props.type){
      case "deletePerson":
        props.deletePerson(props.person);
        break;
      case "continueToRelations":
        props.openPopup("editRelations");
        break;
      case "deleteFile":
        props.deleteFile(props.file);
        break;
      default:
    }

    handleClose();
  }

  
  let dialogTitleText = "";
  let dialogContentText = "";

  switch (props.type){
    case "deletePerson":
      dialogTitleText = "¿Seguro que deseas borrar a " + props.person.getFullName() + "?";
      dialogContentText = "No se borrarán los archivos relacionados";
      break;
    case "continueToRelations":
      dialogTitleText = "¿Deseas añadir relaciones para " + props.person.getFullName() + "?";
      dialogContentText = 'Si no lo haces ahora, podrás hacerlo desde "Editar relaciones"';
      break;
    case "deleteFile":
      dialogTitleText = "¿Seguro que deseas borrar el archivo " + props.file.getTitle() + "?";
      break;
    default:
  }

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{dialogTitleText}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogContentText}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} color="primary" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}