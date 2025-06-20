var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

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

        // Reset database
        await connection.query('SOURCE part1/dogwalks.js');
        await connection.end();

        db = await mysql.createConnection({
            host: 'localhost',
            database: 'DogWalkService'
        });

        var [rows] = await db.execute('SELECT COUNT(*) AS count FROM Users');
        if (rows[0].count === 0) {
            await db.execute(`
                INSERT INTO Users (username, email, password_hash, role)
                VALUES
                ('alice123', 'alice@example.com', 'hashed123', 'owner'),
                ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
                ('carol123', 'carol@example.com', 'hashed789', 'owner'),
                ('de_nice', 'dennis@example.com', 'hashed111', 'walker'),
                ('ayayron', 'aaron@example.com', 'hashed666', 'owner');
            `);
        }
        [rows] = await db.execute('SELECT COUNT(*) AS count FROM Dogs');
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
        [rows] = await db.execute('SELECT COUNT(*) AS count FROM WalkRequests');
        if (rows[0].count === 0) {
            await db.execute(`
                INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
                VALUES
                ('1', '2025-06-10 08:00:00', '30', 'Parklands', 'open'),
                ('2', '2025-06-10 09:30:00', '45', 'Beachside Ave', 'accepted'),
                ('5', '2025-06-20 16:00:00', '30', 'Ashton', 'open'),
                ('3', '2110-01-01 09:30:00', '45', 'A kitchen', 'completed'),
                ('4', '2028-06-20 16:00:00', '30', 'The Garden of Whoodle', 'open');
            `);
        }
        [rows] = await db.execute('SELECT COUNT(*) AS count FROM WalkApplications');
        if (rows[0].count === 0) {
            await db.execute(`
                INSERT INTO WalkApplications (request_id, walker_id, applied_at, status)
                VALUES
                ('1', '2', '2028-06-20 13:00:00', 'pending'),
                ('5', '2', '2024-06-20 16:00:00', 'accepted'),
                ('4', '4', '2022-01-20 11:00:00', 'pending'),
                ('3', '4', '2021-08-20 19:00:00', 'pending'),
                ('4', '2', '2029-10-20 00:00:01', 'rejected');
            `);
        }
        [rows] = await db.execute('SELECT COUNT(*) AS count FROM WalkRatings');
        if (rows[0].count === 0) {
            await db.execute(`
                INSERT INTO WalkRatings (request_id, walker_id, owner_id, rating, comments, rated_at)
                VALUES
                ('2', '1', '3', '5', 'bath needed after'),
                ('1', '4', '3', '3', 'What kinda McDonalds has a message?!'),
                ('3', '2', '4', '5', "Smart Reference Joke"),
                ('4', '5', '2', '5', "not good"),
                ('5', '3', '3', '1');
            `);
        }

        console.log("Finished setup");

    } catch (error) {
        console.error('Error setting up database! Error is as follows:', error);
    }
})();

// Route to return dogs as JSON
app.get('/api/dogs', async (req, res) => {

  try {
    const [dogs] = await db.execute('SELECT * FROM Dogs');
    res.json(dogs);
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch dogs with error ${err}` });
  }
});

// Route to return dogs as JSON
app.get('/api/walkrequests/open', async (req, res) => {

  try {
    const [dogs] = await db.execute(`
      SELECT
      WalkRequests.request_id,
      Dogs.name,
      WalkRequests.requested_time,
      WalkRequests.duration_minutes,
      WalkRequests.location,
      Users.username
      FROM
      WalkRequests
      INNER JOIN Dogs ON WalkRequests.dog_id = Dogs.dog_id
      INNER JOIN Users ON Dogs.owner_id = Users.user_id
      WHERE
      WalkRequests.Status = 'open'
      ;
      `);
    res.json(dogs);
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch dogs with error ${err}` });
  }
});

// Route to return dogs as JSON
app.get('/api/walkers/summary', async (req, res) => {

  try {
    const [dogs] = await db.execute('SELECT * FROM Dogs');
    res.json(dogs);
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch dogs with error ${err}` });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
