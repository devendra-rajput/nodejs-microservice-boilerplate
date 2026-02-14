FROM node:24-alpine

WORKDIR /usr/src/app

COPY services/gateway/package*.json ./

RUN npm install

COPY services/gateway/ .
# Copy protos
COPY protos/ ./protos/

EXPOSE 8000

CMD [ "npm", "run", "dev" ]
