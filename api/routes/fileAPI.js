var express = require('express');
var router = express.Router();
var service = require('../services/FileServices.js');
var fileUpload = require('express-fileupload');
router.use(fileUpload());

const fs = require('fs');

const symbols = /[$%^&*_+|~=`{}[\]:";'<>]/;

// GET
router.get('/getFileData', function(req, res, next) {
    console.log('Obteniendo archivos...');
    service.getFileData().then(
        function(result){
            res.send(result);
        }
    );
});

router.get('/getFileRelations', function(req, res, next){
    console.log('Obteniendo relaciones de ' + req.query.fileID + "...");
    service.getFileRelations(req.query.fileID).then(
        function(result){
            res.send(result);
        }
    );
});


// POST
router.post('/addFile', function(req, res, next){
    var file = req.files.file;

    // Se guarda con una clave aleatoria + el nombre original para evitar duplicados
    var filename = Math.random().toString(36).substr(2, 9) + '_' + file.name;

    // Guarda la fecha en milisegundos para ordenar, ya que ArangoDB no tiene soporte para datos de tipo fecha
    var date = Date.now();

    if (!req.query.title.match(symbols) && !req.query.description.match(symbols)){
        service.addFile(filename, req.query.title, req.query.description, date, file.mimetype, req.query.userID).then(
            function(result){
                let writeStream = fs.createWriteStream(`./public/files/${filename}`);
                writeStream.write(file.data, file.encoding);
                res.send(result);
            }
        );
    } else {
        res.status(500).send("ERROR");
    }
});

router.post('/addLink', function(req, res, next){
    // Guarda la fecha en milisegundos para ordenar, ya que ArangoDB no tiene soporte para datos de tipo fecha
    var date = Date.now();

    if (!req.query.title.match(symbols) && !req.query.description.match(symbols)){
        service.addFile(req.query.link, req.query.title, req.query.description, date, "link", req.query.userID).then(
            function(result){
                res.send(result);
            }
        );
    } else {
        res.status(500).send("ERROR");
    }
});

router.post('/editFile', function(req, res, next){
    console.log('Title: ' + req.query.title + ' Description: ' + req.query.description + ' KEY: ' + req.query.key);

    if (!req.query.title.match(symbols) && !req.query.description.match(symbols)){
        service.editFile(req.query.key, req.query.title, req.query.description).then(
            function(result){
                res.send(result);
            }
        );
    } else {
        res.status(500).send("ERROR");
    }
});

router.post('/editLink', function(req, res, next){
    console.log('Title: ' + req.query.title + ' Description: ' + req.query.description + ' KEY: ' + req.query.key);

    if (!req.query.title.match(symbols) && !req.query.description.match(symbols)){
        service.editLink(req.query.key, req.query.link, req.query.title, req.query.description).then(
            function(result){
                res.send(result);
            }
        );
    } else {
        res.status(500).send("ERROR");
    }
});

router.post('/deleteFile', function(req, res, next){
    console.log('KEY in testAPI: ' + req.query.key);
    service.deleteFile(req.query.key).then(
        function(result){
            res.send(result);
        }
    );
});

router.post('/addFileRelation', function(req, res, next){
    console.log("FileID: " + req.query.fileID + " PersonID: " + req.query.personID);
    service.addFileRelation(req.query.fileID, req.query.personID).then(
        function(result){
            res.send(result);
        }
    );
});

router.post('/deleteFileRelation', function(req, res, next){
    console.log("RelationID: " + req.query.key);
    service.deleteRelation(req.query.key, "relatedTo").then(
        function(result){
            res.send(result);
        }
    );
});


module.exports = router;