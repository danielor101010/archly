import { Clock } from 'lucide-react'
import type { SessionRecord } from '../../stores/userStore'
import { SessionCard } from './SessionCard'

export function RecentSessions({ sessions }: { sessions: SessionRecord[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Clock size={13} className="text-text-subtle" />
        <h2 className="text-sm font-semibold text-text-primary">Recent Sessions</h2>
      </div>
      <div className="flex flex-col gap-3">
        {sessions.slice(0, 5).map(r => <SessionCard key={r.id} record={r} />)}
      </div>
    </div>
  )
}
