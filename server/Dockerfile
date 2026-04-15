FROM node:18-alpine

WORKDIR /app

# Copy package files from server folder
COPY server/package*.json server/tsconfig.json ./

# Install dependencies
RUN npm install

# Copy server source code
COPY server/src ./src

# Copy shared folder (from root)
COPY shared ./shared

# Build TypeScript
RUN npm run build

# List contents to debug (optional - remove after working)
RUN ls -la && ls -la dist/

EXPOSE 3000

CMD ["npm", "start"]