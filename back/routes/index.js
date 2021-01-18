var express = require('express');
var router = express.Router();

var http = require("http");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/about.json', function(req, res) {
    let json = {
        "client": {
            "host": req.connection.remoteAddress.split(":").pop()
        },
        "server": {
            "current_time": Math.floor(Date.now() / 1000),
            "services": [{
                "name": "weather",
                "widgets": [{
                    "name": "city_temperature",
                    "description": "Display temperature for a city",
                    "params": [{
                        "name": "city",
                        "type": "string"
                    }]
                }]
            }, {
                "name": "spotify" ,
                "widgets": [{
                    "name": "Playlist lists",
                    "description": "Displaying the list of all your playlist and can choose a song in it",
                    "params": [{
                        "name": "playlist",
                        "type": "string"
                    }]
                }, {
                    "name": "Spotify Player",
                    "description": "Show a spotify player, where you can start and stop your music",
                    "params": []
                }]
            }, {
                "name": "twitter" ,
                "widgets": [{
                    "name": "Home list",
                    "description": "Displaying the list of all the tweets from the person you follow, on your homepage",
                    "params": []
                }, {
                    "name": "Tweet module",
                    "description": "Module to tweet anything for anyone",
                    "params": [{
                        "name": "tweet",
                        "type": "string"
                    }]
                }]
            }, {
                "name": "reddit" ,
                "widgets": [{
                    "name": "Home list",
                    "description": "Displaying the list of all the reddit posts from the subreddit you follow, on your homepage",
                    "params": []
                }, {
                    "name": "Subreddit browser",
                    "description": "Module to check any subreddit",
                    "params": [{
                        "name": "subreddit",
                        "type": "string"
                    }, {
                        "name": "sort",
                        "type": "string"
                    }]
                }]
            }]
        }
    }
    return res.status(200).send(json)
});

module.exports = router;