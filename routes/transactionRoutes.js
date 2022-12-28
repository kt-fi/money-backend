const express = require('express');

const transactionController = require('../controllers/transactionController');

const router = express.Router();

router.post('/newTransaction', transactionController.newTransaction);

router.get('/getAllAccountTransactions/:accountId/:userId', transactionController.getAllAccountTransactions);


module.exports = router;