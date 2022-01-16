# Base on offical Node.js Alpine image
FROM node:17-alpine

# Install the latest version of NPM
RUN npm install -g npm@8.1.4

# Install PM2 globally
RUN npm install --global pm2

# Clear Cache
RUN npm  cache clear --force

# Set working directory
WORKDIR /opt

# Copy package.json and package-lock.json before other files
# Utilise Docker cache to save re-installing dependencies if unchanged
COPY ./package*.json ./


# Install dependencies
RUN npm install --production

# Copy all files
COPY ./ ./

# Build app
RUN npm run build

# Expose the listening port
EXPOSE 3000

# Run container as non-root (unprivileged) user
# The node user is provided in the Node.js Alpine base image
USER node

# Run npm start script with PM2 when container starts
CMD [ "pm2-runtime", "npm", "--", "start" ]