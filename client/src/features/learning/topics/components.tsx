import type { ReactNode } from 'react'

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div>
    <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/8">{title}</h2>
    {children}
  </div>
)

export const Callout = ({ type, children }: { type: 'insight' | 'failure'; children: ReactNode }) => (
  <div className={`rounded-xl p-4 border text-sm leading-relaxed mt-3 ${
    type === 'insight'
      ? 'bg-indigo-500/8 border-indigo-500/20 text-indigo-200'
      : 'bg-red-500/8 border-red-500/20 text-red-200'
  }`}>
    <span className="font-semibold mr-1">{type === 'insight' ? '💡 Interview Insight:' : '🔥 Failure Scenario:'}</span>
    {children}
  </div>
)

export const CodeBlock = ({ children }: { children: ReactNode }) => (
  <pre className="mt-3 bg-page border border-white/8 rounded-xl p-4 overflow-x-auto text-xs text-zinc-300 font-mono leading-relaxed">
    {children}
  </pre>
)

export const TradeoffTable = ({ rows }: { rows: { name: string; pro: string; con: string; use: string }[] }) => (
  <div className="overflow-hidden rounded-xl border border-white/8">
    <table className="w-full text-xs">
      <thead>
        <tr className="bg-white/5 text-zinc-400">
          <th className="px-3 py-2 text-left font-medium">Algorithm</th>
          <th className="px-3 py-2 text-left font-medium">Advantage</th>
          <th className="px-3 py-2 text-left font-medium">Disadvantage</th>
          <th className="px-3 py-2 text-left font-medium">Best For</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={row.name} className={i % 2 === 0 ? 'bg-card' : 'bg-card'}>
            <td className="px-3 py-2.5 text-white font-medium">{row.name}</td>
            <td className="px-3 py-2.5 text-green-400">{row.pro}</td>
            <td className="px-3 py-2.5 text-red-400">{row.con}</td>
            <td className="px-3 py-2.5 text-zinc-400">{row.use}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
