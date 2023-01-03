const express = require('express');

const houseAccountController = require('../controllers/houseAccountController');

const router = express.Router();

router.post('/newHouseAccount', houseAccountController.createNewHouseAccount);
router.post('/addUserToAccount', houseAccountController.addUserToAccount);

router.get('/getUserBalance/:userId/:accountId', houseAccountController.getTotalUserBalance)
router.get('/getAccountUsers/:accountId', houseAccountController.getAccountUsers);
router.get('/getUserTransactions/:userId/:accountId', houseAccountController.getUserTransactions)

router.delete('/deleteAll', houseAccountController.deleteAllAccounts);

module.exports = router;
