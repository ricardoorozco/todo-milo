const jwt = require('jsonwebtoken');
//import the global config
require('../config/config');

let authorization = (req, res, next) => {
    let token = req.get('Authorization');

    jwt.verify(token, process.env.secrect, (err, payload) => {
        if (err) {
            return res.status(401).json({
                error: true,
                data: err
            });
        } else {
            req.userToken = payload.user;
            next();
        }
    });
}

let isAdmin = (req, res, next) => {

    if (req.userToken.rol === 'ADMIN') {
        req.isAdmin = true;
    } else {
        req.isAdmin = false;
    }

    next();
}

module.exports = {
    authorization,
    isAdmin
};