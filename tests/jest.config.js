//Mongoose preparation for the test environment
const mongoose = require('mongoose');

beforeAll(function(done) {
    mongoose.connect(`mongodb://localhost:27017/todo-milo-testing`, { useNewUrlParser: true }, function(err) {
        if (err) {
            throw err;
        } else {
            mongoose.connection.dropCollection("users", function(err, result) {
                const User = require('../modules/user/user.model');
                new User({
                    username: 'superadmin',
                    email: 'super@admin.com',
                    password: '123456',
                    rol: 'ADMIN'
                }).save((err) => {
                    if (err) {
                        console.log("error save user", err);
                    }
                });
                return done();
            });
        }
    });
});

afterAll(function(done) {
    mongoose.connection.dropCollection("users");
    mongoose.disconnect();
    return done();
});