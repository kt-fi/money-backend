const { validationResult } = require('express-validator')
const { uid } = require('uid');
const mongoose = require('mongoose');

const SharedAccount = require('../schemas/sharedAccount');
const SharedAccountUser = require('../schemas/sharedAccountUser');
const User = require('../schemas/user');
const Transaction = require('../schemas/transaction');

const HttpError = require('../http-error/http-error');


// CREATE NEW TRANSACTION
const newTransaction = async( req, res, next ) => {

const { accountId, userId, quantity, paymentType, concept } = req.body;

let sharedAccount;
let transaction;
let userHouseAccount;
let accountSpending = 0;

// find home account user account
try{

   sharedAccount = await SharedAccount.findOne({accountId}).populate({path: 'individualAccounts'})

   if(sharedAccount){
       sharedAccount.individualAccounts.forEach((account) => {
         if(userId == account.userId){
           userAccount = account
           return;
         }
       });
      
   }else{
       const error =  new HttpError('An Error Finding userAccount', 500);
       return next(error);
   }

   try{
    userHouseAccount = await SharedAccountUser.findOne({userId, accountId}).populate({path: 'transactions'})
      
   }catch(err){
    const error =  new HttpError('An Error Finding userAccount Transactions', 500);
    return next(error);
   }
   
}catch(err){   
     console.log(err)
     const error = new HttpError('Failed to find user bank account', 500);
     return next(error)
}

accountSpending = calculateTotalBalance(sharedAccount, userHouseAccount, quantity)
// create and add transaction to user account

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
        await userHouseAccount.transactions.push(transaction);
        await userHouseAccount.set({balance: accountSpending.accountSpending});
        await userHouseAccount.save({session:sess});
        await sess.commitTransaction();
    }catch(err){
        const error = new HttpError('error saving sessions', 500);
        return next(error)
    }

}catch(err){
    console.log(err)
    const error = new HttpError('transaction error', 500);
    return next(error)
}

res.json(transaction)
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
    let balance;

    userTransactions.forEach(transaction => {
        userTotalSpent += transaction.quantity;
    })

    accountTransactions.transactions.forEach(transaction => {
        accountTotalSpent += transaction.quantity;
    });

    //ACCOUNT USERS AMOUNT
res.json(accountTransactions)

}


// DELETE TRANSACTION BY ID

const deleteTransactionById = async ( req, res, next ) => {

    const transactionId = req.params.transactionId;
    const userId = req.params.userId;
    const sharedAccountId = req.params.sharedAccountId;

    let sharedAccount;
    let userAccount;
    let transaction;

    let newBalance;


    try{

        sharedAccount = await SharedAccount.findOne({sharedAccountId}).populate({path: 'individualAccounts'})

        if(sharedAccount){
            sharedAccount.individualAccounts.forEach((account) => {
              if(userId == account.userId){
                userAccount = account

                return;
              }
            });
           
        }else{
            const error =  new HttpError('An Error Finding userAccount', 500);
            return next(error);
        }

        

    }catch(err){
        console.log(err)
        const error =  new HttpError('An Error Finding User Account', 500);
        return next(error);
    }

    

    // GET TRANSACTION
    try{
        transaction = await Transaction.findOne({transactionId});
        newBalance = userAccount.balance - transaction.quantity;

    }catch(err){
        const error =  new HttpError('An Error Finding TRANSACTION', 500);
            return next(error);
    }


    try{   
        let transactions;
        //HERE ------------------------------------
        let sess = await mongoose.startSession();
        await sess.startTransaction();
        await transaction.remove({session:sess});
        await userAccount.transactions.pull(transaction);
        await userAccount.set({balance: newBalance})
        await userAccount.save({session:sess});
        await sess.commitTransaction();

    }catch(err){
        console.log(err)
        const error =  new HttpError('An Error Deleting Transaction', 500);
        return next(error);
    }
res.send('DELETED TRANSACTION')
  
}



const deleteAllTransactions = async (req, res, next) => {

    try{
        await Transaction.deleteMany({}, console.log('All records deleted'))
    }catch(err){
        const error =  new HttpError('An Error Has Occured whilst tryung to log in, please try again', 500);
        return next(error);
    }
}



const calculateTotalBalance = (sharedAccount, userHouseAccount, quantity) => {
    let accountSpending = 0;
    if(userHouseAccount.transactions.length !== 0){
        userHouseAccount.transactions.forEach((transaction) => {
        accountSpending += transaction.quantity;
    })
    
    accountSpending += parseInt(quantity);

    }


    return {accountSpending};
}

module.exports = { newTransaction, getAllAccountTransactions, deleteTransactionById, deleteAllTransactions }
