import { memo } from 'react'
import type { NodeProps } from 'reactflow'
import type { SystemNodeData } from '../../../stores/graphStore'
import { LoadBalancerNode } from './LoadBalancerNode'
import { DatabaseNode } from './DatabaseNode'
import { CacheNode } from './CacheNode'
import { ApiGatewayNode } from './ApiGatewayNode'
import { ApiServiceNode } from './ApiServiceNode'
import { QueueNode } from './QueueNode'
import { CDNNode } from './CDNNode'
import { ClientNode } from './ClientNode'
import { NotificationNode } from './NotificationNode'
import { SearchNode } from './SearchNode'
import { ObjectStorageNode } from './ObjectStorageNode'
import { WebSocketGatewayNode } from './WebSocketGatewayNode'
import { K8sClusterNode } from './K8sClusterNode'

// Maps data.type to the correct node component
const nodeComponentMap: Record<string, React.ComponentType<NodeProps<SystemNodeData>>> = {
  load_balancer: LoadBalancerNode,
  database: DatabaseNode,
  cache: CacheNode,
  api_gateway: ApiGatewayNode,
  api_service: ApiServiceNode,
  message_queue: QueueNode,
  cdn: CDNNode,
  client: ClientNode,
  notification_service: NotificationNode,
  search_cluster: SearchNode,
  object_storage: ObjectStorageNode,
  websocket_gateway: WebSocketGatewayNode,
  k8s_cluster: K8sClusterNode,
}

/**
 * Smart dispatcher node for when the React Flow node type is 'systemNode'.
 * Reads data.type and renders the correct typed component.
 */
export const SystemNode = memo((props: NodeProps<SystemNodeData>) => {
  const Component = nodeComponentMap[props.data.type] ?? ApiServiceNode
  return <Component {...props} />
})

SystemNode.displayName = 'SystemNode'
