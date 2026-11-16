import { Link } from 'react-router-dom'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/Button'
export function NotFound() {
  return (
    <PageShell className="py-24 text-center">
      <p className="display text-[5rem] leading-none font-bold text-accent">404</p>
      <p className="mt-3 text-ink-2">That page is not on the board.</p>
      <Link to="/" className="mt-6 inline-block"><Button>Back to the leaderboard</Button></Link>
    </PageShell>
  )
}
