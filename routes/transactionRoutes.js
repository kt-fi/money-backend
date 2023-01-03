const express = require('express');

const transactionController = require('../controllers/transactionController');

const router = express.Router();

router.post('/newTransaction', transactionController.newTransaction);

router.get('/getAllAccountTransactions/:accountId/:userId', transactionController.getAllAccountTransactions);

router.delete('/deleteTransactionById/:transactionId/:userId/:sharedAccountId', transactionController.deleteTransactionById);

router.delete('/deleteAll', transactionController.deleteAllTransactions)
module.exports = router;