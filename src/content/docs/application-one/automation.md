---
title: "Application One - Automation Guide"
description: "Automation setup and configuration for Application One CI/CD pipelines"
app: "Application One"
category: "automation"
order: 2
lastUpdated: 2025-07-15
tags: ["automation", "ci-cd", "deployment", "testing"]
---

# Application One - Automation Guide

This guide covers the automation infrastructure for Application One, including CI/CD pipelines, automated testing, deployment processes, and monitoring.

## CI/CD Pipeline Overview

Application One uses a comprehensive CI/CD pipeline built on GitHub Actions, providing automated testing, building, and deployment capabilities.

### Pipeline Architecture

```mermaid
graph LR
    A[Developer Push] --> B[GitHub Actions]
    B --> C[Unit Tests]
    B --> D[Integration Tests]
    B --> E[Security Scan]
    C --> F[Build Application]
    D --> F
    E --> F
    F --> G[Deploy to Staging]
    G --> H[E2E Tests]
    H --> I[Deploy to Production]
```

## GitHub Actions Workflows

### Main CI/CD Workflow

Located at `.github/workflows/ci-cd.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: app_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:6
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:unit
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/app_test
          REDIS_URL: redis://localhost:6379
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/app_test
          REDIS_URL: redis://localhost:6379

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run security audit
        run: npm audit --audit-level moderate
      
      - name: Run CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          languages: javascript

  build:
    needs: [test, security]
    runs-on: ubuntu-latest
    
    outputs:
      image: ${{ steps.image.outputs.image }}
      digest: ${{ steps.build.outputs.digest }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push Docker image
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
      - name: Deploy to staging
        run: |
          echo "Deploying to staging environment..."
          # Add actual deployment commands here

  e2e-tests:
    if: github.ref == 'refs/heads/develop'
    needs: deploy-staging
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          E2E_BASE_URL: https://staging.app-one.hallcrest.engineering

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: [build, e2e-tests]
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production environment..."
          # Add actual deployment commands here
```

## Automated Testing Strategy

### Unit Testing
- **Framework**: Jest with React Testing Library
- **Coverage**: Minimum 80% code coverage required
- **Location**: `src/**/*.test.{js,ts,jsx,tsx}`

#### Example Unit Test
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '../components/LoginForm';

describe('LoginForm', () => {
  it('should submit form with valid credentials', async () => {
    const mockSubmit = jest.fn();
    render(<LoginForm onSubmit={mockSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

### Integration Testing
- **Framework**: Supertest with Jest
- **Database**: Test database with fixtures
- **Location**: `tests/integration/**/*.test.js`

#### Example Integration Test
```javascript
import request from 'supertest';
import { app } from '../src/app';
import { setupTestDB, teardownTestDB } from './helpers/database';

describe('API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate valid user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
    });
  });
});
```

### End-to-End Testing
- **Framework**: Playwright
- **Browsers**: Chrome, Firefox, Safari
- **Location**: `e2e/**/*.spec.js`

#### Example E2E Test
```javascript
import { test, expect } from '@playwright/test';

test.describe('User Authentication Flow', () => {
  test('should allow user to login and access dashboard', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'testpassword');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
  });
});
```

## Deployment Automation

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: application-one
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: application-one
  template:
    metadata:
      labels:
        app: application-one
    spec:
      containers:
      - name: app
        image: ghcr.io/hallcrest/application-one:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Database Migrations

Automated database migrations using GitHub Actions:

```yaml
# .github/workflows/migrate.yml
name: Database Migration

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        type: choice
        options:
        - staging
        - production

jobs:
  migrate:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migrations
        run: npm run migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Monitoring and Alerting

### Application Monitoring
- **APM**: New Relic or DataDog
- **Error Tracking**: Sentry
- **Logs**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Metrics**: Prometheus + Grafana

### Alert Configuration

```yaml
# monitoring/alerts.yml
groups:
- name: application-one-alerts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value }} errors per second"

  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected"
      description: "95th percentile response time is {{ $value }} seconds"

  - alert: DatabaseConnectionFailure
    expr: up{job="postgres"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Database connection failed"
      description: "PostgreSQL database is not responding"
```

## Infrastructure as Code

### Terraform Configuration

```hcl
# infrastructure/main.tf
provider "aws" {
  region = var.aws_region
}

resource "aws_ecs_cluster" "main" {
  name = "application-one-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_service" "app" {
  name            = "application-one"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 3

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "application-one"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.app]
}
```

## Performance Testing

### Load Testing with k6

```javascript
// performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  let response = http.get('https://app-one.hallcrest.engineering/api/health');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

## Backup and Recovery

### Automated Database Backups

```bash
#!/bin/bash
# scripts/backup-database.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="application_one_backup_${TIMESTAMP}.sql"

pg_dump $DATABASE_URL > /backups/$BACKUP_FILE

# Upload to S3
aws s3 cp /backups/$BACKUP_FILE s3://hallcrest-backups/application-one/

# Clean up local file
rm /backups/$BACKUP_FILE

echo "Database backup completed: $BACKUP_FILE"
```

## Troubleshooting Automation

### Common CI/CD Issues

#### Test Failures
1. Check test logs in GitHub Actions
2. Verify database/Redis connectivity
3. Review environment variables
4. Check for race conditions in tests

#### Deployment Failures
1. Verify container registry access
2. Check Kubernetes cluster status
3. Review resource quotas
4. Validate configuration secrets

#### Performance Issues
1. Monitor application metrics
2. Check database query performance
3. Review error rates and response times
4. Analyze resource utilization

For automated incident response, see the [Support Guide](./support.md).

## Security Automation

### Vulnerability Scanning
- **Dependencies**: npm audit, Snyk
- **Containers**: Trivy, Clair
- **Code**: CodeQL, SonarQube
- **Infrastructure**: Checkov, tfsec

### Compliance Monitoring
- SOC 2 compliance checks
- GDPR data handling validation
- Security policy enforcement
- Access control auditing

## Best Practices

1. **Version Control**: Use semantic versioning for releases
2. **Branch Protection**: Require PR reviews and status checks
3. **Secret Management**: Use GitHub Secrets and Azure Key Vault
4. **Resource Limits**: Set appropriate CPU/memory limits
5. **Rollback Strategy**: Implement automated rollback triggers
6. **Documentation**: Keep automation docs up to date

For additional support, contact the DevOps team at devops@hallcrest.engineering.