var express = require('express');
const { URLSearchParams } = require('url');
var router = express.Router();
var fetch = require('node-fetch');
const User = require('./../models/User');
var Twitter = require("node-twitter-api")
const TwitterUser = require('./../models/TwitterUser');

let api_key = "wTRc9S5yJNSncP7tM9qcL48MI";
let api_secret_key = "OoYjdXyce6nFKpTFGYiYUJodpK7NAfEcQNoYX2y0vapgFaW7Cn"
let access_token = "819611658171650048-ZIO5i6fHJJV4b4i3CxM43DVexpmZTQU"
let access_secret_token = "j5046tVk9BDAyHlGcP0ydkCpwhRoZXdlobJTEGxxpNXE2"

let redirect_uri = "http://localhost:8080/twitter/callback";
let method = "https://api.twitter.com/"

var twitter = new Twitter({
    consumerKey: api_key,
    consumerSecret: api_secret_key,
    callback: redirect_uri
});

let _requestSecret;

router.get('/twitter/login', async function(req, res) {
    try {
        twitter.getRequestToken(async function(err, requestToken, requestSecret) {
            if (err)
                return res.status(403).send({"error": true, "status": err});
            else {
                _requestSecret = requestSecret;
                return res.status(200).send({"error": false, "url": "https://api.twitter.com/oauth/authenticate?oauth_token=" + requestToken});
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(403).send({"error": true, "url": "http://localhost:3000/403"});
    }
});

router.get('/twitter/callback', async function(req, res) {
    try {
        if (!req.query || !req.query.oauth_token || !req.query.oauth_verifier)
            return res.status(403).send({"error": true, "status": "Something went wrong"});
        twitter.getAccessToken(req.query.oauth_token, _requestSecret, req.query.oauth_verifier, async function(err, accessToken, accessSecret) {
            if (err)
                res.status(500).send(err);
            else {
                twitter.account("verify_credentials", {"include_entities": false, "skip_status": false, "include_email": true}, accessToken, accessSecret, async function(err, json) {
                    if (!req.cookies || !req.cookies.id) {
                        userInfo = await User.findOne({ email: json.email });
                        if (!userInfo) {
                            var userData = {
                                username: json.screen_name,
                                email: json.email,
                                password: null
                            };
                            userInfo = new User(userData);
                            await userInfo.save();
                        }
                    } else {
                        userInfo = await User.findOne({ _id: req.cookies.id });
                        if (!userInfo) {
                            var userData = {
                                username: json.screen_name,
                                email: json.email,
                                password: null
                            };
                            userInfo = new User(userData);
                            await userInfo.save();
                        }
                    }
                    twitterInfo = await TwitterUser.findOne({ id: userInfo._id });
                    if (!twitterInfo) {
                        var twitterData = {
                            id: userInfo._id,
                            access_token: accessToken,
                            secret_token: accessSecret,
                            nameId: json.screen_name
                        };
                        twitterInfo = new TwitterUser(twitterData);
                        await twitterInfo.save();
                    } else {
                        twitterInfo.access_token = accessToken;
                        twitterInfo.secret_token = accessSecret;
                        twitterInfo.nameId = json.screen_name;
                        await twitterInfo.save();
                    }
                    return res.status(200).redirect("http://localhost:3000/dashboard?id=" + userInfo._id);
                });
            }
        });
    } catch (err) {
        console.log(err)
        res.status(403).send({"error": true, "status": err._message})
    }
});

router.get('/twitter/isconnected', async function(req, res) {
    try {
        if (!req.cookies || !req.cookies.id)
            return res.status(403).send({"error": true, "status": "Something went wrong"});
        let userTwitter = await TwitterUser.findOne({ id: req.cookies.id });
        if (!userTwitter)
            return res.status(403).send({"error": false, "status": false});
        else
            return res.status(200).send({"error": false, "status": true});
    } catch (err) {
        console.log(err)
        res.status(403).send({"error": true, "status": err._message})
    }
});

router.get('/twitter/timeline/get', async function(req, res) {
    try {
        if (!req.cookies || !req.cookies.id)
            return res.status(403).send({"error": true, "status": "Something went wrong"});
        let userTwitter = await TwitterUser.findOne({ id: req.cookies.id });
        if (!userTwitter)
            return res.status(403).send({"error": true, "status": "Can't find name"});
        else {
            twitter.getTimeline("home_timeline", {count: 50, tweet_mode: 'extended'}, userTwitter.access_token, userTwitter.secret_token, async function(err, data, response) {
                if (err) {
                    console.log(err);
                    return res.status(200).send({"error": true, "json": err});
                }
                return res.status(200).send({"error": false, "json": data});
            });
        }
    } catch (err) {
        console.log(err)
        res.status(403).send({"error": true, "status": err._message})
    }
});

router.post('/twitter/post/add', async function(req, res) {
    try {
        if (!req.cookies || !req.cookies.id || !req.body || !req.body.text)
            return res.status(403).send({"error": true, "status": "Something went wrong"});
        let userTwitter = await TwitterUser.findOne({ id: req.cookies.id });
        if (!userTwitter)
            return res.status(403).send({"error": false, "status": false});
        else {
            twitter.statuses("update", {status: req.body.text}, userTwitter.access_token, userTwitter.secret_token, function(err, data, response) {
                if (err) {
                    console.log(err);
                    return res.status(200).send({"error": true, "json": err});
                } else {
                    return res.status(200).send({"error": false, "json": data});
                }
            });
        }
    } catch (err) {
        console.log(err)
        res.status(403).send({"error": true, "status": err._message})
    }
});

module.exports = router;