const mongoose = require('mongoose');

const schema = mongoose.Schema;

const sharedAccountUser = schema({
    userId: { type: String, require: true },
    accountId: { type: String, require: true },
    balance: { type: Number, require: false },
    transactions: [{ type: mongoose.Types.ObjectId, require: false, ref: 'Transaction' }]
})

module.exports =  mongoose.model('SharedAccountUser', sharedAccountUser)