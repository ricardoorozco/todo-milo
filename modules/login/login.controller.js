const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//import the global config
require('../../config/config');

const User = require('../user/user.model');

module.exports.login = (req, res) => {

    let body = req.body;

    User.findOne({ email: body.email }, (err, UserDB) => {
        if (err) {
            return res.status(400).json({
                error: true,
                data: err,
                id
            });
        } else if (!UserDB) {
            return res.status(404).json({
                error: true,
                data: 'Username or password incorrect'
            });
        } else if (!bcrypt.compareSync(body.passwd, UserDB.password)) {
            return res.status(404).json({
                error: true,
                data: 'Username or password incorrect.'
            });
        } else {

            let token = jwt.sign({ user: UserDB }, process.env.secrect, { expiresIn: process.env.expiresIn });

            return res.status(200).json({
                error: false,
                data: {
                    expiresIn: process.env.expiresIn,
                    token
                }
            });
        }
    });
}