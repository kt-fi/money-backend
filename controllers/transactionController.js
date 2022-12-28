const { validationResult } = require('express-validator')
const { uid } = require('uid');
const mongoose = require('mongoose');

const SharedAccount = require('../schemas/sharedAccount');
const User = require('../schemas/user');
const Transaction = require('../schemas/transaction');

const HttpError = require('../http-error/http-error');


// CREATE NEW TRANSACTION
const newTransaction = async( req, res, next ) => {
    
const { accountId, userId, quantity, paymentType, concept } = req.body;

let sharedAccount;
let transaction;

try{
    sharedAccount = await SharedAccount.findOne({accountId});
}catch(err){
    const error = new HttpError('error collecting shared account', 500);
    return next(error)
}

try{

transaction = new Transaction({
    transactionId: uid(),
    accountId,
    userId,
    quantity,
    paymentType,
    concept,
    date: new Date()
})

    try{
        let sess = await mongoose.startSession();
        await sess.startTransaction();
        await transaction.save({session:sess});
        await sharedAccount.transactions.push(transaction);
        await sharedAccount.save({session:sess});
        await sess.commitTransaction();
    }catch(err){
        const error = new HttpError('transaction error', 500);
        return next(error)
    }


}catch(err){
    
    const error = new HttpError('transaction error', 500);
    return next(error)
}

res.json({transaction, sharedAccount})

}


// GET ACCOUNT TRANSACTIONS
const getAllAccountTransactions = async ( req, res, next ) =>{

    const userId = req.params.userId;
    const  accountId  = req.params.accountId;

    let accountTransactions;

    let userTransactions = [];
    let totalTransactions;
  
    let options = {
        path: 'transactions',
        options: {
            sort:{ },
            skip: 0,
            limit : 100
        }
    }

    try{
        accountTransactions = await SharedAccount.findOne({accountId:accountId}).populate([options]);
    }catch(err){
        const error = new HttpError('error getting shared account', 500);
        return next(error)
    }

    accountTransactions.transactions.forEach(transaction => {
        transaction.userId == userId ? userTransactions.push(transaction) : null;
    });

    totalTransactions = accountTransactions.transactions.length;

    let userTotalSpent = 0;
    let accountTotalSpent = 0;
    let plusMinus;
    let balance;

    userTransactions.forEach(transaction => {
        userTotalSpent += transaction.quantity;
    })

    accountTransactions.transactions.forEach(transaction => {
        accountTotalSpent += transaction.quantity;
    });

    //ACCOUNT USERS AMOUNT

    let accountUsersCount;

    try{
        accountUsersCount = await SharedAccount.findOne({accountId});
        accountUsersCount = accountUsersCount.accountMembers.length;
    }catch(err){
        const error = new HttpError('error getting amount of account users', 500);
        return next(error)
    }
    
    

    plusMinus = accountTotalSpent  - userTotalSpent;
    balance = plusMinus - userTotalSpent;

    console.log(plusMinus)
    res.json({
        "Account Users": accountUsersCount,
        "Total Account Spending": accountTotalSpent,
        "You Have Spent": userTotalSpent,
        "Your House Balance": balance,
        
    })
}

module.exports = { newTransaction, getAllAccountTransactions }
