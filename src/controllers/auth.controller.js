const { compareSync } = require("bcrypt");
const usersDAO = require("../models/users.dao");


const authController = {
    async login(req, res) {
        const { cpf, password } = req.body;
        const user = await usersDAO.findByCpf(cpf);

        try {
            if (cpf == user.cpf && compareSync(password, user.password)) {
                req.session.isAuth = true;

                const sessionUser = {
                    cpf: user.cpf,
                    role: user.role,
                    id: user.id,
                    name: user.name
                }

                req.session.user = sessionUser;
                
                return res.redirect('/users');
            } else {
                return res.render('login', { error: 'CPF ou senha inválidos.' });
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