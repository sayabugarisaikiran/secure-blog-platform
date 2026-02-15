# Phase 2: Terraform Deployment Guide

## What This Does

Deploys the 3-tier blog platform to AWS with:
- **VPC** with 6 subnets across 2 AZs (public, private, data)
- **ECS Fargate** running frontend + backend containers
- **RDS PostgreSQL** Multi-AZ database
- **Application Load Balancer** for traffic distribution
- **ECR** for Docker image storage
- **Secrets Manager** for database credentials

---

## Prerequisites

1. **AWS CLI** configured with credentials:
   ```bash
   aws configure
   ```

2. **Terraform** installed (v1.0+):
   ```bash
   terraform version
   ```

3. **Docker images** built locally:
   ```bash
   cd ../
   docker build -t blog-frontend ./frontend
   docker build -t blog-backend ./backend
   ```

---

## Deployment Steps

### Step 1: Initialize Terraform

```bash
cd terraform/
terraform init
```

This downloads the AWS provider and initializes the backend.

### Step 2: Review the Plan

```bash
terraform plan
```

This shows what resources will be created. Review carefully!

### Step 3: Deploy Infrastructure

```bash
terraform apply
```

Type `yes` when prompted. This takes **10-15 minutes** (RDS Multi-AZ is slow to provision).

### Step 4: Get ECR Repository URLs

```bash
terraform output ecr_frontend_url
terraform output ecr_backend_url
```

### Step 5: Push Docker Images to ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $(terraform output -raw ecr_frontend_url | cut -d'/' -f1)

# Tag and push frontend
docker tag blog-frontend:latest $(terraform output -raw ecr_frontend_url):latest
docker push $(terraform output -raw ecr_frontend_url):latest

# Tag and push backend
docker tag blog-backend:latest $(terraform output -raw ecr_backend_url):latest
docker push $(terraform output -raw ecr_backend_url):latest
```

### Step 6: Update ECS Service

After pushing images, force ECS to pull the new images:

```bash
aws ecs update-service \
  --cluster secure-blog-cluster \
  --service secure-blog-service \
  --force-new-deployment \
  --region us-east-1
```

### Step 7: Access Your App

```bash
terraform output alb_dns_name
```

Visit the URL in your browser! Example: `http://secure-blog-alb-1234567890.us-east-1.elb.amazonaws.com`

---

## Verify Deployment

### Check ECS Tasks

```bash
aws ecs list-tasks --cluster secure-blog-cluster --region us-east-1
```

### View Logs

```bash
aws logs tail /ecs/secure-blog --follow --region us-east-1
```

### Test Health Endpoint

```bash
curl http://$(terraform output -raw alb_dns_name | sed 's|http://||')/api/health
```

---

## Cost Management

**Estimated monthly cost: ~$125**

To avoid charges when not using:

```bash
terraform destroy
```

Type `yes` to confirm deletion of all resources.

---

## Troubleshooting

### ECS Tasks Not Starting

1. Check CloudWatch Logs:
   ```bash
   aws logs tail /ecs/secure-blog --follow
   ```

2. Verify images exist in ECR:
   ```bash
   aws ecr describe-images --repository-name secure-blog-frontend
   aws ecr describe-images --repository-name secure-blog-backend
   ```

### Database Connection Issues

1. Verify RDS is running:
   ```bash
   aws rds describe-db-instances --db-instance-identifier secure-blog-db
   ```

2. Check security group rules allow ECS → RDS on port 5432

### ALB Health Checks Failing

1. Ensure backend `/api/health` endpoint returns 200
2. Check target group health:
   ```bash
   aws elbv2 describe-target-health --target-group-arn <ARN>
   ```

---

## What's Next?

- **Phase 3**: Ansible for configuration management
- **Phase 4**: CI/CD pipeline with GitHub Actions
- **Phase 5**: Add CloudFront, WAF, Route53 for production security

---

## File Structure

```
terraform/
├── providers.tf          # AWS provider config
├── variables.tf          # Input variables
├── vpc.tf                # VPC, subnets, NAT, IGW
├── security-groups.tf    # Firewall rules
├── ecr.tf                # Container registry
├── secrets.tf            # Database password
├── rds.tf                # PostgreSQL Multi-AZ
├── iam.tf                # ECS task roles
├── alb.tf                # Load balancer
├── ecs.tf                # Fargate cluster/service
├── outputs.tf            # Important values
└── README.md             # This file
```

---

## Clean Up

When done testing:

```bash
terraform destroy
```

This removes all AWS resources and stops billing.
