import { Howl } from 'howler'
import { usePlayerStore } from '../store/playerStore'

let howl = null
let progressInterval = null

function setupMediaSession(surah) {
  if (!('mediaSession' in navigator) || !surah) return
  const name = surah.name_en || surah.name_ar
  navigator.mediaSession.metadata = new MediaMetadata({
    title: `Surah ${name}`,
    artist: 'Ahmed Abdelrazek Nasr',
    album: 'Quran Audio',
  })
  navigator.mediaSession.setActionHandler('play', () => usePlayerStore.getState().setIsPlaying(true))
  navigator.mediaSession.setActionHandler('pause', () => usePlayerStore.getState().setIsPlaying(false))
  navigator.mediaSession.setActionHandler('previoustrack', () => {
    const state = usePlayerStore.getState()
    const surahs = window.__surahs || []
    const idx = surahs.findIndex((s) => s.id === state.currentSurah?.id)
    if (idx > 0 && window.__onNavigate) window.__onNavigate(surahs[idx - 1])
  })
  navigator.mediaSession.setActionHandler('nexttrack', () => {
    const state = usePlayerStore.getState()
    const surahs = window.__surahs || []
    const idx = surahs.findIndex((s) => s.id === state.currentSurah?.id)
    if (idx < surahs.length - 1 && window.__onNavigate) window.__onNavigate(surahs[idx + 1])
  })
}

export function playAudio(url, surah) {
  const store = usePlayerStore.getState()

  if (howl) {
    howl.unload()
    clearInterval(progressInterval)
  }

  howl = new Howl({
    src: [url],
    html5: true,
    volume: store.volume,
    rate: store.playbackRate,
    onload: () => {
      if (howl) store.setDuration(howl.duration())
    },
    onplay: () => store.setIsPlaying(true),
    onpause: () => store.setIsPlaying(false),
    onstop: () => store.setIsPlaying(false),
    onend: () => store.setIsPlaying(false),
  })

  howl.play()
  setupMediaSession(surah)

  progressInterval = setInterval(() => {
    if (howl && howl.playing()) {
      store.setProgress(howl.seek())
    }
  }, 250)
}

export function togglePlay(playing) {
  if (!howl) return
  if (playing) {
    howl.play()
  } else {
    howl.pause()
  }
}

export function seekTo(sec) {
  if (howl) {
    howl.seek(sec)
    usePlayerStore.getState().setProgress(sec)
  }
}

export function updateVolume(vol) {
  if (howl) howl.volume(vol)
}

export function updateRate(rate) {
  if (howl) howl.rate(rate)
}

export function stopAudio() {
  if (howl) {
    howl.unload()
    howl = null
  }
  clearInterval(progressInterval)
}
