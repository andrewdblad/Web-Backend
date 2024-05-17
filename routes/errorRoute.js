
const express = require('express');
const router = express.Router();
const errorController = require('./controllers/errorController');
const Util = require('../utilities/index');

// Define the intentional error route
router.get('/trigger-error', Util.handleErrors(errorController.triggerError));

module.exports = router;