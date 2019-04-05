const mongoose = require('mongoose');
const unique = require('mongoose-unique-validator');

let Schema = mongoose.Schema;
mongoose.set('useCreateIndex', true);

let taskSchema = new Schema({
    task: {
        type: String,
        require: [
            true,
            'The task is required'
        ]
    },
    status: {
        type: String,
        default: 'PENDING',
        enum: {
            values: [
                'PENDING', 'DONE', 'CANCELED'
            ],
            message: '{VALUE} is not a valid status'
        }
    },
    responsable: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        require: [
            true,
            'The responsable is required'
        ]
    },
    active: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
        default: new Date()
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        require: [
            true
        ]
    },
    updated_at: {
        type: Date
    },
    updated_by: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    deleted_at: {
        type: Date
    },
    deleted_by: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
});

//exclude the deleted data by logical deleted
taskSchema.pre('find', function(next) {

    let conditions = this.getQuery();
    conditions.deleted_at = null;
    this._conditions = conditions;

    //continue others events
    next();
});

//exclude the deleted data by logical deleted
taskSchema.pre('countDocuments', function(next) {

    let conditions = this.getQuery();
    conditions.deleted_at = null;
    this._conditions = conditions;

    //continue others events
    next();
});

//Implementation of the plugin for error handling unique
taskSchema.plugin(unique, {
    message: 'The {PATH} {VALUE} has already been used'
});

module.exports = mongoose.model('Task', taskSchema);