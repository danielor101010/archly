import { useBoardStore } from '../../stores/boardStore'

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-green-400 bg-green-500/10 border-green-500/20',
  POST: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  PUT: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  DELETE: 'text-red-400 bg-red-500/10 border-red-500/20',
  PATCH: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
}

export const InterviewBoard = () => {
  const { requirements, endpoints, models } = useBoardStore()
  const frs = requirements.filter(r => r.type === 'FR')
  const nfrs = requirements.filter(r => r.type === 'NFR')
  const isEmpty = requirements.length === 0 && endpoints.length === 0 && models.length === 0

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-600 text-xs">
        Board fills in as you confirm requirements, API endpoints, and data models.
      </div>
    )
  }

  return (
    <div className="flex gap-0 h-full overflow-hidden text-xs">
      {/* Requirements */}
      <div className="flex-1 border-r border-white/8 overflow-y-auto p-3 min-w-0">
        <div className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px] mb-2">Requirements</div>
        {frs.length > 0 && (
          <div className="mb-3">
            <div className="text-zinc-600 text-[10px] mb-1">Functional</div>
            {frs.map(r => (
              <div key={r.id} className="flex items-start gap-1.5 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1 shrink-0" />
                <span className="text-zinc-300 leading-snug">{r.text}</span>
              </div>
            ))}
          </div>
        )}
        {nfrs.length > 0 && (
          <div>
            <div className="text-zinc-600 text-[10px] mb-1">Non-Functional</div>
            {nfrs.map(r => (
              <div key={r.id} className="flex items-start gap-1.5 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                <span className="text-zinc-300 leading-snug">{r.text}</span>
              </div>
            ))}
          </div>
        )}
        {requirements.length === 0 && <div className="text-zinc-700 italic">Not defined yet</div>}
      </div>

      {/* API Endpoints */}
      <div className="flex-1 border-r border-white/8 overflow-y-auto p-3 min-w-0">
        <div className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px] mb-2">API Endpoints</div>
        {endpoints.map(e => (
          <div key={e.id} className="mb-2">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${METHOD_COLORS[e.method] ?? 'text-zinc-400 bg-white/5 border-white/10'}`}>
                {e.method}
              </span>
              <span className="text-zinc-200 font-mono">{e.path}</span>
            </div>
            {e.desc && <div className="text-zinc-500 pl-1 leading-snug">{e.desc}</div>}
          </div>
        ))}
        {endpoints.length === 0 && <div className="text-zinc-700 italic">Not defined yet</div>}
      </div>

      {/* Data Models */}
      <div className="flex-1 overflow-y-auto p-3 min-w-0">
        <div className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px] mb-2">Data Models</div>
        {models.map(m => (
          <div key={m.id} className="mb-3">
            <div className="text-indigo-400 font-semibold mb-1">{m.name}</div>
            <div className="text-zinc-500 font-mono leading-relaxed">
              {m.fields.split(',').map((f, i) => (
                <div key={i} className="truncate">{f.trim()}</div>
              ))}
            </div>
          </div>
        ))}
        {models.length === 0 && <div className="text-zinc-700 italic">Not defined yet</div>}
      </div>
    </div>
  )
}
