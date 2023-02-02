const { validationResult } = require('express-validator')
const { uid } = require('uid');
const mongoose = require('mongoose');

const SharedAccount = require('../schemas/sharedAccount');
const SharedAccountUser = require('../schemas/sharedAccountUser');
const User = require('../schemas/user');
const Transaction = require('../schemas/transaction');

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


inviteUsersToAccount = async ( req, res, next ) => {

    let { accountId, users } = req.body;

    let foundAccount;

    try{
        foundAccount = await SharedAccount.findOne({accountId});
        console.log(foundAccount)
    }catch(err){
        console.log(err)
        const error = new HttpError('Unable to find account', 500);
        return next(error);
    }

    try{
        let userFound;

        for(let user of users) {
            userFound = await User.findOne({'userEmail': user});
console.log(userFound)
            let sess = await mongoose.startSession();
            await sess.startTransaction();
            await userFound.invitations.push(foundAccount);
            await userFound.save();
            await sess.commitTransaction();

            
        }

    }catch(err){
        const error = new HttpError('Unable to invite users', 500);
        return next(error);
    }

   

}

addUserToAccount = async( req, res, next ) => {
    
    const { accountId, userId } = req.body;

    let userAccount;
    let sharedAccount;
    let sharedAccountUser;

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
        await userAccount.invitations.pull(sharedAccount)
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

const getAllUserAccounts = async ( req, res, next ) => {

    let userId = req.params.userId;

    let foundUser;

    try {

        foundUser = await User.findOne({userId}).populate({path: 'userAccounts'});

        if(!foundUser) {
           return res.json({'msg': 'Unable to collect user accounts.'})
        }

        res.json(foundUser.userAccounts)

    } catch(err) {
        const error =  new HttpError('Unable to get user Accounts', 500);
        return next(error);
    }

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
             res.json({'userBalance':userBalance, 'userTotalSpent': user.balance, 'totalAccountBalance': accountBalance, 'accountName': account.accountName})
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

// REMOVE USER FROM ACCOUNT

const removeUserFromAccount = async ( req, res, next ) => {

    /*
    Remove Transactions for Account,    -- Loop all User Transactions relating to specified account and remove;
    Remove Account from user accounts array  -- Remove shared account from user accounts array;
    Remove Individual Account -- Delete Account;
    Remove User From Shared Account 
    Remove Useer Individual account from shared Account Array
    */ 

    let { userId, accountId } = req.params;

    let foundUser;
    let foundSharedAccount;
    let foundSharedAccountUser;


    try {

        foundUser = await User.findOne({userId});

        if(!foundUser){
            const error =  new HttpError('Failed To Find USER', 500);
            return next(error);
        }
       
        foundSharedAccount = await SharedAccount.findOne({accountId});

        if(!foundSharedAccount) {
            const error =  new HttpError('Failed To Find Shared Account', 500);
            return next(error);
        }

        foundSharedAccountUser = await SharedAccountUser.findOne({'userId': userId, 'accountId':accountId}).populate({path: 'transactions'})

        if(!foundSharedAccountUser) {
            console.log(err)
             const error =  new HttpError('Failed To Find SharedUserAccount', 500);
           return next(error);
        }

        try {
                await Transaction.deleteMany({userId, accountId})
        }catch(err) {
            const error =  new HttpError('Failed To DELETE TRANSACTIONS', 500);
            return next(error);
        }

        try {

            let sess = await mongoose.startSession();
            await sess.startTransaction();
            // REMOVE ACCOUNT FROM USER ACCOUNTS LIST
            await foundUser.userAccounts.pull(foundSharedAccount);
            await foundUser.save();
            // REMOVE INDIVIDUALS ACCOUNT 
            await SharedAccountUser.findOneAndRemove({'userId': userId, 'accountId':accountId})
            // REMOVE USER FROM SHARED ACCOUNT ARRAY
            await foundSharedAccount.accountMembers.pull(foundUser)
            // REMOVE USER ACCOUNT FROM SHARED ACCOUNT ARRAY
            await foundSharedAccount.individualAccounts.pull(foundSharedAccountUser);
            await foundSharedAccount.save({session:sess});
            await sess.commitTransaction();

        }catch(err) {
            console.log(err)
            const error =  new HttpError('ERROR REMOVING DATA UNRESOLVED', 500);
            return next(error);
        }

    }catch(err) {
        console.log(err)
        const error =  new HttpError('ERROR', 500);
        return next(error);
    }

     res.send('?SUCCESS')
}


//DELETE ENTIRE ACCOUNT

const deleteSharedAccountById = async (req, res, next) => {

    let accountId = req.params.accountId;

    try {



    }catch(err) {
        const error =  new HttpError('Unable to delete Account, please try again', 500);
        return next(error);
    }

}

//TEMP DELETE ALL

const deleteAllSharedAccounts = async (req, res, next) => {

    try{
        await SharedAccountUser.deleteMany({}, console.log('All records deleted'))
    }catch(err){
        const error =  new HttpError('An Error Has Occured whilst tryung to log in, please try again', 500);
        return next(error);
    }
}

module.exports = { 
    createNewHouseAccount, 
    inviteUsersToAccount, 
    addUserToAccount, 
    getAllUserAccounts, 
    getAccountUsers, 
    getUserTransactions, 
    getTotalUserBalance,
    removeUserFromAccount,
     deleteAllAccounts,
     deleteSharedAccountById,
     deleteAllSharedAccounts
    }
