var express = require('express');
var router = express.Router();

const db = req

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('respond with a thingy');
});

// Route to return dogs as JSON
router.get('/dogs', async (req, res) => {
  try {
    const [dogs] = await db.execute('SELECT * FROM dogs');
    res.json(dogs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dogs :(' });
  }
});

module.exports = router;
