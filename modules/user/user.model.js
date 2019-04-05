const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const unique = require('mongoose-unique-validator');

const salt = 10;
let Schema = mongoose.Schema;
mongoose.set('useCreateIndex', true);

let userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: [
            true,
            'The username is required'
        ]
    },
    email: {
        type: String,
        unique: true,
        required: [
            true,
            'The email is required'
        ]
    },
    password: {
        type: String,
        required: [
            true,
            'The password is required'
        ]
    },
    rol: {
        type: String,
        default: 'USER',
        enum: {
            values: [
                'ADMIN',
                'USER'
            ],
            message: '{VALUE} is not a valid role'
        }
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
        ref: 'User'
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
userSchema.pre('find', function(next) {

    let conditions = this.getQuery();
    conditions.deleted_at = null;
    this._conditions = conditions;

    //continue others events
    next();
});

//exclude the deleted data by logical deleted
userSchema.pre('countDocuments', function(next) {

    let conditions = this.getQuery();
    conditions.deleted_at = null;
    this._conditions = conditions;

    //continue others events
    next();
});

//encrypting the password before save
userSchema.pre('save', function(next) {
    this.password = bcrypt.hashSync(this.password, salt);

    //continue others events
    next();
});

//encrypting the password before update with findOneAndUpdate
userSchema.pre('findOneAndUpdate', function(next) {

    //only if password is setted
    if (typeof(this._update.password) !== 'undefined') {
        this._update.password = bcrypt.hashSync(this._update.password, salt);
    }

    //continue others events
    next();
});

//exclude password on the toJSON
userSchema.methods.toJSON = function() {
    let user = this;
    let userObj = user.toObject();
    delete userObj.password;

    return userObj;
}

//Implementation of the plugin for error handling unique
userSchema.plugin(unique, {
    message: 'The {PATH} {VALUE} has already been used'
});

module.exports = mongoose.model('User', userSchema);