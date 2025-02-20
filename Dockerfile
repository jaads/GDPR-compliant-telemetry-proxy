FROM node:22-alpine

# Set non-root user for security
USER node

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

# Copy the rest of the application
COPY --chown=node:node . .

# Set environment variables
# to allow to change it at runtime with docker run -e PORT=5051
# ENV PORT=3000

# Expose the port
EXPOSE 3000

# Run the application
CMD ["node", "server.js"]