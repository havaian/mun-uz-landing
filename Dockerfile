FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Create data directory with proper permissions
RUN mkdir -p data

# Bundle app source
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]