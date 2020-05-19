import React, { Component } from "react";
import UserObject from "./UserObject";
import UserItem from "./UserItem";
import HeaderActions from "../Menu/HeaderActions";
import PopupImportFiles from "./PopupImportFiles";


class AdminMain extends Component {
    
    constructor(props){
        super(props);
        this.state = {
            userList: props.userList,
            currentUser: props.currentUser,
            selectedUser: null,
            popupImport: false,
        }
    }

    /**
     * Método para actualizar la lista de usuarios cuando cambia el padre
     * @param {*} prevProps Props del padre antes del cambio
     */
    componentDidUpdate(prevProps) {
        if (this.props.userList !== prevProps.userList) {
            this.setState({userList: this.props.userList});
        }
    }

    /**
     * Método para exportar la información de la base de datos en formato JSON
     */
    // exportData = () => {
    //     fetch(`${this.props.serverName}/configAPI/exportData`, {method: 'POST'})
    //       .then(response => window.open(`${this.props.serverName}/export/export.zip`))
    //       .catch(err => this.props.showNotification("exportDataFailure"));
    // }

    /**
     * Método para exportar los archivos almacenados en el servidor
     */
    exportFiles = () => {
        fetch(`${this.props.serverName}/configAPI/exportFiles`, {method: 'POST'})
          .then(response => window.open(`${this.props.serverName}/files/files.zip`))
          .catch(err => this.props.showNotification("exportFilesFailure"));
    }

    /**
     * 
     */
    importFiles = (file) => {
        const fd = new FormData();

        fd.append('file', file);

        var options = {
            method: 'POST',
            body: fd,
        }

        fetch(`${this.props.serverName}/configAPI/importFiles`, options)
            // .then(response => response.json())
            .then(response => this.props.showNotification("importFilesSuccess"))
            .catch(err => this.props.showNotification("importFilesFailure"));
    }

    /**
     * Método para proporcionar o revocar privilegios de administrador a un usuario
     */
    changeAdminPrivileges = () => {
        if (this.state.currentUser.getID() !== this.state.selectedUser.getID()){
            let role = "admin";
            if (this.state.selectedUser.getRole() === "admin"){
                role = "regular";
            }
            fetch(`${this.props.serverName}/userAPI/changeAdminPrivileges?userID=${this.state.selectedUser.getID()}&role=${role}`, {method: 'POST'})
                .then(response => response.json())
                .then(response => this.updateUserListAfterEdit(response[0]))
                .catch(err => this.props.showNotification("changeAdminPrivilegesFailure"));
        } else {
            alert("No puedes modificar tus propios permisos");
        }
    }

    /**
     * Método para editar un elemento de la lista de usuarios localmente
     * Crea un nuevo objeto usuario con la información editada y se obtiene el índice del objeto original
     * Se pasa el nuevo objeto y el índice al main para editar la lista
     * @param {JSONObject} jsonObject Objeto con la información actualizada del usuario
     */
    updateUserListAfterEdit = (jsonObject) => {
        let editedUser = new UserObject(jsonObject);

        let index = this.state.userList.indexOf(this.state.selectedUser);
        this.props.userListEdit(editedUser, index);

        this.setState({selectedUser: editedUser});
        this.props.showNotification("editUserSuccess");
    }

    /**
     * Método para almacenar el usuario seleccionado en el estado del componente
     * @param {userObject} user Usuario seleccionado
     */
    setSelectedUser = (user) => {
        if(this.state.selectedUser === user){
            this.setState({ selectedUser: null });
        } else {
            this.setState({ selectedUser: user });
        }
    }

    /**
     * Método para abrir un popup
     * @param {String} type Tipo del popup que se quiere abrir
     */
    openPopup = (type) => {
        switch (type){
            case "importFiles":
                this.setState({popupImportFiles: true});
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
            case "importFiles":
                this.setState({popupImportFiles: false});
                break;
            default:
        }
    }


    render() {
        return (
            <div>
                <HeaderActions
                    menu = 'admin'
                    changeAdminPrivileges = {this.changeAdminPrivileges}
                    disabled = {this.state.selectedUser === null}
                    userList = {this.state.userList}
                    handleSearchChange = {this.setSelectedUser}
                    exportData = {this.exportData}
                    exportFiles = {this.exportFiles}
                    openPopup = {this.openPopup}
                />
                {this.state.userList.map( user => (
                    <UserItem 
                        key = {user.getID()}
                        user = {user}
                        selected = {this.state.selectedUser === user}
                        setSelected = {this.setSelectedUser}
                    />
                ))}
                {this.state.popupImportFiles ? 
                    <PopupImportFiles
                        importFiles = {this.importFiles}
                        closePopup = {this.closePopup}
                    />
                    : null
                }
            </div>
        );
    }
}

export default AdminMain;