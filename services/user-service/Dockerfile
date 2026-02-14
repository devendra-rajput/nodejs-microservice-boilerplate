FROM node:24-alpine

WORKDIR /usr/src/app

COPY services/user-service/package*.json ./

RUN npm install

COPY services/user-service/ .

# Copy protos from root context
COPY protos/ ./protos/

EXPOSE 50051

CMD [ "npm", "run", "dev" ]
