const { validationResult } = require('express-validator')
const { uid } = require('uid');
const mongoose = require('mongoose');

const SharedAccount = require('../schemas/sharedAccount');
const User = require('../schemas/user');

const HttpError = require('../http-error/http-error');


createNewHouseAccount = async ( req, res, next ) => {

    const { accountName, creatorId  } = req.body;

    let creatorAccount;
    let newAccount;

    try{
        creatorAccount = await User.findOne({userId: creatorId});
    }catch(err){
        const error = new HttpError('Get Account Creator Failed', 500);
        return next(error);
    }

    try {

        newAccount = await  new SharedAccount({
                accountId: uid(),
                accountName
        });

     try{
            let sess = await mongoose.startSession();
            await sess.startTransaction();
            await creatorAccount.userAccounts.push(newAccount);
            await creatorAccount.save();
            await newAccount.accountMembers.push(creatorAccount);
            await newAccount.save({session:sess});
            await sess.commitTransaction();
        }catch(err){
            const error = new HttpError('Add User To Account Failed', 500);
            console.log(err)
            return next(error);
    }
        

    }catch(err){
        const error = new HttpError('Create Account Failed', 500);
        return next(error);
    }

    res.json(newAccount)
}   

addUserToAccount = async( req, res, next ) => {
    
    const { accountId, userId } = req.body;

    let userAccount;
    let sharedAccount;

    try{

        userAccount = await User.findOne({userId});
        sharedAccount = await SharedAccount.findOne({accountId});

    }catch(err){
        const error = new HttpError('Create Account Failed', 500);
        return next(error);
    }

    try{
        let sess = await mongoose.startSession();
        await sess.startTransaction();
        await userAccount.userAccounts.push(sharedAccount);
        await userAccount.save();
        await sharedAccount.accountMembers.push(userAccount);
        await sharedAccount.save({session:sess});
        await sess.commitTransaction();
    }catch(err){
        const error = new HttpError('Add User To Account Failed', 500);
        console.log(err)
        return next(error);
}

    res.json({userAccount, sharedAccount})

}

module.exports = { createNewHouseAccount, addUserToAccount }
