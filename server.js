const express = require('express');
const app = express();
const port = process.env.PORT || 5000;


// spotify data
let SpotifyWebApi = require('spotify-web-api-node');
let scopes = ['user-read-private',
              'user-read-email',
              'playlist-modify-public',
              'playlist-modify-private'];
let clientID = "8dbae22d12914b8d8324f027fae6514e";
let clientSecret = "faffa488d3c84800bbbc124e246bf675";

let spotifyApi = new SpotifyWebApi({
    clientId: clientID,
    clientSecret: clientSecret,
    redirectUri: "http://localhost:5000/callback"
});

//middleware
let bodyParser = require('body-parser');

//middleware setup
app.use(bodyParser.json());

app.get('/callback', (req, res) => {
    const error = req.query.error;
    const code = req.query.code;
    const state = req.query.state;

    if (error) {
        console.error('Callback Error:', error);
        res.send(`Callback Error: ${error}`);
        return;
    }

    spotifyApi
        .authorizationCodeGrant(code)
        .then(data => {
            const access_token = data.body['access_token'];
            const refresh_token = data.body['refresh_token'];
            const expires_in = data.body['expires_in'];

            spotifyApi.setAccessToken(access_token);
            spotifyApi.setRefreshToken(refresh_token);

            console.log('access_token:', access_token);
            console.log('refresh_token:', refresh_token);

            console.log(
                `Sucessfully retreived access token. Expires in ${expires_in} s.`
            );
            res.send('Success! You can now close the window.');

            setInterval(async () => {
                const data = await spotifyApi.refreshAccessToken();
                const access_token = data.body['access_token'];

                console.log('The access token has been refreshed!');
                console.log('access_token:', access_token);
                spotifyApi.setAccessToken(access_token);
            }, expires_in / 2 * 1000);
        })
        .catch(error => {
            console.error('Error getting Tokens:', error);
            res.send(`Error getting Tokens: ${error}`);
        });
});

app.post('/getSongs', async (req, res) => {
    // assign the user strings
    let data = req.body;
    let user1 = data['user1'];
    let user2 = data['user2'];
    console.log("COMPARING USERS: " + user1 + " vs. " + user2);

    // get a list of the playlist IDs
    let user1Playlists = await getUserPlaylists(user1);
    let user2Playlists = await getUserPlaylists(user2);

    // get all of the tracks in all of the public playlists
    let user1Tracks = await getUserTracks(user1Playlists);
    let user2Tracks = await getUserTracks(user2Playlists);

    // map the tracks for each user according to (key: id, value: {name, artists})
    let user1Map = mapTracks(user1Tracks);
    let user2Map = mapTracks(user2Tracks);

    let intersection = getIntersection(user1Map, user2Map);
    console.log("RETURNING INTERSECTION BETWEEN " + user1 + " AND " + user2);
    res.send(intersection);

});

app.post('/login', (req, res) => {
    console.log("logging in...");
    let response = {link: spotifyApi.createAuthorizeURL(scopes)};
    res.send(response);
});

// gets the ids of the playlist for an individual user
async function getUserPlaylists(user){
    return spotifyApi.getUserPlaylists(user).then((data) => {
        return data.body;

    }, function(err) {
        console.log('Something went wrong!', err);
    }).then((playlists) => {
        let ids = [];
        for(let i = 0; i < playlists['items'].length; i++){
            ids.push(playlists['items'][i]['id']);
        }
        return ids;
    })
}

// iterates through all playlists and replys with all tracks in the set of playlists
async function getUserTracks(userPlaylists){
    let tracks = [];
    for (let i = 0; i < userPlaylists.length; i++) {
        let individualPlaylistTracks = await getUserTracksPerPlaylist(userPlaylists[i]);
        for(let j = 0; j < individualPlaylistTracks.length; j++){
            tracks.push(individualPlaylistTracks[j]);
        }
    }
    return tracks;
}

// iterates through an individual playlist and replies for each track in the playlist
async function getUserTracksPerPlaylist(playlist){
    return spotifyApi.getPlaylistTracks(playlist).then((data) => {
        return data.body;
    }, function (err) {
        console.log('Something went wrong!', err);
    }).then((tracks) => {
        let userTracks = [];
        for (let i = 0; i < tracks['items'].length; i++) {
            try {
                userTracks.push(tracks['items'][i]['track']);
            }
            catch (e) {
                console.log("error: " + e);
            }
        }
        return userTracks
    });
}

// takes in a list of tracks and returns a hashmap (key: id, value: {name, artists})
function mapTracks(trackList){
    let returnMap = new Map();
    for(let i = 0; i < trackList.length; i++){
        try {
            returnMap.set(trackList[i]['id'], trackList[i]);
        }catch (e) {
            console.log("error: " + e);
        }
    }
    return returnMap;
}

function getIntersection(map1, map2){
    let returnList = [];

    for (let key of map1.keys()) {
        if(map2.get(key) !== undefined){
            returnList.push(map2.get(key));
        }
    }

    return returnList;
}

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));
