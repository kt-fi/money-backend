const mongoose = require('mongoose');

const schema = mongoose.Schema;

const transaction = schema({
    transactionId: { type: String, require: true },
    accountId:  { type: String, require: true },
    userId: { type: String, require: true },
    quantity: {  type: Number, require: true },
    paymentType: { type: String, require: true },
    concept:  { type: String, require: true },
    date: { type: Date, require: true},
    creator: { type: mongoose.Types.ObjectId, require:true, ref: 'Transaction'}
})

module.exports =  mongoose.model('Transaction', transaction)