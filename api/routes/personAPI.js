var express = require('express');
var router = express.Router();
var service = require('../services/PersonServices.js');

const symbols = /[$%^&*_+|~=`{}[\]:";'<>]/;

// GET
router.get('/getPersonData', function(req, res, next) {
    console.log('Obteniendo personas...');
    service.getPersonData().then(
        function(result){
            res.send(result);
        }
    );
});

router.get('/getPersonRelations', function(req, res, next){
    console.log('Obteniendo relaciones de ' + req.query.personID + "...");
    service.getPersonRelations(req.query.personID).then(
        function(result){
            res.send(result);
        }
    );
});

router.get('/isRelated', function(req, res, next){
    service.isRelated(req.query.firstPersonID, req.query.secondPersonID).then(
        function(result){
            res.send(result);
        }
    );
});

router.get('/getNodeHeight', function(req, res, next){
    service.getNodeHeight(req.query.personID).then(
        function(result){
            res.send(result);
        }
    );
});



// POST
router.post('/addPerson', function(req, res, next){
    if (!req.query.name.match(symbols) && !req.query.surname.match(symbols)){
        service.addPerson(req.query.name, req.query.surname, req.query.birthdate, req.query.estimatedDate, req.query.gender, req.query.userID).then(
            function(result){
                res.send(result);
            }
        );
    } else {
        res.status(500).send("ERROR");
    }
});

router.post('/editPerson', function(req, res, next){
    if (!req.query.name.match(symbols) && !req.query.surname.match(symbols)){
        service.editPerson(req.query.key, req.query.name, req.query.surname, req.query.birthdate, req.query.estimatedDate, req.query.gender).then(
            function(result){
                res.send(result);
            }
        );
    } else {
        res.status(500).send("ERROR");
    }
});

// Borra primero las relaciones y por último la persona
router.post('/deletePerson', function(req, res, next){
    console.log('KEY in testAPI: ' + req.query.key);
    service.deletePersonRelations(req.query.key).then(
        function(){
            service.deletePerson(req.query.key).then(
                function(result){
                    res.send(result);
                }
            );
        }
    );
});

router.post('/addParentRelation', function(req, res, next){
    console.log("ParentID: " + req.query.parentID + " ChildID: " + req.query.childID);
    service.addParentRelation(req.query.parentID, req.query.childID).then(
        function(result){
            console.log("KEY: " + result);
            res.send(result);
        }
    );
});

router.post('/addPartnerRelation', function(req, res, next){
    console.log("PersonID: " + req.query.personID + " OtherPersonID: " + req.query.otherPersonID);
    service.addPartnerRelation(req.query.personID, req.query.otherPersonID).then(
        function(result){
            console.log("KEY: " + result);
            res.send(result);
        }
    );
});

router.post('/deleteParentRelation', function(req, res, next){
    console.log("RelationID: " + req.query.key);
    service.deleteRelation(req.query.key, "parentOf").then(
        function(result){
            res.send(result);
        }
    );
});

router.post('/deletePartnerRelation', function(req, res, next){
    console.log("RelationID: " + req.query.key);
    service.deleteRelation(req.query.key, "partnerOf").then(
        function(result){
            res.send(result);
        }
    );
});

module.exports = router;