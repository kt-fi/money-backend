const express = require('express');

const houseAccountController = require('../controllers/houseAccountController');

const router = express.Router();

router.post('/newHouseAccount', houseAccountController.createNewHouseAccount);
router.post('/addUserToAccount', houseAccountController.addUserToAccount);
router.get('/getAllUserAccounts/:userId', houseAccountController.getAllUserAccounts);

router.get('/getUserBalance/:userId/:accountId', houseAccountController.getTotalUserBalance);
router.get('/getAccountUsers/:accountId', houseAccountController.getAccountUsers);
router.get('/getUserTransactions/:userId/:accountId', houseAccountController.getUserTransactions);

router.post('/inviteUsers', houseAccountController.inviteUsersToAccount);

router.delete('/removeUserFromAccount/:userId/:accountId', houseAccountController.removeUserFromAccount);
router.delete('/deleteSharedAccountById/:accountId', houseAccountController.deleteSharedAccountById);

router.delete('/deleteAll', houseAccountController.deleteAllAccounts);
router.delete('/deleteAllShared', houseAccountController.deleteAllSharedAccounts);

module.exports = router;
