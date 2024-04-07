FROM nginx:alpine

# Copy custom Nginx configuration file
COPY nginx.conf /etc/nginx/sites-enabled/default

# Expose port 80 (HTTP)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
