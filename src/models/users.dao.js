const db = require("../config/dbConnection");
const { USERS_PER_PAGE } = require('../constants/pagination');

const usersDAO = {
  findAll(page = 1, limit = USERS_PER_PAGE) {
    return new Promise((resolve, reject) => {
      const offset = (page - 1) * limit; //qtd de usuários que vai pular

      const query = "SELECT user.cpf, name, roles, email, phone FROM user "
          + "INNER JOIN email ON (user.cpf = email.cpf) "
          + "INNER JOIN phone ON (user.cpf = phone.cpf) GROUP BY user.cpf "
          + "LIMIT ? OFFSET ?";
      
      db.all(query, [limit, offset], (err, rows) => {
        console.log("LIMITE: ", limit);
        console.log("OFFSET: ", offset);

        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  findByCpf(cpf) {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM user WHERE cpf = ? LIMIT 1;";
      db.get(query, [cpf], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  insert(user) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        const insertUser = "INSERT INTO user (name, cpf, password) VALUES (?, ?, ?);";
        const insertEmail = "INSERT INTO email (cpf, email) VALUES (?, ?);";
        const insertPhone = "INSERT INTO phone (cpf, phone) VALUES (?, ?);";

        db.run(insertUser, [user.nome, user.cpf, user.password], function (err) {
          if (err) return reject(err);

          db.run(insertEmail, [user.cpf, user.email], function (err) {
            if (err) return reject(err);

            db.run(insertPhone, [user.cpf, user.telefone], function (err) {
              if (err) return reject(err);

              resolve({ success: true, message: "Usuário inserido com sucesso" });
            });
          });
        });
      });
    });
  },

  countAll() {
    return new Promise((resolve, reject) => {
      const query = "SELECT COUNT(*) AS count FROM user";
      db.get(query, [], (err, row) => {
        if (err) return reject(err);
        resolve(row.count);
      });
    });
  }
};

module.exports = usersDAO;
