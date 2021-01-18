# Dashboard
  
Dashboard is an epitech project for 3rd years, coded in nodejs and reactJS  
  
Online IP : http://87.106.169.173:3000  
  
# Services  
  
- Weather  
    - City Temperature :  
        Display the temperature of a city  
- Spotify  
    - Playlist lists:  
        Displaying the list of all your playlist and can choose a song in it  
    - Spotify Player:  
        Show a spotify player, where you can start and stop your music  
- Twitter  
    - Home list:  
        Displaying the list of all the tweets from the person you follow, on your homepage  
    - Tweet module:  
        Module to tweet anything for anyone  
- Reddit  
    - Home list:  
        Displaying the list of all the reddit posts from the subreddit you follow, on your homepage  
    - Subreddit browser:  
        Module to check any subreddit  

# API  

- ***Weather***  
    *POST /weather*  
    body:  
&nbsp;&nbsp;&nbsp;&nbsp;latitude : the Latitude of the user  
&nbsp;&nbsp;&nbsp;&nbsp;longitude : the Longitude of the user  
    response: JSON with the meteo for the actual zone  

    *POST /wforecast*  
    body:  
&nbsp;&nbsp;&nbsp;&nbsp;latitude : the Latitude of the user  
&nbsp;&nbsp;&nbsp;&nbsp;longitude : the Longitude of the user  
    response: JSON with the previsualisation of the meteo for the actual zone  
    
- ***Spotify***  
    *GET /spotify/login*  
    response: JSON with the URL to log in with the spotify OAuth  

    *GET /spotify/callback*  
    query content:  
&nbsp;&nbsp;&nbsp;&nbsp;code : code that spotify send himself  
    response: This is only used by spotify and serves the api to get the log in tokens  
    
    *GET /spotify/refresh*  
    response: Refreshed access token key, useful if your token timed out after an hour  
    
    *GET /spotify/me*   
    response: JSON of the logged user   
     
    *GET /spotify/player/pause*   
    response: Nothing, this endpoint is used to pause the song   
     
    *POST /spotify/player/start*   
    body:   
&nbsp;&nbsp;&nbsp;&nbsp;context_uri : Spotify URL of the playlist   
&nbsp;&nbsp;&nbsp;&nbsp;offset : the offset of the song for the playlist (ex: 4 for the 4th song of the playlist)   
&nbsp;&nbsp;&nbsp;&nbsp;song_offset : the offset in ms where you want to start the song   
    response: Nothing, this endpoint is used to start the song   
      
    *GET /spotify/playlists/getAll*   
    query content:   
&nbsp;&nbsp;&nbsp;&nbsp;playlistId : The ID of the playlist   
    response: JSON of the wanted playlist   
     
    *GET /spotify/isconnected*   
    response: If the user is connected or not   
     
    *GET /spotify/player/actualsong*   
    response: Send in JSON the information of the currently played song by the user    
 
- ***Twitter***   
    *GET /twitter/login*   
    response: JSON with the URL to log in with the twitter OAuth   
 
    *GET /twitter/callback*   
    query content:   
&nbsp;&nbsp;&nbsp;&nbsp;oauth_token : code that twitter send himself for the OAuth   
&nbsp;&nbsp;&nbsp;&nbsp;oauth_verifier : code that twitter send himself for the OAuth   
    response: This is only used by twitter and serves the api to get the log in tokens   
    
    *GET /twitter/isconnected*   
    response: If the user is connected or not   
     
    *GET /twitter/timeline/get*   
    response: Get the user timeline   
      
    *POST /twitter/post/add*   
    body:   
&nbsp;&nbsp;&nbsp;&nbsp;text : Text for the tweet   
    response: false or true if it worked   
      
- ***Reddit***  
    *GET /reddit/login*   
    response: JSON with the URL to log in with the reddit OAuth  
  
    *GET /reddit/callback*  
    query content:  
&nbsp;&nbsp;&nbsp;&nbsp;code : code that reddit send himself  
    response: This is only used by twitter and serves the api to get the log in tokens  
      
    *GET /reddit/refresh*  
    response: Refreshed access token key, useful if your token timed out after an hour  
      
    *GET /reddit/homepage/get*  
    response: Get the reddit homepage of the user  
      
    *GET /reddit/subreddit/gethot*  
    query content:  
&nbsp;&nbsp;&nbsp;&nbsp;subreddit : Wanted subreddit  
&nbsp;&nbsp;&nbsp;&nbsp;type : hot/new/top  
    response: Get the subreddit json ordered in the type method  
