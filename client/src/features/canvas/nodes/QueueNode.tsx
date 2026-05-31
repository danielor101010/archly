import { memo } from 'react'
import type { NodeProps } from 'reactflow'
import { Layers } from 'lucide-react'
import { BaseNode } from './BaseNode'
import type { SystemNodeData } from '../../../stores/graphStore'

export const QueueNode = memo((props: NodeProps<SystemNodeData>) => (
  <BaseNode {...props} icon={<Layers size={14} />} accentColor="#a855f7" />
))
QueueNode.displayName = 'QueueNode'
