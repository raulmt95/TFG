var express = require('express');
var router = express.Router();
var service = require('../services/UserServices.js');

const bcrypt = require('bcryptjs');

const symbols = /[$`{}[\]:";']/;

// GET
router.get('/getUserData', function(req, res, next) {
  console.log('Obteniendo usuarios...');
  service.getUserData().then(
      function(result){
          res.send(result);
      }
  );
});

router.get('/getUserByEmail', function(req, res, next) {
  console.log('Obteniendo usuarios...');
  if (!req.query.email.match(symbols)){
    service.getUserByEmail(req.query.email).then(
        function(result){
          res.send(result);
        }
    );
  } else {
    res.status(500).send("ERROR");
  }
});

router.get('/getUserQueryData', function(req, res, next) {
  console.log('Obteniendo lista de consultas...');
  service.getUserQueryData(req.query.userID).then(
      function(result){
        res.send(result);
      }
  );
});


// POST
router.post('/checkPassword', function(req, res, next) {
  console.log('Comprobando contraseña...');
  if (!req.query.email.match(symbols)){
    service.checkPassword(req.query.email, req.query.password).then(
        function(result){
          res.send(result);
        }
    );
  } else {
    res.status(500).send("ERROR");
  } 
});

router.post('/createLoginString', function(req, res, next) {
  console.log("Creando loginString...");
  let loginString = Math.random().toString(36).substr(2, 18);
  bcrypt.hash(loginString, 10, function(err, hash){
    service.setLoginString(req.query.id, hash).then(
      function(result){
        res.send(loginString);
      }
    );
  });
});

router.post('/findRememberedUser', function(req, res, next) {
  console.log("Buscando usuario...");
  service.findRememberedUser(req.query.loginString, req.query.email).then(
    function(result){
      res.send(result);
    }
  );
});

router.post('/logOut', function(req, res, next) {
  console.log("Cerrando sesión...");
  service.setLoginString(req.query.userID, "").then(
      function(result){
        res.send(result);
      }
  );
});

router.post('/addUser', function(req, res, next) {
  console.log('Añadiendo usuario...');
  if (!req.query.email.match(symbols)){
    bcrypt.hash(req.query.password, 10, function(err, hash){
      service.addUser(req.query.email, hash).then(
        function(result){
            res.send(result);
        }
      );
    });
  } else {
    res.status(500).send("ERROR");
  } 
});

router.post('/changeAdminPrivileges', function(req, res, next) {
  console.log('Cambiando privilegios de administrador...');
  service.setRole(req.query.userID, req.query.role).then(
    function(result){
        res.send(result);
    }
  );
});

router.post('/addToQueryList', function(req, res, next) {
  // Guarda la fecha en milisegundos para ordenar, ya que ArangoDB no tiene soporte para datos de tipo fecha
  var date = Date.now();

  console.log('Insertando consulta...');
  if (!req.query.firstParameter.match(symbols) && !req.query.secondParameter.match(symbols)){
    service.addToQueryList(req.query.type, req.query.firstParameter, req.query.secondParameter, req.query.userID, date).then(
      function(result){
        res.send(result);
      }
    );
  } else {
    res.status(500).send("ERROR");
  } 
});

module.exports = router;
