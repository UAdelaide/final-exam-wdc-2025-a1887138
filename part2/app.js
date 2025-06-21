const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

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

app.use((req, res, next) => {
    const publicPaths = ["/","/api/users/login"];
    const loggedInAs = req.session.role;

    if (!loggedInAs && !publicPaths.includes(req.path)) {
        // Not logged in, tried to access a logged in place
        return res.redirect('/');
    }

    return next();
});

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;