# ShopSphere Campus - Deployment & Production Operations Guide

This guide covers production deployment strategies for the ShopSphere Campus platform, ranging from automated Docker Compose orchestration to cloud deployments.

---

## 1. Containerized Deployment (Docker Compose)

The recommended deployment method encapsulates all three tiers:
1. **Database**: MySQL 8.0 with volume persistence (`mysql_data`).
2. **Backend**: Spring Boot 3.3.4 running on Eclipse Temurin 21 JRE Alpine.
3. **Frontend**: React 19 SPA built via Node 20 and served through high-performance Alpine Nginx.

### Step 1: Clone and Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure strong passwords for `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, and a 256-bit `JWT_SECRET`.

### Step 2: Build and Run Containers
```bash
docker compose up -d --build
```

### Step 3: Verify Container Health
```bash
docker compose ps
```
All services should report `Up (healthy)`.

---

## 2. Cloud Platform Deployment (AWS EC2 / Ubuntu 22.04 LTS)

### Step 1: Install System Prerequisites
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y openjdk-21-jdk maven nodejs npm nginx mysql-server
```

### Step 2: Configure MySQL
```bash
sudo mysql -e "CREATE DATABASE shopsphere_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER 'shopsphere'@'localhost' IDENTIFIED BY 'YourSecurePassword@2025';"
sudo mysql -e "GRANT ALL PRIVILEGES ON shopsphere_db.* TO 'shopsphere'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
```

### Step 3: Build & Run Spring Boot Backend
```bash
cd backend
mvn clean package -DskipTests
nohup java -jar target/shopsphere-backend-1.0.0.jar --spring.profiles.active=prod > backend.log 2>&1 &
```

### Step 4: Build & Deploy Frontend to Nginx
```bash
cd ../frontend
npm ci
npm run build
sudo cp -r dist/* /var/www/html/
```

Configure Nginx `/etc/nginx/sites-available/shopsphere`:
```nginx
server {
    listen 80;
    server_name your-campus-domain.edu;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
Enable the site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/shopsphere /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

---

## 3. Production Health & Observability

ShopSphere exposes Spring Boot Actuator endpoints for system observability:
- **Liveness & Readiness**: `GET /actuator/health`
- **Application Info**: `GET /actuator/info`
- **JVM Heap & GC Metrics**: `GET /actuator/metrics`
- **OpenAPI Specification**: `GET /v3/api-docs`
- **Swagger Interactive UI**: `GET /swagger-ui.html`
