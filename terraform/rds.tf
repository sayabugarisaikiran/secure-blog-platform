# ============================================================
# RDS PostgreSQL Database
# ============================================================
# Multi-AZ deployment for high availability

resource "aws_db_instance" "main" {
  identifier = "${var.app_name}-db"

  # Database engine
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"  # Free tier eligible

  # Storage
  allocated_storage     = 20
  max_allocated_storage = 100  # Enable storage autoscaling
  storage_type          = "gp3"
  storage_encrypted     = true

  # Database credentials
  db_name  = "blogdb"
  username = var.db_username
  password = random_password.db_password.result

  # High availability
  multi_az               = true  # Automatic failover to standby
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  # Backup configuration
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"

  # Performance and monitoring
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  performance_insights_enabled    = true
  monitoring_interval             = 60
  monitoring_role_arn             = aws_iam_role.rds_monitoring.arn

  # Deletion protection (set to false for dev/testing)
  deletion_protection = false
  skip_final_snapshot = true  # Set to false in production!

  tags = {
    Name = "${var.app_name}-db"
  }
}

# IAM role for RDS enhanced monitoring
resource "aws_iam_role" "rds_monitoring" {
  name = "${var.app_name}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "monitoring.rds.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}
