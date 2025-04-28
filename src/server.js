const dotenv = require('dotenv');
dotenv.config();

console.log({ VARIAVEIS_AMBIENTE: process.env });

// Import required modules
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./config/dbConnection');

// Initialize the app
const app = express();
const PORT = 3000;

// Middleware setup
// Para que o Express entenda e converta os dados dos formulários do html em req.body.
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index'); // mostra index.ejs
});

app.get('/login', (req, res) => {
  res.render('login'); // mostra login.ejs
});

app.get('/addUser', (req, res) => {
  res.render('addUser'); // mostra addUser.ejs
});

// // Rota de autenticação
// app.post('/auth', (req, res) => {
//   console.log("ADRIANA ", req.body);
//   const { cpf, password } = req.body;

//   const query = `SELECT * FROM user WHERE cpf = ? AND password = ?`;
//   db.get(query, [cpf, password], (err, row) => {
//     if (err) {
//       console.error('Erro na consulta:', err.message);
//       return res.status(500).send('Erro interno');
//     }

//     if (row) {
//       res.send('Login bem-sucedido!');
//       // Aqui você pode redirecionar para um painel ou dashboard
//     } else {
//       res.send('CPF ou senha inválidos');
//     }
//   });
// });

// estamos utilizando memoria do servidor para guardar as sessoes.
// 1. caso o servidor seja reiniciado, vc perde os dados da memoria.
// 2. escalabilidade fica comprometida pq conforme aumenta o numero de usuarios, aumenta a quantidade de memoria necessaria
const session = require('express-session');
app.use(session({
    secret: 'keyboard cat',      // CHAVE -> TODO: MUDAR PARA VAR DE AMBIENTE
    resave: false,      
    saveUninitialized: true,
    // cookie: { secure: true }
}));

// Verifica se existe um array routes. Se sim, adiciona a rota no array, se não, cria o array com a rota atual
// Usado para depurar
app.use((req, res, next) => {
    if (req.session.routes) 
        req.session.routes.push(req.url);
    else
        req.session.routes = [req.url];

    console.log('SESSION ID ' + req.sessionID )
    console.log({ session: req.session})
    next();
})

// Para renderizar as telas da pasta views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const usersRouter = require('./routes/users.routes');
app.use(usersRouter);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});