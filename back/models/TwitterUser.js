const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TwitterUser = new Schema({
    id: {
        type: String,
        required: true
    },
    access_token: {
        type: String,
        required: true
    },
    secret_token: {
        type: String,
        required: true
    },
    nameId: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('TwitterUser', TwitterUser, 'twitterUser');