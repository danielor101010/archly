import { memo } from 'react'
import type { NodeProps } from 'reactflow'
import { Globe } from 'lucide-react'
import { BaseNode } from './BaseNode'
import type { SystemNodeData } from '../../../stores/graphStore'

export const CDNNode = memo((props: NodeProps<SystemNodeData>) => (
  <BaseNode {...props} icon={<Globe size={14} />} accentColor="#0ea5e9" />
))
CDNNode.displayName = 'CDNNode'
