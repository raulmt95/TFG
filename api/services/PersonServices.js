Database = require('arangojs').Database;
db = new Database('http://127.0.0.1:8529');

module.exports = {
    getPersonData : async function(){
        const cursor = await db.query("FOR x IN people FILTER x.visible == true SORT x.birthdate RETURN x");
        try{
            const data = await cursor.all();

            return data;
        } catch (err) {
            console.error("Error: " + err);
        }
    },

    /**
     * Explicación de la query:
     * - vertex, edge y path son el vértice, arista y camino actuales
     * - IN indica la profundidad mínima y máxima. Por defecto es 1..1 así que se omite en este caso ya que solo buscamos relaciones de primer nivel
     * - ANY indica la dirección de las aristas. Puede ser INBOUND, OUTBOUND o ANY, que incluye a los dos primeros
     * - GRAPH es el nombre del grafo que se está leyendo
     * - FILTER para filtrar las relaciones con archivos
     * 
     * - - path.edges devuelve un array con las aristas del camino. De aquí obtenemos el tipo de relación y las dos personas implicadas
     * - - path.vertices devuelve un array con los vértices del camino. De aquí obtenemos el vertice[1], ya que el vertice[0] es la persona actual
     * 
     * - - - Se utilizará 'relatedPersonID' para compararlo con 'fromID', y relatedPersonKey para buscar en la lista de personas
     */
    getPersonRelations : async function(personID){
        const cursor = await db.query(`
        FOR vertex, edge, path IN ANY 'people/${personID}' GRAPH 'familyTree'
        FILTER edge.label != "relatedTo"
        RETURN { 
            relationType: path.edges[0].label, 
            fromID: path.edges[0]._from, 
            relationID: path.edges[0]._key, 
            relatedPersonID: path.vertices[1]._id,
            relatedPersonKey: path.vertices[1]._key
        }`);
        try{
            const data = await cursor.all();

            return data;
        } catch (err) {
            console.error("Error: " + err);
        }
    },

    // Devuelve el camino más corto entre los dos nodos. Si devuelve vacío, significa que no hay relación
    isRelated: async function(firstPersonID, secondPersonID){
        const cursor = await db.query(`
            FOR v, e IN ANY SHORTEST_PATH 'people/${firstPersonID}' TO 'people/${secondPersonID}'
            parentOf, partnerOf
            RETURN {
                "personID": v._id,
                "from": e._from,
                "to": e._to,
                "label": e.label
            }
        `);

        try {
            const path = await cursor.all();
            return path;
        } catch (err){
            console.error("Error: " + err);
        }
    },

    getNodeHeight: async function(personID){
        const cursor = await db.query(`
        FOR x in people
            LET path = (FOR v, e IN OUTBOUND SHORTEST_PATH 'people/${personID}' TO x
                    parentOf
                    RETURN [v, e])
            SORT LENGTH(path) DESC
            LIMIT 1
            RETURN LENGTH(path)
        `);

        try {
            const length = await cursor.all();
            return length;
        } catch (err){
            console.error("Error: " + err);
        }
    },

    addPerson : async function(name, surname, birthdate, estimatedDate, gender, userID){
        const cursor = await db.query(`
            INSERT {
                "name": "${name}",
                "surname": "${surname}",
                "birthdate": ${birthdate},
                "estimatedDate": ${estimatedDate},
                "gender": "${gender}",
                "visible": true,
                "createdBy": "${userID}"
            } INTO people RETURN NEW
        `);
        try{
            const person = await cursor.all();
            return person;
        } catch (err) {
            console.error("Error: " + err);
        }
    },

    editPerson : async function(key, name, surname, birthdate, estimatedDate, gender){
        const cursor = await db.query(`
            LET person = DOCUMENT("people/${key}")
            UPDATE person WITH {
                "name": "${name}",
                "surname": "${surname}",
                "birthdate": ${birthdate},
                "estimatedDate": ${estimatedDate},
                "gender": "${gender}"
            } IN people RETURN NEW
        `);
        try{
            const person = await cursor.all();
            return person;
        } catch (err) {
            console.error("Error: " + err);
        }
    },

    deletePerson: async function(key){
        const cursor = await db.query(`
            LET person = DOCUMENT("people/${key}")
            UPDATE person WITH {
                "visible": false
            } IN people RETURN NEW
        `);
        try{
            const person = await cursor.all();
            return person;
        } catch (err) {
            console.error("Error: " + err);
        }
    },

    addParentRelation: async function(parentID, childID){
        // Las aristas del grafo siempre son dirigidas, pero la dirección se puede ignorar en las búsquedas
        const cursor = await db.query(`
            INSERT {
                _from: "people/${parentID}",
                _to: "people/${childID}",
                "label": "parentOf"
            } INTO parentOf RETURN NEW._key
        `);
        try{
            const key = await cursor.all();
            return key;
        } catch(err) {
            console.error("Error: " + err);
        }
    },

    addPartnerRelation: async function(personID, otherPersonID){
        const cursor = await db.query(`
            INSERT {
                _from: "people/${personID}",
                _to: "people/${otherPersonID}",
                "label": "partnerOf"
            } INTO partnerOf RETURN NEW._key
        `);

        try{
            const key = await cursor.all();
            return key;
        } catch(err) {
            console.error("Error: " + err);
        }
    },

    deleteRelation: async function(relationID, type){
        const cursor = await db.query(`REMOVE '${relationID}' IN ${type} return OLD._key`);

        try{
            const key = await cursor.all();
            return key;
        } catch(err) {
            console.error("Error: " + err);
        }

    },

    // Es necesario hacer 2 queries porque ArangoDB no permite hacer operaciones en 2 colecciones al mismo tiempo
    // Las relaciones con archivos no se borran
    deletePersonRelations: async function(personID){
        db.query(`FOR x IN parentOf
        FILTER x._from == "people/${personID}" OR x._to == "people/${personID}"
        REMOVE x IN parentOf`
        );

        db.query(`FOR x IN partnerOf
        FILTER x._from == "people/${personID}" OR x._to == "people/${personID}"
        REMOVE x IN partnerOf
        `);
    },
}