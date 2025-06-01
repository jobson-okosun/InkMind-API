const express = require('express');
const router = express.Router();
const healthController = require('../controller/healthController');

router
    .route('/')
    .get(healthController.checkHealth);   // GET  /api/v1/health - Get server uptime status

module.exports = router;