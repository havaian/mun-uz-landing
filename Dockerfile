FROM node:20-alpine

# Create app directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Create data directory with proper permissions
RUN mkdir -p data && chown -R nodejs:nodejs data

# Bundle app source
COPY . .

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]