import React, { Component } from "react";
import PersonObject from "./PersonObject";
import RelationObject from "./RelationObject";
import QueryObject from "../User/QueryObject";
import PopupAddPerson from "./PopupAddPerson";
import PopupEditRelations from "./PopupEditRelations";
import PopupSeeRelations from "./PopupSeeRelations";
import AlertDialog from "../Menu/AlertDialog";
import HeaderActions from "../Menu/HeaderActions";
import PersonList from './PersonList';
import FamilyTree from './FamilyTree';

class PersonMain extends Component {
    
    constructor(props){
        super(props);
        this.state = {
            personList: props.personList,
            fileList: props.fileList,
            userQueryList: props.userQueryList,
            resultList: [],
            mainSelectedPerson: null,
            popupAdd: false,
            popupEdit: false,
            popupDelete: false,
            popupEditRelations: false,
            popupContinueToRelations: false,
            popupSeeRelations: false,
            popupSeeFiles: false,
            forceUpdate: false,
            currentUser: props.currentUser,
            rootNode: null,
            nodeList: null,
            treeReady: false,
        }
    }

    /**
     * Método para actualizar la lista de personas, archivos y consultas de usuario cuando cambia el padre,
     * y para volver a renderizar el árbol si se añade o elimina una persona
     * @param {*} prevProps Props del padre antes del cambio
     * @param {*} prevState Estado del componente antes del cambio
     */
    componentDidUpdate(prevProps, prevState) {
        if (this.props.personList !== prevProps.personList) {
            this.setState({personList: this.props.personList}, 
                () => {
                    this.createTreeView();  // Se ejecuta tras setState
            });
        }
        if (this.props.fileList !== prevProps.fileList) {
            this.setState({fileList: this.props.fileList});
        }
        if (this.props.userQueryList !== prevProps.userQueryList) {
            this.setState({userQueryList: this.props.userQueryList});
        }
        
        if (this.state.treeReady === false && this.state.treeReady !== prevState.treeReady){
            this.createTreeView();
        }
    }

    /**
     * Método para volver a renderizar el árbol cuando se cambia de menú
     */
    componentDidMount = () => {
        if (this.state.personList.length > 0){
            this.createTreeView();
        }
    }

    /**
     * Método para crear el árbol. Recorre la lista de personas y obtiene su altura (siendo 0 la base del árbol).
     * Se selecciona una persona con altura media para hacer de nodo raíz, ya que es lo preferible con esta librería
     */
    createTreeView = () => {
        let treeNodes = [];
        let itemsProcessed = 0;
        let length = this.state.personList.length;
        let maxHeight = 0;

        this.state.personList.forEach(p => {
            this.getNodeHeight(p.getID())
            .then((result) => {
                let h = result[0];

                if (h > maxHeight){
                    maxHeight = h;
                }
                treeNodes.push({person: p, height: h});

                itemsProcessed++;
                
                if (itemsProcessed === length){     // Asegura que todos los items han sido procesados, ya que javascript es monohebra
                    if (this.state.rootNode === null){
                        let mainNode = treeNodes.find(function(node){
                            return (node.height >= maxHeight/2 && node.height <= maxHeight/2 + 0.5);
                        });
                        this.setState({rootNode: mainNode.person});
                    }
                    this.createNodeList();
                    this.setState({treeReady: true});
                }
            })
            .catch(err => this.props.showNotification("createTreeFailure"));

        }, this);
    }

    /**
     * Método para crear la lista de nodos del árbol. Cada nodo contiene los ids de sus padres,
     * hijos, parejas y hermanos
     */
    createNodeList = () => {
        let nodeList = [];
        this.state.personList.forEach(p => {
            let node = {};
            node.id = p.getID();
            node.gender = p.getGender();

            let parentObj = [];
            let partnerObj = [];
            let childObj = [];
            p.getRelations().forEach(relation => {
                let relationObj = {};
                relationObj.id = relation.getTo().getID();

                if (relation.getType() === "childOf"){
                    relationObj.type = "blood";
                    parentObj.push(relationObj);
                } else if (relation.getType() === "parentOf"){
                    relationObj.type = "blood";
                    childObj.push(relationObj);
                } else if (relation.getType() === "partnerOf"){
                    relationObj.type = "married";
                    partnerObj.push(relationObj);
                }
            });

            let siblingObj = [];
            p.getSiblings().forEach(sibling => {
                let relationObj = {};
                relationObj.id = sibling.getID();
                relationObj.type = "blood";
                siblingObj.push(relationObj);
            });


            node.parents = parentObj;
            node.siblings = siblingObj;
            node.spouses = partnerObj;
            node.children = childObj;

            nodeList.push(node);
        });

        this.setState({nodeList: nodeList});
    }

    /**
     * Método para obtener la altura de los nodos
     * @param {String} personID ID de la persona representada en el nodo
     * @returns {Number} Altura del nodo
     */
    getNodeHeight = async (personID) => {
        const response = await fetch(`${this.props.serverName}/personAPI/getNodeHeight?personID=${personID}`);
        try{
            const height = await response.json();
            return height;
        } catch(err){
            this.props.showNotification("getNodeHeightFailure");
        } 
    }

    /**
     * Método para añadir una persona a la base de datos
     * @param {String} name Nombre de la persona
     * @param {String} surname Apellidos de la persona
     * @param {Number} birthdate Fecha de nacimiento en milisegundos
     * @param {Boolean} estimatedDate Indica si la fecha de nacimiento es aproximada
     * @param {String} gender Género de la persona
     */
    addNewPerson = (name, surname, birthdate, estimatedDate, gender) => {
        fetch(`${this.props.serverName}/personAPI/addPerson?name=${name}&surname=${surname}&birthdate=${birthdate}&estimatedDate=${estimatedDate}&gender=${gender}&userID=${this.state.currentUser.getID()}`, {method: 'POST'})
            .then(response => response.json())
            .then(response => this.updatePersonListAfterAdd(response[0]))    // response es un array de 1 elemento
            .catch(err => this.props.showNotification("addPersonFailure"));
    }

    /**
     * Método para editar la información de una persona en la base de datos
     * @param {String} name Nombre de la persona
     * @param {String} surname Apellidos de la persona
     * @param {Number} birthdate Fecha de nacimiento en milisegundos
     * @param {Boolean} estimatedDate Indica si la fecha de nacimiento es aproximada
     * @param {String} gender Género de la persona
     */
    editPerson = (name, surname, birthdate, estimatedDate, gender) => {
        let key = this.state.mainSelectedPerson.getID();
        fetch(`${this.props.serverName}/personAPI/editPerson?key=${key}&name=${name}&surname=${surname}&birthdate=${birthdate}&estimatedDate=${estimatedDate}&gender=${gender}`, {method: 'POST'})
            .then(response => response.json())
            .then(response => this.updatePersonListAfterEdit(response[0]))
            .catch(err => this.props.showNotification("editPersonFailure"));
    }

    /**
     * Método para eliminar una persona de la base de datos. Realmente no se elimina, solo cambia su visibilidad
     * @param {PersonObject} person Persona a eliminar
     */
    deletePerson = (person) => {
        fetch(`${this.props.serverName}/personAPI/deletePerson?key=${person.getID()}`, {method: 'POST'})
            .then(response => response.json())
            .then(response => this.updatePersonListAfterDelete(person))
            .catch(err => this.props.showNotification("deletePersonFailure"));
    }

    /**
     * Método para añadir una relación entre personas a la base de datos
     * @param {PersonObject} mainPerson Primera persona de la relación
     * @param {String} relationType Tipo de relación
     * @param {PersonObject} relatedPerson Segunda persona de la relación
     */
    addRelation = (mainPerson, relationType, relatedPerson) => {
        let fetchURL = `${this.props.serverName}/personAPI/`;
        if (relationType === "parentOf"){
            fetchURL += `addParentRelation?parentID=${mainPerson.getID()}&childID=${relatedPerson.getID()}`;
        } else if (relationType === "childOf"){
            fetchURL += `addParentRelation?parentID=${relatedPerson.getID()}&childID=${mainPerson.getID()}`;
        } else {
            fetchURL += `addPartnerRelation?personID=${mainPerson.getID()}&otherPersonID=${relatedPerson.getID()}`;
        }

        fetch(fetchURL, {method: 'POST'})
            .then(response => response.json())
            .then(response => this.updateRelationListAfterAdd(mainPerson, relationType, relatedPerson, response[0]))    // Response contiene solo el key
            .catch(err => this.props.showNotification("addRelationFailure"));
    }

    /**
     * Método para eliminar una relación entre personas de la base de datos
     * En esta caso sí que se elimina completamente, ya que es información fácilmente recreable
     * @param {PersonObject} person Persona a la que pertenece esta relación
     * @param {String} relationID ID de la relación a eliminar
     */
    deleteRelation = (person, relationID) => {
        let relation = person.getRelations().find(rel => rel.getID() === relationID);

        let fetchURL = `${this.props.serverName}/personAPI/`;
        if (relation.getType() === "partnerOf"){
            fetchURL += `deletePartnerRelation?key=${relationID}`;
        } else {
            fetchURL += `deleteParentRelation?key=${relationID}`;
        }

        fetch(fetchURL, {method: 'POST'})
            // .then(response => response.json())
            .then(response => this.updateRelationListAfterDelete(person, relation))
            .catch(err => this.props.showNotification("deleteRelationFailure"));
    }

    /**
     * Método para añadir una consulta a la lista de consultas de la base de datos
     * Los parámetros cambian según el tipo de consulta:
     * - Tipo: findRelation -> firstParameter: personID, secondParameter: personID
     * - Tipo: findByRelationType -> firstParameter: relationType, secondParameter: personID
     * - Tipo: findByName -> firstParameter: name, secondParameter: vacío
     * @param {String} type Tipo de consulta
     * @param {String} firstParameter Primer parámetro de la consulta
     * @param {String} secondParameter Segundo parámetro de la consulta
     */
    addToQueryList = (type, firstParameter, secondParameter) => {
        fetch(`${this.props.serverName}/userAPI/addToQueryList?type=${type}&firstParameter=${firstParameter}&secondParameter=${secondParameter}&userID=${this.state.currentUser.getID()}`, {method: 'POST'})
            .then(response => response.json())
            .then(response => this.updateQueryListAfterAdd(response[0]))
            .catch(err => this.props.showNotification("addToQueryListFailure"));
    }

    /**
     * Busca el camino más corto entre dos personas en el árbol en caso de existir una relación entre ellas
     * @param {PersonObject} firstPerson Persona origen de la búsqueda
     * @param {PersonObject} secondPerson Persona final de la búsqueda
     * @returns {String|Boolean} Tipo de relación en caso de haberla, false en caso contrario
     */
    findRelation = async (firstPerson, secondPerson) => {
        try{
            const response = await fetch(`${this.props.serverName}/personAPI/isRelated?firstPersonID=${firstPerson.getID()}&secondPersonID=${secondPerson.getID()}`);
            const json = await response.json();

            if (json.length !== 0){
                return this.calculateRelation(json);
            } else {
                return false;
            }
        } catch (err) {
            this.props.showNotification("findRelationFailure");
        }
    }

    /**
     * Calcula la relación entre dos personas a partir del camino proporcionado
     * Cada elemento del camino contiene una persona y su relación con la persona anterior en el camino:
     * - personID: ID de la persona correspondiente al elemento actual
     * - from: ID de la persona origen de la relación
     * - to: ID de la persona fin de la relación
     * - label: tipo de relación
     * De esta forma, el primer elemento solo contiene personID, ya que no existe persona anterior en el camino
     * @param {Array} path Camino entre dos personas
     * @returns {String|Boolean} Tipo de relación en caso de estar entre los tipos calculados, false en caso contrario
     */
    calculateRelation = (path) => {
        if (path.length === 2){
            if (this.isParent(path)){
                return "parent";
            } else if (this.isChild(path)){
                return "child";
            } else if (this.isPartner(path)){
                return "partners";
            }
        } else if (path.length === 3){
            if (this.isSibling(path)){
                return "siblings";
            } else if (this.isGrandparent(path)){
                return "grandparent";
            } else if (this.isGrandchild(path)){
                return "grandchild";
            } else if (this.isChildInLaw(path)){
                return "childInLaw";
            } else if (this.isParentInLaw(path)){
                return "parentInLaw";
            }
        } else if (path.length === 4){
            if (this.isUncle(path)){
                return "uncle";
            } else if (this.isNephew(path)){
                return "nephew";
            } else if (this.isSiblingInLaw(path)){
                return "siblingInLaw";
            } else if (this.isAncestor(path)){
                return "ancestor";
            } else if (this.isDescendant(path)){
                return "descendant";
            }
        } else if (path.length === 5){
            if (this.isUncle(path)){
                return "uncle";
            } else if (this.isNephew(path)){
                return "nephew";
            } else if (this.isSiblingInLaw(path)){
                return "siblingInLaw";
            } else if (this.isCousin(path)){
                return "cousin";
            } else if (this.isAncestor(path)){
                return "ancestor"
            } else if (this.isDescendant(path)){
                return "descendant";
            }
        } else if (path.length > 5){
            if (this.isAncestor(path)){
                return "ancestor";
            } else if (this.isDescendant(path)){
                return "descendant";
            }
        }
        return false;
    }

    /**
     * Comprueba si el camino representa una relación de padre
     * Para ello, debe existir una relación "parentOf" con dirección elemento [0] -> [1]
     * @param {Array} path Camino entre dos personas
     * @returns {Boolean} Si la relación es de este tipo o no
     */
    isParent = (path) => {
        if (path[1].label === "parentOf" && path[0].personID === path[1].from){
            return true;
        } else {
            return false;
        }
    }

    /**
     * Comprueba si el camino representa una relación de hijo
     * Para ello, debe existir una relación "parentOf" con dirección elemento [1] -> [0]
     * @param {Array} path Camino entre dos personas
     * @returns {Boolean} Si la relación es de este tipo o no
     */
    isChild = (path) => {
        if (path[1].label === "parentOf" && path[0].personID === path[1].to){
            return true;
        } else {
            return false;
        }
    }

    /**
     * Comprueba si el camino representa una relación de pareja
     * Para ello, debe existir una relación "partnerOf"
     * @param {Array} path Camino entre dos personas
     * @returns {Boolean} Si la relación es de este tipo o no
     */
    isPartner = (path) => {
        if (path[1].label === "partnerOf"){
            return true;
        } else {
            return false;
        }
    }

    /**
     * Comprueba si el camino representa una relación de hermanos
     * Para ello, la persona final debe ser hija del padre de la persona inicial
     * @param {Array} path Camino entre dos personas
     * @returns {Boolean} Si la relación es de este tipo o no
     */
    isSibling = (path) => {
        if (this.isChild(path)){
            let remainingPath = path.filter((_element, index) => index > 0);
            if (this.isParent(remainingPath)){
                return true;
            }
        }
        return false;
    }

    /**
     * Comprueba si el camino representa una relación de abuelo
     * Para ello, la persona final debe ser padre del padre de la persona inicial
     * @param {Array} path Camino entre dos personas
     * @returns {Boolean} Si la relación es de este tipo o no
     */
    isGrandparent = (path) => {
        if (this.isParent(path)){
            let remainingPath = path.filter((_element, index) => index > 0);
            if (this.isParent(remainingPath)){
                return true;
            }
        }
        return false;
    }

    /**
     * Comprueba si el camino representa una relación de nieto
     * Para ello, la persona final debe ser hija del hijo de la persona inicial
     * @param {Array} path Camino entre dos personas
     * @returns {Boolean} Si la relación es de este tipo o no
     */
    isGrandchild = (path) => {
        if (this.isChild(path)){
            let remainingPath = path.filter((_element, index) => index > 0);
            if (this.isChild(remainingPath)){
                return true;
            }
        }
        return false;
    }

    /**
     * Comprueba si el camino representa una relación de yerno
     * Para ello, la persona final debe ser pareja del hijo de la persona inicial
     * @param {Array} path Camino entre dos personas
     * @returns {Boolean} Si la relación es de este tipo o no
     */
    isChildInLaw = (path) => {
        if (this.isPartner(path)){
            let remainingPath = path.filter((_element, index) => index > 0);
            if (this.isChild(remainingPath)){
                return true;
            }
        }
        return false;
    }

    /**
     * Comprueba si el camino representa una relación de suegro
     * Para ello, la persona final debe ser padre de la pareja de la persona inicial
     * @param {Array} path Camino entre dos personas
     * @returns {Boolean} Si la relación es de este tipo o no
     */
    isParentInLaw = (path) => {
        if (this.isParent(path)){
            let remainingPath = path.filter((_element, index) => index > 0);
            if (this.isPartner(remainingPath)){
                return true;
            }
        }
        return false;
    }

    /**
     * Comprueba si el camino representa una relación de tío
     * Para ello, la persona final debe ser hermana del padre de la persona inicial, o cuñada del padre de la persona inicial
     * @param {Array} path Camino entre dos personas
     * @returns {Boolean} Si la relación es de este tipo o no
     */
    isUncle = (path) => {
        if (path.length === 4){
            if (this.isSibling(path)){
                let remainingPath = path.filter((_element, index) => index > 1);
                if (this.isParent(remainingPath)){
                    return true;
                } 
            }
        } else {
            let initialPath = path.filter((_element, index) => index < 4);
            if (this.isSiblingInLaw(initialPath)){
                let remainingPath = path.filter((_element, index) => index > 2);
                if (this.isParent(remainingPath)){
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Comprueba si el camino representa una relación de sobrino
     * Para ello, la persona final debe ser hija del hermano de la persona inicial, o hija del cuñado de la person inicial
     * @param {Array} path Camino entre dos personas
     * @returns {Boolean} Si la relación es de este tipo o no
     */
    isNephew = (path) => {
        if (path.length === 4){
            if (this.isChild(path)){
                let remainingPath = path.filter((_element, index) => index > 0);
                if (this.isSibling(remainingPath)){
                    return true;
                }
            }
        } else {
            if (this.isChild(path)){
                let remainingPath = path.filter((_element, index) => index > 0);
                if (this.isSiblingInLaw(remainingPath)){
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Comprueba si el camino representa una relación de cuñado
     * Para ello, la persona final debe ser pareja del hermano de la persona inicial, hermana de la pareja de la persona inicial,
     * o cuñado de la pareja de la persona inicial
     * @param {Array} path Camino entre dos personas
     * @returns {Boolean} Si la relación es de este tipo o no
     */
    isSiblingInLaw = (path) => {
        if (path.length === 4){
            if (this.isPartner(path)){
                let remainingPath = path.filter((_element, index) => index > 0);
                if (this.isSibling(remainingPath)){
                    return true;
                }
            } else if (this.isSibling(path)){
                let remainingPath = path.filter((_element, index) => index > 1);
                if (this.isPartner(remainingPath)){
                    return true;
                }
    
            }
        } else {
            if (this.isPartner(path)){
                let remainingPath = path.filter((_element, index) => index > 0);
                if (this.isSiblingInLaw(remainingPath)){
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Comprueba si el camino representa una relación de primo
     * Para ello, la persona final debe ser hijo del tío de la persona inicial
     * @param {Array} path Camino entre dos personas
     * @returns {Boolean} Si la relación es de este tipo o no
     */
    isCousin = (path) => {
        if (this.isChild(path)){
            let remainingPath = path.filter((_element, index) => index > 0);
            if (this.isUncle(remainingPath)){
                return true;
            }
        }

        return false;
    }

    /**
     * Comprueba si el camino representa una relación de ancestro
     * Para ello, se hace una búsqueda recursiva de relacions de tipo padre
     * @param {Array} path Camino entre dos personas
     * @returns {Boolean} Si la relación es de este tipo o no
     */
    isAncestor = (path) => {
        if (this.isParent(path)){
            let remainingPath = path.filter((_element, index) => index > 0);
            if (remainingPath.length >= 2){
                return this.isAncestor(remainingPath);
            } else {
                return true;
            }
        }

        return false;
    }

    /**
     * Comprueba si el camino representa una relación de ancestro
     * Para ello, se hace una búsqueda recursiva de relacions de tipo hijo
     * @param {Array} path Camino entre dos personas
     * @returns {Boolean} Si la relación es de este tipo o no
     */
    isDescendant = (path) => {
        if (this.isChild(path)){
            let remainingPath = path.filter((_element, index) => index > 0);
            if (remainingPath.length >= 2){
                return this.isDescendant(remainingPath);
            } else {
                return true;
            }
        }

        return false;
    }


    


    /**
     * Método para añadir un elemento a la lista de personas localmente
     * Crea un nuevo objeto persona a partir del JSON y se lo pasa al main para ser añadido a la lista
     * A continuación pone a la nueva persona como seleccionada para pasar a añadir sus relaciones
     * @param {JSONObject} jsonObject Objeto con la información de la persona a añadir
     */
    updatePersonListAfterAdd = (jsonObject) => {
        let newPerson = new PersonObject(jsonObject);     
        this.props.personListAdd(newPerson);
        this.setState({mainSelectedPerson: newPerson});
        this.props.showNotification("addPersonSuccess");

        this.openPopup("continueToRelations");
    }

    /**
     * Método para editar un elemento de la lista de personas localmente
     * Crea un nuevo objeto persona con la información editada y se obtiene el índice del objeto original
     * Se pasa el nuevo objeto y el índice al main para editar la lista
     * @param {JSONObject} jsonObject Objeto con la información actualizada de la persona
     */
    updatePersonListAfterEdit = (jsonObject) => {
        let editedPerson = new PersonObject(jsonObject);
        editedPerson.setRelations(this.state.mainSelectedPerson.getRelations());

        let index = this.state.personList.indexOf(this.state.mainSelectedPerson);
        this.props.personListEdit(editedPerson, index);

        this.setState({mainSelectedPerson: editedPerson});
        this.props.showNotification("editPersonSuccess");
    }

    /**
     * Método para eliminar un elemento de la lista de personas localmente
     * Se obtiene el índice del objeto borrado y se pasa al main para eliminarlo de la lista
     * @param {PersonObject} person Persona a eliminar
     */
    updatePersonListAfterDelete = (person) => {
        this.setState({treeReady: false});
        this.props.personListDelete(person);
        
        this.setState({mainSelectedPerson: null});
        this.props.showNotification("deletePersonSuccess");
    }

    /**
     * Método para añadir un elemento a la lista de relaciones de una persona localmente
     * Crea un nuevo objeto relación (person -> relatedPerson) a partir de:
     * - mainSelectedPerson del estado del componente
     * - relatedPerson y relatedType del popup de editar relaciones
     * - _key de la respuesta de la base de datos
     * 
     * Es necesario crear también la relación opuesta, es decir, (relatedPerson -> person)
     * @param {PersonObject} person Persona origen de la relación
     * @param {String} relationType Tipo de relación
     * @param {PersonObject} relatedPerson Persona fin de la relación
     * @param {String} key ID de la relación
     */
    updateRelationListAfterAdd = (person, relationType, relatedPerson, key) => {
        let newRelation = new RelationObject({
                            from: this.state.mainSelectedPerson,
                            to: relatedPerson,
                            type: relationType,
                            _key: key
                        });

        let oppositeRelation = "";
        if (relationType === "parentOf"){
            oppositeRelation = new RelationObject({
                from: relatedPerson,
                to: this.state.mainSelectedPerson,
                type: "childOf",
                _key: key
            });
        } else if (relationType === "childOf"){
            oppositeRelation = new RelationObject({
                from: relatedPerson,
                to: this.state.mainSelectedPerson,
                type: "parentOf",
                _key: key
            });
        } else if (relationType === "partnerOf"){
            oppositeRelation = new RelationObject({
                from: relatedPerson,
                to: this.state.mainSelectedPerson,
                type: relationType,
                _key: key
            });
        }

        person.addRelation(newRelation);
        relatedPerson.addRelation(oppositeRelation);

        this.setState({forceUpdate: !this.forceUpdate, treeReady: false});
        this.props.showNotification("addRelationSuccess");
    }

    /**
     * Método para eliminar un elemento de la lista de relaciones de una persona localmente
     * Se elimina la relación (person -> relatedPerson) de la lista de personas del estado
     * Es necesario borrar también la relación opuesta, es decir (relatedPerson -> person)
     * @param {PersonObject} person Persona a la que pertenece la relación que se quiere eliminar
     * @param {RelationObject} relation Relación que se quiere eliminar 
     */
    updateRelationListAfterDelete = (person, relation) => {
        person.deleteRelation(relation);

        let relatedPerson = relation.getTo();
        let relationToDelete = relatedPerson.getRelations().find(r => r.getID() === relation.getID());

        relatedPerson.deleteRelation(relationToDelete);

        this.setState({forceUpdate: !this.forceUpdate, treeReady: false});
        this.props.showNotification("deleteRelationSuccess");
    }

    /**
     * Método para añadir un elemento a la lista de consultas de un usuario localmente
     * Crea un nuevo objeto consulta a partir del JSON y se lo pasa al main para ser añadido a la lista
     * @param {JSONObject} jsonObject Objeto con la información de la consulta
     */
    updateQueryListAfterAdd = (jsonObject) => {
        let newQuery = new QueryObject(jsonObject);
        this.props.queryListAdd(newQuery);
    }



    /**
     * Método para almacenar la persona seleccionada en el estado del componente
     * @param {PersonObject} person Persona seleccionada
     */
    setSelectedPerson = (person) => {
        if(this.state.mainSelectedPerson === person){
            this.setState({ mainSelectedPerson: null });
        } else {
            this.setState({ mainSelectedPerson: person });
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
                if (this.state.currentUser.getID() === this.state.mainSelectedPerson.getCreatedBy() || this.state.currentUser.getRole() === 'admin'){
                    this.setState({popupEdit: true});
                } else {
                    alert("Solo el usuario que ha añadido a esta persona puede editar su información");
                }
                break;
            case "delete":
                if (this.state.currentUser.getID() === this.state.mainSelectedPerson.getCreatedBy() || this.state.currentUser.getRole() === 'admin'){
                    this.setState({popupDelete: true});
                } else {
                    alert("Solo el usuario que ha añadido a esta persona puede eliminarla");
                }
                break;
            case "editRelations":
                if (this.state.currentUser.getID() === this.state.mainSelectedPerson.getCreatedBy() || this.state.currentUser.getRole() === 'admin'){
                    this.setState({popupEditRelations: true});
                } else {
                    alert("Solo el usuario que añadido a esta persona puede editar sus relaciones");
                }
                break;
            case "continueToRelations":
                this.setState({popupContinueToRelations: true});
                break;
            case "seeRelations":
                this.setState({popupSeeRelations: true});
                break;
            case "seeFiles":
                this.setState({popupSeeFiles: true});
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
            case "deletePerson":
                this.setState({popupDelete: false});
                break;
            case "editRelations":
                this.setState({popupEditRelations: false});
                break;
            case "continueToRelations":
                this.setState({popupContinueToRelations: false});
                break;
            case "seeRelations":
                this.setState({popupSeeRelations: false});
                break;
            case "seeFiles":
                this.setState({popupSeeFiles: false});
                break;
            default:
        }
    }

    /**
     * Método para cambiar al menú de visualización de archivos de una persona
     */
    changeToPersonFilesMenu = () => {
        this.props.changeToPersonFilesMenu(this.state.mainSelectedPerson);
    }

    /**
     * Método para cambiar entre sub-árboles
     * @param person Persona raíz del sub-árbol
     */
    changeSubtree = (person) => {
        this.setState({rootNode: person});
    }

    /**
     * Método para establecer la lista de resultados de una consulta
     * Las personas incluidas en esta lista tendrán un estilo distinto en el árbol
     */
    setResultList = (list) => {
        this.setState({resultList: [...list]});
    }



    render() {
        return (
            <div>
                <HeaderActions
                    openPopup = {this.openPopup}
                    disabled = {this.state.mainSelectedPerson === null}
                    changeToPersonFilesMenu = {this.changeToPersonFilesMenu}
                    personList = {this.state.personList}
                    handleSearchChange = {this.setSelectedPerson}
                    menu = 'people'
                />
                {/* 105px = 50 px HeaderNav + 55px HeaderActions */}
                <div style={{display: 'flex', height: 'calc(100vh - 105px)'}}> 
                    <PersonList
                        personList = {this.state.personList}
                        setSelected = {this.setSelectedPerson}
                        selectedPerson = {this.state.mainSelectedPerson}
                        currentUser = {this.state.currentUser}
                        resultList = {this.state.resultList}
                    />
                    {this.state.treeReady ? 
                        <FamilyTree
                            showNotification = {this.props.showNotification}
                            nodeList = {this.state.nodeList}
                            rootNodeID = {this.state.rootNode.getID()}
                            personList = {this.state.personList}
                            changeSubtree = {this.changeSubtree}
                            selectedPerson = {this.state.mainSelectedPerson}
                            setSelected = {this.setSelectedPerson}
                            currentUser = {this.state.currentUser}
                            reRenderTree = {this.state.reRenderTree}
                            resultList = {this.state.resultList}
                        />
                        : null
                    }
                </div>
                {this.state.popupAdd ?
                    <PopupAddPerson
                        type = "add"
                        addPerson = {this.addNewPerson}
                        closePopup = {this.closePopup}
                        personName = "" 
                        personSurname = "" 
                        personGender = "male"
                        birthdate = {null}
                        estimatedDate = {false}
                    /> 
                    : null
                }
                {this.state.popupContinueToRelations ?
                    <AlertDialog
                        type = "continueToRelations"
                        openPopup = {this.openPopup}
                        closePopup = {this.closePopup}
                        person = {this.state.mainSelectedPerson}
                    />
                    : null
                }
                {this.state.popupEdit ? 
                    <PopupAddPerson
                        type = "edit"
                        editPerson = {this.editPerson}
                        closePopup = {this.closePopup}
                        personName = {this.state.mainSelectedPerson.getName()}
                        personSurname = {this.state.mainSelectedPerson.getSurname()}
                        personGender = {this.state.mainSelectedPerson.getGender()}
                        birthdate = {this.state.mainSelectedPerson.getBirthdate()}
                        estimatedDate = {this.state.mainSelectedPerson.getEstimatedDate()}
                    /> 
                    : null
                }
                {this.state.popupEditRelations ?
                    <PopupEditRelations
                        selectedPerson = {this.state.mainSelectedPerson}
                        personList = {this.state.personList}
                        addRelation = {this.addRelation}
                        deleteRelation = {this.deleteRelation}
                        closePopup = {this.closePopup}
                        findRelation = {this.findRelation}
                        forceUpdate = {this.forceUpdate}
                    />
                    : null
                }
                {this.state.popupDelete ?
                    <AlertDialog
                        type = "deletePerson"
                        deletePerson = {this.deletePerson}
                        closePopup = {this.closePopup}
                        person = {this.state.mainSelectedPerson}
                    />
                    : null
                }
                {this.state.popupSeeRelations ?
                    <PopupSeeRelations
                        selectedPerson = {this.state.mainSelectedPerson}
                        personList = {this.state.personList}
                        closePopup = {this.closePopup}
                        findRelation = {this.findRelation}
                        setResultList = {this.setResultList}
                        currentUser = {this.state.currentUser}
                        addToQueryList = {this.addToQueryList}
                        userQueryList = {this.state.userQueryList}
                    />
                    : null
                }
            </div>
        );
    }
}

export default PersonMain;