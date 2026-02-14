FROM node:18-alpine

WORKDIR /usr/src/app

COPY services/todo-service/package*.json ./

RUN npm install

COPY services/todo-service/ .
# Copy protos from root context
COPY protos/ ./protos/

EXPOSE 50052

CMD [ "npm", "start" ]
