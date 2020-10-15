// dependencies
const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config();

// port value
let port;

// spotify data
let SpotifyWebApi = require('spotify-web-api-node');
let scopes = ['user-read-private',
              'user-read-email',
              'playlist-modify-public',
              'playlist-modify-private'];

let spotifyApi = new SpotifyWebApi({
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    redirectUri: "http://localhost:3000/callback"
});

// middleware
let bodyParser = require('body-parser');

// middleware setup
app.use(bodyParser.json());

// setting the port and static path
console.log("NODE_ENV is", process.env.NODE_ENV);
if (process.env.NODE_ENV === "production") {
    port = process.env.PORT || 3000;
    app.use(express.static(path.join(__dirname, "/build")));
    app.get("/", (request, response) => {
        response.sendFile(path.join(__dirname, "/build", "index.html"));
    });
} else {
    port = 3001;
    console.log("Not seeing your changes as you develop?");
    console.log("Do you need to set 'start': 'npm run development' in package.json?"
    );
}

/* Endpoint Name: /login
 * Author: API example developer
 * Description: login function (courtesy of the developer of the API in their example code)
 */
app.post('/login', (req, res) => {
    let link = spotifyApi.createAuthorizeURL(scopes);
    res.send({link: link});
});

/* Endpoint Name: /callback
 * Author: API example developer
 * Description: callback function for the login (courtesy of the developer of the API in their example code)
 */
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

/* Endpoint Name: /getSongs
 * Author: Connor
 * Description: gets all of the songs shared by two users on their public playlists
 */
app.post('/getSongs', async (req, res) => {
    try {
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

        // get all artists of all user's tracks
        let user1Artists = getUserArtists(user1Tracks);
        let user2Artists = getUserArtists(user2Tracks);

        // get all albums of all user's tracks
        let user1Albums = getUserAlbums(user1Tracks);
        let user2Albums = getUserAlbums(user2Tracks);

        // map the tracks for each user according to (key: id, value: {name, artists})
        let user1Map = mapTracks(user1Tracks);
        let user2Map = mapTracks(user2Tracks);

        let intersection = getIntersection(user1Map, user2Map);
        let intersectionArtistsId = getArtistIntersection(intersection);
        let intersectionArtistsImages = await getFullArtists(intersectionArtistsId);

        console.log("RETURNING INTERSECTION BETWEEN " + user1 + " AND " + user2);
        res.send(JSON.stringify( { user1Artists: user1Artists, user2Artists: user2Artists, user1Albums: user1Albums, user2Albums: user2Albums, intersection: intersection, user1Songs: user1Tracks, user2Songs: user2Tracks, artistImages: intersectionArtistsImages } ));

    }catch (e) {
        console.log(e);
    }
});


// get the artists in common between two users
function getArtistIntersection(intersection) {
    let artists = [];
    for (let i = 0 ; i < intersection.length ; i++) {
        artists.push(intersection[i].artists[0].id)
    }
    return artists
}

// Get full artist objects of shared artists
async function getFullArtists(ids) {
    return spotifyApi.getArtists(ids).then((data) => {
        return data.body;
    }, function(err) {
        console.log('Something went wrong!', err);
    }).then((artists) => {        
        let images = []
        for(let i = 0; i < artists['artists'].length; i++) {
            images.push(artists['artists'][i])
        }
        return images
    })
}

// gets all artist names of songs in a user's playlists
function getUserArtists(tracks) {
    let artists = [];
    for (let i = 0 ; i < tracks.length ; i++) {
        artists.push({name: tracks[i].artists[0].name, images: tracks[i].artists[0].images})
    }
    return artists
}

// gets all album names and images of songs in a user's playlists
function getUserAlbums(tracks) {
    let albums = [];
    for (let i = 0 ; i < tracks.length ; i++) {
        albums.push({name: tracks[i].album.name, images: tracks[i].album.images, artists: tracks[i].album.artists[0]})
    }
    return albums
}

/* Function Name: getUserPlaylists
 * Author: Connor
 * Parameters: a userid
 * Return: all public playlist ids for a given user
 * Description: gets a list of all of the playlist ids for a particular user
 */
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

/* Function Name: getUserTracks
 * Author: Connor
 * Parameters: a list of playlist IDs
 * Return: a list of tracks in all of the playlists
 * Description: gets all of the tracks in a list of playlists
 */
async function getUserTracks(userPlaylists){
    // the empty list that will contain all public tracks on a users spotify
    let tracks = [];

    // for each of the playlists, get the tracks in each one
    for (let i = 0; i < userPlaylists.length; i++) {
        // get all of the tracks in an individual playlist
        let individualPlaylistTracks = await getUserTracksPerPlaylist(userPlaylists[i]);
        // go through each song in that playlist
        for(let j = 0; j < individualPlaylistTracks.length; j++){
            // add that song's data to the tracks list
            tracks.push(individualPlaylistTracks[j]);
        }
    }

    // return the tracks
    return tracks;
}

/* Function Name: getUserTracksPerPlaylist
 * Author: Connor
 * Parameters: a playlist
 * Return: all songs in that particular playlist
 * Description: a helper function for the above function that gets all of the tracks in a single playlist
 */
async function getUserTracksPerPlaylist(playlist){
    // calls the spotify api for the tracks in a playlist
    return spotifyApi.getPlaylistTracks(playlist).then((data) => {
        // send the body of the api response to the "then" function
        return data.body;
    }, function (err) {
        // if something went wrong during the request, log it
        console.log('Something went wrong!', err);
    }).then((tracks) => {
        // the list of track data that will be returned as a result of this function
        let userTracks = [];

        // goes through all of the tracks from the response
        for (let i = 0; i < tracks['items'].length; i++) {
            // sometimes a track won't have an id for some reason, that is the reason for the try
            try {
                // add ALL of the track data to the list that is going to be returned
                userTracks.push(tracks['items'][i]['track']);
            }
            catch (e) {
                // log if there isn't an id for a particular song
                console.log("error: " + e);
            }
        }

        // the tracks for a playlist (what will actually be returned at the end of function execution)
        return userTracks
    });
}

/* Function Name: mapTracks
 * Author: Connor
 * Parameters: a list of tracks
 * Return: a map of tracks (key: id, value: track data)
 * Description: maps all of the tracks given their id to the track data
 */
function mapTracks(trackList){
    // the map that will be returned
    let returnMap = new Map();

    // iterate through all of the tracks in the list
    for(let i = 0; i < trackList.length; i++){
        try {
            //assigns the id of the track to the map with the value being all of the track data
            returnMap.set(trackList[i]['id'], trackList[i]);
        }catch (e) { //for some reason a track may not have an id, this catches it and moves on
            console.log("error: " + e);
        }
    }

    // return the map
    return returnMap;
}

/* Function Name: getIntersection
 * Author: Connor
 * Parameters: maps of track data for two users
 * Return: the track data for all intersecting songs
 * Description: takes the maps and returns the values of those that both maps have in common
 */
function getIntersection(map1, map2){
    // the list that will have track data added to it and returned
    let returnList = [];

    // goes through all of the keys in the first map
    for (let key of map1.keys()) {
        // if there is a key in map1 that is associated with map2, there must be an intersection
        if(map2.get(key) !== undefined){
            // add the track that both users have in common to the map
            returnList.push(map2.get(key));
        }
    }

    // return the list of common tracks between the users
    return returnList;
}

// listen on the assigned port
app.listen(port, () => console.log(`Listening on port ${port}`));
