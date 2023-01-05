const { validationResult } = require('express-validator')
const { uid } = require('uid');
const bcrypt = require('bcrypt');

const HttpError = require('../http-error/http-error');
const User = require('../schemas/user');
const SharedAccount = require('../schemas/sharedAccount')

// CREATE NEW USER
const createUser = async (req, res, next) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        res.json(error.message)
        return next( new HttpError("Invalid Input passed, please try again", 422))
    }


    let { userName, userEmail, password } = req.body;
    let hashedPassword;

    let userExists ;

    try{
      userExists  = await User.findOne({userEmail});

        if(userExists){
            const error =  new HttpError('Sorry a user with this email already exists!! please try again', 500);
            res.json(error.message)
            return next(error );
        }

    }catch(err){
        const error =  new HttpError('An Error has Occured', 500);
        return next(error);
    }

    try {
        hashedPassword = await bcrypt.hash(password, 12)
    }
    catch(err){
        const error =  new HttpError('An Error Has Occured', 500);
        return next(error);
    }

    try{
        let newUser = await new User({
                userId: uid(),
                userName,
                userEmail,
                password: hashedPassword,
                userAccounts: []
            })

            await newUser.save();
            res.json(newUser);

        } catch(err){
            const error =  new HttpError('An Error Has Occured', 500);
            return next(error);
    }
}


// USER SIGN IN
const signIn = async (req, res, next) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        res.json(error.message)
        return next( new HttpError("Invalid Input passed, please try again", 422))
    }

    let { userEmail, password } = req.body;
    let foundUser;

    try {
        foundUser = await User.findOne({userEmail}).populate({path: 'userAccounts'});

        if(!foundUser){
            const error =  new HttpError('No User Exists with this email, please sign up', 502);
            res.json(error.message)
            return next(error);
        } else {
            const passwordMatch = await bcrypt.compare(password, foundUser.password);
            if(passwordMatch){
                console.log('Success')
            }else{
                const error =  new HttpError('Password Incorrect please try again', 500);
                res.json(error.message)
                return next(error);
            }
        }

        return res.json(foundUser)
    } catch(err){
        const error =  new HttpError('An Error Has Occured whilst tryung to log in, please try again', 500);
        return next(error);
    }
}

//TEMP DELETE ALL

const deleteAllUsers = async (req, res, next) => {

    try{
        await User.deleteMany({}, console.log('All records deleted'))
    }catch(err){
        const error =  new HttpError('An Error Has Occured whilst tryung to log in, please try again', 500);
        return next(error);
    }
}

module.exports = { createUser, signIn, deleteAllUsers };