var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

let db;

(async() => {

    const connection = mysql.createConnection({
    host: 'localhost'
    });

    await connection.query('CREATE DATABASE IF NOT EXISTS DogsList');
    await connection.end();

    db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'DogsList'
    });

})();






app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);

module.exports = app;
