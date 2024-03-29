FROM --platform=linux/amd64 node:17

# Create app directory
WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Install NestJS CLI
RUN npm i -g @nestjs/cli

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# RUN npm install --production
# If you are building your code for production
RUN npm ci --only=production

# Bundle app source
COPY . .


RUN npm run build

CMD [ "node", "dist/main" ]