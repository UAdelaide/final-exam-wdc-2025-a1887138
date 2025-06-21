const express = require('express');
const session = require('express-session');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST login (un-dummy version)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(`
      SELECT user_id, username, role FROM Users
      WHERE email = ? AND password_hash = ?
    `, [email, password]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const role = rows[0].role;

    if (role === "walker") {
      req.session.role = 'walker';
      res.redirect("/walker-dashboard.html");
    } else if (role === "owner") {
      req.session.role = 'owner';
      res.redirect("/owner-dashboard.html");
    } else {
      res.status(500).json({ error: 'Server Error' });
    }

    // res.json({ message: 'Login successful', user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/logout', async (req, res) => {
  try {
    req.session.destroy();
    res.redirect('/');
  } catch (error) {
    console.error(error);
  }
});

router.post('/logout', async (req, res) => {
  const { owner_id } = req.body;

  try {
    const [rows] = await db.query(`
      SELECT dog_id, name FROM Dogs
      WHERE owner_id = ?
    `, [owner_id]);
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;