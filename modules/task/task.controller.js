const Task = require('./task.model');

let create = (req, res) => {

    if (!req.isAdmin) {
        return res.status(401).json({
            error: true,
            data: {
                message: 'Unauthorized user'
            }
        });
    }

    let body = req.body;

    let task = new Task({
        task: body.task,
        responsable: body.responsable,
        created_by: req.userToken._id
    });

    task.save((err, taskDB) => {
        if (err) {
            return res.status(400).json({
                error: true,
                data: err
            });
        } else {
            return res.status(200).json({
                error: false,
                data: {
                    message: 'Task created successfully',
                    test: taskDB._id
                }
            });
        }
    });
}

let list = (req, res) => {

    let offset = Number(req.query.offset) || 0;
    let limit = Number(req.query.limit) || 10;

    let where;

    if (!req.isAdmin) {
        where = { responsable: req.userToken._id };
    } else {
        where = {};
    }

    Task.find(where)
        .sort('task')
        .skip(offset)
        .limit(limit)
        .populate('responsable', 'username email')
        .populate('created_by', 'username')
        .populate('updated_by', 'username')
        .populate('deleted_by', 'username')
        .exec((err, tasks) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    data: err
                });
            } else {
                Task.countDocuments(where, (err, total) => {

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
                            tasks
                        }
                    });
                });
            }
        });
}

let view = (req, res) => {

    if (!req.isAdmin) {
        where = { _id: req.params.id, responsable: req.userToken._id };
    } else {
        where = { _id: req.params.id };
    }

    Task.findOne(where).
    populate('responsable').
    exec((err, taskDB) => {
        if (err) {
            return res.status(500).json({
                error: true,
                data: err
            });
        } else if (!taskDB) {
            return res.status(404).json({
                error: true,
                data: {
                    message: 'Task not found'
                }
            });
        } else {
            return res.status(200).json({
                error: false,
                data: {
                    taskDB
                }
            });
        }
    });
}

let update = (req, res) => {

    let id = req.params.id;
    let body = req.body;

    if (!req.isAdmin) {
        where = { _id: req.params.id, responsable: req.userToken._id };
    } else {
        where = { _id: req.params.id };
    }

    //the attributes __v, created_at, updated_at and deleted_at are omitted because it must not be modified
    delete body.__v;
    delete body.created_at;
    delete body.updated_at;
    delete body.deleted_at;

    body.updated_at = new Date();
    body.updated_by = req.userToken._id

    Task.findOneAndUpdate(where, body, { new: true, runValidators: true }, (err, taskDB) => {
        if (err) {
            return res.status(400).json({
                error: true,
                data: err
            });
        } else if (!taskDB) {
            return res.status(404).json({
                error: true,
                data: {
                    message: 'Task not found'
                },
                id
            });
        } else {
            return res.status(200).json({
                error: false,
                data: {
                    message: 'Task updated successfully'
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
                message: 'Unauthorized user'
            }
        });
    }

    let id = req.params.id;

    let deleted = {
        deleted_by: req.userToken._id,
        deleted_at: new Date()
    };

    //logical deleted
    Task.findByIdAndUpdate(id, deleted, { new: true, runValidators: true }, (err, taskDB) => {
        if (err) {
            return res.status(400).json({
                error: true,
                data: err,
                id
            });
        } else if (!taskDB) {
            return res.status(404).json({
                error: true,
                data: {
                    message: 'Task not found'
                },
                id
            });
        } else {
            return res.status(200).json({
                error: false,
                data: {
                    message: 'Task deleted successfully'
                }
            });
        }
    });
}

module.exports = {
    create,
    list,
    view,
    update,
    logicalDelete
}