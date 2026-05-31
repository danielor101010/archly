import type { NodeTypes } from 'reactflow'
import { SystemNode } from './SystemNode'
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

export const nodeTypes: NodeTypes = {
  systemNode: SystemNode,  // smart dispatcher — reads data.type at runtime
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
