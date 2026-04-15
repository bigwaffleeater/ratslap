FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code and shared folder
COPY src ./src
COPY ../shared ./shared

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]