var createError = require('http-errors');
var express = require('express');
var path = require('path');
const mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');


var indexRouter = require('./routes/index');
var SpotifyRouter = require('./routes/spotify');
var TwitterRouter = require('./routes/twitter');
var RedditRouter = require('./routes/reddit');
var WeatherRouter = require('./routes/weather');
var RegisterRouter = require('./routes/register');
var LoginRouter = require('./routes/login');
const bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(express.static(path.join(__dirname, 'public')));

/* Mongoose */
mongoose.Promise = global.Promise;
var urlmongo = "mongodb://batou:d4shb04rd123@87.106.169.173:27017/dashboardDb?authSource=dashboardDb&readPreference=primary";
var options = { keepAlive: 300000, connectTimeoutMS: 30000, useNewUrlParser: true };
mongoose.set('useUnifiedTopology', true);
mongoose.connect(urlmongo, options);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connexion error'));
db.once('open', function (){ console.log("Successfully connected"); });

app.get('/', indexRouter);
app.post('/weather', WeatherRouter);
app.post('/wforecast', WeatherRouter);
app.post('/register', RegisterRouter);
app.post('/login', LoginRouter);
app.post('/wforecast', WeatherRouter);
app.get('/spotify/login', SpotifyRouter);
app.get('/spotify/callback', SpotifyRouter);
app.get('/spotify/refresh', SpotifyRouter);
app.get('/spotify/me', SpotifyRouter);
app.get('/spotify/player/pause', SpotifyRouter);
app.get('/spotify/playlists/getAll', SpotifyRouter);
app.get('/spotify/playlists/get', SpotifyRouter);
app.get('/spotify/isconnected', SpotifyRouter);
app.post('/spotify/player/start', SpotifyRouter);
app.get('/spotify/player/actualsong', SpotifyRouter);
app.get('/twitter/login', TwitterRouter);
app.get('/twitter/callback', TwitterRouter);
app.get('/twitter/isconnected', TwitterRouter);
app.get('/twitter/timeline/get', TwitterRouter);
app.post('/twitter/post/add', TwitterRouter);
app.get('/reddit/login', RedditRouter);
app.get('/reddit/callback', RedditRouter);
app.get('/reddit/refresh', RedditRouter);
app.get('/reddit/homepage/get', RedditRouter);
app.get('/reddit/subreddit/gethot', RedditRouter);
app.get('/reddit/isconnected', RedditRouter)
app.get('/about.json', indexRouter);
// app.use('/spotify/username', SpotifyRouter);  //avec les images etc
// app.use('/spotify/playlist', SpotifyRouter);  //avec les images etc
// app.use('/spotify/last_play', SpotifyRouter); //avec les images etc
// app.use('/spotify/play', SpotifyRouter); //celle qui l ecoute en ce moment
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/*app.use(function(req, res, next) {
  res.set("Access-Control-Allow-Origin", "http://localhost:3000/dashboard");
	res.set("Access-Control-Allow-Credentials", "true");
	res.set("Access-Control-Max-Age", "1800");
	res.set("Access-Control-Allow-Headers", "content-type");
	res.set("Access-Control-Allow-Methods","PUT, POST, GET, DELETE, PATCH, OPTIONS");
  next()
})*/

module.exports = app;
