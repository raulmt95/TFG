Database = require('arangojs').Database;
db = new Database('http://127.0.0.1:8529');

module.exports = {
    getFileData : async function(){
        const cursor = await db.query('FOR x IN files FILTER x.visible == true SORT x.date DESC RETURN x');
        try{
            const data = await cursor.all();

            return data;
        } catch(err) {
            console.error("ERROR: " + err);
        }
    },

    /**
     *  Se utiliza relationKey para referenciar esta relación (por ejemplo en operaciones de borrado)
     *  y personKey para obtener el objeto persona de la lista
     */
    getFileRelations : async function(fileID){
        const cursor = await db.query(`
        FOR vertex, edge, path IN OUTBOUND 'files/${fileID}' GRAPH 'familyTree'
        FILTER vertex.visible == true
        RETURN { 
            relationType: path.edges[0].label,
            relationKey: path.edges[0]._key, 
            personKey: path.vertices[1]._key
        }`);
        try{
            const data = await cursor.all();

            return data;
        } catch (err) {
            console.error("Error: " + err);
        }
    },

    addFile : async function(filename, title, description, date, type, userID){
        const cursor = await db.query(`
            INSERT {
                "filename": "${filename}",
                "title": "${title}",
                "description": "${description}",
                "date": ${date},
                "type": "${type}",
                "uploadedBy": "${userID}",
                "visible": true
            } INTO files RETURN NEW
        `);
        try{
            const file = await cursor.all();
            return file;
        } catch (err) {
            console.error("Error: " + err);
        }
    },

    editFile : async function(key, title, description){
        const cursor = await db.query(`
            LET file = DOCUMENT("files/${key}")
            UPDATE file WITH {
                "title": "${title}",
                "description": "${description}"
            } IN files RETURN NEW
        `);
        try{
            const file = await cursor.all();
            return file;
        } catch (err) {
            console.error("Error: " + err);
        }
    },

    editLink : async function(key, link, title, description){
        const cursor = await db.query(`
            LET file = DOCUMENT("files/${key}")
            UPDATE file WITH {
                "filename": "${link}",
                "title": "${title}",
                "description": "${description}"
            } IN files RETURN NEW
        `);
        try{
            const file = await cursor.all();
            return file;
        } catch (err) {
            console.error("Error: " + err);
        }
    },

    deleteFile: async function(key){
        const cursor = await db.query(`
            LET file = DOCUMENT("files/${key}")
                UPDATE file WITH {
                    "visible": false
                } IN files RETURN NEW`
        );
        try{
            const file = await cursor.all();
            return file;
        } catch (err) {
            console.error("Error: " + err);
        }
    },

    addFileRelation: async function(fileID, personID){
        const cursor = await db.query(`
            INSERT {
                _from: "files/${fileID}",
                _to: "people/${personID}",
                "label": "relatedTo"
            } INTO relatedTo RETURN NEW._key
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
}