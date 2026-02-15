# ============================================================
# Frontend Dockerfile — Nginx serving static files
# ============================================================
# Serves HTML/CSS/JS and proxies API requests to backend
# ============================================================

FROM nginx:1.27-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy frontend static files
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
