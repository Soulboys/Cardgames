var express = require('express');
var router = express.Router();
const User = require('./../models/User');
const bcrypt = require('bcrypt');
const saltRounds = 10;

function addIdCookie(req, res, id) {
    let options = {
        maxAge: 1000 * 60 * 60 * 24 * 30, // would expire after a month
        httpOnly: true, // The cookie only accessible by the web server
        sameSite: true
    }
    console.log(id)
    res.cookie('usr_id', id, options)
}

router.post('/login', async (req, res) => {
    try {
        if (!req.body || !req.body.email || !req.body.password)
            return res.status(403).send({"error": true, "status": "There's no email or password in the request"})
        user = await User.findOne({ email: req.body.email });
        if (!user)
            return res.status(403).send({"error": true, "status": "Account doesn't exists"})
        var result = await bcrypt.compare(req.body.password, user.password)
        if (result) {
            addIdCookie(req, res, user._id);
            return res.status(200).send({"error": false, "status": "Successfully logged in", "id": user._id});
        } else
            return res.status(403).send({"error": true, "status": "Failed to log in"});
    } catch (err) {
        if (err._message == 'User validation failed')
            return res.status(403).send({"error": true, "status": "Be careful if your email/password is right"});
        console.log(err);
        return res.status(500).send({"error": true, "status": "Server side error happened"});
    }
});

module.exports = router;