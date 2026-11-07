const mongoose = require('mongoose');
const Task = require('../models/taskModel');
const config = require('../config');

const seedTasks = [
  {
    title: 'Migrate user session storage to Redis cluster',
    description: 'Offload active JSON Web Tokens and user sessions from memory to high-availability Redis.',
    status: 'completed',
    priority: 'high',
    category: 'devops',
    assignee: {
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com'
    },
    tags: ['redis', 'caching', 'infrastructure', 'auth'],
    estimatedHours: 12,
    actualHours: 14,
    dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    subtasks: [
      { title: 'Provision Redis ElastiCache instance', isCompleted: true },
      { title: 'Implement Redis client connection pool', isCompleted: true },
      { title: 'Write failover and fallback unit tests', isCompleted: true }
    ]
  },
  {
    title: 'Implement OAuth2 Google and GitHub Single Sign-On',
    description: 'Add OAuth 2.0 social authentication flows to reduce onboarding friction for new engineering teams.',
    status: 'in_progress',
    priority: 'critical',
    category: 'feature',
    assignee: {
      name: 'Sarah Chen',
      email: 'sarah.chen@example.com'
    },
    tags: ['oauth', 'security', 'frontend', 'backend'],
    estimatedHours: 20,
    actualHours: 11,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // in 3 days
    subtasks: [
      { title: 'Register developer apps in Google and GitHub consoles', isCompleted: true },
      { title: 'Implement passport/custom oauth callback endpoints', isCompleted: true },
      { title: 'Link existing email accounts to OAuth provider IDs', isCompleted: false },
      { title: 'Security review on CSRF state tokens', isCompleted: false }
    ]
  },
  {
    title: 'Fix race condition in concurrent inventory reservations',
    description: 'Two simultaneous checkout requests occasionally reserve the last remaining stock item.',
    status: 'in_review',
    priority: 'critical',
    category: 'bug',
    assignee: {
      name: 'Faiyaz Khan',
      email: 'faiyazkhan024@gmail.com'
    },
    tags: ['database', 'concurrency', 'transactions', 'bugfix'],
    estimatedHours: 8,
    actualHours: 6.5,
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    subtasks: [
      { title: 'Reproduce with k6 load test script', isCompleted: true },
      { title: 'Implement MongoDB transaction with session isolation', isCompleted: true },
      { title: 'Conduct code review and merge to staging', isCompleted: false }
    ]
  },
  {
    title: 'Refactor REST API controllers to service-repository pattern',
    description: 'Decouple direct Mongoose calls from controller request orchestration for improved testability.',
    status: 'todo',
    priority: 'medium',
    category: 'refactor',
    assignee: {
      name: 'David Kim',
      email: 'david.kim@example.com'
    },
    tags: ['architecture', 'clean-code', 'refactoring'],
    estimatedHours: 16,
    actualHours: 0,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    subtasks: [
      { title: 'Extract Task repository layer', isCompleted: false },
      { title: 'Extract Task business logic service', isCompleted: false },
      { title: 'Update unit test mocks', isCompleted: false }
    ]
  },
  {
    title: 'Publish OpenAPI / Swagger 3.0 API Specification',
    description: 'Document all REST endpoints, request schemas, status codes, and curl examples for external integrators.',
    status: 'completed',
    priority: 'medium',
    category: 'documentation',
    assignee: {
      name: 'Elena Rostova',
      email: 'elena.rostova@example.com'
    },
    tags: ['docs', 'openapi', 'swagger', 'api'],
    estimatedHours: 6,
    actualHours: 5,
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    subtasks: [
      { title: 'Draft OpenAPI 3.0 YAML spec', isCompleted: true },
      { title: 'Integrate Swagger UI middleware on /api/docs', isCompleted: true }
    ]
  },
  {
    title: 'Set up Prometheus metrics and Grafana dashboard',
    description: 'Collect HTTP request durations, memory utilization, and active database connection pool gauges.',
    status: 'todo',
    priority: 'high',
    category: 'devops',
    assignee: {
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com'
    },
    tags: ['monitoring', 'grafana', 'prometheus', 'observability'],
    estimatedHours: 10,
    actualHours: 0,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    subtasks: [
      { title: 'Install prom-client node package', isCompleted: false },
      { title: 'Expose /metrics endpoint with token auth', isCompleted: false },
      { title: 'Import Grafana Express dashboard JSON template', isCompleted: false }
    ]
  },
  {
    title: 'Optimize MongoDB text search indexes for task queries',
    description: 'Evaluate explain execution stats for compound text indexing across task titles, descriptions, and tags.',
    status: 'backlog',
    priority: 'low',
    category: 'maintenance',
    assignee: {
      name: 'Faiyaz Khan',
      email: 'faiyazkhan024@gmail.com'
    },
    tags: ['mongodb', 'indexes', 'performance'],
    estimatedHours: 4,
    actualHours: 0,
    dueDate: null,
    subtasks: []
  },
  {
    title: 'Implement automated email notifications on task status changes',
    description: 'Send webhook or SendGrid transactional email when task transitions to in_review or completed.',
    status: 'backlog',
    priority: 'medium',
    category: 'feature',
    assignee: {
      name: 'Sarah Chen',
      email: 'sarah.chen@example.com'
    },
    tags: ['notifications', 'email', 'sendgrid'],
    estimatedHours: 12,
    actualHours: 0,
    dueDate: null,
    subtasks: []
  }
];

const seedDatabase = async () => {
  try {
    console.log(`[Seeder] Connecting to MongoDB: ${config.mongodbUri}...`);
    await mongoose.connect(config.mongodbUri, { serverSelectionTimeoutMS: 5000 });

    console.log('[Seeder] Clearing existing tasks collection...');
    await Task.deleteMany({});

    console.log(`[Seeder] Inserting ${seedTasks.length} initial tasks...`);
    const createdTasks = await Task.insertMany(seedTasks);

    console.log(`[Seeder] Successfully seeded ${createdTasks.length} tasks!`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder] Seeding failed: ${error.message}`);
    await mongoose.connection.close();
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedTasks, seedDatabase };
