import React, {useEffect} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Typography, FormGroup, FormLabel, FormControlLabel, Radio, RadioGroup } from '@material-ui/core';
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
  previewContainer: {
    width: '100%',
    height: 150,
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    marginBottom: theme.spacing(2),
  },
  filePreview: {
    maxWidth: '95%',
    maxHeight: '95%',
    display: 'block',
    margin: 'auto',
  },
  dialogContent: {
    width: 450,
  } 
}));

export default function PopupAddPerson(props) {
  const [open, setOpen] = React.useState(true);
  const [title, setTitle] = React.useState(props.fileTitle);
  const [description, setDescription] = React.useState(props.fileDescription);
  const [emptyTitleError, setEmptyTitleError] = React.useState(false);
  const [fileError, setFileError] = React.useState(false);
  const [titleInputError, setTitleInputError] = React.useState(false);
  const [descriptionInputError, setDescriptionInputError] = React.useState(false);
  const [type] = React.useState(props.type);
  const [selectedFileText, setSelectedFileText] = React.useState("Ningún archivo seleccionado");
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [filePreview, setFilePreview] = React.useState("");
  const [filename] = React.useState(props.filename);
  const [fileType] = React.useState(props.fileType);
  const [radioValue, setRadioValue] = React.useState("file");
  const [link, setLink] = React.useState(props.filename);
  const [emptyLinkError, setEmptyLinkError] = React.useState(false);

  const classes = useStyles();

  let previewTitle = props.fileTitle;
  let dialogTitle = "";
  if (type === "edit"){
    dialogTitle = "Editar archivo";
  } else {
    dialogTitle = "Añadir archivo";
  }

  const handleClose = () => {
    props.closePopup(type);

    setOpen(false);
  };

  const handleChange = (event) => {
    switch (event.target.name){
        case "title":
            setTitle(event.target.value);
            setEmptyTitleError(false);
            break;
        case "description":
            setDescription(event.target.value);
            break;
        case "link":
            setLink(event.target.value);
            setEmptyLinkError(false);
            break;
        default:
    }
  }

  const handleFileChange = (event) => {
    let file = event.target.files[0];
    if (file.type.includes("image") ||
        file.type === "application/pdf" ||
        file.type === "video/mp4"){
      setSelectedFile(file);
      setFileError(false);
      // Sigue en useEffect, ya que setSelectedFile es asíncrono
    } else {
      setSelectedFileText("El formato de archivo no es válido");
    }
  }
  
  useEffect(() => {
    // Se ejecuta cuando acaba la ejecución de setSelectedFile
    if (selectedFile !== null) {
      setSelectedFileText("Seleccionado: " + selectedFile.name);

      let reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = function (e) {
        setFilePreview(reader.result);
      }
    }
  }, [selectedFile]);

  const handleRadioChange = (event) => {
    setRadioValue(event.target.value);
  }

  const handleConfirm = () => {
    let symbols = /[$%^&*_+|~=`{}[\]:";'<>]/;

    if (title === ""){
      setEmptyTitleError(true);
    }
    if (selectedFile === null && type === "add" && radioValue === "file"){
      setFileError(true);
    }
    if (link === "" && radioValue === "link"){
      setEmptyLinkError(true);
    }
    if (title.match(symbols)){
      setTitleInputError(true);
    } else {
      setTitleInputError(false);
    }
    if (description.match(symbols)){
      setDescriptionInputError(true);
    } else {
      setDescriptionInputError(false);
    }

    if (title !== "" && !title.match(symbols) && !description.match(symbols)){
      if (type === "edit"){
        if (fileType === "link"){
          props.editLink(link, title, description);
        } else {
          props.editFile(title, description);
        }
        handleClose();
      } else {
        if (radioValue === "file" && selectedFile !== null){
          props.uploadFile(selectedFile, title, description);
          handleClose();
        } else if (radioValue === "link" && link !== ""){
          props.uploadLink(link, title, description);
          handleClose();
        }
      }
    }
  }

  return (
    <div>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{dialogTitle}</DialogTitle>
        <DialogContent className={classes.dialogContent} >   
          {type !== "edit" ?
            <FormGroup>
              <FormLabel component="legend">Tipo</FormLabel>
              <RadioGroup row aria-label="gender" name="kind" value={radioValue} onChange={handleRadioChange}>
                <FormControlLabel value="file" control={<Radio />} label="Archivo" selected/>
                <FormControlLabel value="link" control={<Radio />} label="Link" />
              </RadioGroup>
            </FormGroup>
            : null
          }   
          {type !== "edit" && radioValue === "file" ?
            <FormGroup row className={classes.fileInput}>
              <Button color="primary" variant="contained" component="label">
                  Seleccionar archivo
                  <input type="file" onChange={handleFileChange} style={{ display: "none" }}/>
              </Button>
              <Typography gutterBottom className={classes.inputText}>{selectedFileText}</Typography>
            </FormGroup>
            : null
          }
          {fileError && radioValue === "file" ? <Typography color="error" gutterBottom>Debes seleccionar un archivo</Typography> : null}
          {emptyLinkError && radioValue === "link" ? <Typography color="error" gutterBottom>Debes introducir un enlace</Typography> : null}
          {filePreview !== "" ? 
            <div className={classes.previewContainer}>
              {selectedFile.type.includes("image") ? 
                <img alt="preview" src={filePreview} className={classes.filePreview}/>
                : null
              }
              {selectedFile.type === "application/pdf" ? 
                <embed src={filePreview} className={classes.filePreview} type="application/pdf"/>
                : null
              }
              {selectedFile.type === "video/mp4" ?
                <video className={classes.filePreview} controls>
                  <source src={filePreview} type="video/mp4"/>
                </video>
                : null
              }
              <Typography>{selectedFile.name}</Typography>
            </div>
            : null 
          }

          {type === "edit" ?
            <div className={classes.previewContainer}>
              {fileType.includes("image") ? 
                <img alt="preview" src={`${props.serverName}/files/${filename}`} className={classes.filePreview}/>
                : null
              }
              {fileType === "application/pdf" ? 
                <embed src={`${props.serverName}/files/${filename}`} className={classes.filePreview} type="application/pdf"/>
                : null
              }
              {fileType === "video/mp4" ?
                <video className={classes.filePreview} controls>
                  <source src={`${props.serverName}/files/${filename}`} type="video/mp4"/>
                </video>
                : null
              }
              {fileType === "link" ?
                <img alt="preview" src="text_placeholder.png" className={classes.filePreview}/>
                : null
              }
              <Typography>{previewTitle}</Typography>
            </div>
            : null 
          }

          {(type !== "edit" && radioValue === "link") || fileType === "link" ?
            <TextField
              className = {classes.link}
              margin = "dense"
              variant = "outlined"
              name = "link"
              label = "Link"
              type = "text"
              value = {link}
              onChange = {handleChange}
              error = {emptyLinkError}
              fullWidth
              required
            />
            : null
          }

          <TextField
            autoFocus
            margin = "dense"
            variant = "outlined"
            name = "title"
            label = "Título"
            type = "text"
            value = {title}
            onChange = {handleChange}
            error = {emptyTitleError || titleInputError}
            fullWidth
            required
          />
          {emptyTitleError ? <Typography color="error">El título no puede estar vacío</Typography> : null}
          {titleInputError ? <Typography color="error">Solo se aceptan los caracteres: ( ) ¿ ? ¡ ! , . - /</Typography> : null}
          <TextField
            margin = "dense"
            variant = "outlined"
            name = "description"
            label = "Descripción"
            type = "text"
            value = {description}
            onChange = {handleChange}
            error = {descriptionInputError}
            fullWidth
            multiline
            rows={4}
          />
          {descriptionInputError ? <Typography color="error">Solo se aceptan los caracteres: ( ) ¿ ? ¡ ! , . - /</Typography> : null}
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