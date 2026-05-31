import { memo } from 'react'
import type { NodeProps } from 'reactflow'
import { Zap } from 'lucide-react'
import { BaseNode } from './BaseNode'
import type { SystemNodeData } from '../../../stores/graphStore'

export const CacheNode = memo((props: NodeProps<SystemNodeData>) => (
  <BaseNode {...props} icon={<Zap size={14} />} accentColor="#eab308" />
))
CacheNode.displayName = 'CacheNode'
