const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SpotifyUser = new Schema({
    id: {
        type: String,
        required: true
    },
    access_token: {
        type: String,
        required: true
    },
    refresh_token: {
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

module.exports = mongoose.model('SpotifyUser', SpotifyUser, 'spotifyUser');