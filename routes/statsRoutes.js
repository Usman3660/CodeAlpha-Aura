const express = require('express');
const router = express.Router();
const store = require('../models/dataStore');
const { getStatus } = require('../config/db');

router.get('/', (req, res) => {
  const stats = store.getStats();
  const dbStatus = getStatus();

  res.json({
    success: true,
    stats,
    database: dbStatus
  });
});

module.exports = router;
