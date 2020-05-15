import React, { Component } from "react";
import Register from "./Register";
import LogIn from "./LogIn";
import UserObject from "./UserObject";


class UserEntry extends Component {
    
    constructor(props){
        super(props);
        this.state = {
            registerMenu: false,
        }
    }

    /**
     * Método para inicio de sesión rápido
     * Comprueba si hay un login string en el almacenamiento local, y lo compara con el almacenado en la base de datos
     */
    componentDidMount = () => {
        let loginString = localStorage.loginString;
        let email = localStorage.email;
        if (loginString){
            this.findRememberedUser(loginString, email);
        }
    }

    /**
     * Método para comprobar si un loginString existe en la base de datos
     * @param {String} loginString String para inicio de sesión rápido
     */
    findRememberedUser = (loginString, email) => {
        fetch(`${this.props.serverName}/userAPI/findRememberedUser?loginString=${loginString}&email=${email}`, {method: 'POST'})
            .then(response => response.json())
            .then((response) => {
                let currentUser = new UserObject(response[0]);
                this.props.handleLogIn(currentUser);
            })
            .catch(err => this.props.showNotification("rememberFailure"));
    }

    /**
     * Método para comprobar si un email ya está almacenado en la base de datos
     * @param {String} email Email introducido por el usuario
     */
    checkIfUserExists = async (email) => {
        const response = await fetch(`${this.props.serverName}/userAPI/getUserByEmail?email=${email}`);

        try{
            const user = await response.json();

            return user[0];
        } catch(err){
            this.props.showNotification("checkIfUserExistsFailure");
        } 
    }

    /**
     * Método para comprobar si la contraseña introducida se corresponde con el email introducio
     * @param {String} email Email introducido por el usuario
     * @param {String} password Contraseña introducida por el usuario
     */
    checkPassword = async (email, password) => {
        // La contraseña se manda en texto plano, ya que idealmente la conexión estaría encriptada con SSL
        const response = await fetch(`${this.props.serverName}/userAPI/checkPassword?email=${email}&password=${password}`, {method: 'POST'});

        try{
            const isCorrect = await response.json();

            return isCorrect;
        } catch(err){
            this.props.showNotification("checkPasswordFailure");
        }
    }

    /**
     * Método para añadir un usuario a la base de datos
     * @param {String} email Email introducido por el usuario
     * @param {String} password Contraseña introducida por el usuario
     */
    addUser = (email, password) => {
        fetch(`${this.props.serverName}/userAPI/addUser?email=${email}&password=${password}`, {method: 'POST'})
            .then(response => response.json())
            .then((response) => {
                this.props.showNotification("addUserSuccess");
                this.changeRegisterMenu();
            })
            .catch(err => this.props.showNotification("addUserFailure"));
    }

    /**
     * Método para inicio de sesión
     * Pasa el usuario al main para almacenarlo en el estado
     * Crea un loginString si se ha seleccionado la casilla de recordar sesión
     * @param {Boolean} remember Indica si se ha marcado la casilla de recordar sesión
     * @param {UserObject} user Usuario que ha iniciado sesión
     */
    handleLogIn = (remember, user) => {
        let currentUser = new UserObject(user);
        this.props.handleLogIn(currentUser);
        if (remember){
            fetch(`${this.props.serverName}/userAPI/createLoginString?id=${currentUser.getID()}`, {method: 'POST'})
                .then(response => response.text())
                .then(function(response){
                    localStorage.setItem("loginString", response);
                    localStorage.setItem("email", currentUser.getEmail());
                })
                .catch(err => this.props.showNotification("rememberFailure"));
        }
    }

    /**
     * Método para cambiar entre el menú de inicio de sesión y el de registro
     */
    changeRegisterMenu = () => {
        this.setState({
            registerMenu: !this.state.registerMenu,
        });
    }

    render() {
        return (
            <div>
                {this.state.registerMenu ? 
                    <Register
                        changeRegisterMenu = {this.changeRegisterMenu}
                        addUser = {this.addUser}
                        checkIfUserExists = {this.checkIfUserExists}
                    />
                    : 
                    <LogIn
                        changeRegisterMenu = {this.changeRegisterMenu}
                        checkIfUserExists = {this.checkIfUserExists}
                        checkPassword = {this.checkPassword}
                        handleLogIn = {this.handleLogIn}
                    />
                }
            </div>
        );
    }
}

export default UserEntry;