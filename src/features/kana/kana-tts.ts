/** Speak a Japanese character via the browser Speech Synthesis API. */
export function speakKana(text: string, voiceURI?: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text.trim()) {
    return
  }
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text.trim())
  utterance.lang = 'ja-JP'
  utterance.rate = 0.85
  if (voiceURI) {
    const voice = window.speechSynthesis.getVoices().find((v) => v.voiceURI === voiceURI)
    if (voice) utterance.voice = voice
  }
  window.speechSynthesis.speak(utterance)
}

export function listJapaneseVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return []
  }
  return window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('ja'))
}
