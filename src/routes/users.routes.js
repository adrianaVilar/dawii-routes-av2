const { Router } = require('express');
const usersController = require('../controllers/users.controller');
const isAuth = require('../middlewares/isAuth');
const authController = require('../controllers/auth.controller');

const usersRouter = Router();

usersRouter.get('/users', isAuth, usersController.getAll);
usersRouter.post('/users', usersController.create);
usersRouter.post('/login', authController.login);
usersRouter.get('/logout', authController.logout);
usersRouter.get('/user/:id', isAuth, usersController.getById);
usersRouter.get('/updateUser/:id', isAuth, usersController.editUserById);
usersRouter.post('/updateUser/:id', isAuth, usersController.updateById);
usersRouter.get('/deleteUser/:id', isAuth, usersController.delete);


module.exports = usersRouter;