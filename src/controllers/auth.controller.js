const { compareSync } = require("bcrypt");
const usersDAO = require("../models/users.dao");


const authController = {
    async login(req, res) {
        const { cpf, password }  = req.body;
        const user = await usersDAO.findByCpf(cpf);

        try {
            if (cpf == user.cpf && password == user.password) { // TODO: comparar com hash da senha!!!
                req.session.isAuth = true;

                const sessionUser = {
                    cpf: user.cpf,
                    role: user.role
                }

                req.session.user = sessionUser;
                
                return res.redirect('/users');

                // res.render('usersList', {
                //     usuarios: await usersDAO.findAll(), // Array de objetos com nome, cpf, email, telefone
                //     user: req.session.user   // Objeto do usuário logado (com role, ex: "admin")
                // });
            }
        } catch (err) {
      console.error("Erro no login:", err);
      return res.status(500).send("Erro no servidor ao tentar fazer login.");
    }
    },

    logout(req, res) {
        req.session.destroy();
        res.render('index');
    }
}

module.exports = authController;