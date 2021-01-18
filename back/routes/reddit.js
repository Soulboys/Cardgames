var express = require('express');
const { URLSearchParams } = require('url');
var router = express.Router();
var fetch = require('node-fetch');
const User = require('./../models/User');
const RedditUser = require('./../models/RedditUser');

let api_key = "P7UB8WCqCb0Tsg";
let api_secret_key = "xdkVcHJ3JKd0htELxfvWhjdlRSBmoA"
let method = "https://oauth.reddit.com/"

let redirect_uri = "http://localhost:8080/reddit/callback";

async function getUserInfo(access_token) {
    var options = {
        'method': 'GET',
        'headers': {
            'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
            'Content-Type': "application/x-www-form-urlencoded",
            'Authorization': "Bearer " + access_token
        }
    };
    let response = await fetch(method + "/api/v1/me" , options);
    let json = await response.json();
    return json;
}

router.get('/reddit/login', function(req, res) {
    try {
        let scopes = "identity edit flair history modconfig modflair modlog modposts modwiki mysubreddits privatemessages read report save submit subscribe vote wikiedit wikiread"
        let url = "https://www.reddit.com/api/v1/authorize?client_id=" + api_key + "&response_type=code&state=RANDOM_STRING&redirect_uri=" + redirect_uri + "&duration=permanent&scope=" + scopes;
        return res.status(200).send({"error": false, "url": url});
    } catch (err) {
        console.log(err);
        return res.status(403).send({"error": true, "url": "http://localhost:3000/403"});
    }
});

router.get('/reddit/callback', async function(req, res) {
    try {
        if (!req.query || !req.query.code || !req.cookies || !req.cookies.id)
            return res.status(403).send({"error": true, "status": "Something went wrong"});
        let base64bufffer = Buffer.from(api_key + ':' + api_secret_key).toString('base64');
        const params = new URLSearchParams();
        params.append("grant_type", "authorization_code");
        params.append("code", req.query.code);
        params.append("redirect_uri", "http://localhost:8080/reddit/callback");

        var options = {
            'method': 'POST',
            'headers': {
                'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
                'Content-Type': "application/x-www-form-urlencoded",
                'Authorization': "Basic " + base64bufffer
            },
            "body": params
        };
        let response = await fetch('https://www.reddit.com/api/v1/access_token', options);
        let json = await response.json();
        let userJson = await getUserInfo(json.access_token);
        let userId = req.cookies.id;
        let userSpotify = await RedditUser.findOne({ id: userId });
        if (!userSpotify) {
            var userData = {
                id: userId,
                nameId: userJson.name,
                access_token: json.access_token,
                refresh_token: json.refresh_token,
            };
            newUserSpotify = new RedditUser(userData);
            await newUserSpotify.save();
        } else {
            userSpotify.nameId = userJson.id;
            userSpotify.access_token = json.access_token;
            userSpotify.refresh_token = json.refresh_token;
            await userSpotify.save();
        }
        return res.status(200).redirect("http://localhost:3000/dashboard");
    } catch (err) {
        console.log(err);
        return res.status(403).send({"error": true, "url": "http://localhost:3000/403"});
    }
});

router.get('/reddit/refresh', async function(req, res) {
    try {
        if (!req.cookies || !req.cookies.id)
            return res.status(403).send({"error": true, "status": "Something went wrong"});

        let userReddit = await RedditUser.findOne({ id: req.cookies.id });
        if (!userReddit)
            return res.status(403).send({"error": true, "status": "Something went wrong"});

        let base64bufffer = Buffer.from(api_key + ':' + api_secret_key).toString('base64');
        const params = new URLSearchParams();
        params.append("grant_type", "refresh_token");
        params.append("refresh_token", userReddit.refresh_token);

        var options = {
            'method': 'POST',
            'headers': {
                'Authorization': "Basic " + base64bufffer
            },
            "body": params
        };
        let response = await fetch('https://www.reddit.com/api/v1/access_token', options);
        let json = await response.json();
        userReddit.access_token = json.access_token;
        await userReddit.save();
        return res.status(200).send({"error": false, "status": "Successfully updated key", "access_token": json.access_token});
    } catch (err) {
        console.log(err)
        res.status(403).send({"error": true, "status": err._message})
    }
});

router.get('/reddit/homepage/get', async function(req, res) {
    try {
        if (!req.cookies || !req.cookies.id)
            return res.status(403).send({"error": true, "status": "Something went wrong"});
        let userReddit = await RedditUser.findOne({ id: req.cookies.id });
        if (!userReddit)
            return res.status(403).send({"error": true, "status": "Something went wrong"});

        var options = {
            'method': 'GET',
            'headers': {
                'Authorization': "Bearer " + userReddit.access_token
            }
        };
        let response = await fetch(method + '.json', options);
        let json = await response.json();
        console.log(json.data.children)
        return res.status(200).send({"error": false, "json": json});
    } catch (err) {
        console.log(err)
        res.status(403).send({"error": true, "status": err._message})
    }
});

router.get('/reddit/subreddit/gethot', async function(req, res) {
    try {
        if (!req.cookies || !req.cookies.id || !req.query || !req.query.subreddit || !req.query.type)
            return res.status(403).send({"error": true, "status": "Something went wrong"});
        let userReddit = await RedditUser.findOne({ id: req.cookies.id });
        if (!userReddit)
            return res.status(403).send({"error": true, "status": "Something went wrong"});

        var options = {
            'method': 'GET',
            'headers': {
                'Authorization': "Bearer " + userReddit.access_token
            }
        };
        let response = await fetch(method + 'r/' + req.query.subreddit + '/' + req.query.type + '/.json?count=20', options);
        let json = await response.json();
        return res.status(200).send({"error": false, "json": json});
    } catch (err) {
        console.log(err)
        res.status(403).send({"error": true, "status": err._message})
    }
});

router.get('/reddit/isconnected', async function(req, res) {
    try {
        if (!req.cookies || !req.cookies.id) {
            return res.status(403).send({"error": true, "status": "Something went wrong"});
        }
        let userReddit = await RedditUser.findOne({ id: req.cookies.id });
        if (!userReddit) {
            return res.status(403).send({"error": false, "status": false});
        }
        else
            return res.status(200).send({"error": false, "status": true});
    } catch (err) {
        console.log(err)
        res.status(403).send({"error": true, "status": err._message})
    }
});

module.exports = router;