const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

//import the global config
require('./config/config');

//init express
const app = express();

/***** Controller *****/
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
app.use(bodyParser.json())

//import routes
app.use(require('./modules/login/login.router'));
app.use(require('./modules/user/user.router'));
app.use(require('./modules/task/task.router'));

/***** MONGO CONNECTION *****/
mongoose.connect(`mongodb://${process.env.dbuser}:${process.env.dbpasswd}@${process.env.dbhost}:${process.env.dbport}/${process.env.dbdatabase}`, {
    useNewUrlParser: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('MongoDB connected and online');
});

/***** SOCKET TO LISTEN *****/
app.listen(process.env.PORT, () => {
    console.log('Server Started in Port: ' + process.env.PORT);
});