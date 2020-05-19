var express = require('express');
var router = express.Router();
var service = require('../services/ConfigServices.js');
var fileUpload = require('express-fileupload');
router.use(fileUpload());

const bcrypt = require('bcryptjs');
const child_process = require("child_process");
const fs = require('fs');

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
                    
// router.post('/exportData', function(req, res, next){
//     console.log("EXPORTANDO");
//     service.exportData().then(
//         function(){
//             child_process.execSync(`zip -r export.zip *`, {
//                 cwd: "./public/export"
//             });
//             res.send("Export creado");
//         }
//     );
// });

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

router.post('/importFiles', function(req, res, next){
    console.log("IMPORTANDO");
    var file = req.files.file;
    var filename = file.name;

    let writeStream = fs.createWriteStream(`./public/files/${filename}`);
    writeStream.end(file.data, file.encoding);
    writeStream.on('finish', () => {
        console.log("HOA");
        child_process.execSync(`unzip -o ${filename}`, {
            cwd: "./public/files"
        });
        res.send("Importación completada");
    });
    
    
});

module.exports = router;