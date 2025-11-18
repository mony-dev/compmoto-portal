# Base stage
FROM node:18-alpine as base

# Install necessary packages (รวม openssl ด้วย)
RUN apk add --no-cache g++ make py3-pip libc6-compat openssl

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock to the container
COPY package*.json yarn.lock ./

# Expose the application port
EXPOSE 3000

# Builder stage
FROM base as builder

# Set the working directory
WORKDIR /app

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy all necessary files for the build process
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:18-alpine as production

# ติดตั้ง openssl ใน production stage ด้วย
RUN apk add --no-cache openssl

# Set the working directory
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy only necessary files from the builder stage
# COPY --from=builder /app/package.json ./package.json
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/prisma ./prisma   
COPY --from=builder /app ./ 
# Create non-root user and fix permissions for the whole app folder
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nextjs -u 1001 -G nodejs \
  && mkdir -p /app/.next/cache/images \
  && chown -R nextjs:nodejs /app

# Change to the non-root user
USER nextjs

# Start the Next.js application
CMD ["npm", "start"]
