export type LanguageCategory = 'Frontend' | 'Backend' | 'Infrastructure'
export type LanguageDifficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export interface Language {
  slug: string
  name: string
  category: LanguageCategory
  difficulty: LanguageDifficulty
  description: string
  color: string
  icon: string   // emoji
  topics: string[]
}

export const LANGUAGES: Language[] = [
  // ── Frontend ──────────────────────────────────────────────────────────────
  {
    slug: 'javascript',
    name: 'JavaScript',
    category: 'Frontend',
    difficulty: 'Beginner',
    color: '#f7df1e',
    icon: '⚡',
    description: 'Closures, event loop, promises, prototype chain, ES6+ features.',
    topics: ['Closures', 'Event loop', 'Promises / async-await', 'Prototype chain', 'ES6+ syntax'],
  },
  {
    slug: 'typescript',
    name: 'TypeScript',
    category: 'Frontend',
    difficulty: 'Intermediate',
    color: '#3178c6',
    icon: '🔷',
    description: 'Type system, generics, utility types, strictness, declaration merging.',
    topics: ['Type vs Interface', 'Generics', 'Utility types', 'Type narrowing', 'Declaration files'],
  },
  {
    slug: 'react',
    name: 'React',
    category: 'Frontend',
    difficulty: 'Intermediate',
    color: '#61dafb',
    icon: '⚛️',
    description: 'Hooks, reconciliation, state management, performance, component patterns.',
    topics: ['Hooks', 'Virtual DOM', 'Context API', 'Memoization', 'Component lifecycle'],
  },
  {
    slug: 'css',
    name: 'CSS',
    category: 'Frontend',
    difficulty: 'Beginner',
    color: '#264de4',
    icon: '🎨',
    description: 'Specificity, flexbox, grid, animations, BEM, responsive design.',
    topics: ['Specificity', 'Flexbox', 'CSS Grid', 'Animations', 'Responsive design'],
  },
  {
    slug: 'angular',
    name: 'Angular',
    category: 'Frontend',
    difficulty: 'Advanced',
    color: '#dd0031',
    icon: '🅰️',
    description: 'Dependency injection, change detection, RxJS, NgModules, forms.',
    topics: ['Change detection', 'Dependency injection', 'RxJS', 'Directives', 'Angular forms'],
  },
  {
    slug: 'vue',
    name: 'Vue',
    category: 'Frontend',
    difficulty: 'Intermediate',
    color: '#42b883',
    icon: '💚',
    description: 'Reactivity system, Composition API, directives, Vuex/Pinia, lifecycle.',
    topics: ['Reactivity', 'Composition API', 'Directives', 'Lifecycle hooks', 'State management'],
  },

  // ── Backend ───────────────────────────────────────────────────────────────
  {
    slug: 'python',
    name: 'Python',
    category: 'Backend',
    difficulty: 'Beginner',
    color: '#3776ab',
    icon: '🐍',
    description: 'Generators, decorators, GIL, memory model, OOP, list comprehensions.',
    topics: ['Decorators', 'Generators', 'GIL', 'OOP / dunder methods', 'Async / await'],
  },
  {
    slug: 'nodejs',
    name: 'Node.js',
    category: 'Backend',
    difficulty: 'Intermediate',
    color: '#339933',
    icon: '🟢',
    description: 'Event loop phases, streams, cluster, libuv, CommonJS vs ESM.',
    topics: ['Event loop phases', 'Streams', 'Worker threads', 'Cluster', 'Module system'],
  },
  {
    slug: 'java',
    name: 'Java',
    category: 'Backend',
    difficulty: 'Intermediate',
    color: '#f89820',
    icon: '☕',
    description: 'JVM internals, concurrency, generics, collections, Spring basics.',
    topics: ['JVM & GC', 'Generics', 'Collections', 'Concurrency', 'Spring DI'],
  },
  {
    slug: 'go',
    name: 'Go',
    category: 'Backend',
    difficulty: 'Intermediate',
    color: '#00acd7',
    icon: '🐹',
    description: 'Goroutines, channels, interfaces, garbage collector, error handling.',
    topics: ['Goroutines', 'Channels', 'Interfaces', 'Error handling', 'Garbage collector'],
  },
  {
    slug: 'sql',
    name: 'SQL',
    category: 'Backend',
    difficulty: 'Beginner',
    color: '#e38c00',
    icon: '🗄️',
    description: 'Joins, indexes, transactions, window functions, query optimization.',
    topics: ['JOINs', 'Indexes', 'Transactions', 'Window functions', 'Query optimization'],
  },
  {
    slug: 'rust',
    name: 'Rust',
    category: 'Backend',
    difficulty: 'Advanced',
    color: '#ce412b',
    icon: '🦀',
    description: 'Ownership, borrow checker, lifetimes, traits, async runtime.',
    topics: ['Ownership', 'Borrow checker', 'Lifetimes', 'Traits', 'Async / await'],
  },

  // ── Infrastructure ────────────────────────────────────────────────────────
  {
    slug: 'docker',
    name: 'Docker',
    category: 'Infrastructure',
    difficulty: 'Beginner',
    color: '#2496ed',
    icon: '🐳',
    description: 'Images, containers, volumes, networking, Dockerfile best practices.',
    topics: ['Images vs containers', 'Volumes', 'Networking', 'Dockerfile', 'Multi-stage builds'],
  },
  {
    slug: 'kubernetes',
    name: 'Kubernetes',
    category: 'Infrastructure',
    difficulty: 'Advanced',
    color: '#326ce5',
    icon: '⚙️',
    description: 'Pods, deployments, services, HPA, RBAC, resource limits.',
    topics: ['Pods & deployments', 'Services & ingress', 'HPA', 'RBAC', 'ConfigMaps & Secrets'],
  },
  {
    slug: 'linux',
    name: 'Linux / Bash',
    category: 'Infrastructure',
    difficulty: 'Intermediate',
    color: '#ffcc00',
    icon: '🐧',
    description: 'Process management, file permissions, shell scripting, networking tools.',
    topics: ['File permissions', 'Process management', 'Shell scripting', 'Networking', 'Systemd'],
  },
  {
    slug: 'git',
    name: 'Git',
    category: 'Infrastructure',
    difficulty: 'Beginner',
    color: '#f05033',
    icon: '📦',
    description: 'Branching strategies, merge vs rebase, reflog, cherry-pick, hooks.',
    topics: ['Branching', 'Merge vs rebase', 'Reflog', 'Interactive rebase', 'Hooks'],
  },
  {
    slug: 'aws',
    name: 'AWS',
    category: 'Infrastructure',
    difficulty: 'Intermediate',
    color: '#ff9900',
    icon: '☁️',
    description: 'EC2, S3, RDS, Lambda, VPC, IAM, CloudFormation fundamentals.',
    topics: ['EC2 & auto-scaling', 'S3 & storage', 'VPC & networking', 'IAM', 'Lambda & serverless'],
  },
]

export const LANGUAGE_CATEGORIES: LanguageCategory[] = ['Frontend', 'Backend', 'Infrastructure']
