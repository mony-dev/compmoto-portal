# Production stage
FROM node:18-alpine as production

# Set the working directory
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy only necessary files from the builder stage
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/lib ./lib

RUN chmod +x /app/lib/web/utils/fetchInvoice.mjs

# Create the .next/cache/images directory and set correct permissions
RUN mkdir -p /app/.next/cache/images && \
    chown -R 1001:1001 /app/.next && \
    chown -R 1001:1001 /app/lib

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Ensure the node_modules directory is accessible
RUN chown -R nextjs:nodejs /app/node_modules

# Change to the non-root user
USER nextjs

# Start the Next.js application
CMD ["npm", "start"]