import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './index.css'
import './App.css'
import { PIXABAY_API_URL, PIXABAY_API_KEY, FREESOUND_API_URL, FREESOUND_API_KEY } from '../config'

export const pixabayApi = query => `${PIXABAY_API_URL}?key=${PIXABAY_API_KEY}&q=${query}&image_type=photo`
export const freesoundApi = query =>`${FREESOUND_API_URL}?query=${query}&token=${FREESOUND_API_KEY}
&normalized=true&fields=previews,description&sort=downloads_desc&filter=duration:[1 TO 5]`

const App = () => {
  const [ pictures, setPictures ] = useState([])
  const [ sounds, setSounds ] = useState([])
  const [ query, setQuery ] = useState('cats')
  const [ tags, setTags ] = useState([])

  if (!JSON.parse(localStorage.getItem('data'))) {
    localStorage.setItem('data', JSON.stringify({}))
  }

  let sound = null

  const getPictures = async (query) => {
    const data = JSON.parse(localStorage.getItem('data'))

    if (!data[query]) {
      const response = await axios.get(pixabayApi(query))
      const pictures = response.data.hits

      data[query] = pictures
      localStorage.setItem('data', JSON.stringify(data))
      setPictures(pictures)
    } else {
      setPictures(data[query])
    }
  }

  const getSounds = async (query) => {
    const response = await axios.get(freesoundApi(query))
    const sounds = response.data.results
    //console.log(sounds)
    setSounds(sounds)
    playAudio(sounds[0].previews['preview-lq-mp3'])
  }

  const togglePicture = id => {
    const newPictures = [...pictures]
    newPictures[id].showImage = !newPictures[id].showImage
    setPictures(newPictures)
  }

  const playAudio = fileName => {
    if(sound) {
      sound.pause()
    }
    sound = new Audio(fileName)
    sound.play()
  }

  const onSubmit = event => {
    event.preventDefault()
    tags.unshift(query)
    setTags(tags)
    getPictures(query)
  }

  const onChange = event => {
    setQuery(event.target.value)
  }

  return (
    <div className="App">
      <form onSubmit={onSubmit} className="Search-form">
        <input
          name="searchQuery"
          type="text"
          className="Search-input"
          placeholder="Search for pictures"
          autoComplete="off"
          onChange={onChange}
          value={query}
        />
        <button className="Search-button">
          Search
        </button>
      </form>
      <div className="App-tags">
        {tags.length !== 0 && <div className="App-tags-label">Recent</div>}
        {tags.map((tag) => (
          <div className="App-tags-item" key={tag} onClick={() => { getPictures(tag) }}>
            { tag }
          </div>
        ))}
      </div>
      <div className="App-picture-items-holder">
      {pictures.length !== 0 && <div className="App-picture-items">
          {pictures.map((picture, index) => (
            <div className="App-picture-item" key={picture.id} onClick={() => { getSounds(query) }}>
              {!picture.showImage && <img
                src={picture.webformatURL}
                alt={picture.tags}
                className="App-picture-item-image"
              />}

              {picture.showImage && <h2 className="App-picture-item-title">{picture.tags}</h2>}

              {picture.showImage && <div>
                <button
                  name={index}
                  type="submit"
                  className="Search-button"
                  onClick={() => togglePicture(index)}
                >
                  {picture.showImage ? 'Hide' : 'Show' } Image
                </button>
              </div>}
            </div>
          ))}
        </div>}
      </div>
    </div>
  );
}

export default App