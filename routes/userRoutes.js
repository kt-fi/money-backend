const express = require('express');

const userController = require('../controllers/userController');

const router = express.Router();

router.post('/newUser', userController.createUser);
router.post('/login', userController.signIn);


module.exports = router;