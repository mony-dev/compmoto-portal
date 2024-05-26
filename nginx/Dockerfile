FROM nginx:alpine

# Copy custom Nginx configuration file
COPY conf.d/default.conf /etc/nginx/conf.d/default.conf

# Expose ports 80 and 443
EXPOSE 80
EXPOSE 443

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
