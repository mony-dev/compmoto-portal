# Base stage
FROM node:18-alpine as base
RUN apk add --no-cache g++ make py3-pip libc6-compat
WORKDIR /app
COPY package*.json yarn.lock ./
EXPOSE 3000

# Builder stage
FROM base as builder
WORKDIR /app

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy all files for the build process
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:18-alpine as production
WORKDIR /app
ENV NODE_ENV=production

# Copy over the necessary files from the builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nextjs -u 1001
USER nextjs

# Start the Next.js application
CMD ["npm", "start"]
