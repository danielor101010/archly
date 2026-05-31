import { memo } from 'react'
import type { NodeProps } from 'reactflow'
import { HardDrive } from 'lucide-react'
import { BaseNode } from './BaseNode'
import type { SystemNodeData } from '../../../stores/graphStore'

export const ObjectStorageNode = memo((props: NodeProps<SystemNodeData>) => (
  <BaseNode {...props} icon={<HardDrive size={14} />} accentColor="#14b8a6" />
))
ObjectStorageNode.displayName = 'ObjectStorageNode'
