const express = require('express');
const { check } = require('express-validator');

const userController = require('../controllers/userController');


const router = express.Router();

router.post('/newUser', [check('userName').not().isEmpty().isLength({min:3}), check('userEmail').not().isEmpty().isEmail(), check('password').not().isEmpty().isLength({min:5})], userController.createUser);
router.post('/login', userController.signIn);



//TEMP
router.delete('/deleteAll', userController.deleteAllUsers
)


module.exports = router;