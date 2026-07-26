/** Speak a Japanese character via the browser Speech Synthesis API matching mobile ja-JP default. */
export function speakKana(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text.trim()) {
    return
  }
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text.trim())
  utterance.lang = 'ja-JP'
  utterance.rate = 0.85
  
  // Pick default ja-JP system voice
  const jaVoice = window.speechSynthesis
    .getVoices()
    .find((v) => v.lang.toLowerCase().startsWith('ja'))
  if (jaVoice) {
    utterance.voice = jaVoice
  }
  
  window.speechSynthesis.speak(utterance)
}
