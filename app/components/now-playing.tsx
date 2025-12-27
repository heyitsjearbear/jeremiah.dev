import NowPlayingClient from './now-playing-client'
import {getRandomSongs, type Song} from '@/app/lib/sanity'

export default async function NowPlaying() {
  let songs: Song[] = []

  try {
    songs = await getRandomSongs()
  } catch (error) {
    console.warn('Failed to load now playing songs from Sanity.', error)
  }

  return <NowPlayingClient initialSongs={songs} />
}
