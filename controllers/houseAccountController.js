const { validationResult } = require('express-validator')
const { uid } = require('uid');
const mongoose = require('mongoose');

const SharedAccount = require('../schemas/sharedAccount');
const SharedAccountUser = require('../schemas/sharedAccountUser');
const User = require('../schemas/user');

const HttpError = require('../http-error/http-error');


// CREATE NEW SHARED ACCOUNT
createNewHouseAccount = async ( req, res, next ) => {

    const { accountName, creatorId  } = req.body;

    let creatorAccount;
    let newAccount;
    let sharedAccountUser;

    // get creator
    try{
        creatorAccount = await User.findOne({userId: creatorId});
    }catch(err){
        const error = new HttpError('Get Account Creator Failed', 500);
        return next(error);
    }

    // create shared account
    try {
        newAccount = await  new SharedAccount({
                accountId: uid(),
                accountName
        });

    // create user account for shared account
    try{
        sharedAccountUser = await new SharedAccountUser({
            userId: creatorId,
            accountId: newAccount.accountId,
            balance: 0,
            transactions: []
        })

    }catch(err){
        const error = new HttpError('failed to add user account to shared account', 500);
        return next(error);
    }

     try{
            let sess = await mongoose.startSession();
            await sess.startTransaction();
            await creatorAccount.userAccounts.push(newAccount);
            await creatorAccount.save();
            await sharedAccountUser.save();
            await newAccount.individualAccounts.push(sharedAccountUser)
            await newAccount.accountMembers.push(creatorAccount);
            await newAccount.save({session:sess});
            await sess.commitTransaction();
        }catch(err){
            const error = new HttpError('Add User To Account Failed', 500);
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

    // get user and shared accounts
    try{

        userAccount = await User.findOne({userId});
        sharedAccount = await SharedAccount.findOne({accountId});

    }catch(err){
        const error = new HttpError('Create Account Failed', 500);
        return next(error);
    }

    // create user account for shared account 
    try{

        sharedAccountUser = await new SharedAccountUser({
            userId: userId,
            accountId,
            balance: 0,
            transactions: []
        })

    }catch(err){
        const error = new HttpError('failed to add user account to shared account', 500);
        return next(error);
    }

    try{
        let sess = await mongoose.startSession();
        await sess.startTransaction();
        await userAccount.userAccounts.push(sharedAccount);
        await userAccount.save();
        await sharedAccountUser.save();
        await sharedAccount.individualAccounts.push(sharedAccountUser)
        await sharedAccount.accountMembers.push(userAccount);
        await sharedAccount.save({session:sess});
        await sess.commitTransaction();
    }catch(err){
        const error = new HttpError('Add User To Account Failed', 500);
        return next(error);
}
    res.json({userAccount, sharedAccount})
}


const getAccountUsers = async (req, res, next ) => {

const accountId = req.params.accountId;
let users = [];

try{
    let account = await SharedAccount.findOne({accountId}).populate({path: 'accountMembers'});

    account.accountMembers.map(member =>{
        users.push({'userName': member.userName, 'userId': member.userId, 'accountId': accountId})
    })

}catch(err){
    const error =  new HttpError('An Error Has Occured getting account users', 500);
    return next(error);
}
res.json(users)
}

const getUserTransactions = async (req, res, next) => {

    const { userId, accountId } = req.params;
    let userTransactions;
    let foundUser;
    try {

        userTransactions =  await SharedAccountUser.findOne({accountId, userId}).populate({path: 'transactions'});
        foundUser = await User.findOne({userId})
        userTransactions.transactions.reverse()
        res.json({'name': foundUser.userName, 'transactions': userTransactions.transactions})

    }catch(err){
        const error =  new HttpError('Could not get user Transactions', 500);
        return next(error);
    }

}

const getTotalUserBalance = async (req, res, next) => {

    const { userId, accountId } = req.params;
    let account;
    let user;

    let userBalance;
    let accountBalance = 0;

    try{
        account = await SharedAccount.findOne({accountId}).populate({path: 'individualAccounts'});

        account.individualAccounts.forEach(account => {
             account.userId == userId ? user = account : null;
        });

        try{
        //   accountBalance = account.individualAccounts.reduce((a,b)=>{
        //       return a.balance + b.balance, 0;
            // })

            for(let i = 0; i < account.individualAccounts.length; 0, i++){
                accountBalance += account.individualAccounts[i].balance;
                console.log(accountBalance)
            }
            
             userBalance = (accountBalance/account.individualAccounts.length) - user.balance;
             res.json({'userBalance':userBalance, 'userTotalSpent': user.balance, 'totalAccountBalance': accountBalance})
        }catch(err){
          
            const error =  new HttpError('An Error Has Occured 11', 500);
        return next(error);
        }

    }catch(err){     
        const error =  new HttpError('An Error Has Occured getting balance', 500);
        return next(error);
    }
}

const deleteAllAccounts = async (req, res, next) => {

    try{
        await SharedAccount.deleteMany({}, console.log('All records deleted'))
    }catch(err){
        const error =  new HttpError('An Error Has Occured whilst tryung to log in, please try again', 500);
        return next(error);
    }
}

module.exports = { createNewHouseAccount, addUserToAccount, getAccountUsers, getUserTransactions, getTotalUserBalance, deleteAllAccounts }
