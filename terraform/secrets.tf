# ============================================================
# Secrets Manager
# ============================================================
# Stores database password securely

# Generate a random password for the database
resource "random_password" "db_password" {
  length  = 16
  special = true
}

# Store the password in Secrets Manager
resource "aws_secretsmanager_secret" "db_password" {
  name        = "${var.app_name}-db-password"
  description = "Database password for ${var.app_name}"

  tags = {
    Name = "${var.app_name}-db-password"
  }
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id = aws_secretsmanager_secret.db_password.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db_password.result
  })
}
