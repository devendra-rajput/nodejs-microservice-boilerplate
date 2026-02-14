/**
 * Todo Service - Placeholder
 * This service is currently under development
 */

const express = require('express');

const app = express();
const PORT = process.env.PORT || 50052;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Todo Service - Coming Soon! 🚧',
    status: 'Under Development',
    plannedFeatures: [
      'Create, Read, Update, Delete Todos',
      'MongoDB integration with Mongoose',
      'gRPC server for inter-service communication',
      'User-specific todo management',
      'Todo categories and tags',
      'Due dates and reminders',
      'Priority levels',
      'Search and filtering',
    ],
    documentation: 'See services/todo-service/README.md for details',
  });
});

// Placeholder endpoints (catch-all for non-existent routes)
app.use((req, res) => {
  res.status(503).json({
    success: false,
    message: 'Todo Service is currently under development',
    availableEndpoints: [
      'GET / - Service status',
    ],
  });
});

// Error handling
app.use((err, req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚧 Todo Service (Placeholder) running on port ${PORT}`);
  console.log('⚠️  This service is under development');
  console.log('📝 Planned features: Task management, MongoDB integration, gRPC support');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down todo-service...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down todo-service...');
  process.exit(0);
});
