const mongoose = require('mongoose');

const schema = mongoose.Schema;

const transaction = schema({
    transactionId: { type: String, require: true },
    sharedAccountNumber:  { type: mongoose.Types.ObjectId, require: true, ref: 'HouseAccount' },
    userId: { type: mongoose.Types.ObjectId, require: true, ref: 'User' },
    quantity: {  type: Number, require: true },
    paymentType: { type: String, require: true },
    concept:  { type: String, require: true },
    date: { type: Date, require: true}
})

module.exports =  mongoose.model('Transaction', transaction)