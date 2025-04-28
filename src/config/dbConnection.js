const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho para o banco
const dbPath = path.resolve(__dirname, '../database/usersystem.db');

// Conexão com o banco
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar no banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados.');
  }
});

// Exporta a conexão
module.exports = db;
