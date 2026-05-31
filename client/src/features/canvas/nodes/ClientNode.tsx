import { memo } from 'react'
import type { NodeProps } from 'reactflow'
import { Monitor } from 'lucide-react'
import { BaseNode } from './BaseNode'
import type { SystemNodeData } from '../../../stores/graphStore'

export const ClientNode = memo((props: NodeProps<SystemNodeData>) => (
  <BaseNode {...props} icon={<Monitor size={14} />} accentColor="#94a3b8" />
))
ClientNode.displayName = 'ClientNode'
