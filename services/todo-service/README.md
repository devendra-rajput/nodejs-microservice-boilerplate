# 📝 Todo Service

<div align="center">

**🚧 UNDER DEVELOPMENT 🚧**

**Task Management | MongoDB | gRPC Server**

</div>

---

## ⚠️ Current Status

This service is currently **under development** and serves as a placeholder. The basic structure is in place, but core functionality has not been implemented yet.

---

## 🎯 Planned Overview

The **Todo Service** will be a microservice responsible for task management, todo CRUD operations, and user-specific task organization. It will use MongoDB for flexible document storage and expose both HTTP REST APIs and gRPC endpoints.

---

## 🏗️ Planned Architecture

```
API Gateway (HTTP Proxy)
        ↓
   📝 Todo Service (Planned)
        ↓
   MongoDB Database
```

```
API Gateway (gRPC Client)
        ↓
   📝 Todo Service (gRPC Server)
        ↓
   MongoDB Database
```

---

## ✨ Planned Features

### Core Functionality
- [ ] **Todo CRUD** - Create, read, update, delete todos
- [ ] **User Association** - User-specific todos
- [ ] **Categories & Tags** - Organize todos by category
- [ ] **Priority Levels** - High, medium, low priority
- [ ] **Due Dates** - Set deadlines for tasks
- [ ] **Status Tracking** - Todo, in progress, completed
- [ ] **Search & Filter** - Find todos by various criteria
- [ ] **Pagination** - Efficient data retrieval

### Database
- [ ] **MongoDB Integration** - NoSQL document storage
- [ ] **Mongoose ODM** - Schema validation and modeling
- [ ] **Indexes** - Performance optimization
- [ ] **Aggregation Pipelines** - Complex queries

### Service Communication
- [ ] **gRPC Server** - Inter-service communication
- [ ] **REST API** - HTTP endpoints for clients
- [ ] **Redis Pub/Sub** - Real-time todo updates via Socket.IO

---

## 🛠️ Planned Technology Stack

| Technology | Purpose |
|------------|---------|
| **Express.js** | Web framework |
| **Mongoose** | MongoDB ODM |
| **MongoDB** | NoSQL database |
| **gRPC** | Service-to-service communication |
| **Redis** | Caching & pub/sub |
| **Joi** | Request validation |
| **Winston** | Structured logging |

---

## 📁 Planned Project Structure

```
todo-service/
├── Dockerfile
├── package.json
└── src/
    ├── index.js                # Entry point (placeholder)
    ├── bootstrap/              # Initialization
    ├── config/
    │   ├── database.js         # MongoDB config
    │   └── redis.js            # Redis client
    ├── grpc/
    │   ├── controllers/
    │   │   └── todo.controller.js
    │   └── server.js
    ├── models/
    │   └── todo.js             # Mongoose model
    ├── resources/
    │   └── v1/
    │       └── todos/
    │           ├── todos.controller.js
    │           └── todos.validation.js
    ├── routes/
    │   └── todos.js
    └── utils/
        └── logger.js
```


---

## 🚀 Current Implementation

### Running the Placeholder

```bash
# From project root
docker compose up todo-service

# View placeholder message
curl http://localhost:50052/
```

**Response:**
```json
{
  "success": true,
  "message": "Todo Service - Coming Soon! 🚧",
  "status": "Under Development",
  "plannedFeatures": [
    "Create, Read, Update, Delete Todos",
    "MongoDB integration with Mongoose",
    "gRPC server for inter-service communication",
    "User-specific todo management",
    "Todo categories and tags",
    "Due dates and reminders",
    "Priority levels",
    "Search and filtering"
  ]
}
```

---

## 📞 Port Information

- **HTTP Port:** 50052 (Internal Docker network)
- **gRPC Port:** To be determined
- **Public Access:** Via Gateway at `http://localhost:8080/todo-service` (when implemented)

---

## 🛣️ Development Roadmap

### Phase 1: Basic Setup (Not Started)
- [ ] MongoDB connection setup
- [ ] Mongoose models
- [ ] Basic CRUD endpoints
- [ ] Input validation with Joi

### Phase 2: Advanced Features (Not Started)
- [ ] Search and filtering
- [ ] Categories and tags
- [ ] Due date management
- [ ] Priority levels

### Phase 3: Integration (Not Started)
- [ ] gRPC server implementation
- [ ] Redis pub/sub for real-time updates
- [ ] Socket.IO integration via Gateway
- [ ] User association validation

### Phase 4: Production Ready (Not Started)
- [ ] Error handling
- [ ] Logging
- [ ] Testing suite
- [ ] Performance optimization

---

## 🤝 Contributing

This service is currently a placeholder. If you'd like to implement the todo service:

1. Review the planned features above
2. Follow the existing patterns in user-service
3. Use MongoDB + Mongoose for data storage
4. Implement gRPC server for inter-service communication
5. Add comprehensive tests
6. Update this README with actual implementation details

---

## 🔗 Related Documentation

- [Main README](../../README.md)
- [Gateway README](../gateway/README.md)
- [User Service README](../user-service/README.md)

---

<div align="center">

### 🚧 **This Service is Under Development** 🚧

**Want to contribute? Check out the roadmap above!**

---

[⬆ Back to Main README](../../README.md)

</div>
