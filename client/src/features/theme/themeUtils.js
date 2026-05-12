export const THEME_STORAGE_KEY = 'coworker_theme_preference'
export const THEME_DEFAULT_VERSION_KEY = 'coworker_theme_default_version'
export const THEME_DEFAULT_VERSION = 'light-default-2026-05'
export const THEMES = ['light', 'dark']
export const DEFAULT_THEME = 'light'

export const normalizeTheme = (theme) => (
  THEMES.includes(theme) ? theme : DEFAULT_THEME
)

export const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME
  }

  try {
    const defaultVersion = window.localStorage.getItem(THEME_DEFAULT_VERSION_KEY)

    if (defaultVersion !== THEME_DEFAULT_VERSION) {
      window.localStorage.setItem(THEME_STORAGE_KEY, DEFAULT_THEME)
      window.localStorage.setItem(THEME_DEFAULT_VERSION_KEY, THEME_DEFAULT_VERSION)
      return DEFAULT_THEME
    }

    return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY))
  } catch {
    return DEFAULT_THEME
  }
}

export const applyTheme = (theme) => {
  if (typeof document === 'undefined') {
    return
  }

  const normalizedTheme = normalizeTheme(theme)
  const root = document.documentElement

  root.classList.toggle('dark', normalizedTheme === 'dark')
  root.dataset.theme = normalizedTheme
  root.style.colorScheme = normalizedTheme
}

export const persistTheme = (theme) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, normalizeTheme(theme))
    window.localStorage.setItem(THEME_DEFAULT_VERSION_KEY, THEME_DEFAULT_VERSION)
  } catch {
    // Storage can be blocked in private mode. The in-memory theme still works.
  }
}
