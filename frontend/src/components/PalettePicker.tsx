import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Palette, Check } from 'lucide-react'
import { ACCENTS, useTheme } from '@/lib/theme'

export function PalettePicker() {
  const { accent, setAccent } = useTheme()
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label="Choose accent colour"
        className="flex size-9 items-center justify-center rounded-full text-ink-2 transition hover:bg-white/5 hover:text-ink"
      >
        <Palette className="size-[18px]" strokeWidth={1.75} />
        <span className="absolute right-1.5 bottom-1.5 size-2 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <button aria-label="Close" className="fixed inset-0 z-30 cursor-default" onClick={() => setOpen(false)} />
            <motion.div
              role="listbox" aria-label="Accent colours"
              initial={{ opacity: 0, y: -6, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -6, filter: 'blur(6px)' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 z-40 mt-2 w-56 rounded-2xl bg-raised p-2 shadow-[0_20px_60px_-20px_rgb(0_0_0/0.8)] hairline-strong"
            >
              <p className="px-2 pt-1 pb-2 text-[11px] font-medium tracking-wide text-ink-3 uppercase">Accent</p>
              <div className="grid grid-cols-6 gap-1.5 px-1 pb-1">
                {ACCENTS.map(a => (
                  <button
                    key={a.id} role="option" aria-selected={a.id === accent.id} title={a.name}
                    onClick={() => { setAccent(a.id); setOpen(false) }}
                    className="group relative flex aspect-square items-center justify-center rounded-full transition hover:scale-110"
                    style={{ background: a.hex, boxShadow: a.id === accent.id ? `0 0 0 2px var(--bg), 0 0 0 3.5px ${a.hex}, 0 6px 20px -6px ${a.hex}` : undefined }}
                  >
                    {a.id === accent.id && <Check className="size-3.5 text-black" strokeWidth={3} />}
                  </button>
                ))}
              </div>
              <p className="px-2 pt-2 pb-1 text-[12px] text-ink-3">Applied to buttons, rows, glow and the field behind the page.</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
