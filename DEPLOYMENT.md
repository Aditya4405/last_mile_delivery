# LogiTrack Logistics - Production Deployment Guide

This guide provides step-by-step instructions to build, configure, run, and maintain the LogiTrack Logistics tracking system in a production containerized environment.

---

## 1. Prerequisites & Docker Installation

### Windows 11 / Windows Server
1. Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/).
2. Enable WSL 2 (Windows Subsystem for Linux) during installation.
3. Start Docker Desktop and verify the installation in PowerShell:
   ```powershell
   docker --version
   docker compose version
   ```

### Linux (Ubuntu 22.04+)
1. Update system packages and install prerequisites:
   ```bash
   sudo apt-get update
   sudo apt-get install -y ca-certificates curl gnupg
   ```
2. Add Docker's official GPG key:
   ```bash
   sudo install -m 0755 -d /etc/apt/keyrings
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
   sudo chmod a+r /etc/apt/keyrings/docker.gpg
   ```
3. Set up the repository:
   ```bash
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   sudo apt-get update
   ```
4. Install Docker Engine and Compose:
   ```bash
   sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   ```
5. Verify services are running:
   ```bash
   sudo systemctl status docker
   ```

---

## 2. Configuration Setup

Copy the template `.env.example` file to `.env`:
```bash
cp .env.example .env
```

Open `.env` and fill in your active production credentials:
* **`DB_USERNAME` / `DB_PASSWORD`**: Database authentication credentials.
* **`JWT_SECRET`**: HMAC SHA-256 bits secure string (at least 64 hex characters).
* **`SMTP_USERNAME` / `SMTP_PASSWORD`**: SMTP mail server authentication keys.
* **`RAZORPAY_KEY` / `RAZORPAY_SECRET`**: Razorpay checkout keys.

---

## 3. Container Management

### Build Images
To compile the Spring Boot jar and build the React static build with Nginx:
```bash
docker compose build --no-cache
```

### Start Containers
To start all services (PostgreSQL, Spring Boot backend, Nginx frontend) in the background:
```bash
docker compose up -d
```
* **Ports exposed**:
  * **React Frontend / Nginx Proxy**: Port `80` (or `443` if SSL is set up).
  * **Spring Boot Backend**: Port `8084` (internally mapped).
  * **PostgreSQL Database**: Port `5432` (internally mapped).

### View Container Logs
To monitor service logs in real-time:
```bash
docker compose logs -f
```

### Stop Containers
To shut down all running services without losing database schema or uploads data:
```bash
docker compose down
```

---

## 4. Database Maintenance Operations

### Backup Database
To perform a complete hot backup of the PostgreSQL schema and data:
```bash
docker exec -t logitrack_postgres pg_dump -U postgres -d lastmile_tracker > backup.sql
```

### Restore Database
To restore a backup into a fresh database:
1. Copy your `backup.sql` to the container environment or execute:
   ```bash
   cat backup.sql | docker exec -i logitrack_postgres psql -U postgres -d lastmile_tracker
   ```

---

## 5. Cloud Platform Deployments

### Railway Deployment (Spring Boot Backend)
1. **Create Project**: Sign in to [Railway](https://railway.app) and create a new project.
2. **Provision PostgreSQL**: Add a PostgreSQL database service inside your Railway project.
3. **Deploy Backend**: Click "New" -> "GitHub Repo" -> Select this repository.
   * Under settings, set the **Root Directory** of the service to `lastmile-backend`.
4. **Environment Variables**: Configure the following Variables in the backend service tab:
   * `PORT`: `8084` (or leave empty to let Railway assign a dynamic port)
   * `DB_URL`: `${{Postgres.DATABASE_URL}}` (or `jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}`)
   * `DB_USERNAME`: `${{Postgres.PGUSER}}`
   * `DB_PASSWORD`: `${{Postgres.PGPASSWORD}}`
   * `JWT_SECRET`: Generate a secure 64-character hex string.
   * `SMTP_HOST`: `smtp.gmail.com`
   * `SMTP_PORT`: `587`
   * `SMTP_USERNAME`: Your Gmail address.
   * `SMTP_PASSWORD`: Your App Password (not your primary password).
   * `RAZORPAY_KEY`: Your Razorpay Key ID.
   * `RAZORPAY_SECRET`: Your Razorpay Secret Key.

### Vercel Deployment (React Frontend)
1. **Connect Project**: Sign in to [Vercel](https://vercel.app), click "Add New" -> "Project" -> Import your GitHub repository.
2. **Framework & Directory**: 
   * **Framework Preset**: `Vite`
   * **Root Directory**: Select the root folder `./` (where `package.json` is located).
3. **Build & Development Settings**:
   * Build Command: `npm run build`
   * Output Directory: `dist`
4. **Environment Variables**: Add these variables before clicking "Deploy":
   * `VITE_APP_MODE`: `live`
   * `VITE_API_BASE_URL`: The public HTTPS URL of your Railway backend service (e.g. `https://lastmile-backend-production.up.railway.app`).
   * `VITE_WS_URL`: The public HTTPS/WSS URL of your Railway backend's SockJS WebSocket endpoint (e.g. `https://lastmile-backend-production.up.railway.app/ws`).

