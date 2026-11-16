import { DynamicIcon, type IconName } from 'lucide-react/dynamic'

export function CatIcon({ name, className = 'size-4' }: { name: string; className?: string }) {
  return <DynamicIcon name={name as IconName} className={className} strokeWidth={1.75} aria-hidden />
}
