var SpotifyWebApi = require("spotify-web-api-node");
var bodyParser    = require('body-parser');
var express = require('express'),
	app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/static'));
app.set('views', './views')
app.set('view engine', 'jade')

var clientId = '';
var clientSecret = '';
var scopes = ['playlist-read-collaborative'],
	redirectUri = 'http://localhost:8000/callback';

var spotifyApi = new SpotifyWebApi({
	clientId : clientId,
	clientSecret : clientSecret,
	redirectUri : redirectUri,
});

function randomString(length) {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};


var stateKey = 'spotify_auth_state';
var tokenExpirationEpoch;

app.get('/', function(req, res) {
	// console.log('hi');
	// res.sendfile('index.html');
	if (spotifyApi.getAccessToken() == undefined) {
		var state = randomString(16);
		res.cookie(stateKey, state);
		var authURL = spotifyApi.createAuthorizeURL(scopes, state);
		res.redirect(authURL);
	}
	else {
		console.log('here');
		res.render('index');
	}
});

app.get('/callback', function(req, res) {
	// console.log('hii');
	spotifyApi.authorizationCodeGrant(req.query.code)
	.then(function(data) {
	console.log('The token expires in ' + data.body['expires_in']);
	console.log('The access token is ' + data.body['access_token']);
	console.log('The refresh token is ' + data.body['refresh_token']);
	spotifyApi.setAccessToken(data.body['access_token']);
	spotifyApi.setRefreshToken(data.body['refresh_token']);

	tokenExpirationEpoch = (new Date().getTime() / 1000) + data.body['expires_in'];

	res.redirect('/');
	}, function(err) {
	console.log('Something went wrong!', err);
	return res.send(err);
	});
});

app.get('/playlists', function(req, res) {
	spotifyApi.getUserPlaylists(
		'charizarrd93',
		{
			limit: req.query.limit,
			offset: req.query.offset
		})
		.then(function(data) {
		res.send(data.body);
		},function(err) {
		console.log('Something went wrong!', err);
	});
});


app.get('/tracks', function(req, res) {
	spotifyApi.getPlaylistTracks(
		'charizarrd93',
		req.query.playlist_id)
		.then(function(data) {
		res.send(data.body);
		},function(err) {
		console.log('Something went wrong!', err);
	});
});



app.listen(8000, function () {
	console.log('server started...');
});
