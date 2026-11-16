import { Sun, Moon } from 'lucide-react'
import { motion } from 'motion/react'
import { useTheme } from '@/lib/theme'

export function PalettePicker() {
  const { mode, setMode } = useTheme()

  const toggle = () => {
    setMode(mode === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
      title={`Theme: #38bdf8 · Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
      className="group relative flex size-9 items-center justify-center rounded-full text-ink-2 transition hover:bg-accent-subtle hover:text-ink cursor-pointer outline-none"
    >
      <motion.div
        key={mode}
        initial={{ rotate: -30, opacity: 0, scale: 0.8 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 30, opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.25 }}
      >
        {mode === 'dark' ? (
          <Sun className="size-[18px] text-ink-2 transition-colors group-hover:text-accent" strokeWidth={1.75} />
        ) : (
          <Moon className="size-[18px] text-ink-2 transition-colors group-hover:text-accent" strokeWidth={1.75} />
        )}
      </motion.div>
      {/* Permanent #38bdf8 brand glow dot */}
      <span
        className="absolute right-1.5 bottom-1.5 size-2 rounded-full shadow-[0_0_8px_#38bdf8] transition-transform duration-300 group-hover:scale-125"
        style={{ backgroundColor: '#38bdf8' }}
      />
    </button>
  )
}
