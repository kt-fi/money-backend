const mongoose = require('mongoose');

const schema = mongoose.Schema;

const user = schema({
    userId: { type: String, require: true },
    userName:  { type: String, require: true },
    userEmail:  { type: String, require: true },
    password: { type: String, require: true },
    userAccounts: [{ type: mongoose.Types.ObjectId, requre: false, ref: 'sharedAccount'}]
})

module.exports =  mongoose.model('User', user)