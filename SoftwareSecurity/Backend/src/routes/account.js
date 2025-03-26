const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.get('/', accountController.getAccounts);
router.get('/statement/:accountId/:month/:year', accountController.viewStatement);
router.post('/transfer', accountController.transfer);

module.exports = router;