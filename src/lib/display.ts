import type { DisplayPrefs } from '../types'

export const DEFAULT_DISPLAY: DisplayPrefs = {
  textSize: 100,
  highContrast: false,
  reduceMotion: false,
  darkTheme: false,
}

/**
 * Mirrors the preferences onto <html> as data-* attributes, which index.css and the Tailwind variants key off.
 * index.html has a small inline copy of this that runs before first paint; keep the two in sync.
 */
export function applyDisplayPrefs(prefs: DisplayPrefs) {
  const root = document.documentElement
  root.dataset.textSize = String(prefs.textSize)
  setDataAttribute(root, 'contrast', prefs.highContrast ? 'more' : null)
  setDataAttribute(root, 'motion', prefs.reduceMotion ? 'reduce' : null)
  setDataAttribute(root, 'theme', prefs.darkTheme ? 'dark' : null)
}

function setDataAttribute(root: HTMLElement, key: string, value: string | null) {
  if (value === null) delete root.dataset[key]
  else root.dataset[key] = value
}
