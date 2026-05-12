import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../features/theme/themeSlice'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle({ className = '', showLabel = false }) {
  const dispatch = useDispatch()
  const theme = useSelector((state) => state.theme.mode)

  const handleToggle = () => {
    dispatch(toggleTheme())
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={theme === 'dark'}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      className={`
        relative flex items-center justify-center
        ${showLabel ? 'w-auto px-3' : 'w-9'} h-9 rounded-xl
        transition-all duration-200
        text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-cyan-400
        hover:bg-blue-50 dark:hover:bg-slate-800
        border border-transparent hover:border-blue-200 dark:hover:border-slate-700
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-cyan-400
        ${className}
      `}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <Sun className="w-5 h-5" strokeWidth={2} />
      ) : (
        <Moon className="w-5 h-5" strokeWidth={2} />
      )}
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {theme === 'light' ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  )
}
