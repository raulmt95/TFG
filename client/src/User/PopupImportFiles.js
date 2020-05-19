import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Typography, FormGroup } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles((theme) => ({
  fileInput: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
  inputText: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  dialogContent: {
    width: 450,
  } 
}));

export default function PopupImportFiles(props) {
  const [open, setOpen] = React.useState(true);
  const [fileError, setFileError] = React.useState(false);
  const [selectedFileText, setSelectedFileText] = React.useState("Ningún archivo seleccionado");
  const [selectedFile, setSelectedFile] = React.useState(null);

  const classes = useStyles();

  const handleClose = () => {
    props.closePopup("importFiles");

    setOpen(false);
  };

  const handleFileChange = (event) => {
    let file = event.target.files[0];
    if (file.type === "application/zip") {
      setSelectedFile(file);
      setSelectedFileText("Seleccionado: " + file.name);
      setFileError(false);
    } else {
      setSelectedFileText("El formato de archivo no es válido");
    }
  }

  const handleConfirm = () => {
    if (selectedFile !== null){
      props.importFiles(selectedFile);
      handleClose();
    } else {
      setFileError(true);
    }
  }

  return (
    <div>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Importar archivos</DialogTitle>
        <DialogContent className={classes.dialogContent} >   
            <FormGroup row className={classes.fileInput}>
              <Button color="primary" variant="contained" component="label">
                  Selecciona un archivo .zip
                  <input type="file" onChange={handleFileChange} style={{ display: "none" }}/>
              </Button>
              <Typography gutterBottom className={classes.inputText}>{selectedFileText}</Typography>
            </FormGroup>
            {fileError ? <Typography color="error" gutterBottom>Debes seleccionar un archivo</Typography> : null}
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