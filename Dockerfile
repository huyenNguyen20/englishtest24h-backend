FROM node:16-alpine3.11

WORKDIR /backend

ADD package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD npm run start:dev