import { Link } from 'react-router-dom'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 ${className}`} aria-label="GoCrazy home">
      <svg viewBox="0 0 64 64" className="size-6" aria-hidden>
        <rect width="64" height="64" rx="14" fill="var(--raised)" />
        <path d="M14 44h8V26h-8zM28 44h8V16h-8zM42 44h8V32h-8z" fill="var(--accent)" />
      </svg>
      <span className="display text-[1.1rem] font-bold tracking-tight">GoCrazy</span>
    </Link>
  )
}
