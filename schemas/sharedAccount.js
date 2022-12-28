const mongoose = require('mongoose');

const schema = mongoose.Schema;

const sharedAccount = schema({
    accountId: { type: String, require: true },
    accountName: { type: String, require: true },
    accountMembers: [{ type: mongoose.Types.ObjectId, require: false, ref: 'Account' }],
    transactions: [{ type: mongoose.Types.ObjectId, require: false, ref: 'Transaction' }]
})

module.exports =  mongoose.model('SharedAccount', sharedAccount)