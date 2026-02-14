const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

/**
 * Helper function to load a Proto file
 */
const loadProto = (filename) => {
  // 1. DEFINE PATH TO PROTO FILE
  const PROTO_PATH = path.join(__dirname, '../../protos', filename);

  // 2. LOAD THE PROTO FILE
  const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  // 3. RETURN THE LOADED PACKAGE
  return grpc.loadPackageDefinition(packageDefinition);
};

const userProto = loadProto('user.proto').user;

// const todoProto = loadProto('todo.proto').todo;

// 4. CREATE THE GRPC CLIENT INSTANCE
const userClient = new userProto.UserService(
  process.env.USER_SERVICE_GRPC_URL || 'user-service:50053',
  grpc.credentials.createInsecure(),
);

// const todoClient = new todoProto.TodoService(
//     process.env.TODO_SERVICE_URL || 'todo-service:50052',
//     grpc.credentials.createInsecure()
// );

module.exports = {
  userClient,
  // todoClient
};
