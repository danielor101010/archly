import { memo } from 'react'
import type { NodeProps } from 'reactflow'
import { Server } from 'lucide-react'
import { BaseNode } from './BaseNode'
import type { SystemNodeData } from '../../../stores/graphStore'

export const LoadBalancerNode = memo((props: NodeProps<SystemNodeData>) => (
  <BaseNode {...props} icon={<Server size={14} />} accentColor="#3b82f6" />
))
LoadBalancerNode.displayName = 'LoadBalancerNode'
