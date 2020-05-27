import React, { Component } from "react";
import HeaderNav from "./Menu/HeaderNav";
import PersonMain from "./Person/PersonMain";
import FileMain from "./File/FileMain";
import UserEntry from "./User/UserEntry";
import AdminMain from "./User/AdminMain";
import PersonObject from "./Person/PersonObject";
import FileObject from "./File/FileObject";
import RelationObject from "./Person/RelationObject";
import UserObject from "./User/UserObject";
import QueryObject from "./User/QueryObject"
import Notification from "./Menu/Notification";

const serverName = "http://localhost:9000";

class Main extends Component {
    constructor(props){
        super(props);
        this.state = {
            menu: 0,
            selectedTab: 0,
            personList: [],
            fileList: [],
            userList: [],
            personFileList: [],
            userQueryList: [],
            selectedPerson: null,
            notificationType: "",
            notificationOpen: false,
            currentUser: null,
        }
    }

    /**
     * Método para conectar con la base de datos cuando se monta el componente
     * En caso de no existir, se inicializa una nueva base de datos
     */
    componentDidMount = () => {
        fetch(`${serverName}/configAPI/initialize`)
          .then(response => response.text())
          .then(response => this.showNotification("initializeSuccess"))
          .catch(err => this.showNotification("initializeFailure"));
    }

    /**
     * Método de inicio de sesión.
     * Llama a los métodos de obtención de datos de personas, archivos y usuarios necesarios para el
     * funcionamiento del programa y los almacena en el estado. Almacena también el usuario actual
     * @param user Usuario que ha iniciado sesión
     */
    handleLogIn = (user) => {
        this.getPersonData();
        this.getFileData();
        this.setState({currentUser: user});
        this.getUserData();
        this.getUserQueryData();
    }

    /**
     * Método para cerrar sesión. Elimina al usuario actual del estado, así como su loginString en caso
     * de tenerlo (Si se marcó la casilla de mantener la sesión)
     */
    handleLogOut = () => {
        fetch(`${serverName}/userAPI/logOut?userID=${this.state.currentUser.getID()}`, {method: 'POST'})
          .then(response => {
            localStorage.removeItem("loginString");
            localStorage.removeItem("email");
            this.setState({currentUser: null});
          })
          .catch(err => this.showNotification("logOutFailure"));
    }

    /**
     * Obtiene los datos de personas de la base de datos
     */
    getPersonData = () => {
        fetch(`${serverName}/personAPI/getPersonData`)
          .then(response => response.json())
          .then(response => this.createPersonList(response))
          .catch(err => this.showNotification("getPersonDataFailure"));
    }

    /**
     * Crea una lista de objetos persona para almacenarla en el estado
     * @param {Array} res Respuesta de la base de datos. Contiene los datos de las personas en formato JSON
     */
    createPersonList = (res) => {
        let auxPersonList = [];
        res.forEach(function(obj){
            let person = new PersonObject(obj);
            auxPersonList.push(person);
        });
        this.getPersonRelations(auxPersonList);
        this.setState({personList: auxPersonList});
    }

    /**
     * Obtiene los datos de las relaciones entre personas
     * @param {Array} personList Lista de personas. Se itera sobre ella para obtener las relaciones
     */
    getPersonRelations = (personList) => {
        personList.forEach(function(person){
            fetch(`${serverName}/personAPI/getPersonRelations?personID=${person.getID()}`)
                .then(response => response.json())
                .then(response => this.setPersonRelations(response, person))
                .catch(err => this.showNotification("getPersonRelationsFailure"));
        }, this);
    }

    /**
     * Establece las relaciones de cada objeto persona
     * @param {Array} response Respuesta de la base de datos. Contiene los datos de las relaciones en formato JSON
     * @param {PersonObject} person Objeto persona al que se le añadirán las relaciones
     */
    setPersonRelations = (response, person) => {
        response.forEach(function(obj){
            let relatedPerson = this.state.personList.find(p => p.getID() === obj.relatedPersonKey);
            let relation = null;

            if (obj.relationType === "parentOf"){
                if (obj.fromID === obj.relatedPersonID){    // relatedPerson es parent
                    relation = new RelationObject({from: person, to: relatedPerson, type: "childOf", _key: obj.relationID});
                } else {    // selectedPerson es parent
                    relation = new RelationObject({from: person, to: relatedPerson, type: "parentOf", _key: obj.relationID});
                }
            } else {
                relation = new RelationObject({from: person, to: relatedPerson, type: "partnerOf", _key: obj.relationID});
            }

            person.addRelation(relation);
        }, this);
    }

    /**
     * Obtiene los datos de los archivos de la base de datos
     */
    getFileData = () => {
        fetch(`${serverName}/fileAPI/getFileData`)
          .then(response => response.json())
          .then(response => this.createFileList(response))
          .catch(err => this.showNotification("getFileDataFailure"));
    }

    /**
     * Crea una lista de objetos archivo para almacenarla en el estado
     * @param {Array} res Respuesta de la base de datos. Contiene los datos de los archivos en formato JSON
     */
    createFileList = (res) => {
        let auxFileList = [];
        res.forEach(function(obj){
            let file = new FileObject(obj);
            auxFileList.push(file);
        });
        this.getFileRelations(auxFileList);
        this.setState({fileList: auxFileList});
    }

    /**
     * Obtiene los datos de las relaciones entre archivos y personas
     * @param {Array} fileList Lista de archivos. Se itera sobre ella para obtener las relaciones
     */
    getFileRelations = (fileList) => {
        fileList.forEach(function(file){
            fetch(`${serverName}/fileAPI/getFileRelations?fileID=${file.getID()}`)
                .then(response => response.json())
                .then(response => this.setFileRelations(response, file))
                .catch(err => this.showNotification("getFileRelationsFailure"));
        }, this);
    }

    /**
     * Establece las relaciones de cada objeto archivo
     * @param {Array} response Respuesta de la base de datos. Contiene los datos de las relaciones en formato JSON
     * @param {FileObject} file Objeto archivo al que se le añadirán las relaciones
     */
    setFileRelations = (response, file) => {
        response.forEach(function(obj){            
            let relatedPerson = this.state.personList.find(person => person.getID() === obj.personKey);
            let relation = new RelationObject({from: file,
                                                to: relatedPerson,
                                                type: "relatedTo",
                                                _key: obj.relationKey
                                            });

            file.addRelation(relation);
        }, this);   // Enlaza la función del forEach con this
    }

    /**
     * Obtiene los datos de los usuarios de la base de datos
     */
    getUserData = () => {
        fetch(`${serverName}/userAPI/getUserData`)
          .then(response => response.json())
          .then(response => this.createUserList(response))
          .catch(err => this.showNotification("getUserDataFailure"));
    }

    /**
     * Crea una lista de objetos usuario para almacenarla en el estado
     * @param {Array} res Respuesta de la base de datos. Contiene los datos de los usuarios en formato JSON
     */
    createUserList = (res) => {
        let auxUserList = [];
        res.forEach(function(obj){
            let user = new UserObject(obj);
            auxUserList.push(user);
        });
        this.setState({userList: auxUserList});
    }

    /**
     * Obtiene los datos de las consultas de usuario de la base de datos
     */
    getUserQueryData = () => {
        fetch(`${serverName}/userAPI/getUserQueryData?userID=${this.state.currentUser.getID()}`)
          .then(response => response.json())
          .then(response => this.createUserQueryList(response))
          .catch(err => this.showNotification("getUserQueryDataFailure"));
    }

    /**
     * Crea una lista de objetos consulta para almacenarla en el estado
     * @param {Array} res Respuesta de la base de datos. Contiene los datos de las consultas en formato JSON
     */
    createUserQueryList = (res) => {
        let auxUserQueryList = [];
        res.forEach(function(obj){
            let userQuery = new QueryObject(obj);
            auxUserQueryList.push(userQuery);
        });
        this.setState({userQueryList: auxUserQueryList});
    }

    /**
     * Método para añadir una persona a la lista del estado. Se inserta ordenada por fecha de nacimiento
     * Se hace una copia de la lista porque React no permite modificarla directamente
     * @param {PersonObject} newPerson Persona a añadir.
     */
    personListAdd = (newPerson) => {
        let auxPersonList = [...this.state.personList];

        if (auxPersonList.length === 0){    // Es la primera persona que se añade
            auxPersonList.push(newPerson);
        } else {
            for (let i=0; i < auxPersonList.length; i++){
                if (auxPersonList[i].getBirthdate() > newPerson.getBirthdate()){
                    auxPersonList.splice(i, 0, newPerson);
                    break;
                }
                if (i === auxPersonList.length - 1){
                    auxPersonList.push(newPerson);
                    break;
                }
            }
        }
        
        this.setState({personList: [...auxPersonList]});
    }

    /**
     * Método para editar una persona de la lista. Se sustituye el objeto persona indicado por otro
     * objeto con la información actualizada.
     * @param {PersonObject} editedPerson Persona con la información actualizada
     * @param {Number} index Índice de la persona que se va a editar
     */
    personListEdit = (editedPerson, index) => {
        let auxPersonList = [...this.state.personList];
        auxPersonList[index] = editedPerson;

        this.setState({personList: [...auxPersonList]});
    }

    /**
     * Método para eliminar una persona de la lista. Es necesario eliminar también sus relaciones en ambas
     * direcciones, es decir, (person -> relatedPerson) y (relatedPerson -> person)
     * @param {PersonObject} person Persona a eliminar.
     */
    personListDelete = (person) => {
        let index = this.state.personList.indexOf(person);
        
        let auxPersonList = [...this.state.personList];
        auxPersonList.splice(index, 1);

        person.getRelations().forEach(function(relation){
            let relatedPerson = relation.getTo();

            relatedPerson.setRelations(relatedPerson.getRelations().filter(r => r.getTo().getID() !== person.getID()));
        });

        this.setState({personList: [...auxPersonList]});
    }

    /**
     * Método para añadir un archivo a la lista del estado. Se inserta en primera posición, ya que están 
     * ordenados por fecha de inserción
     * @param {FileObject} newFile Archivo a añadir
     */
    fileListAdd = (newFile) => {
        this.setState({fileList: [newFile, ...this.state.fileList]});
    }

    /**
     * Método para editar un archivo de la lista. Se sustituye el objeto archivo indicado por otro
     * objeto con la información actualizada
     * @param {FileObject} editedFile Archivo con la información actualizada
     * @param {Number} index Índice del archivo que se va a editar
     */
    fileListEdit = (editedFile, index) => {
        let auxFileList = [...this.state.fileList];
        auxFileList[index] = editedFile;

        this.setState({fileList: [...auxFileList]}, 
            () => {
                if (this.state.selectedPerson !== null){
                    this.updatePersonFileList();
                }
            }
        );
    }

    /**
     * Método para eliminar un archivo de la lista. 
     * En caso de estar visualizando los archivos de una persona, se actualiza también su lista
     * @param {FileObject} file Archivo a eliminar
     */
    fileListDelete = (file) => {
        let index = this.state.fileList.indexOf(file);

        let auxFileList = [...this.state.fileList];
        auxFileList.splice(index, 1);

        this.setState({fileList: [...auxFileList]}, 
            () => {
                if (this.state.selectedPerson !== null){
                    this.updatePersonFileList();
                }
            }
        );
    }

    /**
     * Método para editar un usuario de la lista.
     * Se sustituye el objeto usuario indicado por otro objeto con la información actualizada
     * @param {userObject} editedUser Usuario con la información actualizada
     * @param {Number} index Índice del usuario que se va a editar
     */
    userListEdit = (editedUser, index) => {
        let auxUserList = [...this.state.userList];
        auxUserList[index] = editedUser;

        this.setState({userList: [...auxUserList]});
    }

    /**
     * Método para añadir una consulta a la lista del estado. Se inserta en primera posición, ya que están 
     * ordenadas por fecha de realización
     * @param {QueryObject} newQuery Archivo a añadir
     */
    queryListAdd = (newQuery) => {
        this.setState({userQueryList: [newQuery, ...this.state.userQueryList]});
    }

    /**
     * Método para cambiar entre menús. Los valores posibles son:
     * - 0: Menú de personas
     * - 1: Menú de archivos
     * - 2: Menú de administración
     * @param {Number} value Menú al que se quiere cambiar
     */
    menuChangedHandler = (value) => {
        this.setState({
            menu: value,
            selectedTab: value,
        });
    }

    /**
     * Método para visualizar los archivos de una persona concreta. Se crea una lista de archivos
     * específica para esta persona, y se cambia al menú "3", que utiliza el mismo componente que el
     * menú archivos pero con distintos props
     * @param {PersonObject} person Persona de la que se desean visualizar los archivos
     */
    changeToPersonFilesMenu = (person) => {
        this.setState({
            personFileList: this.state.fileList.filter(file => file.getRelations().find(relation => relation.getTo() === person)),
            selectedPerson: person,
            selectedTab: 1,
            menu: 3
        });
    }

    /**
     * Método para actualizar la lista de archivos de una persona
     */
    updatePersonFileList = () => {
        this.setState({
            personFileList: this.state.fileList.filter(file => file.getRelations().find(relation => relation.getTo() === this.state.selectedPerson)),
        });
    }

    /**
     * Método para mostrar notificaciones de éxito o de fallo cuando se hace una llamada al servidor
     * @param {String} type Tipo de notificación. Usado para seleccionar el mensaje que se muestra
     */
    showNotification = (type) => {
        this.setState({
            notificationType: type,
            notificationOpen: true
        });
    }

    /**
     * Método para cerrar una notificación
     */
    closeNotification = () => {
        this.setState({
            notificationType: "",
            notificationOpen: false
        });
    }


    render() {
        return (
            <div>
                {this.state.currentUser !== null ?
                    <div>
                        <HeaderNav 
                            menuChangedHandler = {this.menuChangedHandler}
                            selected = {this.state.selectedTab}
                            handleLogOut = {this.handleLogOut}
                            currentUser = {this.state.currentUser}
                        />
                        <div style={{marginTop: '105px'}}>
                            {this.state.menu === 0 ?    // Personas general
                                <PersonMain
                                    personList = {this.state.personList}
                                    fileList = {this.state.fileList}
                                    userList = {this.state.userList}
                                    userQueryList = {this.state.userQueryList}
                                    personListAdd = {this.personListAdd}
                                    personListEdit = {this.personListEdit}
                                    personListDelete = {this.personListDelete}
                                    queryListAdd = {this.queryListAdd}
                                    changeToPersonFilesMenu = {this.changeToPersonFilesMenu}
                                    showNotification = {this.showNotification}
                                    currentUser = {this.state.currentUser}
                                    serverName = {serverName}
                                /> 
                                : null
                            }
                            {this.state.menu === 1 ?    // Archivos general
                                <FileMain
                                    fileList = {this.state.fileList}
                                    personList = {this.state.personList}
                                    userList = {this.state.userList}
                                    fileListAdd = {this.fileListAdd}
                                    fileListEdit = {this.fileListEdit}
                                    fileListDelete = {this.fileListDelete}
                                    showNotification = {this.showNotification}
                                    currentUser = {this.state.currentUser}
                                    serverName = {serverName}
                                />
                                : null
                            }
                            {this.state.menu === 3 ?    // Archivos de una persona
                                <FileMain
                                    fileList = {this.state.personFileList}
                                    personList = {this.state.personList}
                                    userList = {this.state.userList}
                                    fileListAdd = {this.fileListAdd}
                                    fileListEdit = {this.fileListEdit}
                                    fileListDelete = {this.fileListDelete}
                                    selectedPerson = {this.state.selectedPerson}
                                    updatePersonFileList = {this.updatePersonFileList}
                                    showNotification = {this.showNotification}
                                    currentUser = {this.state.currentUser}
                                    serverName = {serverName}
                                />
                                : null
                            }
                            {this.state.menu === 2 ?    // Administración de usuarios
                                <AdminMain
                                    userList = {this.state.userList}
                                    userListEdit = {this.userListEdit}
                                    showNotification = {this.showNotification}
                                    currentUser = {this.state.currentUser}
                                    serverName = {serverName}
                                />
                                : null
                            }
                        </div>
                    </div>
                    :
                    <div>
                        <UserEntry
                            showNotification = {this.showNotification}
                            handleLogIn = {this.handleLogIn}
                            currentUser = {this.state.currentUser}
                            serverName = {serverName}
                        />
                    </div>
                }
                {this.state.notificationOpen ?
                    <Notification
                        type = {this.state.notificationType}
                        closeNotification = {this.closeNotification}
                    />
                    : null
                }
            </div>
        );
    }
}

export default Main;