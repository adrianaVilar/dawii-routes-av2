const db = require("../config/dbConnection");
const { USERS_PER_PAGE } = require('../constants/pagination');

const usersDAO = {
  findAll(page = 1, limit = USERS_PER_PAGE) {
    return new Promise((resolve, reject) => {
      const offset = (page - 1) * limit; //qtd de usuários que vai pular

      const query = `
        SELECT user.cpf, user.id, name, email, phone FROM user 
        INNER JOIN email ON (user.cpf = email.cpf) 
        INNER JOIN phone ON (user.cpf = phone.cpf) GROUP BY user.cpf 
        LIMIT ? OFFSET ?;`;
      
      db.all(query, [limit, offset], (err, rows) => {
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

  findById(id) {
    return new Promise((resolve, reject) => {
      const userQuery = "SELECT * FROM user WHERE id = ?;";
      const emailQuery = `
        SELECT email, principal
        FROM email
        WHERE cpf = (SELECT cpf FROM user WHERE id = ?);
      `;
      const phoneQuery = `
        SELECT phone, principal
        FROM phone
        WHERE cpf = (SELECT cpf FROM user WHERE id = ?);
      `;

      db.get(userQuery, [id], (err, userRow) => {
        if (err) return reject(err);

        db.all(emailQuery, [id], (err, emailRows) => {
          if (err) return reject(err);

          db.all(phoneQuery, [id], (err, phoneRows) => {
            if (err) return reject(err);

            // Retorna um objeto contendo os dados de cada query
            resolve({
              user: userRow,
              emails: emailRows,
              phones: phoneRows
            });
          });
        });
      });
    });
  },

  insert(user) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        const insertUser = "INSERT INTO user (name, cpf, password, role) VALUES (?, ?, ?, ?);";
        const insertEmail = "INSERT INTO email (cpf, email, principal) VALUES (?, ?, 1);";
        const insertPhone = "INSERT INTO phone (cpf, phone, principal) VALUES (?, ?, 1);";

        db.run(insertUser, [user.nome, user.cpf, user.password, user.perfil], function (err) {
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
      const query = "SELECT COUNT(*) AS count FROM user;";
      db.get(query, [], (err, row) => {
        if (err) return reject(err);
        resolve(row.count);
      });
    });
  },

  countByName(name) {
    return new Promise((resolve, reject) => {
      const query = "SELECT COUNT(*) AS count FROM user WHERE name=?;";
      db.get(query, [name], (err, row) => {
        if (err) return reject(err);
        resolve(row.count);
      });
    });
  },

  updateUserName: (cpf, name) => {
    return new Promise((resolve, reject) => {
      const update = "UPDATE user SET name = ? WHERE cpf = ?;";
      db.run(update, [name, cpf], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  updatePassword: (cpf, password) => {
    return new Promise((resolve, reject) => {
      const update = "UPDATE user SET password = ? WHERE cpf = ?;";
      db.run(update, [password, cpf], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  deleteUserEmails: (cpf) => {
    return new Promise((resolve, reject) => {
      const queryDelete = "DELETE FROM email WHERE cpf = ?;";
      db.run(queryDelete, [cpf], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  insertEmail: ({ cpf, email, principal }) => {
    return new Promise((resolve, reject) => {
      const insert = "INSERT INTO email (cpf, email, principal) VALUES (?, ?, ?);";
      db.run(insert, [cpf, email, principal], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  deleteUserPhones: (cpf) => {
    return new Promise((resolve, reject) => {
      const queryDelete = "DELETE FROM phone WHERE cpf = ?;";
      db.run(queryDelete, [cpf], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  insertPhone: ({ cpf, phone, principal }) => {
    return new Promise((resolve, reject) => {
      const insert = "INSERT INTO phone (cpf, phone, principal) VALUES (?, ?, ?);";
      db.run(insert, [cpf, phone, principal], (err) => {
        if (err) reject(err);
        else resolve({ success: true, message: "Telefone inserido com sucesso" });
      });
    });
  },

  deleteUser: (cpf) => {
    return new Promise((resolve, reject) => {
      const queryDelete = "DELETE FROM user WHERE cpf = ?;";
      db.run(queryDelete, [cpf], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  findCpfById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `
          SELECT user.cpf FROM user 
          WHERE id = ?;`;
        
        db.get(query, [id], (err, row) => {
          if (err) return reject(err);
          resolve(row);
        });
      })
  },

};

module.exports = usersDAO;
