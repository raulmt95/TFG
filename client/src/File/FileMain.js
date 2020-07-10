import React, { Component } from "react";
import PopupAddFile from "./PopupAddFile";
import FileObject from "./FileObject";
import RelationObject from "../Person/RelationObject";
import FileItem from "./FileItem";
import AlertDialog from "../Menu/AlertDialog";
import PopupViewFile from "./PopupViewFile";
import { Typography } from "@material-ui/core";
import HeaderActions from "../Menu/HeaderActions"

class FileMain extends Component {
    constructor(props){
        super(props);
        this.state = {
            fileList: props.fileList,
            personList: props.personList,
            userList: props.userList,
            mainSelectedFile: null,
            poupAdd: false,
            popupEdit: false,
            popupDelete: false,
            popupView: false,
            forceUpdate: false,
            currentUser: props.currentUser,
        }
    }

    /**
     * Método para actualizar la lista de personas, archivos y usuarios cuando cambia el padre
     * @param {*} prevProps Props del padre antes del cambio
     * @param {*} prevState Estado del componente antes del cambio
     */
    componentDidUpdate(prevProps) {
        if (this.props.fileList !== prevProps.fileList) {
            this.setState({fileList: this.props.fileList});
        }
        if (this.props.personList !== prevProps.personList) {
            this.setState({personList: this.props.personList});
        }
        if (this.props.userList !== prevProps.userList) {
            this.setState({userList: this.props.userList});
        }
    }

    /**
     * Método para subir un archivo al servidor y añadir su información la base de datos
     * @param {*} file Archivo a subir
     * @param {String} title Título del archivo
     * @param {String} description Descripción del archivo
     */
    uploadFile = (file, title, description) => {
        const fd = new FormData();

        fd.append('file', file);

        var options = {
            method: 'POST',
            body: fd,
        }

        fetch(`${this.props.serverName}/fileAPI/addFile?title=${title}&description=${description}&userID=${this.state.currentUser.getID()}`, options)
            .then(response => response.json())
            .then(response => this.updateFileListAfterAdd(response[0]))
            .catch(err => this.props.showNotification("uploadFileFailure"));
    }

    /**
     * Método para añadir un link a la base de datos
     * @param {String} link URL del link
     * @param {String} title Título del archivo
     * @param {String} description Descripción del archivo
     */
    uploadLink = (link, title, description) => {
        fetch(`${this.props.serverName}/fileAPI/addLink?link=${link}&title=${title}&description=${description}&userID=${this.state.currentUser.getID()}`, {method: 'POST'})
            .then(response => response.json())
            .then(response => this.updateFileListAfterAdd(response[0]))
            .catch(err => this.props.showNotification("uploadFileFailure"));
    }

    /**
     * Método para editar la información de un archivo en la base de datos
     * @param {String} title Título del archivo
     * @param {String} description Descripción del archivo
     */
    editFile = (title, description) => {
        let key = this.state.mainSelectedFile.getID();
        fetch(`${this.props.serverName}/fileAPI/editFile?key=${key}&title=${title}&description=${description}`, {method: 'POST'})
            .then(response => response.json())
            .then(response => this.updateFileListAfterEdit(response[0]))
            .catch(err => this.props.showNotification("editFileFailure"));
    }

    /**
     * Método para editar la información de un link en la base de datos
     * @param {String} link URL del link
     * @param {String} title Título del archivo
     * @param {String} description Descripción del archivo
     */
    editLink = (link, title, description) => {
        let key = this.state.mainSelectedFile.getID();
        fetch(`${this.props.serverName}/fileAPI/editLink?key=${key}&link=${link}&title=${title}&description=${description}`, {method: 'POST'})
            .then(response => response.json())
            .then(response => this.updateFileListAfterEdit(response[0]))
            .catch(err => this.props.showNotification("editFileFailure"));
    }

    /**
     * Método para eliminar un archivo o link de la base de datos. Realmente no se elimina, solo cambia su visibilidad
     * @param {FileObject} file Archivo a eliminar
     */
    deleteFile = (file) => {
        fetch(`${this.props.serverName}/fileAPI/deleteFile?key=${file.getID()}`, {method: 'POST'})
            .then(response => response.json())
            .then(response => this.updateFileListAfterDelete(file)) // A pesar de no usar response, se pone para evitar que se ejecute si no hay respuesta
            .catch(err => this.props.showNotification("deleteFileFailure"));
    }

    /**
     * Método para añadir una relación entre un archivo y una persona a la base de datos
     * @param {FileObject} file Archivo de la relación
     * @param {PersonObject} person Persona de la relación
     */
    addRelation = (file, person) => {
        fetch(`${this.props.serverName}/fileAPI/addFileRelation?fileID=${file.getID()}&personID=${person.getID()}`, {method: 'POST'})
            .then(response => response.json())
            .then(response => this.updateRelationListAfterAdd(person, file, response[0]))    // Response contiene solo el key
            .catch(err => this.props.showNotification("addRelationFailure"));
    }

    /**
     * Método para eliminar una relación entre archivo y persona de la base de datos
     * En esta caso sí que se elimina completamente, ya que es información fácilmente recreable
     * @param {FileObject} file Archivo al que pertenece esta relación
     * @param {String} relationID ID de la relación a eliminar
     */
    deleteRelation = (file, relationID) => {
        let relation = file.getRelations().find(rel => rel.getID() === relationID);

        fetch(`${this.props.serverName}/fileAPI/deleteFileRelation?key=${relationID}`, {method: 'POST'})
            // .then(response => response.json())
            .then(response => this.updateRelationListAfterDelete(file, relation))
            .catch(err => this.props.showNotification("deleteRelationFailure"));
    }





    /**
     * Método para añadir un elemento a la lista de archivos localmente
     * Crea un nuevo objeto archivo a partir del JSON y se lo pasa al main para ser añadido a la lista
     * Si se crea cuando se están viendo los archivos de una persona, se relacionará automáticamente con ella
     * @param {JSONObject} jsonObject Objeto con la información del archivo o link a añadir
     */
    updateFileListAfterAdd = (jsonObject) => {
        let newFile = new FileObject(jsonObject);   
        this.props.fileListAdd(newFile);
        this.setState({mainSelectedFile: newFile});

        this.props.showNotification("uploadFileSuccess");

        if (this.props.selectedPerson){
            this.addRelation(newFile, this.props.selectedPerson);
        }
    }

    /**
     * Método para modificar la información de un elemento de la lista de archivos localmente
     * Crea un nuevo objeto archivo con la información editada y se obtiene el índice del objeto original
     * Se pasa el nuevo objeto y el índice al main para editar la lista
     * @param {JSONObject} jsonObject Objeto con la información actualizada del archivo o link
     */
    updateFileListAfterEdit = (jsonObject) => {
        let editedFile = new FileObject(jsonObject);
        editedFile.setRelations(this.state.mainSelectedFile.getRelations());

        let index = this.state.fileList.indexOf(this.state.mainSelectedFile);
        this.props.fileListEdit(editedFile, index);

        this.setState({mainSelectedFile: editedFile});
        this.props.showNotification("editFileSuccess");
    }

    /**
     * Método para eliminar un elemento de la lista de archivos localmente
     * Se obtiene el índice del objeto borrado y se le pasa al main para eliminarlo de la lista
     * @param {FileObject} file Archivo o link a eliminar
     */
    updateFileListAfterDelete = (file) => {
        this.props.fileListDelete(file);
        
        this.setState({mainSelectedFile: null});
        this.props.showNotification("deleteFileSuccess");
    }


    /**
     * Método para añadir un elemento a la lista de relaciones de un archivo localmente
     * @param {PersonObject} relatedPerson Persona de la relación
     * @param {FileObject} file Archivo de la relación
     * @param {String} key ID de la relación
     */
    updateRelationListAfterAdd = (relatedPerson, file, key) => {
        let newRelation = new RelationObject({
                            from: this.state.mainSelectedFile,
                            to: relatedPerson,
                            type: "relatedTo",
                            _key: key
                        });

        file.addRelation(newRelation);
        this.setState({forceUpdate: !this.forceUpdate});
        this.props.showNotification("addRelationSuccess");

        if (this.props.selectedPerson){
            this.props.updatePersonFileList();
        }
    }

    /**
     * Método para eliminar un elemento de la lista de relaciones de un archivo localmente
     * @param {FileObject} file Archivo al que pertenece la relación que se quiere eliminar
     * @param {RelationObject} relation Relación que se quiere eliminar 
     */
    updateRelationListAfterDelete = (file, relation) => {
        file.deleteRelation(relation);
        this.setState({forceUpdate: !this.forceUpdate});
        this.props.showNotification("deleteRelationSuccess");
    }


    /**
     * Método para almacenar el archivo seleccionado en el estado del componente
     * @param {FileObject} file Archivo seleccionado 
     */
    setSelectedFile = (file) => {
        if(this.state.mainSelectedFile === file){
            this.setState({ mainSelectedFile: null });
        } else {
            this.setState({ mainSelectedFile: file });
        }
    }

    /**
     * Método para abrir un popup
     * @param {String} type Tipo del popup que se quiere abrir
     */
    openPopup = (type) => {
        switch (type){
            case "add":
                this.setState({popupAdd: true});
                break;
            case "edit":
                if (this.state.currentUser.getID() === this.state.mainSelectedFile.getUploadedBy() || this.state.currentUser.getRole() === 'admin'){
                    this.setState({popupEdit: true});
                } else {
                    alert("Solo el usuario que ha subido el archivo puede editar su información");
                }
                break;
            case "delete":
                if (this.state.currentUser.getID() === this.state.mainSelectedFile.getUploadedBy() || this.state.currentUser.getRole() === 'admin'){
                    this.setState({popupDelete: true});
                } else {
                    alert("Solo el usuario que ha subido el archivo puede eliminarlo");
                }    
                break;
            case "viewFile":
                this.setState({popupView: true});
                break;
            default:
        }
    }

    /**
     * Método para cerrar un popup
     * @param {String} type Tipo del popup que se quiere cerrar
     */
    closePopup = (type) => {
        switch (type){
            case "add":
                this.setState({popupAdd: false});
                break;
            case "edit":
                this.setState({popupEdit: false});
                break;
            case "deleteFile":
                this.setState({popupDelete: false});
                break;
            case "viewFile":
                this.setState({popupView: false});
                break;
            default:
        }
    }

    render() {
        return (
            <div>
                <HeaderActions
                    openPopup = {this.openPopup}
                    disabled = {this.state.mainSelectedFile === null}
                    fileList = {this.state.fileList}
                    menu = 'files'
                    handleSearchChange = {this.setSelectedFile}
                />
                {this.props.selectedPerson ? 
                <Typography style={{paddingTop: '1%'}} align="center" variant='h5'>Archivos de {this.props.selectedPerson.getFullName()}</Typography>
                : null
                }
                <div style={{padding: '1%'}}>
                    {this.state.fileList.map( file => (
                        <FileItem 
                            key = {file.getID()}
                            file = {file}
                            selected = {this.state.mainSelectedFile === file}
                            parentHandler = {this.setSelectedFile}
                            owned = {this.state.currentUser.getID() === file.getUploadedBy()}
                            serverName = {this.props.serverName}
                        />
                    ))}
                </div>
                {this.state.popupAdd ?
                    <PopupAddFile
                        type = "add"
                        uploadFile = {this.uploadFile}
                        uploadLink = {this.uploadLink}
                        closePopup = {this.closePopup}
                        fileTitle = "" 
                        fileDescription = ""
                        filename = "" 
                        fileType = ""
                        serverName = {this.props.serverName}
                    /> 
                    : null
                }
                {this.state.popupEdit ? 
                    <PopupAddFile
                        type = "edit"
                        editFile = {this.editFile}
                        editLink = {this.editLink}
                        closePopup = {this.closePopup}
                        fileTitle = {this.state.mainSelectedFile.getTitle()}
                        fileDescription = {this.state.mainSelectedFile.getDescription()}
                        filename = {this.state.mainSelectedFile.getFilename()}
                        fileType = {this.state.mainSelectedFile.getType()}
                        serverName = {this.props.serverName}
                    /> 
                    : null
                }
                {this.state.popupDelete ?
                    <AlertDialog
                        type = "deleteFile"
                        deleteFile = {this.deleteFile}
                        closePopup = {this.closePopup}
                        file = {this.state.mainSelectedFile}
                    />
                    : null
                }
                {this.state.popupView ?
                    <PopupViewFile
                        type = "viewFile"
                        file = {this.state.mainSelectedFile}
                        closePopup = {this.closePopup}
                        personList = {this.state.personList}
                        fileList = {this.state.fileList}
                        userList = {this.state.userList}
                        addRelation = {this.addRelation}
                        deleteRelation = {this.deleteRelation}
                        getFileRelations = {this.getFileRelations}
                        forceUpdate = {this.forceUpdate}
                        currentUser = {this.state.currentUser}
                        serverName = {this.props.serverName}
                    />
                    : null
                }
            </div>
        );
    }
}

export default FileMain;