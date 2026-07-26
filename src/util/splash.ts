declare global {
  interface Window {
    /** Installed by the inline splash script in index.html. */
    __tobuHideSplash?: () => void
  }
}

/**
 * Dismisses the cold-start splash from index.html. Deferred one frame so the
 * first React paint is on screen before the splash fades out — otherwise the
 * user sees a blank flash between the two.
 */
export function hideSplash() {
  requestAnimationFrame(() => {
    window.__tobuHideSplash?.()
  })
}
