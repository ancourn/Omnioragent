# Stage 1: Build Next.js app
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build Next.js
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# Copy built app
COPY --from=builder /app ./

# Create workspace and templates directories if they don't exist
RUN mkdir -p workspace templates

# Expose port
EXPOSE 3000

# Run Next.js server
CMD ["npm", "run", "start"]