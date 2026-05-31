import { memo } from 'react'
import type { NodeProps } from 'reactflow'
import { Radio } from 'lucide-react'
import { BaseNode } from './BaseNode'
import type { SystemNodeData } from '../../../stores/graphStore'

export const WebSocketGatewayNode = memo((props: NodeProps<SystemNodeData>) => (
  <BaseNode {...props} icon={<Radio size={14} />} accentColor="#06b6d4" />
))
WebSocketGatewayNode.displayName = 'WebSocketGatewayNode'
