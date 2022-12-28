const express = require('express');

const houseAccountController = require('../controllers/houseAccountController');

const router = express.Router();

router.post('/newHouseAccount', houseAccountController.createNewHouseAccount);
router.post('/addUserToAccount', houseAccountController.addUserToAccount);

module.exports = router;
