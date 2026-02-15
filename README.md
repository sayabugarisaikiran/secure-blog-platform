# 📝 Secure Blog Platform

A **3-Tier Architecture** web application built with modern DevOps practices.

> 🎯 **Purpose**: Teaching project for DevOps → DevSecOps pipeline using trending tools.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│              TIER 1 — PRESENTATION                   │
│  Nginx (Docker) → serves frontend + proxies API      │
│  Production: Route53 → CloudFront → WAF → ACM        │
├──────────────────────────────────────────────────────┤
│              TIER 2 — APPLICATION                    │
│  Node.js + Express API (Docker)                       │
│  JWT Auth • Blog CRUD • Health Check                  │
│  Production: ALB → ECS Fargate                        │
├──────────────────────────────────────────────────────┤
│              TIER 3 — DATA                           │
│  PostgreSQL 15 (Docker)                               │
│  Users • Posts                                        │
│  Production: AWS RDS                                  │
└──────────────────────────────────────────────────────┘
```

## 🚀 Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose installed

### Start Everything
```bash
# Clone the project
cd secure-blog-platform

# Start all 3 tiers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Access the App
| URL | Description |
|---|---|
| http://localhost | 📝 Blog Frontend |
| http://localhost/admin.html | 🔐 Admin Panel |
| http://localhost:3000/api/health | 💚 Health Check |
| http://localhost:3000/api/posts | 📜 Posts API |

### 🔌 Port Information

| Port | Service | Container | Purpose | Public Access |
|---|---|---|---|---|
| **80** | Nginx | `frontend` | HTTP web server (blog + admin UI) | ✅ Required |
| **3000** | Node.js | `backend` | Express API server | ⚠️ Optional (for direct API testing) |
| **5432** | PostgreSQL | `db` | Database server | ❌ Internal only |

**For EC2/Remote Deployment:**
- **Port 80** must be open in Security Group for web access
- Access via: `http://YOUR_EC2_PUBLIC_IP/`
- Admin panel: `http://YOUR_EC2_PUBLIC_IP/admin.html`
- Port 3000 can remain closed (frontend proxies API requests via Nginx)
- Port 5432 should **never** be exposed publicly (database is internal)

### First-Time Setup
1. Open http://localhost/admin.html
2. Click "Create Account"
3. Register as **admin** role
4. Login and create your first blog post
5. View it on http://localhost

### Stop Everything
```bash
docker-compose down       # Stop services
docker-compose down -v    # Stop + delete database data
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, get JWT token |
| GET | `/api/auth/me` | ✅ | Get current user profile |

### Posts
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/posts` | ❌ | List published posts |
| GET | `/api/posts/:id` | ❌ | Get single post |
| GET | `/api/posts/admin/all` | 🔑 Admin | List all posts (incl. drafts) |
| POST | `/api/posts` | 🔑 Admin | Create new post |
| PUT | `/api/posts/:id` | 🔑 Admin | Update post |
| DELETE | `/api/posts/:id` | 🔑 Admin | Delete post |

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server + DB health status |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript, Nginx |
| Backend | Node.js, Express, Sequelize |
| Database | PostgreSQL 15 |
| Auth | JWT + bcrypt |
| Containers | Docker, Docker Compose |

---

## 📦 Project Structure

```
secure-blog-platform/
├── backend/                  # Tier 2 — Application
│   ├── src/
│   │   ├── config/           # Database config
│   │   ├── controllers/      # Auth + Post logic
│   │   ├── middleware/       # JWT auth, error handler
│   │   ├── models/           # Sequelize models
│   │   ├── routes/           # API routes
│   │   └── app.js            # Express entry point
│   ├── tests/                # Jest integration tests
│   ├── Dockerfile
│   └── package.json
├── frontend/                 # Tier 1 — Presentation
│   ├── css/                  # Stylesheets
│   ├── js/                   # Frontend JavaScript
│   ├── index.html            # Blog page
│   ├── admin.html            # Admin panel
│   ├── nginx.conf            # Nginx config
│   └── Dockerfile
├── terraform/                # Phase 2 — IaC
├── ansible/                  # Phase 3 — Config mgmt
├── .github/workflows/        # Phase 4 — CI/CD
├── monitoring/               # Phase 7 — Observability
├── docker-compose.yml        # Local 3-tier environment
└── README.md
```

---

## 🗺️ DevOps Roadmap

- [x] **Phase 1**: Application Code + Docker
- [ ] **Phase 2**: Terraform (VPC, ECS, RDS, ALB)
- [ ] **Phase 3**: Ansible (Config Management)
- [ ] **Phase 4**: CI/CD (GitHub Actions + Jenkins)
- [ ] **Phase 5**: AWS Security (Route53, CloudFront, WAF, ACM)
- [ ] **Phase 6**: DevSecOps (SonarQube, Trivy, Checkov)
- [ ] **Phase 7**: Monitoring (Prometheus, Grafana, CloudWatch)
- [ ] **Phase 8**: Advanced (EKS, ArgoCD, Helm)
