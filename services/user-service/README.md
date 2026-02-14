# 👤 User Service

<div align="center">

**Authentication | User Management | File Uploads | gRPC Server**

</div>

---

## 🎯 Overview

The **User Service** is a microservice responsible for user authentication, profile management, file uploads, and user-related operations. It exposes both HTTP REST APIs and gRPC endpoints for inter-service communication.

---

## 🏗️ Architecture Role

```
API Gateway (HTTP Proxy)
        ↓
   👤 User Service ← You are here
        ↓
   MySQL Database
```

```
API Gateway (gRPC Client)
        ↓
   👤 User Service (gRPC Server)
        ↓
   MySQL Database
```

---

## ✨ Key Features

### Authentication & Authorization
- ✅ **User Registration** - Email-based registration with OTP verification
- ✅ **Email Verification** - 6-digit OTP sent via email
- ✅ **Login/Logout** - JWT token-based authentication
- ✅ **Password Reset** - Forgot password flow with OTP
- ✅ **Role-based Access** - Admin and User roles
- ✅ **Token Management** - Access tokens with expiration

### User Management
- ✅ **Profile CRUD** - Create, read, update, delete user profiles
- ✅ **Password Change** - Secure password update
- ✅ **Account Deletion** - User can delete their account
- ✅ **Admin User List** - Paginated user listing for admins
- ✅ **Timezone Support** - User-specific timezone handling

### File Management
- ✅ **Local File Upload** - Development environment (volume-mounted)
- ✅ **AWS S3 Upload** - Production-ready cloud storage
- ✅ **Presigned URLs** - Direct S3 uploads from client
- ✅ **Image Conversion** - HEIC to JPG conversion
- ✅ **Bulk Uploads** - Multiple file upload support
- ✅ **File Deletion** - Delete from local or S3 storage

### Service Communication
- ✅ **gRPC Server** - Exposes user operations for inter-service calls
- ✅ **Redis Pub/Sub** - Publishes events to Gateway for Socket.IO
- ✅ **REST API** - HTTP endpoints for external clients

---

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **Express.js** | Web framework |
| **Sequelize** | MySQL ORM |
| **MySQL** | Primary database |
| **gRPC** | Service-to-service communication |
| **Redis (ioredis)** | Caching & pub/sub |
| **JWT (jsonwebtoken)** | Token-based authentication |
| **Bcryptjs** | Password hashing |
| **Multer** | File upload middleware |
| **AWS S3 SDK** | Cloud storage integration |
| **Nodemailer** | Email service |
| **Joi** | Request validation |
| **HEIC Convert** | Image format conversion |
| **Winston** | Structured logging |
| **i18n** | Internationalization |

---

## 📁 Project Structure

```
user-service/
├── Dockerfile
├── package.json
├── .sequelizerc                # Sequelize configuration
└── src/
    ├── index.js                # Entry point
    ├── bootstrap/              # Service initialization
    │   ├── setup.js
    │   ├── routes.js
    │   └── processHandlers.js
    ├── config/
    │   ├── v1/
    │   │   ├── database.js     # MySQL config
    │   │   └── redis.js        # Redis client
    │   └── i18n.js             # Internationalization
    ├── constants/
    │   └── socket_events.js    # Socket event names
    ├── database/
    │   ├── migrations/         # Sequelize migrations
    │   │   └── 20240101000000-create-users.js
    │   └── seeders/            # Database seeders
    │       └── 20240101000000-demo-users.js
    ├── emailTemplates/
    │   └── v1/
    │       ├── verification.js         # Verification email
    │       └── forgotPassword.js       # Password reset email
    ├── grpc/
    │   ├── controllers/
    │   │   └── user.controller.js      # gRPC handlers
    │   └── server.js                   # gRPC server setup
    ├── helpers/
    │   └── v1/
    │       ├── data.helpers.js         # JWT, password, etc.
    │       └── response.helpers.js     # API responses
    ├── locales/                # i18n translations
    │   └── en.json
    ├── middleware/
    │   ├── v1/
    │   │   └── authorize.js    # JWT middleware
    │   └── error.js            # Error handling
    ├── models/
    │   ├── index.js            # Model loader
    │   └── user.js             # User model
    ├── resources/
    │   └── v1/
    │       └── users/
    │           ├── user.model.js           # User model methods
    │           ├── users.controller.js     # HTTP controllers
    │           └── users.validation.js     # Joi schemas
    ├── routes/
    │   └── users.js            # Express routes
    ├── services/
    │   ├── aws.js              # AWS S3 service
    │   └── nodemailer.js       # Email service
    ├── uploads/                # Local file storage (dev)
    └── utils/
        ├── logger.js           # Winston logger
        └── upload.js           # Multer configuration
```


---

## 🚀 Running the Service

### Database Setup

```bash
# Create database
npm run db:create

# Run migrations
npm run db:migrate

# (Optional) Run seeders
npm run db:seed
```

### Development (Docker)
```bash
# From project root
docker compose up user-service

# View logs
docker compose logs -f user-service
```

### Development (Local)
```bash
cd services/user-service
npm install
npm run dev
```

### Production
```bash
npm start
```

---

## 📡 API Endpoints

### Base URL
- **Via Gateway:** `http://localhost:8080/user-service/api/v1/users`
- **Direct:** `http://localhost:50051/api/v1/users` (not recommended in production)


---

## 📤 File Upload Strategies

### 1. Local Storage (Development)

```javascript
// POST /upload-image
// Files stored in: uploads/YYYY/M/D/
// Format: image-{uuid}-{timestamp}.{ext}
```

**Volume Mount:**
```yaml
volumes:
  - ./services/user-service/uploads:/usr/src/app/uploads
```

### 2. AWS S3 (Production)

**Direct Upload with Presigned URL:**
```javascript
// Step 1: Get presigned URL
const response = await POST('/generate-aws-presigned-url', {
  file_name: 'profile.jpg',
  file_type: 'image/jpeg',
  folder: 'profiles'
});

// Step 2: Upload directly to S3 from client
await fetch(response.data.uploadUrl, {
  method: 'PUT',
  headers: { 'Content-Type': 'image/jpeg' },
  body: fileBlob
});
```

**Benefits:**
- Client uploads directly to S3 (reduces server load)
- Server only generates presigned URL
- No file data passes through server

---

## 🔌 gRPC Server

**Port:** 50053

**Proto Definition:** `protos/user.proto`

**Available Methods:**
- `GetUserById` - Fetch user by ID
- `ValidateUser` - Validate user for authentication
- (Extend as needed)

**Usage (from Gateway):**
```javascript
const user = await grpcClient.userService.GetUserById({ userId: 123 });
```

---

## 📨 Email Templates

Located in: `emailTemplates/v1/`

### Verification Email
- **Template:** `verification.js`
- **Trigger:** User registration
- **Contains:** 6-digit OTP, welcome message
- **Expiration:** 10 minutes

### Password Reset Email
- **Template:** `forgotPassword.js`
- **Trigger:** Forgot password request
- **Contains:** 6-digit OTP, reset instructions
- **Expiration:** 10 minutes

**Configuration:** `services/nodemailer.js`

---

## 🧪 Testing

### Create User
```bash
curl -X POST http://localhost:8080/user-service/api/v1/users/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/user-service/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:8080/user-service/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📝 Logging

**Logger:** Winston with daily log rotation

**Logs Location:** `logs/`
- `user-service-combined-YYYY-MM-DD.log` - All logs
- `user-service-error-YYYY-MM-DD.log` - Errors only

**Configuration:** `utils/logger.js`

---

## 🔄 Database Migrations

### Create Migration
```bash
npx sequelize-cli migration:generate --name migration-name
```

### Run Migrations
```bash
npm run db:migrate          # Development
npm run db:migrate:prod     # Production
```

### Undo Migration
```bash
npm run db:migrate:undo
```

### Seeders
```bash
npm run db:seed             # Development
npm run db:seed:prod        # Production
```

---


## 🔗 Related Documentation

- [Main README](../../README.md)
- [Gateway README](../gateway/README.md)

---

## 📞 Port Information

- **HTTP Port:** 50051 (Internal Docker network)
- **gRPC Port:** 50053 (Internal Docker network)
- **Public Access:** Via Gateway at `http://localhost:8080/user-service`

---

<div align="center">

**Built with Express.js | Sequelize | MySQL | gRPC | AWS S3**

[⬆ Back to Main README](../../README.md)

</div>
