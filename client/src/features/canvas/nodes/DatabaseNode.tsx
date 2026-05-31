import { memo } from 'react'
import type { NodeProps } from 'reactflow'
import { Database } from 'lucide-react'
import { BaseNode } from './BaseNode'
import type { SystemNodeData } from '../../../stores/graphStore'

export const DatabaseNode = memo((props: NodeProps<SystemNodeData>) => (
  <BaseNode {...props} icon={<Database size={14} />} accentColor="#22c55e" />
))
DatabaseNode.displayName = 'DatabaseNode'
