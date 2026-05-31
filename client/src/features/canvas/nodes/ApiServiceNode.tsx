import { memo } from 'react'
import type { NodeProps } from 'reactflow'
import { Cpu } from 'lucide-react'
import { BaseNode } from './BaseNode'
import type { SystemNodeData } from '../../../stores/graphStore'

export const ApiServiceNode = memo((props: NodeProps<SystemNodeData>) => (
  <BaseNode {...props} icon={<Cpu size={14} />} accentColor="#6366f1" />
))
ApiServiceNode.displayName = 'ApiServiceNode'
