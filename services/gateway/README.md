# 🚪 API Gateway Service

<div align="center">

**Centralized Entry Point | Request Routing | Authentication | Real-time Support**

</div>

---

## 🎯 Overview

The **API Gateway** is the single entry point for all client requests in this microservices architecture. It handles HTTP request routing, authentication, rate limiting, WebSocket connections, and proxies requests to backend microservices.

---

## 🏗️ Architecture Role

```
Client (HTTP/HTTPS/WebSocket)
        ↓
    Nginx (SSL Termination)
        ↓
   🚪 API Gateway ← You are here
        ↓
   Backend Services (gRPC)
```

---

## ✨ Key Features

### Core Functionality
- ✅ **HTTP Request Routing** - Proxies REST requests to microservices
- ✅ **JWT Authentication** - Validates tokens via middleware
- ✅ **Rate Limiting** - Redis-based distributed limiting (per-IP)
- ✅ **CORS Management** - Configurable allowed origins
- ✅ **Static File Serving** - Serves files from `/public` directory
- ✅ **Security Headers** - Helmet middleware for HTTP security

### Real-time Features
- ✅ **Socket.IO Server** - WebSocket server for real-time communication
- ✅ **Socket Authentication** - JWT-based socket connection validation
- ✅ **Redis Pub/Sub** - Subscribe to events from backend services
- ✅ **Room Management** - User-specific rooms (`user_{userId}`)
- ✅ **Horizontal Scaling** - Redis adapter for multi-instance support

### Service Communication
- ✅ **gRPC Client** - Communicates with backend services
- ✅ **HTTP Proxy** - Proxies REST requests to services
- ✅ **Service Discovery** - Routes based on service names

---

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **Express.js** | Web framework |
| **http-proxy-middleware** | Request proxying |
| **Socket.IO** | Real-time WebSocket server |
| **@socket.io/redis-adapter** | Multi-instance scaling |
| **gRPC** | Service-to-service communication |
| **Redis (ioredis)** | Caching, pub/sub, rate limiting |
| **rate-limiter-flexible** | Distributed rate limiting |
| **Helmet** | Security headers |
| **CORS** | Cross-origin control |
| **EJS** | Template rendering |
| **Winston** | Structured logging |

---

## 📁 Project Structure

```
gateway/
├── Dockerfile
├── package.json
└── src/
    ├── index.js                    # Entry point
    ├── bootstrap/                  # Initialization
    │   ├── setup.js                # Express app setup
    │   ├── routes.js               # Route configuration & proxying
    │   ├── serverHandlers.js       # HTTP/HTTPS server creation
    │   └── processHandlers.js      # Graceful shutdown
    ├── config/
    │   ├── cors.js                 # CORS configuration
    │   └── redis.js                # Redis client
    ├── constants/
    │   └── socket_events.js        # Socket.IO event names
    ├── grpc/
    │   └── client.js               # gRPC client setup
    ├── middleware/
    │   ├── authorize.js            # JWT authentication
    │   ├── rateLimiter.js          # Rate limiting middleware
    │   └── timezone.js             # Timezone handling
    ├── public/                     # Static files
    │   └── css/
    ├── services/
    │   └── socket.js               # Socket.IO service
    ├── tests/
    │   ├── test-rate-limiter.js    # Rate limiter testing
    │   └── test-multi-ip.js        # Multi-IP testing
    ├── utils/
    │   └── logger.js               # Winston logger
    └── views/                      # EJS templates
        ├── layout.ejs
        ├── terms.ejs
        └── privacy.ejs
```

---

## 🚀 Running the Service

### Development (Docker)
```bash
# From project root
docker-compose up gateway

# View logs
docker-compose logs -f gateway
```

### Development (Local)
```bash
cd services/gateway
npm install
npm run dev
```

### Production
```bash
npm start
```

---

## 📡 Request Routing

The gateway routes requests based on URL prefixes:

| Route Prefix | Target Service | Example |
|--------------|----------------|---------|
| `/user-service/*` | User Service | `/user-service/api/v1/users/profile` |
| `/todo-service/*` | Todo Service | `/todo-service/api/v1/todos` |
| `/public/*` | Static Files | `/public/css/styles.css` |
| `/` | Gateway Pages | `/`, `/terms`, `/privacy` |

### Proxy Configuration

From `bootstrap/routes.js`:
```javascript
app.use('/user-service', createProxyMiddleware({
  target: process.env.USER_SERVICE_URL || 'http://user-service:50051',
  changeOrigin: true,
  pathRewrite: {
    '^/user-service': '', // Remove prefix when forwarding
  },
}));
```

---

## 🔐 Authentication Flow

```
1. Client sends request with JWT in header
   ↓
2. Gateway authorize middleware validates token
   ↓
3. Calls user-service via gRPC to validate user
   ↓
4. Attaches user info to req.user
   ↓
5. Forwards request to target service
```

**Middleware:** `middleware/authorize.js`

---

## 🔌 Socket.IO Architecture

### Connection Flow
```
1. Client connects with JWT token
   ↓
2. Gateway validates token (authMiddleware)
   ↓
3. Client joins user-specific room (user_{userId})
   ↓
4. Client can emit events (handled by gateway)
   ↓
5. Backend services publish to Redis
   ↓
6. Gateway receives from Redis and emits to Socket.IO
```

### Event Patterns

**Client → Gateway (Request/Response):**
```javascript
// Client sends event with callback
socket.emit('profile:update', data, (response) => {
  // Immediate response
});

// Gateway handles event, calls service via gRPC
```

**Service → Gateway → Client (Broadcast):**
```javascript
// Backend service publishes to Redis
redisClient.publish('SYSTEM_EVENTS', JSON.stringify({
  userId: 123,
  type: 'PROFILE_UPDATED',
  data: {...}
}));

// Gateway subscribes, emits to Socket.IO
io.to('user_123').emit('PROFILE_UPDATED', data);
```

---

## ⚡ Rate Limiting

**Configuration:** `middleware/rateLimiter.js`

- **Type:** Redis-based distributed rate limiting
- **Scope:** Per IP address
- **Default:** 100 requests per 60 seconds
- **Blocking:** Configurable (default: block after limit)
- **Response:** `429 Too Many Requests`

**Testing:**
```bash
node src/tests/test-rate-limiter.js --rps 250 --duration 5
node src/tests/test-multi-ip.js --users 10 --requests 25
```

---

## 🧪 Testing

### Rate Limiter Test
```bash
node src/tests/test-rate-limiter.js \
  --base-url http://localhost:8080 \
  --rps 500 \
  --duration 10
```

### Multi-IP Test
```bash
node src/tests/test-multi-ip.js \
  --base-url http://localhost:8080 \
  --users 20 \
  --requests 50
```

---

## 📝 Logging

**Logger:** Winston with daily log rotation

**Logs Location:** `logs/`
- `combined-YYYY-MM-DD.log` - All logs
- `error-YYYY-MM-DD.log` - Error logs only

**Configuration:** `utils/logger.js`

---

## 🔗 Related Documentation

- [Main README](../../README.md)
- [User Service README](../user-service/README.md)

---

## 📞 Port Information

- **Internal Port:** 8000 (Docker network)
- **External Port:** 8080 (HTTP via Nginx)
- **External Port:** 8443 (HTTPS via Nginx)

---

<div align="center">

**Built with Express.js | Socket.IO | gRPC | Redis**

[⬆ Back to Main README](../../README.md)

</div>
