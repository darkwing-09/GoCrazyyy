import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, type Category, type Meta, type Stats } from './api'

type Ctx = { meta: Meta | null; categories: Category[]; stats: Stats | null; refreshStats: () => void }
const C = createContext<Ctx>({ meta: null, categories: [], stats: null, refreshStats: () => {} })

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState<Meta | null>(null)
  const [categories, setCats] = useState<Category[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const refreshStats = () => { api.stats().then(setStats).catch(() => {}) }
  useEffect(() => {
    api.meta().then(setMeta).catch(() => {})
    api.categories().then(r => setCats(r.categories.map(({ slug, name, icon }) => ({ slug, name, icon })))).catch(() => {})
    refreshStats()
    const id = setInterval(refreshStats, 60_000)
    return () => clearInterval(id)
  }, [])
  return <C.Provider value={{ meta, categories, stats, refreshStats }}>{children}</C.Provider>
}
export const useAppData = () => useContext(C)
