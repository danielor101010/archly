import { memo } from 'react'
import type { NodeProps } from 'reactflow'
import { Search } from 'lucide-react'
import { BaseNode } from './BaseNode'
import type { SystemNodeData } from '../../../stores/graphStore'

export const SearchNode = memo((props: NodeProps<SystemNodeData>) => (
  <BaseNode {...props} icon={<Search size={14} />} accentColor="#f97316" />
))
SearchNode.displayName = 'SearchNode'
