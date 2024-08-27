# Base stage
FROM node:18-alpine as base
RUN apk add --no-cache g++ make py3-pip libc6-compat
WORKDIR /app
COPY package*.json ./
EXPOSE 3000

# Builder stage
FROM base as builder
WORKDIR /app

# Install dependencies
RUN npm ci

# Copy all files for the build process
COPY . .

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:18-alpine as production
WORKDIR /app
ENV NODE_ENV=production

# Copy over the package.json and node_modules from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Copy the built Next.js app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nextjs -u 1001
USER nextjs

# Start the Next.js application
CMD ["npm", "start"]

# Dev stage
FROM base as dev
ENV NODE_ENV=development
RUN npm install 
COPY . .
CMD ["npm", "run", "dev"]
