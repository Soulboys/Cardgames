import './App.css';
import { Button, Card, Alert} from 'react-bootstrap';
import React, { Component, useEffect } from 'react'
import PrimarySearchAppBar from './TorBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlayCircle, faCog, faMinus, faPlay, faPlus, faStepBackward, faStepForward, faPen, faVirusSlash, faCheck, faSearch } from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';
import { TextField } from '@material-ui/core';
const instance = axios.create({ timeout: 1000 });

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            latitude: null,
            longitude: null,
            WData: null,
            WFdata: null,
            moreW: false,
            spotifyCo: false,
            Redirect: false,
            link: "",
            Tco : false,
            Sco: false,
            Playlist: null,
            Tlaylist: false,
            AllPlaylist: null,
            Sname: null,
            Ttime: null,
            postT: false,
            theMusic: null,
            iTheMusic: null,
            actualS: null,
            duration: 0,
            paused: true,
            currentCount: 60,
            post: null,
            posted: false,
            WTwi: true,
            WSpo: true,
            WWea: true,
            WRed: true,
            currents: 60,
            Rco: false,
            HomeR: null,
            Rhot: false,
            redditF: "",
            hotData: null,
        }
        this.handleChangePost = this.handleChangePost.bind(this);
        this.handleChangeRefresh = this.handleChangeRefresh.bind(this);
        this.handleChangeRF = this.handleChangeRF.bind(this);


    }

    timer() {
        this.setState({
          currentCount: this.state.currentCount - 1
        })
        if(this.state.currentCount < 1) { 
            this.refresh()
            this.setState({currentCount: this.state.currents})
        }
      }

    urlban = (item) => {
        return (item.replace(/(?:https?|ftp):\/\/[\n\S]+/g, ''))
    }

//-----------------------------------------Reddit-----------------------------------------//

    RedditIsConnected = () => {
        axios.get("http://localhost:8080/reddit/isconnected", { withCredentials: true }).then((data) => {
            console.log(data.data)
            if (data.data.error === false) {
                if (data.data.status === true && this.state.Rco === false) {
                    this.setState({
                        Rco : true
                    })
                this.refresh()
                } else if (data.data.status === false) {
                    this.setState({
                        Rco : false
                    })
                }
            }
        })
    }

    RedditGetHot = () => {
        axios.get("http://localhost:8080/reddit/subreddit/gethot?subreddit=" + this.state.redditF +"&type=hot", {withCredentials: true}).then((data) => {
            if (data.status === 403)
                this.RedditRefresh()
            if (data.data.error === false) {
                this.setState({
                    hotData: data.data.json
                })
            }
        })
    }

    RedditRefresh = () => {
        axios.get("http://localhost:8080/reddit/refresh", { withCredentials: true }).then((data) => {
        })
    }

    RedditGetHomePage = () => {
        axios.get("http://localhost:8080/reddit/homepage/get", { withCredentials: true }).then((data) => {
            if (data.status === 403)
                this.RedditRefresh()
            console.log(data.data.json)
            if (data.data.error === false) {
                this.setState({
                        HomeR : data.data.json
                    })
            }
        })
    }

//-----------------------------------------Twitter-----------------------------------------//

    TwitterIsConnected = () => {
        axios.get("http://localhost:8080/twitter/isconnected", { withCredentials: true }).then((data) => {
            console.log(data.data)
            if (data.data.error === false) {
                if (data.data.status === true && this.state.Tco === false) {
                    this.setState({
                        Tco : true
                    })
                this.refresh()
                } else if (data.data.status === false) {
                    this.setState({
                        Tco : false
                    })
                }
            }
        })
    }

    getTimeline = () => {
        axios.get("http://localhost:8080/twitter/timeline/get", {withCredentials: true}).then((data) => {
            if (data.data.error === false) {
                console.log(data.data)
                this.setState({
                    Ttime: data.data
                })
            }
        })
    }

    postPostT = () => {
        axios.post("http://localhost:8080/twitter/post/add", {text: this.state.post}, {withCredentials: true}).then((data) => {
            if (data.data.error === false) {
                this.setState({
                    post: null,
                    postT: false,
                    posted: true,
                })
            }
            console.log(data.data)
        })
    }

//-----------------------------------------Spotify-----------------------------------------//

    pauseSpotify = () => {
        if (this.state.theMusic && this.state.paused === false) {
            this.getPauseSpotify()
            this.getActual()
            console.log(this.state.paused)
        } else if (this.state.theMusic && this.state.paused === true) {
            console.log("tamere")
            this.getMusic(this.state.iTheMusic, this.state.duration)
        }
    }

    getPauseSpotify = () => {
        axios.get("http://localhost:8080/spotify/player/pause", {withCredentials: true}).then((data) => {
          
        })
    }

    getActual = () => {
        axios.get("http://localhost:8080/spotify/player/actualsong", {withCredentials: true}).then((data) => {
            if(data.data.error !== true) {
                console.log(data.data)
                this.setState({actualS: data.data, duration: data.data.json.progress_ms, paused: true})
            }
        })

    }

    PlayMusic = (i, item) => {
        this.setState({
            theMusic: item, 
            iTheMusic: i
        })
        this.getMusic(i, 0)
    }

    PlayBeforeMusic = () => {
        var i = this.state.iTheMusic
        if(this.state.iTheMusic !== 0) {
            this.setState({
                theMusic: this.state.Playlist.tracks.items[this.state.iTheMusic - 1],
                iTheMusic: this.state.iTheMusic - 1
            })
            this.getMusic(i - 1, 0)
        }
    }

    PlayNextMusic = () => {
        var i = this.state.iTheMusic
        this.setState({
            theMusic: this.state.Playlist.tracks.items[this.state.iTheMusic + 1],
            iTheMusic: this.state.iTheMusic + 1
        })
        this.getMusic(i + 1, 0)
    }

    getMusic = (i, so)=> {
        console.log(so)
        axios.post("http://localhost:8080/spotify/player/start", {'song_offset': so, 'offset': i , 'context_uri': this.state.Playlist.uri}, {withCredentials: true}).then((data) =>{
            if (data.data.error === false) {
               this.setState({paused: false})
            }
        })
    }

    getRefreshToken = () => {
        axios.get("http://localhost:8080/spotify/refresh",{ withCredentials: true })
    }


    SpotifyIsConnected = () => {
        axios.get("http://localhost:8080/spotify/isconnected", { withCredentials: true }).then((data) => {
            if (data.data.error === false) {
                if (data.data.status === true && this.state.Sco === false) {
                    this.setState({
                        Sco : true
                    })
                    this.refresh()
                } else if (data.data.status === false) {
                    this.setState({
                        Sco : false
                    })
                }
            }
        })
    }

    getUserSpotify = () => {
        axios.get("http://localhost:8080/spotify/me", {withCredentials: true}).then(data => {
            if (data.data.json.error) {
                if (data.data.json.error.message === "The access token expired")
                this.getRefreshToken()
            }
            if (data.data.error === false) {
                console.log("getuser")

                console.log(data.data)
                this.setState({
                    Sname: data.data.json
                })
            }
        })
    }

    getAllPlaylist = () => {
        axios.get("http://localhost:8080/spotify/playlists/getAll", {withCredentials: true}).then(data => {
            if (data.data.json.error) {
                if (data.data.json.error.message === "The access token expired")
                this.getRefreshToken()
            }
            if (data.data.error === false) {
                console.log("getallpal")

                console.log(data.data)
                this.setState({
                    AllPlaylist: data.data.json
                })
            }
        })
    }

    getPlaylist = (id) => {
        axios.get("http://localhost:8080/spotify/playlists/get?playlistId="+ id, {withCredentials: true}).then(data => {
            if (data.data.json.error) {
                if (data.data.json.error.message === "The access token expired")
                this.getRefreshToken()
            }
            if (data.data.error === false) {
                console.log("getpal")

                console.log(data.data)
                this.setState({
                    Tlaylist: true,
                    Playlist: data.data.json
                })
            }
        })
    }

//-----------------------------------------Weather-----------------------------------------//


    getWeather = (latitude, longitude) => {
        axios.post("http://localhost:8080/weather", {
             'latitude': latitude, 'longitude': longitude }).then(data =>  {
            console.log(data.data)
            this.setState({ 
            WData: data.data, 
            latitude : latitude,
            longitude: longitude })
        });
    }

    getWForecast = () => {
        axios.post("http://localhost:8080/wforecast", {'latitude': this.state.latitude, 'longitude': this.state.longitude })
        .then(data =>  {
            console.log(data.data)
            this.setState({ 
                WFdata: data.data, 
            })   
        });
    }

//-----------------------------------------Other-----------------------------------------//

    componentDidMount() {
        this.intervalId = setInterval(this.timer.bind(this), 1000);
        if (window.location.href.indexOf("id=") > -1 && document.cookie.indexOf("id=")) {
            document.cookie = "id=" + window.location.href.split("id=")[1];
        }
        this.TwitterIsConnected()
        this.SpotifyIsConnected()
        if (navigator.geolocation) {
          navigator.geolocation.watchPosition((position) => {   
            if (this.state.longitude === null && this.state.latitude === null)
                this.getWeather(position.coords.latitude, position.coords.longitude)
          });
        }
      }

      handleChangePost(event) {
        this.setState({ post: event.target.value });
    }

    handleChangeRefresh(event) {
        this.setState({ currents: event.target.value });
    }

    handleChangeRF(event) {
        this.setState({ redditF: event.target.value });
    }

      componentWillUnmount() {
        clearInterval(this.intervalId);
      }

      refresh = () => {
        if (this.state.Rco === false) {
            this.RedditIsConnected()
        } else {
            this.RedditGetHomePage()
        }
        if (this.state.Sco === false)
            this.SpotifyIsConnected()
        if (this.state.Sco === true && (this.state.AllPlaylist === null || this.state.Sname === null)) {
            this.getUserSpotify()
            this.getAllPlaylist()
        }
        if (this.state.Tco === false)
            this.TwitterIsConnected()
        if (this.state.Tco === true && (this.state.Ttime === null || this.state.currentCount === 0)) {
            this.getTimeline()
        }
        if (this.state.currentCount === 0)
            this.getWeather(this.state.latitude, this.state.longitude)
      }

    render() {
        return (
            <div style={{flex: 1}}>
                <header>
                    <PrimarySearchAppBar></PrimarySearchAppBar>

                </header>
                <body style={{flex: 1, flexDirection:'row'}}>
                    <div className='test1'>
                        <div className='test2'>
                            <div className="tet">
                            {this.state.WWea === true ?
                            <div className='card_' >
                                <Card style={{ flex: 1, boxShadow: "1px 1px 6px #9E9E9E", width: 550}}>
                                    <Card.Body>
                                    <Card.Title style={{textAlign: 'left'}}>
                                        <div className="T1">
                                        <div className="T2">
                                            <img src={this.state.WData === null ? '' : this.state.WData.data.current.condition.icon} alt="new"/>
                                            <span style={{flex: 1}}>   {this.state.WData === null ? ' - - ' : this.state.WData.data.current.temp_c} °C</span>

                                        </div>
                                        <div className="T2">
                                            <span style={{flex: 1}}>   {this.state.WData === null ? " - - " : this.state.WData.data.location.name}</span>

                                        </div>
                                        <div className="T2">
                                            
                                        </div>
                                        <Button variant="primary" onClick={() => {
                                            this.setState({
                                                moreW : this.state.moreW === true ? false: true
                                            })
                                            this.getWForecast()
                                        }}>{this.state.moreW === true ? <FontAwesomeIcon icon={faMinus} />: <FontAwesomeIcon icon={faPlus} />}</Button> 
                                    
                                        </div>
                                    </Card.Title>
                                    {(this.state.moreW === true && this.state.WFdata != null)? <Card.Text>
                                        <div className='forecastW'>
                                            {this.state.WFdata.data.forecastday[0].hour.map((map, i) => {
                                                return (
                                                <div className='forecast_icon' style={{flex: 1, flexDirection: 'column',marginTop: 10, marginLeft: 8, paddingRight: 8, textAlign: 'center', borderLefTcolor: 'lightgray', borderLeftWidth: 1}}>
                                                    <div>
                                                        <span style={{fontWeight: 'bold'}}>{i}:00</span>
                                                    </div>
                                                    <img src={map.condition.icon}></img>
                                                    <span style={{fontWeight: 'bold'}}>{map.temp_c} C°</span>
                                                </div>)
                                            })}
                                       
                                        </div>
                                    </Card.Text>: null}
                                        
                                    </Card.Body>
                                </Card>
                            </div>
                            : null }
                            {this.state.WRed === true ?
                            <div className='card_' style={{marginTop: 10}}>
                                <Card style={{ flex: 1, boxShadow: "1px 1px 6px #9E9E9E"}}>
                                    <Card.Body>
                                        <Card.Title style={{textAlign: 'left'}}>
                                        <div className="T1">
                                            <div className="T2">
                                                {this.state.Rhot === false ? <span>Reddit</span>: <span>SubReddit</span>}
                                            </div>
                                            <div className="T2">
                                                {this.state.Rhot === true ? <div className="Add1"><TextField placeholder="SubReddit" value={this.state.redditF} onChange={this.handleChangeRF}></TextField> <Button style={{marginLeft: 10}} onClick={() => {this.RedditGetHot()}}><FontAwesomeIcon icon={faSearch}/></Button></div> : null }
                                            </div>
                                            <div className="T2">
                                                
                                            </div>
                                        <Button variant="primary" onClick={() => {
                                            if (this.state.Rhot === true) {
                                                this.setState({
                                                    Rhot : false,
                                                })
                                            } else {
                                                this.setState({
                                                    Rhot : true,
                                                })
                                            }
                                        }
                                        }><FontAwesomeIcon icon={faPen} /></Button> 
                                    
                                        </div></Card.Title>
                                        {this.state.Rco === false ? <Button onClick={() => {
                                            axios.get("http://localhost:8080/reddit/login").then(data =>  {
                                                if (data.data.error === false) {
                                                    console.log(data.data)
                                                    window.location.href = data.data.url;
                                                }})
                                        }}>Connection Reddit</Button> : (this.state.hotData !== null && this.state.Rhot === true)  ? 
                                        <div className='red'>
                                            {this.state.hotData.message ? <span>Not Found</span> :
                                        this.state.hotData.data.children.map((items, i) => {
                                            return (
                                            <div style={{boxShadow: "1px 1px 6px #9E9E9E", margin: 10, borderRadius: 7}}>
                                                <div style={{marginTop: 7, padding: 7}}>
                                                    <span style={{fontWeight: "bold", marginTop: 7, marginLeft: 7, marginRight: 7}}>{items.data.title}</span>
                                                </div>
                                                <span style={{color: "gray", marginBottom: 7, margin: 1}}>{items.data.author}</span>

                                                <div style={{margin: 10}}>
                                                {items.data.selftext ? 
                                                <span style={{margin: 10}}>{items.data.selftext}</span>
                                                :items.data.preview ? items.data.preview.images ? items.data.preview.images[0].source ? <img width={400} src={items.data.preview.images[0].source.url.replace("&amp;", "&")}></img>: null: null: null}
                                                </div>
                                            </div>
                                            )
                                    }) }
                                    </div> 
                                    : this.state.HomeR !== null && this.state.Rhot === false  ? 
                                        <div className='red'>
                                            {this.state.HomeR.data.children.map((items, i) => {
                                                return (
                                                <div style={{boxShadow: "1px 1px 6px #9E9E9E", margin: 10, borderRadius: 7}}>
                                                    <div style={{marginTop: 7, padding: 7}}>
                                                        <span style={{fontWeight: "bold", marginTop: 7, marginLeft: 7, marginRight: 7}}>{items.data.title}</span>
                                                    </div>
                                                    <span style={{color: "gray", marginBottom: 7, margin: 1}}>{items.data.author}</span>

                                                    <div style={{margin: 10}}>
                                                    {items.data.selftext ? 
                                                    <span style={{margin: 10}}>{items.data.selftext}</span>
                                                    :items.data.preview ? items.data.preview.images ? items.data.preview.images[0].source ? <img width={400} src={items.data.preview.images[0].source.url.replace("&amp;", "&")}></img>: null: null: null}
                                                    </div>
                                                </div>
                                                )
                                            })} 
                                        </div>
                                        : <span>Loading</span>}
                                    </Card.Body>
                                </Card>
                            </div>
                            : null}
                            <div className="test2">
                            <div className='test4' style={{}}>
                                <div className='T1' style={{width: "100%", margin: 2 , marginTop: 10}}>
                                    <div className="T2" style={{marginLeft: 10}}>
                                        <span>Weather</span>
                                    </div>
                                    <div className="T2">
                                    </div>
                                    <div className="T2">
                                        <Button onClick={() => {this.setState({WWea: this.state.WWea === true ? false: true })}}>
                                        {this.state.WWea === true ? <FontAwesomeIcon icon={faMinus} />: <FontAwesomeIcon icon={faPlus} />}
                                        </Button>
                                    </div>
                                </div>
                                <div className='T1' style={{width: "100%", margin: 2}}>
                                    <div className="T2" style={{marginLeft: 10}}>
                                        <span>Spotify</span>
                                    </div>
                                    <div className="T2">
                                    </div>
                                    <div className="T2">
                                        <Button onClick={() => {this.setState({WSpo: this.state.WSpo === true ? false: true })}}>
                                        {this.state.WSpo === true ? <FontAwesomeIcon icon={faMinus} />: <FontAwesomeIcon icon={faPlus} />}
                                        </Button>
                                    </div>
                                </div>
                                <div className='T1' style={{width: "100%", margin: 2}}>
                                    <div className="T2" style={{marginLeft: 10}}>
                                        <span>Twitter</span>
                                    </div>
                                    <div className="T2">
                                    </div>
                                    <div className="T2">
                                        <Button onClick={() => {this.setState({WTwi: this.state.WTwi === true ? false: true })}}>
                                        {this.state.WTwi === true ? <FontAwesomeIcon icon={faMinus} />: <FontAwesomeIcon icon={faPlus} />}
                                        </Button>
                                    </div>
                                </div>
                                <div className='T1' style={{width: "100%", margin: 2}}>
                                    <div className="T2" style={{marginLeft: 10}}>
                                        <span>Reddit</span>
                                    </div>
                                    <div className="T2">
                                    </div>
                                    <div className="T2">
                                        <Button onClick={() => {this.setState({WRed: this.state.WRed=== true ? false: true })}}>
                                        {this.state.WRed === true ? <FontAwesomeIcon icon={faMinus} />: <FontAwesomeIcon icon={faPlus} />}
                                        </Button>
                                    </div>
                                </div>
                                <div className='T1' style={{width: "100%", margin: 2}}>
                                    <div className="T2" style={{marginLeft: 10}}>
                                        <span>Refresh</span>
                                    </div>
                                    <div className="T2">
                                    <TextField style={{marginRight: 10}} onChange={this.handleChangeRefresh} value={this.state.currents}></TextField>

                                    </div>
                                    <div className="T2, Add1">
                    
                                        <div style={{flex:1}}>
                                            <Button onClick={() => {this.setState({currentCount: this.state.currents})}}>
                                            {this.state.WRed === true ? <FontAwesomeIcon icon={faCheck} />: <FontAwesomeIcon icon={faPlus} />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </div>
                            </div>
                            {this.state.WSpo === true ?
                            <div className="tet">
                                <div className='card_'>
                                    <Card style={{ flex: 1, boxShadow: "1px 1px 6px #9E9E9E", backgroundColor: "#131313"}}>
                                        <Card.Body>
                                            <Card.Title style={{textAlign: 'left', color: "#20AF43", fontWeight: 'bold', flex: 1, flexDirection: 'row', height: 30, justifyContent: "center", alignItems: "center"}}><span style={{flex: 1}}>Spotify </span>{this.state.Tlaylist != false ? <Button variant style={{ marginLeft: 20, backgroundColor: '#1E1E1E',flex: 1, maxWidth: 40, maxHeight:40, alignItems: 'right', justifyContent: 'center', textAlign:'center'}} onClick={() => {
                                                        this.setState({
                                                            Tlaylist: false
                                                        })
                                                    }}><FontAwesomeIcon icon={faArrowLeft} style={{textAlign: "center", color: "white", fontSize: 12}}></FontAwesomeIcon></Button>: <Button variant style={{backgroundColor: '#131313',flex: 1, width: 40, height:40, alignItems: 'right', justifyContent: 'center', textAlign:'center'}}></Button>}</Card.Title>   
                                        {this.state.Sco === false ? <Button variant style={{backgroundColor: "#1E1E1E", }} onClick={() => {axios.get("http://localhost:8080/spotify/login").then(data =>  {
                                            if (data.data.error === false) {
                                                console.log(data.data)
                                                window.location.href = data.data.url;
                                            }   
                                            })}}
                                                ><span style={{color: "white"}}>Connect Spotify</span></Button> : this.state.AllPlaylist !== null && this.state.Tlaylist === false ?
                                                <div className='spotify'>
                                                    <span></span>
                                                {this.state.AllPlaylist.items.map((map, i) => {
                                                    return (
                                                        <form style={{flex: 1, alignItems:'left', flexDirection: 'column', cursor: 'pointer'}} onClick={() => this.getPlaylist(map.id)}>
                                                            <div style={{marginTop: 10, textAlign: 'left'}}>
                                                                <img width={60} style={{width: 60, height: 60, marginRight: 10}} src={map.images[0].url  }></img>
                                                                <span style={{color: "white", fontWeight: "bold", fontSize:14}}>{map.name}</span>
                                                            </div>
                                                        </form>)
                                                            })}
                                                </div> : this.state.Tlaylist != false ? 
               
                                                <div className='spotify'>
                                                {this.state.Playlist.tracks.items.map((item, i) => {
                                                    return(
                                                        <form className="spotrack1" onClick={() => {this.PlayMusic(i, item)
                                                        }} style={{flex: 1, alignItems:'left', flexDirection: 'row',marginTop: 10}}>
                                                            <div>
                                                                <img width={60} style={{width: 60, height: 60, marginRight: 10}} src={item.track.album.images[0] ? item.track.album.images[0].url: ''}></img>
                                                            </div>
                                                            <div className='spotrack2'>
                                                                <span style={{color: "white", fontWeight: "bold", fontSize:14}}>{item.track.name}</span>
                                                                <div className='spotrack3'>
                                                                    {item.track.artists.map((e, i) => {
                                                                        return (
                                                                        <span style={{color: "lightgray", fontWeight: "bold", fontSize:10}}>{e.name} </span>)
                                                                })}
                                                            </div>
                                                        </div>
                                                    </form>
                                                    )}
                                                )}
                                        </div> : <span style={{color: "white"}}>Loading</span> }
                                    </Card.Body>
                                </Card>
                            </div>
                            {this.state.Sco === true ?
                            <div className='card_'>
                                <Card style={{ flex: 1, boxShadow: "1px 1px 6px #9E9E9E", backgroundColor:'#131313'}}>
                                    <Card.Body>
                                        {this.state.theMusic !== null ? 
                                        <form className="spotrack1" style={{flex: 1, alignItems:'left', flexDirection: 'row'}}>
                                            <div>
                                                <img width={60} style={{width: 60, height: 60, marginRight: 10}} src={this.state.theMusic.track.album.images[0] ? this.state.theMusic.track.album.images[0].url: ''}></img>
                                                 </div>
                                                    <div className='spotrack2'>
                                                        <span style={{color: "white", fontWeight: "bold", fontSize:14}}>{this.state.theMusic.track.name}</span>
                                                        <div className='spotrack3'>
                                                        {this.state.theMusic.track.artists.map((e, i) => {
                                                            return (
                                                                <span style={{color: "lightgray", fontWeight: "bold", fontSize:10}}>{e.name} </span>
                                                                )
                                                            }
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </form> : null}
                                    </Card.Body>
                                    <div className='dispot'>
                                        <Button variant style={{marginRight: 5, backgroundColor: '#1E1E1E'}} onClick={() => {if (this.state.iTheMusic !== null) this.PlayBeforeMusic()}}><FontAwesomeIcon icon={faStepBackward} color="#20AF43"  /></Button>
                                        <Button variant style={{margin: 5, backgroundColor: '#1E1E1E'}} onClick={() => {this.pauseSpotify()}}><FontAwesomeIcon icon={faPlayCircle} color="#20AF43" style={{fontSize: 20}}/></Button>
                                        <Button variant style={{margin: 5, backgroundColor: '#1E1E1E'}} onClick={() => {if (this.state.iTheMusic !== null) this.PlayNextMusic()}}><FontAwesomeIcon icon={faStepForward} color="#20AF43"/></Button>
                                    </div>
                                </Card>
                            </div>: null}
                            </div>
                            : null}
                            { this.state.WTwi === true ?
                            <div className='tet'>
                                <div className='card_1' style={{margin: 7}}>
                                <Card style={{ flex: 1, boxShadow: "1px 1px 6px #9E9E9E", maxHeight: 700}}>
                               
                                    <Card.Body style={{flex: 1}}>
                                    <Card.Title style={{textAlign: 'left'}}><div className="T1">
                                        <div className="T2">
                                            <span>Twitter</span>
                                        </div>
                                        <div className="T2">
                                        </div>
                                        <div className="T2">
                                        </div>
                                        </div>
                                        </Card.Title>
                                    <div className="twi">
                                        {(this.state.Tco) === true ? this.state.Ttime != null ? <div style={{flex: 1, flexDirection: "column"}}>
                                            {this.state.Ttime.json.map((item) => {
                                                return (
                                                    <div className="twitter" style={{boxShadow: "2px 2px 4px #9E9E9E", padding: 10}}>
                                                        <div style={{paddingTop: 7, marginLeft: 5}}>
                                                            <img src={item.user.profile_image_url} style={{borderRadius: 360}}></img><span style={{fontWeight: "bold", marginLeft: 10}}>{item.user.name}</span></div>
                                                        <div>
                                                            <div>
                                                                <span>{this.urlban(item.full_text)}</span>
                                                            </div>
                                                            <div className='twitterimage'>
                                                                {item.extended_entities ? item.extended_entities.media.map((items, i) => {
                                                                    return (
                                                                    <img style={{borderRadius: 5, borderWidth: 1, borderColor: 'lightgray'}} width={200} src={items.media_url}></img>
                                                                    )
                                                                }): null}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        )}
                                        </div>: <span>Loading</span> : <Button onClick={() => {
                                            axios.get("http://localhost:8080/twitter/login").then(data =>  {
                                                if (data.data.error === false) {
                                                    console.log(data.data)
                                                    window.location.href = data.data.url;
                                                }})
                                        }}>Connection Twitter</Button>}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>
                            {this.state.Tco === true ?
                            <div className='card_'>
                                <Card style={{ boxShadow: "1px 1px 6px #9E9E9E", maxWidth: 400}}>
                                {this.state.posted == true ? <Alert  variant="success" onClose={() => this.setState({posted : false})} dismissible>
                                        <Alert.Heading style={{fontSize: 17}}>Posted</Alert.Heading>
                                                </Alert> : null}
                                    <Card.Body>
                                    <div style={{flex: 1, flexDirection: "column", width: '100%'}}>
                                        <TextField style={{flex: 1, width: '100%'}} value={this.state.post} onChange={this.handleChangePost}>
                                        </TextField>
                                    </div>
                                    </Card.Body>
                                    <Button style={{}} onClick={() => {this.postPostT()}}>Post</Button>

                                </Card>
                            </div>: null}
                        </div>

                        :null}
                        </div>
                            
                        </div>

                </body>
            </div>
        );
    }
}

export default Dashboard;