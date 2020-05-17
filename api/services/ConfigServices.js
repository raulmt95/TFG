Database = require('arangojs').Database;
db = new Database('http://127.0.0.1:8529');
db.useBasicAuth("root", "");

const databaseName = "ProyectoDB";

module.exports = {
    createDatabase : async function(){
        db.useBasicAuth("root", "");
        db.useDatabase("_system");

        const names = await db.listDatabases();

        if (names.includes(databaseName)){
            try {
                db.useDatabase(databaseName);
                console.log("Usando base de datos: " + databaseName);
                return "databaseExists";
            } catch (err) {
                console.log("Error conectando a la base de datos: " + err);
            }
        } else {
            try {
                await db.createDatabase(databaseName);
                db.useDatabase(databaseName);
                console.log("Base de datos creada: " + databaseName);
            } catch (err){
                console.log("Error creando base de datos: " + err);
            }
        }
    },

    createCollections : async function(){
        const peopleCollection = db.collection('people');
        await peopleCollection.create();
        const fileCollection = db.collection('files');
        await fileCollection.create();
        const parentCollection = db.edgeCollection('parentOf');
        await parentCollection.create();
        const partnerCollection = db.edgeCollection('partnerOf');
        await partnerCollection.create();
        const relatedCollection = db.edgeCollection('relatedTo');
        await relatedCollection.create();
        const userCollection = db.collection('users');
        await userCollection.create();
        const queryCollection = db.collection('queryList');
        await queryCollection.create();
    },

    createGraph : async function(){
        const graph = db.graph('familyTree');
        const info = await graph.create({
            edgeDefinitions: [{
                collection: 'parentOf',
                from: ['people'],
                to: ['people']
            },
            {
                collection: 'partnerOf',
                from: ['people'],
                to: ['people'] 
            },
            {
                collection: 'relatedTo',
                from: ['files'],
                to: ['people'] 
            }
            ]
        });
    },

    createAdmin : async function(hash){
        const cursor = await db.query(`
            INSERT {
                "email": "admin@admin.com",
                "role": "admin",
                "password": "${hash}",
                "loginString": "",
                "visible": true
            } INTO users
        `);
    },

    exportData : async function(){
        const fs = require('fs');
        const collections = await db.listCollections();

        collections.forEach(collection => {
            db.collection(collection.name).all().then(function (docs) {
                let filename = collection.name + ".json";
                return new Promise(function (resolve, reject) {
                  fs.writeFile(`./public/export/${filename}`, JSON.stringify(docs, null, 2), function (err) {
                    if (err) reject(err);
                    else resolve();
                  });
              })
              .then(function () {
                console.log('All done!');
              })
              .catch(function (err) {
                console.error('Something wrong', err);
              });
            });
        });
    }
}