import {
  Backpack, BarChart3, Bitcoin, Bot, Briefcase, Building2, Code2, Gamepad2, Globe, GraduationCap, HeartPulse, Home,
  IndianRupee, Kanban, ListChecks, MapPin, Megaphone, Mic, Palette, PenLine, Rocket, Scale, Search, Share2, ShieldCheck,
  ShoppingBag, Sparkles, Target, Trophy, UserRound, WandSparkles, type LucideIcon,
} from 'lucide-react'

/** Category icons by lucide name, as stored in categories.icon. Static imports keep the bundle to these 30 icons. */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  bot: Bot, search: Search, megaphone: Megaphone, 'bar-chart-3': BarChart3, bitcoin: Bitcoin, 'code-2': Code2,
  scale: Scale, 'shield-check': ShieldCheck, 'heart-pulse': HeartPulse, 'share-2': Share2, trophy: Trophy,
  briefcase: Briefcase, 'graduation-cap': GraduationCap, 'building-2': Building2, 'shopping-bag': ShoppingBag,
  globe: Globe, 'gamepad-2': Gamepad2, 'user-round': UserRound, 'list-checks': ListChecks, kanban: Kanban,
  palette: Palette, 'pen-line': PenLine, rocket: Rocket, 'wand-sparkles': WandSparkles, mic: Mic, target: Target,
  'map-pin': MapPin, home: Home, backpack: Backpack, 'indian-rupee': IndianRupee,
}

export function CatIcon({ name, className = 'size-4' }: { name: string; className?: string }) {
  const Icon = CATEGORY_ICONS[name] ?? Sparkles
  return <Icon className={className} strokeWidth={1.75} aria-hidden />
}

export function LinkedInIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  )
}

export function XIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}
