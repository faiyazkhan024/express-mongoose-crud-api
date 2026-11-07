# AGENT.md

> Operational Guidelines and Architecture Guide for AI Coding Agents and Developers

This document serves as the primary technical specification, operational guide, and coding manual for AI agents (such as Google Antigravity, Claude Code, Cursor, GitHub Copilot) and human contributors working on **express-mongoose-crud-api**.

---

## 1. Project Overview & Mission

- **Project Name:** `express-mongoose-crud-api`
- **Application Name:** **TaskPulse API**
- **Description:** A robust, production-grade RESTful CRUD API built with Node.js, Express.js, and MongoDB/Mongoose for agile sprint and engineering task management. Features rich embedded subdocuments (subtasks, assignee), compound & full-text indexing, aggregation analytics, and strict defensive validation.
- **Repository URL:** `git@github.com:faiyazkhan024/express-mongoose-crud-api.git`
- **Default Branch:** `main`

---

## 2. Technical Stack

| Component | Technology | Description |
|---|---|---|
| **Language / Runtime** | JavaScript / Node.js 20+ (v26) | Asynchronous event loop with CommonJS modules |
| **Framework** | Express.js 4.x | Fast, unopinionated minimalist web framework |
| **Database** | MongoDB | Distributed document database |
| **ODM** | Mongoose 8.x | Strict schema enforcement, virtuals, middleware hooks |
| **Configuration** | `dotenv` | Environment variable management via `.env` |
| **Logging & CORS** | `morgan` + `cors` | HTTP request logging and cross-origin handling |
| **Test Runner** | Node.js Test Runner (`node:test`) | Native fast test runner with `node:assert/strict` |

---

## 3. Repository Architecture & Layout

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
├── .gitignore                   # Git ignore patterns
├── AGENT.md                     # This file (Agent instructions)
├── LICENSE                      # ISC License
├── package.json                 # Project manifest & npm scripts
└── README.md                    # Project documentation
```

### Architectural Principles
1. **Config Layer (`src/config/index.js`)**: Loads settings from `.env`. No controller or service should read directly from `process.env`.
2. **Database Layer (`src/config/db.js`)**: Manages connection pooling, lifecycle event listeners, state health inspection, and graceful connection teardown.
3. **Model Layer (`src/models/taskModel.js`)**: Clean Mongoose schema with schema validation, virtuals (`isOverdue`, `subtaskCount`, `completedSubtaskCount`), compound indexes, and text index.
4. **Validation Layer (`src/middlewares/validateTask.js`)**: Intercepts requests before reaching the controller. Validates 24-character hex ObjectIds, required fields, enum boundaries, and query pagination limits.
5. **Controller Layer (`src/controllers/taskController.js`)**: Implements RESTful action methods conforming to HTTP status code semantics (`200`, `201`, `204`, `400`, `404`, `500`).
6. **Centralized Error Handling (`src/middlewares/errorHandler.js`)**: Normalizes Mongoose `CastError`, `ValidationError`, duplicate key code `11000`, and unknown routes into predictable `{ success: false, status: 'fail' | 'error', message, errors }` responses.

---

## 4. Development & Tooling Commands

All commands are executed using `npm`:

```bash
# Install dependencies
npm install

# Run locally in production mode
npm start

# Run with nodemon hot reloading
npm run dev

# Seed database with sample tasks
npm run seed

# Run automated integration test suite
npm test
```

---

## 5. Instructions for Autonomous AI Agents

1. **Understand Context:** Inspect `taskModel.js`, `taskController.js`, and `validateTask.js` before modifying domain behavior.
2. **Preserve Documentation:** Keep all docstrings, comments, and instructions intact.
3. **Verify Working State:**
   - Run `npm test` before declaring any task complete.
   - Ensure all test assertions pass with zero failures.
4. **Atomic Git Commits:** Keep changes cohesive and accompanied by clear commit messages following Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`).
5. **Security & Secrets:** Never commit real secrets or `.env` files. Maintain `.env.example`.
