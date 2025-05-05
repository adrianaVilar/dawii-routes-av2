const isAuth = (req, res, next) => {
    if (req.session.isAuth) return next();

    res.render('index');
}

module.exports = isAuth;