import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { LayoutGrid, Compass } from 'lucide-react'
import { CatIcon } from './Icon'
import { useAppData } from '@/lib/app-data'

export function CategoryRail({ active, suffix = '' }: { active: string | null; suffix?: string }) {
  const { categories } = useAppData()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>('[data-active="true"]')
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [active, categories.length])
  const chip = (to: string, label: string, icon: React.ReactNode, isActive: boolean) => (
    <Link key={to} to={to} data-active={isActive} aria-current={isActive ? 'page' : undefined}
      className={clsx('flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium whitespace-nowrap transition-colors duration-300',
        isActive ? 'bg-accent text-accent-ink shadow-[var(--accent-glow)]' : 'text-ink-2 hover:bg-white/5 hover:text-ink')}>
      {icon}{label}
    </Link>
  )
  return (
    <div className="relative mt-4">
      <div ref={ref} className="flex gap-1 overflow-x-auto rounded-full bg-surface p-1 hairline [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chip(`/${suffix}`.replace(/\/$/, '') || '/', 'All', <LayoutGrid className="size-3.5" strokeWidth={1.75} />, active === null)}
        {categories.map(c => chip(`/category/${c.slug}${suffix ? '/' + suffix : ''}`, c.name.split(' & ')[0].split(',')[0], <CatIcon name={c.icon} className="size-3.5" />, active === c.slug))}
        <Link to="/categories" className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium text-accent hover:bg-accent-12"><Compass className="size-3.5" strokeWidth={1.75} />Explore</Link>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 rounded-r-full bg-gradient-to-l from-bg to-transparent" />
    </div>
  )
}
