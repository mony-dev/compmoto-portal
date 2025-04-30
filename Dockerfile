# Base stage
FROM node:18-slim as base

# Install necessary packages
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock to the container
COPY package*.json yarn.lock ./

# Expose the application port
EXPOSE 3000

# Builder stage
FROM base as builder

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy all files for the build process
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:18-slim as production

# Install runtime dependencies
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --gid 1001 nodejs && \
    adduser --uid 1001 --gid 1001 --disabled-password nextjs

# Copy files from the builder stage
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/lib ./lib 
COPY --from=builder /app/prisma ./prisma

# Set permissions
RUN chown -R nextjs:nodejs /app

# Switch to the non-root user
USER nextjs

# Start the Next.js application and the cron jobs
# CMD ["sh", "-c", "node ./lib/web/jobs/scheduleJobs.mjs & npm start"]
CMD ["npm", "start"]