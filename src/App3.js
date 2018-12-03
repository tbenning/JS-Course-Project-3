import React, { Component } from 'react'
import './App.css'
import styled from 'styled-components'
import queryString from 'query-string'

const Button = styled.button`
  padding: 20px;
`

const Wrapper = styled.div`
  max-width: 1024px;
  margin: 0 auto;
`

const Form = styled.form`
  max-width: 600px;
  margin: 0 auto;
`

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      token: '',
      deviceId: '',
      loggedIn: false,
      shuffle: false,
      error: '',
      trackName: 'Track Name',
      artistName: 'Artist Name',
      albumName: 'Album Name',
      playing: false,
      position: 0,
      duration: 1,
      serverData: {},
    }
    //Check player
    this.playerCheckInterval = null
  }

  // Method to handle login when we click "go"
  handleLogin() {
    if (this.state.token !== '') {
      this.setState({ loggedIn: true })
      // check for the player every second
      this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000)
    }
  }

  //component mounting --> get the token from widndow
  componentDidMount() {
    let parsed = queryString.parse(window.location.search)
    //console.log(parsed)
    let accessToken = parsed.access_token
    console.log(accessToken)
    //this.state ({loggedIn: true}
    //this.setState.token = accessToken
    // Fetch sum stuff

    fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: 'Bearer ' + accessToken },
    })
      .then(response => response.json())
      .then(data =>
        this.setState({
          token: accessToken,
          user: {
            name: data.display_name,
          },
        })
      )
    //.then(this.checkForPlayer)
    //this.transferPlaybackHere
  }

  onStateChanged(state) {
    // if we're no longer listening to music, we'll get a null state, otherwise
    if (state !== null) {
      const {
        current_track: currentTrack,
        position,
        duration,
      } = state.track_window
      const trackName = currentTrack.name
      const albumName = currentTrack.album.name

      //Formatting the object into something readable by mapping and joining it
      const artistName = currentTrack.artists
        .map(artist => artist.name)
        .join(', ')

      const playing = !state.paused
      this.setState({
        position,
        duration,
        trackName,
        albumName,
        artistName,
        playing,
      })
    }
  }

  // stuff handle the player's states
  createEventHandlers() {
    //This data for error handling comes from:
    //https://developer.spotify.com/documentation/web-playback-sdk/quick-start/
    this.player.on('initialization_error', e => {
      console.error(e)
    })
    this.player.on('authentication_error', e => {
      console.error(e)
      this.setState({ loggedIn: false })
    })
    this.player.on('account_error', e => {
      console.error(e)
    })

    //Get playback status updates
    this.player.on('player_state_changed', state => {
      console.log(state)
    })

    // Call our new method
    this.player.on('player_state_changed', state => this.onStateChanged(state))

    //ready
    //Need to add async and await calls, since we need to grab the transfer playback
    this.player.on('ready', async data => {
      let { device_id } = data
      await this.setState({ deviceId: device_id })
      this.transferPlaybackHere()
    })
  }

  //check to see if there is a player
  checkForPlayer() {
    const { token } = this.state
    if (window.Spotify !== null) {
      // cancel the interval
      clearInterval(this.playerCheckInterval)

      this.player = new window.Spotify.Player({
        name: "Tyler's Spotify Player",
        getOAuthToken: cb => {
          cb(token)
        },
      })

      // Create out Event Handlers
      this.createEventHandlers()

      // finally, connect!
      this.player.connect()
    }
  }

  onPrevClick() {
    this.player.previousTrack()
  }

  onPlayClick() {
    this.player.togglePlay()
  }

  onNextClick() {
    this.player.nextTrack()
  }

  onShuffleClick() {
    //set state to shuffle true
    this.player.nextTrack()
    // set shuffle back to false
  }

  // Transfer the playback. This means you dont have to go into your spotfy app somewhere and switch over the playback method. It happens automagically
  // This is the method we'll use to make it happen
  transferPlaybackHere() {
    console.log('transfer playback worked')
    const { deviceId, token } = this.state
    fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        device_ids: [deviceId],
        play: true,
      }),
    })
  }

  render() {
    // Make the state props = some variables we can use
    const {
      token,
      loggedIn,
      artistName,
      trackName,
      albumName,
      error,
      position,
      duration,
      playing,
    } = this.state

    return (
      <div className="App">
        <Wrapper>
          <div className="app-header">
            <h1>Spotify</h1>
          </div>
          {error && <p>Error: {error}</p>}

          {loggedIn ? (
            <div>
              <h1>User: {this.state.user.name}</h1>
              <p>Artist: {artistName}</p>
              <p>Track: {trackName}</p>
              <p>Album: {albumName}</p>
              <Button onClick={() => this.onPrevClick()}>Previous</Button>
              <Button onClick={() => this.onPlayClick()}>
                {playing ? 'Pause' : 'Play'}
              </Button>
              <Button onClick={() => this.onNextClick()}>Next</Button>
            </div>
          ) : (
            <div>
              <p>Log In to Spotify</p>
              <a
                href="https://beta.developer.spotify.com/documentation/web-playback-sdk/quick-start/#authenticating-with-spotify"
                target="_blank"
              >
                {' '}
                Get auth{' '}
              </a>
              <Form>
                <input
                  type="text"
                  //value={token}
                  //onChange={e => this.setState({ token: e.target.value })}
                />
              </Form>
              <a href="http://localhost:8888/login">Authenticate ur stuff</a>
            </div>
          )}
        </Wrapper>
      </div>
    )
  }
}

export default App
