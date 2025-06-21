const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const db = require('../models/db');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));
app.use(session({
    secret: 'So secret even I will forget this',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

// Route to return dogs as JSON
app.get('/api/dogs', async (req, res) => {
  try {
    const [dogs] = await db.execute('SELECT * FROM Dogs');
    res.json(dogs);
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch dogs with error ${err}` });
  }
});

app.use((req, res, next) => {
    // We need SOME available paths. These are they.
    const publicPaths = ["", "/","/api/users/login"];
    const loggedInAs = req.session.role;

    if (!loggedInAs && !publicPaths.includes(req.path)) {
        // Not using a view engine, so stopping just straight connections to .html pages...
        // ... won't happen, but the functionality of those pages is gone. All...
        // ... unauthorized accessing of server paths will be blocked.
        console.log(`Attempted access of unauthorized place! Path: ${req.path}`);
        return res.redirect(307, '/');
    }

    // Important debug info, remove if you dare
    console.log(req.session.role);

    return next();
});

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;
