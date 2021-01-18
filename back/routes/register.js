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

router.post('/register', async (req, res) => {
    try {
        if (!req.body || !req.body.username || !req.body.email || !req.body.password)
            return res.status(403).send({"error": true, "status": "There's no email or password in the request"})
        user = await User.findOne({ email: req.body.email });
        if (user)
            return res.status(403).send({"error": true, "status": "Account already existing"})
        let hash = await bcrypt.hash(req.body.password, saltRounds);
        var userData = {
            username: req.body.username,
            email: req.body.email,
            password: hash
        };
        userInfo = new User(userData);
        await userInfo.save();
        addIdCookie(req, res, userInfo._id);
        return res.status(200).send({"error": false, "status": "Account successfully created", "id": userInfo._id});
    } catch (err) {
        if (err._message == 'User validation failed')
            return res.status(403).send({"error": false, "status": "Be careful if your email/password is right"});
        console.log(err);
        return res.status(500).send({"error": false, "status": "Server side error happened"});
    }
});

module.exports = router;