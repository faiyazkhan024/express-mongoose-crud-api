# TaskPulse API

> A robust, portfolio-ready RESTful CRUD API built with Node.js, Express.js, and MongoDB/Mongoose for agile sprint and engineering task management.

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.x-black.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-darkgreen.svg)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-8.x-red.svg)](https://mongoosejs.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

---

## Overview & Domain Rationale

Agile issue and sprint tracking is a foundational backend necessity across high-performing software engineering teams. **TaskPulse** is built around real-world software delivery workflows:
- **Hierarchical Document Modeling:** Leverages MongoDB's document architecture with embedded subdocuments for assignees and subtask checklists.
- **Workflow State Lifecycles:** Constrained status transitions (`backlog` → `todo` → `in_progress` → `in_review` → `completed` / `cancelled`) and priority tiers (`low`, `medium`, `high`, `critical`).
- **Sprint Aggregation Analytics:** A high-performance MongoDB Aggregation pipeline (`/api/v1/tasks/analytics`) calculating task distribution, priority breakdowns, velocity metrics (estimated vs. actual hours), and completion percentages.
- **Full-Text & Compound Indexing:** Optimized compound indexing on `(status, priority, dueDate)` alongside a MongoDB `$text` search index across task titles, descriptions, and tag arrays.
- **Defensive Engineering:** Strict request schema validation middleware, 24-character hexadecimal ObjectId guardrails, and centralized error handling with custom operational errors (`AppError`).

---

## Architectural Highlights

- **Layered MVC Architecture:** Clean separation of concerns between HTTP routing (`routes/`), request orchestration (`controllers/`), schema models (`models/`), and cross-cutting concerns (`middlewares/`, `errors/`, `config/`).
- **Connection Lifecycle Management:** Resilient connection handling via `mongoose.connection` with event listeners (`connected`, `disconnected`, `error`), connection state health monitoring, and graceful process shutdown listeners (`SIGTERM`/`SIGINT`).
- **Strict Input Validation:** Pre-controller validation middleware preventing bad payloads, malformed ObjectIds, invalid enum values, and out-of-range pagination limits.
- **Automated Seeder:** One-command database population script (`npm run seed`) creating realistic engineering tasks with subtasks and time tracking.

---

## Tech Stack

| Component | Technology | Description |
|---|---|---|
| **Runtime** | Node.js (v20+ / v26) | Asynchronous event-driven JavaScript runtime |
| **Framework** | Express.js (v4.x) | Fast, minimalist web framework for Node.js |
| **Database** | MongoDB | Distributed document database |
| **ODM** | Mongoose (v8.x) | Elegant MongoDB object modeling and schema validation |
| **Config** | `dotenv` | Centralized environment variable management |
| **CORS & Logging**| `cors` + `morgan` | Cross-Origin Resource Sharing and HTTP request logger |
| **Testing** | Node.js Test Runner | Native zero-dependency unit and integration test runner (`node:test`) |

---

## Repository Layout

```
express-mongoose-crud-api/
├── src/
│   ├── config/
│   │   ├── db.js                # Mongoose connection pool & lifecycle management
│   │   └── index.js             # Environment variable loading & configuration
│   ├── controllers/
│   │   └── taskController.js    # Task CRUD logic & aggregation analytics
│   ├── db/
│   │   └── seed.js              # Database seeder with realistic sprint tasks
│   ├── errors/
│   │   └── AppError.js          # Operational application error class
│   ├── middlewares/
│   │   ├── errorHandler.js      # Global error and 404 handler
│   │   └── validateTask.js      # Request body & query parameter validation
│   ├── models/
│   │   └── taskModel.js         # Mongoose schema, indexes, and virtuals
│   ├── routes/
│   │   └── taskRoutes.js        # RESTful API route definitions
│   ├── app.js                   # Express application setup & middleware stack
│   └── server.js                # HTTP server bootstrap & graceful shutdown
├── test/
│   └── api.test.js              # Automated integration and smoke test suite
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── AGENT.md                     # AI coding agent & contributor guidelines
├── LICENSE                      # ISC License
├── package.json                 # Project manifest & npm scripts
└── README.md                    # Project documentation
```

---

## Getting Started

### Prerequisites
- **Node.js** (v20.x or higher)
- **npm** (v9.x or higher)
- **MongoDB** instance running locally (port `27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI.

### 1. Clone & Install Dependencies
```bash
git clone git@github.com:faiyazkhan024/express-mongoose-crud-api.git
cd express-mongoose-crud-api
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Default configuration:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/express_mongoose_crud_db
```
*(If using MongoDB Atlas, replace `MONGODB_URI` with your connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/express_mongoose_crud_db?retryWrites=true&w=majority`)*

### 3. Seed Database (Optional)
Populate MongoDB with realistic initial sprint tasks:
```bash
npm run seed
```

### 4. Run Application
```bash
# Production mode
npm start

# Development mode (with live reload via nodemon)
npm run dev
```

### 5. Run Test Suite
```bash
npm test
```

---

## REST API Endpoint Reference

| Method | Endpoint | Description | Query Parameters / Body |
|---|---|---|---|
| `GET` | `/` | API welcome info and endpoint manifest | None |
| `GET` | `/health` | Server uptime & MongoDB connection state | None |
| `GET` | `/api/v1/tasks/analytics` | Aggregated sprint metrics & breakdowns | None |
| `GET` | `/api/v1/tasks` | List paginated tasks with filters & search | `page`, `limit`, `status`, `priority`, `category`, `search`, `sortBy`, `sortOrder` |
| `POST` | `/api/v1/tasks` | Create a new sprint task | JSON payload (see below) |
| `GET` | `/api/v1/tasks/:id` | Retrieve single task by MongoDB ObjectId | None |
| `PUT` | `/api/v1/tasks/:id` | Full update of existing task | JSON payload |
| `PATCH`| `/api/v1/tasks/:id` | Partial update of task attributes | JSON payload |
| `DELETE`| `/api/v1/tasks/:id`| Remove task (returns 204 No Content) | None |

---

## Example API Requests & Responses

### 1. Health Check
```bash
curl -X GET http://localhost:3000/health
```
```json
{
  "status": "ok",
  "timestamp": "2026-11-07T15:50:00.000Z",
  "uptime": 24.12,
  "environment": "development",
  "database": {
    "status": "connected"
  }
}
```

### 2. Create a Sprint Task
```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement Redis Caching Layer",
    "description": "Cache frequent task queries to reduce MongoDB read load by 60%.",
    "status": "todo",
    "priority": "high",
    "category": "devops",
    "assignee": {
      "name": "Sarah Chen",
      "email": "sarah.chen@example.com"
    },
    "tags": ["redis", "caching", "performance"],
    "estimatedHours": 8,
    "dueDate": "2026-11-20T18:00:00.000Z",
    "subtasks": [
      { "title": "Configure Redis cluster", "isCompleted": true },
      { "title": "Integrate cache middleware in Express", "isCompleted": false }
    ]
  }'
```
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "672ce34fa819bd0012e4f011",
    "_id": "672ce34fa819bd0012e4f011",
    "title": "Implement Redis Caching Layer",
    "description": "Cache frequent task queries to reduce MongoDB read load by 60%.",
    "status": "todo",
    "priority": "high",
    "category": "devops",
    "assignee": {
      "name": "Sarah Chen",
      "email": "sarah.chen@example.com"
    },
    "tags": ["redis", "caching", "performance"],
    "estimatedHours": 8,
    "actualHours": 0,
    "dueDate": "2026-11-20T18:00:00.000Z",
    "subtasks": [
      { "title": "Configure Redis cluster", "isCompleted": true, "_id": "672ce34fa819bd0012e4f012" },
      { "title": "Integrate cache middleware in Express", "isCompleted": false, "_id": "672ce34fa819bd0012e4f013" }
    ],
    "isArchived": false,
    "isOverdue": false,
    "subtaskCount": 2,
    "completedSubtaskCount": 1,
    "createdAt": "2026-11-07T15:50:00.000Z",
    "updatedAt": "2026-11-07T15:50:00.000Z"
  }
}
```

### 3. List Tasks with Filtering, Search, and Pagination
```bash
curl -X GET "http://localhost:3000/api/v1/tasks?status=in_progress&priority=critical&page=1&limit=5&sortBy=dueDate&sortOrder=asc"
```
```json
{
  "success": true,
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "data": [
    {
      "id": "672ce34fa819bd0012e4f002",
      "_id": "672ce34fa819bd0012e4f002",
      "title": "Implement OAuth2 Google and GitHub Single Sign-On",
      "status": "in_progress",
      "priority": "critical",
      "category": "feature",
      "assignee": {
        "name": "Sarah Chen",
        "email": "sarah.chen@example.com"
      },
      "tags": ["oauth", "security", "auth"],
      "estimatedHours": 20,
      "actualHours": 11,
      "subtaskCount": 4,
      "completedSubtaskCount": 2
    }
  ]
}
```

### 4. Sprint Aggregation Analytics
```bash
curl -X GET http://localhost:3000/api/v1/tasks/analytics
```
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalTasks": 8,
      "totalEstimatedHours": 88,
      "totalActualHours": 36.5,
      "completedCount": 2,
      "completionRate": 25.0
    },
    "byStatus": [
      { "status": "todo", "count": 2 },
      { "status": "backlog", "count": 2 },
      { "status": "completed", "count": 2 },
      { "status": "in_progress", "count": 1 },
      { "status": "in_review", "count": 1 }
    ],
    "byPriority": [
      { "priority": "medium", "count": 3 },
      { "priority": "high", "count": 2 },
      { "priority": "critical", "count": 2 },
      { "priority": "low", "count": 1 }
    ],
    "byCategory": [
      { "category": "devops", "count": 2 },
      { "category": "feature", "count": 2 },
      { "category": "bug", "count": 1 },
      { "category": "refactor", "count": 1 },
      { "category": "documentation", "count": 1 },
      { "category": "maintenance", "count": 1 }
    ]
  }
}
```

### 5. Partial Update (PATCH Status Transition)
```bash
curl -X PATCH http://localhost:3000/api/v1/tasks/672ce34fa819bd0012e4f011 \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress", "actualHours": 3.5}'
```
```json
{
  "success": true,
  "message": "Task partially updated successfully",
  "data": {
    "id": "672ce34fa819bd0012e4f011",
    "_id": "672ce34fa819bd0012e4f011",
    "title": "Implement Redis Caching Layer",
    "status": "in_progress",
    "actualHours": 3.5,
    "updatedAt": "2026-11-07T15:52:10.000Z"
  }
}
```

### 6. Delete a Task
```bash
curl -i -X DELETE http://localhost:3000/api/v1/tasks/672ce34fa819bd0012e4f011
```
```http
HTTP/1.1 204 No Content
```

### 7. Input Validation Error (400 Bad Request)
```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "",
    "priority": "ultra-urgent",
    "status": "in_the_cloud"
  }'
```
```json
{
  "success": false,
  "status": "fail",
  "message": "Task validation failed",
  "errors": [
    { "field": "title", "message": "Title is required and cannot be empty." },
    { "field": "status", "message": "Status must be one of: backlog, todo, in_progress, in_review, completed, cancelled." },
    { "field": "priority", "message": "Priority must be one of: low, medium, high, critical." }
  ]
}
```

---

## License

This project is open source and licensed under the [ISC License](LICENSE).
