/** Speak Japanese text via browser SpeechSynthesisUtterance (same approach as mobile TTS fallback). */
export function speakJapanese(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text.trim()) {
    return
  }
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text.trim())
  utterance.lang = 'ja-JP'
  utterance.rate = 0.85

  const jaVoice = window.speechSynthesis
    .getVoices()
    .find((v) => v.lang.toLowerCase().startsWith('ja'))
  if (jaVoice) {
    utterance.voice = jaVoice
  }

  window.speechSynthesis.speak(utterance)
}
