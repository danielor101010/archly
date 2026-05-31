import { memo } from 'react'
import type { NodeProps } from 'reactflow'
import { Shield } from 'lucide-react'
import { BaseNode } from './BaseNode'
import type { SystemNodeData } from '../../../stores/graphStore'

export const ApiGatewayNode = memo((props: NodeProps<SystemNodeData>) => (
  <BaseNode {...props} icon={<Shield size={14} />} accentColor="#8b5cf6" />
))
ApiGatewayNode.displayName = 'ApiGatewayNode'
