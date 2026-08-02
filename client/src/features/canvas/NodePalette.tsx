import {
  Monitor, Globe, Network, DoorOpen, Server, Zap, Layers,
  Database, Search, HardDrive, Bell, Radio, Boxes,
} from 'lucide-react'
import { useGraphStore, type NodeType } from '../../stores/graphStore'

// The palette of components a user can drop onto the canvas by clicking. Order
// roughly follows request flow (edge → compute → data → infra).
const PALETTE: Array<{ type: NodeType; label: string; icon: typeof Server }> = [
  { type: 'client',               label: 'Client',        icon: Monitor },
  { type: 'cdn',                  label: 'CDN',           icon: Globe },
  { type: 'load_balancer',        label: 'Load Bal.',     icon: Network },
  { type: 'api_gateway',          label: 'Gateway',       icon: DoorOpen },
  { type: 'api_service',          label: 'Service',       icon: Server },
  { type: 'cache',               label: 'Cache',         icon: Zap },
  { type: 'message_queue',        label: 'Queue',         icon: Layers },
  { type: 'database',            label: 'Database',      icon: Database },
  { type: 'search_cluster',       label: 'Search',        icon: Search },
  { type: 'object_storage',       label: 'Storage',       icon: HardDrive },
  { type: 'notification_service', label: 'Notify',        icon: Bell },
  { type: 'websocket_gateway',    label: 'WebSocket',     icon: Radio },
  { type: 'k8s_cluster',          label: 'K8s',           icon: Boxes },
]

const DEFAULT_LABEL: Record<NodeType, string> = {
  client: 'Client', cdn: 'CDN', load_balancer: 'Load Balancer', api_gateway: 'API Gateway',
  api_service: 'API Service', cache: 'Cache', message_queue: 'Message Queue',
  database: 'Database', search_cluster: 'Search Cluster', object_storage: 'Object Storage',
  notification_service: 'Notification Service', websocket_gateway: 'WebSocket Gateway',
  k8s_cluster: 'K8s Cluster',
}

export const NodePalette = () => {
  const addNode = useGraphStore(s => s.addNode)

  const add = (type: NodeType) => {
    addNode({ id: `${type}-${crypto.randomUUID().slice(0, 6)}`, type, label: DEFAULT_LABEL[type] })
  }

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-auto max-w-[calc(100%-24px)]">
      <div className="flex items-center gap-0.5 px-1.5 py-1 bg-card border border-white/8 rounded-xl overflow-x-auto">
        <span className="text-[10px] text-zinc-500 font-medium px-1.5 shrink-0">Add</span>
        <div className="w-px h-5 bg-white/8 shrink-0" />
        {PALETTE.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => add(type)}
            title={`Add ${DEFAULT_LABEL[type]}`}
            className="shrink-0 w-12 flex flex-col items-center gap-0.5 px-1 py-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Icon size={14} />
            <span className="text-[9px] leading-none">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
