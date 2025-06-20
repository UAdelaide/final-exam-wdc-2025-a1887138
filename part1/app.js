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
    try {

        const connection = await mysql.createConnection({
            host: 'localhost'
        });

        await connection.query('CREATE DATABASE IF NOT EXISTS DogsDB');
        await connection.end();

        db = await mysql.createConnection({
            host: 'localhost',
            // user: 'root',
            database: 'DogsDB'
        });

        await db.execute(`
            CREATE TABLE IF NOT EXISTS Dogs (
            dog_id INT AUTO_INCREMENT PRIMARY KEY,
            owner_id INT NOT NULL,
            name VARCHAR(50) NOT NULL,
            size ENUM('small', 'medium', 'large') NOT NULL,
            FOREIGN KEY (owner_id) REFERENCES Users(user_id)
            )
        `);

        const [rows] = await db.execute('SELECT COUNT(*) AS count FROM Dogs');
        if (rows[0].count === 0) {
            await db.execute(`
                INSERT INTO Dogs (owner_id, name, size)
                VALUES
                ('1', 'Max', 'medium'),
                ('3', 'Bella', 'small'),
                ('4', 'Gordon Ramsey 2', 'large'),
                ('2', 'Whoodlegarden Pombungledungus', 'medium'),
                ('5', 'Xanthor', 'medium');
            `);
        }

    } catch (error) {
        console.error('Error setting up database! Error is as follows:', error);
    }
})();

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);

module.exports = app;
