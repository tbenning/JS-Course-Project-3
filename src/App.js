import React, { Component } from 'react'
import './App.css'
import styled from 'styled-components'
import queryString from 'query-string'
//import { access } from 'fs'

const Button = styled.button`
  padding: 20px;
`

const Wrapper = styled.div`
  max-width: 1024px;
  margin: 0 auto;
  background: #f7f7f7;
  padding: 40px;
`

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      token: '',
      loggedIn: false,
      username: '',
      topTracks: [],
      topTracksMed: [],
      recentlyPlayed: [],
    }
  }

  componentDidMount() {
    let parsed = queryString.parse(window.location.search)
    //console.log(parsed)
    let accessToken = parsed.access_token
    this.setState({ token: accessToken })
    console.log(accessToken)

    if (!accessToken) return
    this.getUserData(accessToken)
    this.getTopTracksData(accessToken, 'short_term')
    this.getTopTracksDataMed(accessToken, 'medium_term')
    this.getRecentlyPlayed(accessToken)
  }

  getUserData(accessToken) {
    //fetch some data and add it to our state
    fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: 'Bearer ' + accessToken },
    })
      .then(response => response.json())
      .then(data =>
        this.setState({
          //token: accessToken,
          username: data.display_name,
        })
      )
  }

  getRecentlyPlayed(accessToken) {
    fetch('https://api.spotify.com/v1/me/player/recently-played', {
      headers: { Authorization: 'Bearer ' + accessToken },
    })
      .then(response => response.json())
      .then(data => this.setState({ recentlyPlayed: data.items }))
  }

  getTopTracksData(accessToken, timeRange) {
    fetch(
      `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=15`,
      {
        headers: { Authorization: 'Bearer ' + accessToken },
      }
    )
      .then(response => response.json())
      .then(data => this.setState({ topTracks: data.items }))
  }

  getTopTracksDataMed(accessToken, timeRange) {
    fetch(
      `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=15`,
      {
        headers: { Authorization: 'Bearer ' + accessToken },
      }
    )
      .then(response => response.json())
      .then(data => this.setState({ topTracksMed: data.items }))
  }

  signOut() {
    console.log('stuff')
  }

  render() {
    const { token, loggedIn, username } = this.state

    const topTracks = this.state.topTracks
    const topTracksMed = this.state.topTracksMed
    const recentlyPlayed = this.state.recentlyPlayed

    return (
      <div className="App">
        <Wrapper>
          <div className="app-header">
            <h1>{username} Spotify</h1>
          </div>
          {username ? (
            <div>
              <h3>My Username is: {username}</h3>

              <h4>Most Played Past few</h4>
              <ol className="text-left">
                {topTracksMed.map(track => (
                  <li>{track.name}</li>
                ))}
              </ol>

              <h4>Most Played This Month</h4>
              <ol className="text-left">
                {topTracks.map(track => (
                  <li>{track.name}</li>
                ))}
              </ol>

              <h4>Recently Played</h4>
              <ol className="text-left">
                {recentlyPlayed.map(track => (
                  <li>
                    {track.track.name} -{' '}
                    {track.track.artists.map(artist => artist.name + ' ')}
                  </li>
                ))}
              </ol>

              <Button onClick={this.signOut}>Log Out</Button>
            </div>
          ) : (
            <div>
              <Button
                type="submit"
                onClick={() =>
                  (window.location = 'http://localhost:8888/login')
                }>
                Login ur stuff
              </Button>
            </div>
          )}
        </Wrapper>
      </div>
    )
  }
}

export default App
