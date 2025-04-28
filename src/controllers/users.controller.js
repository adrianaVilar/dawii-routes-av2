const { hashSync } = require("bcrypt");
const usersDAO = require("../models/users.dao");
const { USERS_PER_PAGE } = require('../constants/pagination');

const usersController = {
    getAll: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;  // Pega a página, default é 1
            const limit = USERS_PER_PAGE;
            const resultado = await usersDAO.findAll(page, limit);
            const totalUsers = await usersDAO.countAll();
            const totalPages = Math.ceil(totalUsers / limit);

            if (!res.headersSent) {
                res.render("usersList", { 
                    users: resultado,
                    page,
                    totalPages,
                    totalUsers,
                    user: req.session.user, // usuário logado
                }); 
            }
        } catch (err) {
            console.error("Erro ao buscar usuários:", err);
            if (!res.headersSent) {
                res.status(500).send("Erro ao buscar usuários");
            }
        }
  },
    create: async (req, res) => {
        try {
            console.log({ body: req.body });
            const user = req.body;

            user.password = hashSync(user.senha, 10);
            await usersDAO.insert(user);
            if (!res.headersSent) {
                res.render('addedSuccessfully');
            }
        } catch (err) {
            console.error("Erro ao inserir usuário:", err);
            if (!res.headersSent) {
                res.status(500).send("Erro ao inserir usuário");
            }
        }
    },
};

module.exports = usersController;