FROM node:20-alpine

WORKDIR /app

# Install Python and build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ src/
COPY squid.json ./
COPY schema.graphql ./

# Build the application
RUN npm run build

# Expose ports
EXPOSE 4000 3000

# Default command
CMD ["npm", "run", "process"]