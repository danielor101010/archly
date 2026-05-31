export interface NodeDoc {
  title: string
  description: string
  docLinks: { label: string; url: string }[]
}

export const NODE_DOCS: Record<string, NodeDoc> = {
  client: {
    title: 'Client',
    description: 'The client is the end-user application — a browser, mobile app, or desktop program — that initiates requests to your system. Clients communicate over HTTP/HTTPS and must handle latency, retries, and offline states gracefully. Optimizing what the client caches and prefetches is critical for perceived performance.',
    docLinks: [
      { label: 'MDN: HTTP Overview', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP' },
      { label: 'web.dev: Performance', url: 'https://web.dev/performance' },
    ],
  },
  cdn: {
    title: 'CDN (Content Delivery Network)',
    description: 'A CDN is a globally distributed network of edge servers that cache static assets — images, JS, CSS, and videos — close to end users. By serving content from a nearby PoP (point of presence), CDNs dramatically reduce latency and offload origin servers. They also provide DDoS protection and TLS termination at the edge.',
    docLinks: [
      { label: 'Cloudflare Docs', url: 'https://developers.cloudflare.com' },
      { label: 'AWS CloudFront', url: 'https://aws.amazon.com/cloudfront' },
    ],
  },
  load_balancer: {
    title: 'Load Balancer',
    description: 'A load balancer distributes incoming traffic across multiple backend instances using strategies like round-robin, least-connections, or IP hash. It provides horizontal scalability, health checking, and zero-downtime deployments via rolling updates. Layer-7 load balancers can route based on URL paths or headers, enabling canary releases and A/B testing.',
    docLinks: [
      { label: 'nginx Docs', url: 'https://nginx.org/en/docs' },
      { label: 'AWS Elastic Load Balancing', url: 'https://aws.amazon.com/elasticloadbalancing' },
    ],
  },
  api_gateway: {
    title: 'API Gateway',
    description: 'An API gateway is a single entry point that handles cross-cutting concerns such as authentication, rate limiting, request routing, and response transformation. It decouples clients from internal microservice topology and can aggregate multiple downstream calls into one response. Gateways also enforce quotas and collect telemetry centrally.',
    docLinks: [
      { label: 'Kong Gateway Docs', url: 'https://docs.konghq.com' },
      { label: 'AWS API Gateway', url: 'https://aws.amazon.com/api-gateway' },
    ],
  },
  api_service: {
    title: 'API Service',
    description: 'An API service is a backend microservice that implements business logic and exposes it over HTTP/REST or gRPC. Services should be stateless so they can be scaled horizontally behind a load balancer. RESTful design uses resource-oriented URLs and standard HTTP verbs; gRPC uses binary Protobuf framing for high-throughput inter-service calls.',
    docLinks: [
      { label: 'RESTful API Design', url: 'https://restfulapi.net' },
      { label: 'gRPC Docs', url: 'https://grpc.io/docs' },
    ],
  },
  cache: {
    title: 'Cache',
    description: 'A cache stores frequently accessed data in fast in-memory storage to reduce latency and database load. Redis supports rich data structures (hashes, sorted sets, streams) and pub/sub, making it suitable for session storage, leaderboards, and rate limiting. Memcached is a simpler, multi-threaded option optimised purely for key-value caching at high throughput.',
    docLinks: [
      { label: 'Redis Documentation', url: 'https://redis.io/docs' },
      { label: 'Memcached Wiki', url: 'https://www.memcached.org' },
    ],
  },
  message_queue: {
    title: 'Message Queue',
    description: 'A message queue decouples producers from consumers, enabling async processing, load levelling, and fault tolerance. Kafka is a distributed commit log suited to high-throughput event streaming and replay. RabbitMQ provides flexible routing with exchanges and bindings, while AWS SQS is a fully-managed queue that scales without operational overhead.',
    docLinks: [
      { label: 'Apache Kafka Docs', url: 'https://kafka.apache.org/documentation' },
      { label: 'AWS SQS', url: 'https://aws.amazon.com/sqs' },
      { label: 'RabbitMQ Docs', url: 'https://www.rabbitmq.com/docs' },
    ],
  },
  database: {
    title: 'Database',
    description: 'A database provides durable, queryable storage for application state. PostgreSQL is a powerful open-source relational database with strong ACID guarantees, JSON support, and advanced indexing. MongoDB is a document database that offers flexible schemas and horizontal sharding, making it a popular choice when data models evolve rapidly.',
    docLinks: [
      { label: 'PostgreSQL Docs', url: 'https://www.postgresql.org/docs' },
      { label: 'MongoDB Docs', url: 'https://www.mongodb.com/docs' },
    ],
  },
  search_cluster: {
    title: 'Search Cluster',
    description: 'A search cluster provides full-text search, faceting, and relevance ranking over large datasets using an inverted index. Elasticsearch is the industry standard, offering a distributed architecture with near real-time indexing and a rich query DSL. OpenSearch is the AWS-maintained open-source fork, offering the same capabilities under an Apache 2.0 licence.',
    docLinks: [
      { label: 'Elasticsearch Guide', url: 'https://www.elastic.co/guide' },
      { label: 'OpenSearch Docs', url: 'https://opensearch.org/docs/latest' },
    ],
  },
  object_storage: {
    title: 'Object Storage',
    description: 'Object storage is a flat-namespace store for unstructured blobs — images, videos, backups, and logs — that scales to exabytes without filesystem overhead. AWS S3 offers 11 nines of durability, versioning, lifecycle policies, and pre-signed URLs for secure direct uploads from clients. MinIO is a self-hosted S3-compatible alternative ideal for on-premises or Kubernetes deployments.',
    docLinks: [
      { label: 'AWS S3', url: 'https://aws.amazon.com/s3' },
      { label: 'MinIO Docs', url: 'https://min.io/docs' },
    ],
  },
  notification_service: {
    title: 'Notification Service',
    description: 'A notification service delivers push notifications, SMS, or emails to users asynchronously. Firebase Cloud Messaging (FCM) supports iOS, Android, and web push with topic-based fan-out. AWS SNS is a fully-managed pub/sub service that fans out to millions of endpoints including SQS queues, Lambda functions, and mobile devices.',
    docLinks: [
      { label: 'Firebase Cloud Messaging', url: 'https://firebase.google.com/docs/cloud-messaging' },
      { label: 'AWS SNS Docs', url: 'https://docs.aws.amazon.com/sns' },
    ],
  },
  websocket_gateway: {
    title: 'WebSocket Gateway',
    description: 'A WebSocket gateway maintains persistent, full-duplex TCP connections between clients and the server, enabling real-time features like live chat, collaborative editing, and live dashboards. Socket.IO adds rooms, namespaces, and automatic fallback to long-polling. The browser WebSocket API is the underlying standard on which these libraries are built.',
    docLinks: [
      { label: 'Socket.IO Docs v4', url: 'https://socket.io/docs/v4' },
      { label: 'MDN: WebSocket API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSocket' },
    ],
  },
  k8s_cluster: {
    title: 'Kubernetes Cluster',
    description: 'Kubernetes is an open-source container orchestration platform that automates deployment, scaling, and self-healing of containerised workloads. It groups containers into Pods, manages them with Deployments, and exposes them via Services and Ingress. Features like Horizontal Pod Autoscaler, rolling updates, and resource quotas make it the standard substrate for running microservices at scale.',
    docLinks: [
      { label: 'Kubernetes Documentation', url: 'https://kubernetes.io/docs/home' },
    ],
  },
}
