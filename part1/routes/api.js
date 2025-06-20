var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('respond with a thingy');
});

// Route to return books as JSON
router.get('/', async (req, res) => {
  try {
    const [books] = await db.execute('SELECT * FROM books');
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

module.exports = router;
