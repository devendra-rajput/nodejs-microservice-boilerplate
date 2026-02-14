const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const { validateUser } = require('./controllers/user.controller');

// 1. DEFINE PATH TO PROTO FILE
const PROTO_PATH = path.join(__dirname, '../../protos/user.proto');

// 2. LOAD THE PROTO FILE
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// 3. CREATE THE GRPC OBJECT
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

const startGrpcServer = () => {
  // 4. CREATE A NEW SERVER INSTANCE
  const server = new grpc.Server();

  // 5. REGISTER SERVICES
  server.addService(userProto.UserService.service, {
    ValidateUser: validateUser,
  });

  // 6. DEFINE THE PORT
  const PORT = process.env.GRPC_PORT || '50053';

  // 7. START THE SERVER
  server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Failed to bind gRPC server:', err);
      return;
    }

    // Log success message using the actual bound port
    console.log(`gRPC Server running at 0.0.0.0:${port}`);
  });
};

module.exports = {
  startGrpcServer,
};
