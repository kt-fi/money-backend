const mongoose = require('mongoose');

const schema = mongoose.Schema;

const sharedAccount = schema({
    accountId: { type: String, require: true },
    accountName: { type: String, require: true },
    accountMembers: [{ type: mongoose.Types.ObjectId, require: false, ref: 'User' }],
    individualAccounts: [{ type: mongoose.Types.ObjectId, require: false, ref: 'SharedAccountUser' }],
    accountBalance: { type: Number, require: true }
})

module.exports =  mongoose.model('SharedAccount', sharedAccount)