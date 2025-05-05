const { hashSync } = require("bcrypt");
const usersDAO = require("../models/users.dao");
const { USERS_PER_PAGE } = require('../constants/pagination');

const usersController = {
    getAll: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;  // Pega a página, default é 1
            const limit = USERS_PER_PAGE;
            const filterName = req.query.filter;
            var resultado = await usersDAO.findAll(page, limit);
            var totalUsers = await usersDAO.countAll();
            var totalPages = Math.ceil(totalUsers / limit);

            if (!res.headersSent) {

                if (filterName) {
                    resultado = resultado.filter(u =>
                    u.name.toLowerCase().includes(filterName.toLowerCase()));

                    totalUsers = await usersDAO.countByName(filterName);
                    totalPages = Math.ceil(totalUsers / limit);

                    totalPages == 0 ? totalPages = 1 : totalPages;
                }

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
            const user = req.body;

            user.password = hashSync(user.senha, 10);
            await usersDAO.insert(user);
            if (!res.headersSent) {
                res.render('addedSuccessfully');
            }
        } catch (err) {
            if (err == "Error: SQLITE_CONSTRAINT: UNIQUE constraint failed: user.cpf") {
                return res.render('addUser', { error: 'CPF já cadastrado.' });
            }

            if (!res.headersSent) {
                res.status(500).send("Erro ao inserir usuário");
            }
        }
    },

    getById: async (req, res) => {
        try {
            const resultado = await usersDAO.findById(req.params.id);
            if (!res.headersSent) {
                res.render("user", { 
                    userInfo: resultado.user,
                    emails: resultado.emails,
                    phones: resultado.phones,
                    user: req.session.user, // cpf do usuário logado
                }); 
            }
        } catch (err) {
            console.error("Erro ao buscar usuário: ", req.params.id, err);
            if (!res.headersSent) {
                res.status(500).send("Erro ao buscar usuário");
            }
        }
    },

    editUserById: async (req, res) => {
        try {
            const resultado = await usersDAO.findById(req.params.id);
            if (!res.headersSent) {
                res.render("updateUser", { 
                    userInfo: resultado.user,
                    emails: resultado.emails,
                    phones: resultado.phones,
                    user: req.session.user, // cpf do usuário logado
                }); 
            }
        } catch (err) {
            console.error("Erro ao buscar usuário: ", req.params.id, err);
            if (!res.headersSent) {
                res.status(500).send("Erro ao buscar usuário");
            }
        }
    },

    updateById: async (req, res) => {
        const id = req.params.id;
        const cpfRow = await usersDAO.findCpfById(id);
        const cpf = cpfRow?.cpf;
        const { name, emails, emailPrincipal, phones, phonePrincipal, password } = req.body;

        try {
            await usersDAO.updateUserName(cpf, name);

            if (password.length > 0) {
                const hashPassword = hashSync(password, 10);
                await usersDAO.updatePassword(cpf, hashPassword);
            }

            await usersDAO.deleteUserEmails(cpf);
            for (let i = 0; i < emails.length; i++) {
                await usersDAO.insertEmail({
                    cpf,
                    email: emails[i],
                    principal: parseInt(emailPrincipal) === i ? 1 : 0
                });
            }

            await usersDAO.deleteUserPhones(cpf);
            for (let i = 0; i < phones.length; i++) {
                await usersDAO.insertPhone({
                    cpf,
                    phone: phones[i],
                    principal: parseInt(phonePrincipal) === i ? 1 : 0
                });
            }

            res.redirect(`/user/${id}`);
        } catch (err) {
            console.error("Erro ao atualizar usuário:", err);
            res.status(500).send("Erro ao atualizar usuário.");
        }
    },

    delete: async (req, res) => {
        const id = req.params.id;
        const cpfRow = await usersDAO.findCpfById(id);
        const cpf = cpfRow?.cpf;

        try {
            await usersDAO.deleteUserEmails(cpf);
            await usersDAO.deleteUserPhones(cpf);
            await usersDAO.deleteUser(cpf);

            res.redirect("/users");
        } catch (err) {
            console.error("Erro ao deletar usuário:", err);
            res.status(500).send("Erro ao deletar usuário.");
        }
    }
};

module.exports = usersController;