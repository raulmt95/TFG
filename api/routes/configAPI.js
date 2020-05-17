var express = require('express');
var router = express.Router();
var service = require('../services/ConfigServices.js');

const bcrypt = require('bcryptjs');
const child_process = require("child_process");

router.get('/initialize', function(req, res, next){
    service.createDatabase().then(
        function(result){
            if (result !== "databaseExists"){
                service.createCollections().then(
                    function(){
                        service.createGraph().then(
                            function(){
                                bcrypt.hash("adminPassword", 10, function(err, hash){
                                    service.createAdmin(hash).then(
                                        function(){
                                            res.send("Inicialización correcta");
                                        }
                                    );
                                });
                            }  
                        );
                    }
                );
            }
        }
    );
});
                    
router.post('/exportData', function(req, res, next){
    console.log("EXPORTANDO");
    service.exportData().then(
        function(){
            child_process.execSync(`zip -r export.zip *`, {
                cwd: "./public/export"
            });
            res.send("Export creado");
        }
    );
});

router.post('/exportFiles', function(req, res, next){
    console.log("EXPORTANDO");
    service.exportData().then(
        function(){
            child_process.execSync(`zip -r files.zip *`, {
                cwd: "./public/files"
            });
            res.send("Export creado");
        }
    );
});

module.exports = router;