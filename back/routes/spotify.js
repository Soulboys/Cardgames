var express = require('express');
const { URLSearchParams } = require('url');
var router = express.Router();
var fetch = require('node-fetch');
const User = require('./../models/User');
const SpotifyUser = require('./../models/SpotifyUser');

let client_id = "0b2af6904bd94d4190809d07d6ad732e";
let client_secret = "f5deb719ad0146b2902f429e8e59c12b";
let redirect_uri = "http://localhost:8080/spotify/callback";


async function getUserInfo(access_token) {
    var options = {
        'method': 'GET',
        'headers': {
            'Authorization': "Bearer " + access_token
        }
    };
    let response = await fetch('https://api.spotify.com/v1/me', options);
    let json = await response.json();
    return json;
}

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/spotify/login', function(req, res) {
    try {
        var scopes = 'user-read-private user-read-email ugc-image-upload user-read-recently-played user-top-read user-read-playback-position user-read-playback-state user-modify-playback-state user-read-currently-playing app-remote-control streaming user-library-modify user-library-read';
        let url = 'https://accounts.spotify.com/authorize' + '?response_type=code' + '&client_id=' + client_id +
            (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
            '&redirect_uri=' + redirect_uri;
        return res.status(200).send({"error": false, "url": url});
    } catch (err) {
        console.log(err);
        return res.status(403).send({"error": true, "url": "http://localhost:3000/403"});
    }
});

router.get('/spotify/callback', async function(req, res) {
    try {
        if (!req.query || !req.query.code || !req.cookies || !req.cookies.id)
            return res.status(403).send({"error": true, "status": "Something went wrong"});
        let base64bufffer = Buffer.from(client_id + ':' + client_secret).toString('base64');
        const params = new URLSearchParams();
        params.append("grant_type", "authorization_code");
        params.append("code", req.query.code);
        params.append("redirect_uri", redirect_uri);

        var options = {
            'method': 'POST',
            'headers': {
                'Authorization': "Basic " + base64bufffer
            },
            "body": params
        };
        let response = await fetch('https://accounts.spotify.com/api/token', options);
        let json = await response.json();
        let userJson = await getUserInfo(json.access_token)

        let userId = req.cookies.id
        let userSpotify = await SpotifyUser.findOne({ id: userId });
        if (!userSpotify) {
            var userData = {
                id: userId,
                nameId: userJson.id,
                access_token: json.access_token,
                refresh_token: json.refresh_token,
            };
            newUserSpotify = new SpotifyUser(userData);
            await newUserSpotify.save();
        } else {
            userSpotify.nameId = userJson.id;
            userSpotify.access_token = json.access_token;
            userSpotify.refresh_token = json.refresh_token;
            await userSpotify.save();
        }
        return res.status(200).redirect("http://localhost:3000/dashboard");
    } catch (err) {
        console.log(err)
        res.status(403).send({"error": true, "status": err._message})
    }
});

router.get('/spotify/refresh', async function(req, res) {
    try {
        if (!req.cookies || !req.cookies.id)
            return res.status(403).send({"error": true, "status": "Something went wrong"});

        let userSpotify = await SpotifyUser.findOne({ id: req.cookies.id });
        if (!userSpotify)
            return res.status(403).send({"error": true, "status": "Something went wrong"});

        let base64bufffer = Buffer.from(client_id + ':' + client_secret).toString('base64');
        const params = new URLSearchParams();
        params.append("grant_type", "refresh_token");
        params.append("refresh_token", userSpotify.refresh_token);

        var options = {
            'method': 'POST',
            'headers': {
                'Authorization': "Basic " + base64bufffer
            },
            "body": params
        };
        let response = await fetch('https://accounts.spotify.com/api/token', options);
        let json = await response.json();
        userSpotify.access_token = json.access_token;
        await userSpotify.save();
        return res.status(200).send({"error": false, "status": "Successfully updated key", "access_token": json.access_token});
    } catch (err) {
        console.log(err)
        res.status(403).send({"error": true, "status": err._message})
    }
});

router.get('/spotify/me', async function(req, res) {
    try {
        if (!req.cookies || !req.cookies.id)
            return res.status(403).send({"error": true, "status": "Something went wrong"});
        let userSpotify = await SpotifyUser.findOne({ id: req.cookies.id });
        if (!userSpotify)
            return res.status(403).send({"error": true, "status": "Something went wrong"});
        json = getUserInfo(userSpotify.access_token)
        return res.status(200).send({"error": false, "json": json});
    } catch (err) {
        console.log(err)
        res.status(403).send({"error": true, "status": err._message})
    }
});

router.get('/spotify/player/pause', async function(req, res) {
    try {
        if (!req.cookies || !req.cookies.id)
            return res.status(403).send({"error": true, "status": "Something went wrong"});
        let userSpotify = await SpotifyUser.findOne({ id: req.cookies.id });
        if (!userSpotify)
            return res.status(403).send({"error": true, "status": "Something went wrong"});

        var options = {
            'method': 'PUT',
            'headers': {
                'Authorization': "Bearer " + userSpotify.access_token
            }
        };
        let response = await fetch('https://api.spotify.com/v1/me/player/pause', options);
        return res.status(200).send({"error": false, "status": "paused"});
    } catch (err) {
        console.log(err)
        res.status(403).send({"error": true, "status": err._message})
    }
});

router.post('/spotify/player/start', async function(req, res) {
    try {
        console.log(req.cookies.id)
        console.log(req.body.context_uri)
        console.log(req.body.offset)
        if (!req.cookies || !req.cookies.id || !req.body || !req.body.context_uri || !Number.isInteger(req.body.offset) || !Number.isInteger(req.body.song_offset))
            return res.status(403).send({"error": true, "status": "Something went wrong"});
        let userSpotify = await SpotifyUser.findOne({ id: req.cookies.id });
        if (!userSpotify)
            return res.status(403).send({"error": true, "status": "Something went wrong"});
        let params = {
            "context_uri": req.body.context_uri,
            "offset": {
                "position": req.body.offset
            },
            "position_ms": req.body.song_offset
        }
        var options = {
            'method': 'PUT',
            'headers': {
                'Authorization': "Bearer " + userSpotify.access_token
            },
            "body": JSON.stringify(params)
        };
        let response = await fetch('https://api.spotify.com/v1/me/player/play', options);
        return res.status(200).send({"error": false, "status": "paused"});
    } catch (err) {
        console.log(err)
        res.status(403).send({"error": true, "status": err._message})
    }
});

router.get('/spotify/playlists/getAll', async function(req, res) {
    try {
        if (!req.cookies || !req.cookies.id)
            return res.status(403).send({"error": true, "status": "Something went wrong"});
        let userSpotify = await SpotifyUser.findOne({ id: req.cookies.id });
        if (!userSpotify)
            return res.status(403).send({"error": true, "status": "Something went wrong"});

        var options = {
            'method': 'GET',
            'headers': {
                'Authorization': "Bearer " + userSpotify.access_token
            }
        };
        let response = await fetch('https://api.spotify.com/v1/users/' + userSpotify.nameId + '/playlists', options);
        let json = await response.json();
        return res.status(200).send({"error": false, "json": json});
    } catch (err) {
        console.log(err)
        res.status(403).send({"error": true, "status": err._message})
    }
});

router.get('/spotify/playlists/get', async function(req, res) {
    console.log(req.query)
    try {
        if (!req.cookies || !req.cookies.id) {
            console.log("tamere?")
            return res.status(403).send({"error": true, "status": "Something went wrong"});
        }
        let userSpotify = await SpotifyUser.findOne({ id: req.cookies.id });
        if (!userSpotify)
            return res.status(403).send({"error": true, "status": "Something went wrong"});
        if (!req.query || !req.query.playlistId)
            return res.status(403).send({"error": true, "status": "Something went wrong"});
        console.log(req.query.playlistId)
        var options = {
            'method': 'GET',
            'headers': {
                'Authorization': "Bearer " + userSpotify.access_token
            }
        };
        let response = await fetch('https://api.spotify.com/v1/playlists/' + req.query.playlistId, options);
        let json = await response.json();
        if (json.error) {
            return res.status(json.error.status).send({"error": true, "status": json.error.message});
        }
        return res.status(200).send({"error": false, "json": json});
    } catch (err) {
        console.log(err)
        res.status(403).send({"error": true, "status": err._message})
    }
});

router.get('/spotify/isconnected', async function(req, res) {
    try {
        if (!req.cookies || !req.cookies.id) {
            return res.status(403).send({"error": true, "status": "Something went wrong"});
        }
        let userSpotify = await SpotifyUser.findOne({ id: req.cookies.id });
        if (!userSpotify) {
            return res.status(403).send({"error": false, "status": false});
        }
        else
            return res.status(200).send({"error": false, "status": true});
    } catch (err) {
        console.log(err)
        res.status(403).send({"error": true, "status": err._message})
    }
});

router.get('/spotify/player/actualsong', async function(req, res) {
    try {
        if (!req.cookies || !req.cookies.id)
            return res.status(403).send({"error": true, "status": "Something went wrong"});
        let userSpotify = await SpotifyUser.findOne({ id: req.cookies.id });
        if (!userSpotify)
            return res.status(403).send({"error": true, "status": "Something went wrong"});
        var options = {
            'method': 'GET',
            'headers': {
                'Authorization': "Bearer " + userSpotify.access_token
            },
        };
        let response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', options);
        let json = await response.json();
        if (json.error) {
            return res.status(json.error.status).send({"error": true, "status": json.error.message});
        }
        return res.status(200).send({"error": false, "json": json});
    } catch (err) {
        console.log(err)
        res.status(403).send({"error": true, "status": err._message})
    }
});

module.exports = router;
