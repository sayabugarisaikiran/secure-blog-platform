# Architecture Security Model

## Overview

This document explains the security architecture of the Secure Blog Platform and best practices for exposing services in Docker and Kubernetes environments.

---

## The Golden Rule

```
✅ CORRECT: Internet → Load Balancer → Frontend → Backend (internal) → Database
❌ WRONG:   Internet → Load Balancer → Backend (direct external access)
```

**Backend APIs should NEVER be directly exposed to the internet.**

---

## Current Architecture (Docker Compose / ECS Fargate)

### Traffic Flow

```
┌─────────────────────────────────────────────────────────┐
│                        Internet                          │
└────────────────────────┬────────────────────────────────┘
                         │
                    Port 80/443
                         │
                         ▼
              ┌──────────────────────┐
              │   Load Balancer      │
              │   (ALB / Nginx)      │
              └──────────┬───────────┘
                         │
                    Port 80
                         │
                         ▼
              ┌──────────────────────┐
              │  Frontend Container  │  ◄─── ✅ ONLY this is public
              │  (Nginx)             │
              └──────────┬───────────┘
                         │
              Internal proxy /api/*
                         │
                         ▼
              ┌──────────────────────┐
              │  Backend Container   │  ◄─── ❌ NOT exposed externally
              │  (Node.js:3000)      │
              └──────────┬───────────┘
                         │
                    Port 5432
                         │
                         ▼
              ┌──────────────────────┐
              │  Database            │  ◄─── ❌ NOT exposed externally
              │  (PostgreSQL)        │
              └──────────────────────┘
```

### Security Layers

| Layer | Component | External Access | Protected By |
|---|---|---|---|
| **Tier 1** | Frontend (Nginx) | ✅ Public | ALB Security Group (ports 80/443) |
| **Tier 2** | Backend (Node.js) | ❌ Private | ECS Security Group (only from ALB) |
| **Tier 3** | Database (PostgreSQL) | ❌ Private | RDS Security Group (only from ECS) |

---

## How Backend Stays Internal

### 1. Docker Compose (Local Development)

**`docker-compose.yml`:**
```yaml
services:
  frontend:
    ports:
      - "80:80"        # ✅ Exposed to host machine
  
  backend:
    # ❌ NO ports section = not exposed to host
    # Only accessible via internal Docker network
  
  db:
    # ❌ NO ports section = not exposed to host
```

**`frontend/nginx.conf`:**
```nginx
location /api/ {
    proxy_pass http://backend:3000/api/;  # Internal container-to-container
}
```

### 2. AWS ECS Fargate (Production)

**`terraform/security-groups.tf`:**
```hcl
# Backend only accepts traffic from ALB
resource "aws_security_group" "ecs" {
  ingress {
    from_port       = 3000
    security_groups = [aws_security_group.alb.id]  # ← Only ALB can reach it
  }
}
```

**`terraform/ecs.tf`:**
```hcl
# ALB targets frontend container, not backend
load_balancer {
  container_name   = "frontend"  # ← External traffic goes here
  container_port   = 80
}
```

---

## Kubernetes Architecture (Phase 8)

### Recommended: Ingress with Path-Based Routing

```yaml
# Frontend Service (internal)
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  type: ClusterIP  # ❌ Not exposed externally
  ports:
    - port: 80

---
# Backend Service (internal)
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  type: ClusterIP  # ❌ Not exposed externally
  ports:
    - port: 3000

---
# Ingress (single external entry point)
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: blog-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - host: blog.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend
                port:
                  number: 3000
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80
```

**Result:** Ingress controller is the only external entry point. Both services remain internal.

---

## Why Backend Should Be Internal

### Security Benefits

| Benefit | Description |
|---|---|
| **Reduced Attack Surface** | Attackers cannot directly probe backend API endpoints |
| **Defense in Depth** | Multiple layers (ALB → Frontend → Backend) |
| **CORS Prevention** | No cross-origin issues when frontend proxies requests |
| **Centralized Security** | Add WAF, rate limiting, authentication at one point (ALB/Ingress) |
| **Compliance** | Meets PCI-DSS, HIPAA, SOC 2 requirements for internal APIs |

### Operational Benefits

| Benefit | Description |
|---|---|
| **Single Entry Point** | Easier monitoring and logging |
| **Flexible Backend Changes** | Can modify backend without affecting external clients |
| **Simplified DNS** | Only one public DNS record needed |
| **Cost Optimization** | One load balancer instead of two |

---

## Exceptions: When to Expose Backend Directly

Only expose backend externally in these scenarios:

### 1. Public API Product
- Building an API-as-a-service (like Stripe, Twilio, GitHub API)
- **Add:** API Gateway, rate limiting, API keys, OAuth

### 2. Mobile/Native Apps
- Mobile apps need direct API access (can't use Nginx proxy)
- **Add:** AWS API Gateway or Kong Gateway with authentication

### 3. Microservices with Service Mesh
- Using Istio, Linkerd, or Consul for service-to-service communication
- **Add:** mTLS, service mesh policies, zero-trust networking

### 4. GraphQL Federation
- Multiple backend services federated into one GraphQL endpoint
- **Add:** Apollo Gateway or GraphQL Mesh

**For a blog platform:** Backend should **always remain internal**. ✅

---

## Verification Checklist

Use this checklist to verify your architecture is secure:

### Docker Compose
- [ ] Backend has NO `ports:` section in `docker-compose.yml`
- [ ] Frontend Nginx config proxies `/api/*` to backend
- [ ] Database has NO `ports:` section

### AWS ECS Fargate
- [ ] ALB security group allows 80/443 from `0.0.0.0/0`
- [ ] ECS security group allows 3000 ONLY from ALB security group
- [ ] RDS security group allows 5432 ONLY from ECS security group
- [ ] ALB target group points to frontend container, not backend

### Kubernetes
- [ ] Frontend service type is `ClusterIP` (not `LoadBalancer`)
- [ ] Backend service type is `ClusterIP` (not `LoadBalancer`)
- [ ] Ingress is the only resource with external access
- [ ] Network policies restrict pod-to-pod communication

---

## Testing Security

### Test 1: Verify Backend is NOT Accessible

```bash
# This should FAIL (connection refused or timeout)
curl http://YOUR_ALB_DNS:3000/api/health

# This should SUCCEED (proxied through frontend)
curl http://YOUR_ALB_DNS/api/health
```

### Test 2: Check Security Groups (AWS)

```bash
# ECS security group should only allow traffic from ALB
aws ec2 describe-security-groups \
  --group-ids sg-xxxxxxxxx \
  --query 'SecurityGroups[0].IpPermissions'
```

### Test 3: Verify Nginx Proxy

```bash
# Check Nginx logs to see proxy requests
docker logs <frontend-container-id> | grep "proxy"
```

---

## Common Mistakes to Avoid

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| Exposing backend on port 3000 | Only expose frontend on port 80 |
| Using `LoadBalancer` for backend in K8s | Use `ClusterIP` for backend |
| Opening backend security group to `0.0.0.0/0` | Only allow traffic from ALB/frontend |
| Skipping Nginx proxy configuration | Always proxy `/api/*` through frontend |
| Using separate ALBs for frontend and backend | Use one ALB with path-based routing |

---

## References

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [AWS Well-Architected Framework - Security Pillar](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html)
- [Kubernetes Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/)
- [NIST Zero Trust Architecture](https://www.nist.gov/publications/zero-trust-architecture)

---

## Summary

**The Secure Blog Platform follows security best practices:**

✅ Frontend is the only externally accessible component  
✅ Backend is internal-only, accessible via Nginx proxy  
✅ Database is isolated in private subnets  
✅ Security groups enforce least-privilege access  
✅ Architecture scales from Docker Compose to Kubernetes  

This design is **production-ready** and follows industry standards for secure web application architecture.
