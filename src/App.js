import React, { Component } from 'react'
import './App.css'
import styled from 'styled-components'
import queryString from 'query-string'
import { access } from 'fs'

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
    this.getTopTracksData(accessToken)
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

  getTopTracksData(accessToken) {
    fetch(
      'https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=15',
      {
        headers: { Authorization: 'Bearer ' + accessToken },
      }
    )
      .then(response => response.json())
      .then(data => this.setState({ topTracks: data.items }))
  }

  signOut() {
    console.log('stuff')
  }

  render() {
    const { token, loggedIn, username } = this.state

    const topTracks = this.state.topTracks
    return (
      <div className="App">
        <Wrapper>
          <div className="app-header">
            <h1>{username} Spotify</h1>
          </div>
          {username ? (
            <div>
              <h1>My Username is: {username}</h1>
              <ol>
                {topTracks.map(track => (
                  <li>{track.name}</li>
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
                }
              >
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
