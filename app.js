const express = require('express');
const app = express();
const connection = require('./database/database');

// Models
const Usuario = require('./models/usuario');
const Tipo = require('./models/tipo');
const Figurinha = require('./models/figurinha');

// Routes import
const usuarioRoute = require('./routes/usuarioRoutes');

// Forms Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Database
connection
   .authenticate()
   .then(() => {
    console.log("Conexão feita com sucesso!");
   });

// Access from other origin
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader (
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS'
  );
  next();
});

// Routes
app.use('/api/usuario', usuarioRoute);


module.exports = app;
