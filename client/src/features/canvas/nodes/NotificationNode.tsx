import { memo } from 'react'
import type { NodeProps } from 'reactflow'
import { Bell } from 'lucide-react'
import { BaseNode } from './BaseNode'
import type { SystemNodeData } from '../../../stores/graphStore'

export const NotificationNode = memo((props: NodeProps<SystemNodeData>) => (
  <BaseNode {...props} icon={<Bell size={14} />} accentColor="#ec4899" />
))
NotificationNode.displayName = 'NotificationNode'
