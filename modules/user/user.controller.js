const User = require('./user.model');

let create = (req, res) => {

    if (!req.isAdmin) {
        return res.status(401).json({
            error: true,
            data: {
                messege: 'Unauthorized user'
            }
        });
    }

    let body = req.body;

    let user = new User({
        username: body.username,
        email: body.email,
        password: body.password,
        rol: body.rol,
        active: body.active,
        created_by: req.userToken._id
    });

    user.save((err, userDB) => {
        if (err) {
            return res.status(400).json({
                error: true,
                data: err
            });
        } else {
            return res.status(200).json({
                error: false,
                data: {
                    messege: 'User created successfully'
                }
            });
        }
    });
}

let list = (req, res) => {

    if (!req.isAdmin) {
        return res.status(401).json({
            error: true,
            data: {
                messege: 'Unauthorized user'
            }
        });
    }

    let offset = Number(req.query.offset) || 0;
    let limit = Number(req.query.limit) || 10;

    let where = {};

    User.find(where)
        .sort('username')
        .skip(offset)
        .limit(limit)
        .populate('created_by', 'username')
        .populate('updated_by', 'username')
        .populate('deleted_by', 'username')
        .exec((err, users) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    data: err
                });
            } else {
                User.countDocuments(where, (err, total) => {

                    if (err) {
                        return res.status(400).json({
                            error: true,
                            data: err
                        });
                    }

                    return res.status(200).json({
                        error: false,
                        data: {
                            offset,
                            limit,
                            total,
                            users
                        }
                    });
                });
            }
        });
}

let update = (req, res) => {

    if (!req.isAdmin) {
        return res.status(401).json({
            error: true,
            data: {
                messege: 'Unauthorized user'
            }
        });
    }

    let id = req.params.id;
    let body = req.body;

    //the attributes __v, created_at, updated_at and deleted_at are omitted because it must not be modified
    delete body.__v;
    delete body.created_at;
    delete body.updated_at;
    delete body.deleted_at;

    body.updated_at = new Date();
    body.updated_by = req.userToken._id

    User.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, userDB) => {
        if (err) {
            return res.status(400).json({
                error: true,
                data: err
            });
        } else if (!userDB) {
            return res.status(404).json({
                error: true,
                data: 'User not found',
                id
            });
        } else {
            return res.status(200).json({
                error: false,
                data: {
                    messege: 'User updated successfully'
                }
            });
        }
    });
}

let logicalDelete = (req, res) => {

    if (!req.isAdmin) {
        return res.status(401).json({
            error: true,
            data: {
                messege: 'Unauthorized user'
            }
        });
    }

    let id = req.params.id;

    let deleted = {
        deleted_by: req.userToken._id,
        deleted_at: new Date()
    };

    //logical deleted
    User.findByIdAndUpdate(id, deleted, { new: true, runValidators: true }, (err, userDB) => {
        if (err) {
            return res.status(400).json({
                error: true,
                data: err,
                id
            });
        } else if (!userDB) {
            return res.status(404).json({
                error: true,
                data: 'User not found',
                id
            });
        } else {
            return res.status(200).json({
                error: false,
                data: {
                    messege: 'User deleted successfully'
                }
            });
        }
    });
}

module.exports = {
    create,
    list,
    update,
    logicalDelete
}