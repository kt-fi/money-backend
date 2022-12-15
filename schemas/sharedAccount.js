const mongoose = require('mongoose');

const schema = mongoose.Schema;

const sharedAccount = schema({
    accountId: { type: String, require: true },
    accountName: { type: String, require: true },
    accountMembers: [{ type: mongoose.Types.ObjectId, require: true, ref: 'Account' }]
})

module.exports =  mongoose.model('SharedAccount', sharedAccount)