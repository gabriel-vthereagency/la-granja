import { useRef, useCallback } from 'react'

const BASE = import.meta.env.BASE_URL

function playAudioSafe(audio: HTMLAudioElement) {
  audio.currentTime = 0
  audio.play().catch((e) => console.warn('[Timer] Audio play failed:', e))
}

export function useSoundEffects() {
  const elimSound1Ref = useRef<HTMLAudioElement | null>(null)
  const elimSound2Ref = useRef<HTMLAudioElement | null>(null)
  const rebuyRef = useRef<HTMLAudioElement | null>(null)
  const levelUpRef = useRef<HTMLAudioElement | null>(null)
  const nextElimSoundRef = useRef(0) // alternates 0/1

  // Lazy-init audio elements (only created once)
  const getElimSound1 = () => {
    if (!elimSound1Ref.current) {
      elimSound1Ref.current = new Audio(`${BASE}Eliminado 1.mp3`)
    }
    return elimSound1Ref.current
  }
  const getElimSound2 = () => {
    if (!elimSound2Ref.current) {
      elimSound2Ref.current = new Audio(`${BASE}Eliminado 2.mp3`)
    }
    return elimSound2Ref.current
  }
  const getRebuySound = () => {
    if (!rebuyRef.current) {
      rebuyRef.current = new Audio(`${BASE}Rebuy.mp3`)
    }
    return rebuyRef.current
  }
  const getLevelUpSound = () => {
    if (!levelUpRef.current) {
      levelUpRef.current = new Audio(`${BASE}Bling change.mp3`)
    }
    return levelUpRef.current
  }

  const playElimination = useCallback(() => {
    const sound = nextElimSoundRef.current === 0 ? getElimSound1() : getElimSound2()
    nextElimSoundRef.current = nextElimSoundRef.current === 0 ? 1 : 0
    playAudioSafe(sound)
  }, [])

  const playRebuy = useCallback(() => {
    playAudioSafe(getRebuySound())
  }, [])

  const playLevelUp = useCallback(() => {
    playAudioSafe(getLevelUpSound())
  }, [])

  return { playElimination, playRebuy, playLevelUp }
}
