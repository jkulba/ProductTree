---
title: "Application Two - Automation Guide"
description: "Microservices automation, orchestration, and CI/CD for Application Two"
app: "Application Two"
category: "automation"
order: 2
lastUpdated: 2025-01-15
tags: ["automation", "microservices", "kubernetes", "ci-cd"]
---

# Application Two - Automation Guide

This guide covers the automation infrastructure for Application Two's microservices platform, including CI/CD pipelines, service orchestration, monitoring automation, and deployment strategies.

## Multi-Service CI/CD Pipeline

Application Two uses a sophisticated CI/CD pipeline that handles multiple services with interdependencies, automated testing across service boundaries, and coordinated deployments.

### Pipeline Architecture

```mermaid
graph TB
    A[Code Push] --> B[Service Detection]
    B --> C[Parallel Service Builds]
    C --> D[Unit Tests]
    C --> E[Integration Tests]
    C --> F[Security Scans]
    D --> G[Build Containers]
    E --> G
    F --> G
    G --> H[Deploy to Staging]
    H --> I[E2E Tests]
    I --> J[Performance Tests]
    J --> K[Deploy to Production]
```

### GitHub Actions Workflow

Located at `.github/workflows/microservices-ci-cd.yml`:

```yaml
name: Microservices CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME_PREFIX: ${{ github.repository }}

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      api-gateway: ${{ steps.changes.outputs.api-gateway }}
      user-service: ${{ steps.changes.outputs.user-service }}
      data-processor: ${{ steps.changes.outputs.data-processor }}
      analytics-service: ${{ steps.changes.outputs.analytics-service }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v2
        id: changes
        with:
          filters: |
            api-gateway:
              - 'services/api-gateway/**'
            user-service:
              - 'services/user-service/**'
            data-processor:
              - 'services/data-processor/**'
            analytics-service:
              - 'services/analytics/**'

  test-api-gateway:
    if: needs.detect-changes.outputs.api-gateway == 'true'
    needs: detect-changes
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: services/api-gateway/package-lock.json
      
      - name: Install dependencies
        run: npm ci
        working-directory: services/api-gateway
      
      - name: Run tests
        run: npm test
        working-directory: services/api-gateway
      
      - name: Run linting
        run: npm run lint
        working-directory: services/api-gateway

  test-user-service:
    if: needs.detect-changes.outputs.user-service == 'true'
    needs: detect-changes
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: user_service_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
        working-directory: services/user-service
      
      - name: Run tests
        run: pytest --cov=app --cov-report=xml
        working-directory: services/user-service
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/user_service_test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: services/user-service/coverage.xml

  test-data-processor:
    if: needs.detect-changes.outputs.data-processor == 'true'
    needs: detect-changes
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:6
        env:
          MONGO_INITDB_ROOT_USERNAME: admin
          MONGO_INITDB_ROOT_PASSWORD: password
        options: >-
          --health-cmd "echo 'db.runCommand(\"ping\").ok'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      kafka:
        image: confluentinc/cp-kafka:latest
        env:
          KAFKA_BROKER_ID: 1
          KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
          KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Cache Maven dependencies
        uses: actions/cache@v3
        with:
          path: ~/.m2
          key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}
      
      - name: Run tests
        run: mvn test
        working-directory: services/data-processor
        env:
          MONGODB_URI: mongodb://admin:password@localhost:27017/test?authSource=admin
          KAFKA_BOOTSTRAP_SERVERS: localhost:9092

  build-and-push:
    needs: [detect-changes, test-api-gateway, test-user-service, test-data-processor]
    if: always() && (needs.test-api-gateway.result == 'success' || needs.test-api-gateway.result == 'skipped') && (needs.test-user-service.result == 'success' || needs.test-user-service.result == 'skipped') && (needs.test-data-processor.result == 'success' || needs.test-data-processor.result == 'skipped')
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        service: [api-gateway, user-service, data-processor, analytics-service]
    
    steps:
      - uses: actions/checkout@v4
      
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
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_PREFIX }}-${{ matrix.service }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: services/${{ matrix.service }}
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  integration-tests:
    needs: build-and-push
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Compose
        run: |
          docker-compose -f docker-compose.test.yml up -d
          sleep 30  # Wait for services to be ready
      
      - name: Run integration tests
        run: |
          docker-compose -f docker-compose.test.yml exec -T test-runner pytest tests/integration/
      
      - name: Cleanup
        if: always()
        run: docker-compose -f docker-compose.test.yml down

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: integration-tests
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          method: kubeconfig
          kubeconfig: ${{ secrets.KUBE_CONFIG }}
      
      - name: Deploy to staging
        run: |
          helm upgrade --install application-two-staging ./helm/application-two \
            --namespace staging \
            --set image.tag=${{ github.sha }} \
            --set environment=staging \
            --values helm/values-staging.yaml

  performance-tests:
    needs: deploy-staging
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Run performance tests
        uses: grafana/k6-action@v0.3.0
        with:
          filename: tests/performance/load-test.js
        env:
          BASE_URL: https://staging-app-two.hallcrest.engineering

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: [integration-tests, performance-tests]
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          method: kubeconfig
          kubeconfig: ${{ secrets.KUBE_CONFIG }}
      
      - name: Deploy to production
        run: |
          helm upgrade --install application-two ./helm/application-two \
            --namespace production \
            --set image.tag=${{ github.sha }} \
            --set environment=production \
            --values helm/values-production.yaml
```

## Service Orchestration

### Kubernetes Helm Charts

```yaml
# helm/application-two/templates/api-gateway.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "application-two.fullname" . }}-api-gateway
  labels:
    {{- include "application-two.labels" . | nindent 4 }}
    component: api-gateway
spec:
  replicas: {{ .Values.apiGateway.replicaCount }}
  selector:
    matchLabels:
      {{- include "application-two.selectorLabels" . | nindent 6 }}
      component: api-gateway
  template:
    metadata:
      labels:
        {{- include "application-two.selectorLabels" . | nindent 8 }}
        component: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: "{{ .Values.image.repository }}-api-gateway:{{ .Values.image.tag }}"
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: {{ .Values.environment }}
        - name: USER_SERVICE_URL
          value: "http://{{ include "application-two.fullname" . }}-user-service:8000"
        - name: DATA_PROCESSOR_URL
          value: "http://{{ include "application-two.fullname" . }}-data-processor:8080"
        - name: ANALYTICS_SERVICE_URL
          value: "http://{{ include "application-two.fullname" . }}-analytics-service:8000"
        resources:
          {{- toYaml .Values.apiGateway.resources | nindent 10 }}
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

### Service Mesh Configuration (Istio)

```yaml
# k8s/service-mesh/virtual-service.yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: application-two-routing
  namespace: production
spec:
  hosts:
  - app-two.hallcrest.engineering
  gateways:
  - application-two-gateway
  http:
  - match:
    - uri:
        prefix: /api/users
    route:
    - destination:
        host: user-service
        port:
          number: 8000
    fault:
      delay:
        percentage:
          value: 0.1
        fixedDelay: 5s
  - match:
    - uri:
        prefix: /api/data
    route:
    - destination:
        host: data-processor
        port:
          number: 8080
    retries:
      attempts: 3
      perTryTimeout: 2s
  - match:
    - uri:
        prefix: /api/analytics
    route:
    - destination:
        host: analytics-service
        port:
          number: 8000
```

## Automated Testing Strategies

### Contract Testing with Pact

```python
# tests/contract/test_user_service_contract.py
import pytest
from pact import Consumer, Provider, Like, EachLike
from pact.verifier import Verifier

def test_get_user_contract():
    consumer = Consumer('api-gateway')
    pact = consumer.has_pact_with(Provider('user-service'))
    
    (pact
     .given('User 123 exists')
     .upon_receiving('a request for user 123')
     .with_request('GET', '/users/123')
     .will_respond_with(200, body=Like({
         'id': 123,
         'email': 'user@example.com',
         'name': 'Test User',
         'created_at': '2025-01-15T10:00:00Z'
     }))
    )
    
    with pact:
        # Make actual request to verify contract
        response = requests.get('http://user-service:8000/users/123')
        assert response.status_code == 200
        assert response.json()['id'] == 123
```

### Chaos Engineering

```yaml
# chaos/network-latency.yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: network-delay
  namespace: staging
spec:
  action: delay
  mode: one
  selector:
    namespaces:
      - staging
    labelSelectors:
      component: user-service
  delay:
    latency: "10ms"
    correlation: "100"
    jitter: "0ms"
  duration: "5m"
  scheduler:
    cron: "0 */6 * * *"  # Every 6 hours
```

## Infrastructure Automation

### Terraform for AWS EKS

```hcl
# infrastructure/eks.tf
resource "aws_eks_cluster" "application_two" {
  name     = "application-two-cluster"
  role_arn = aws_iam_role.cluster.arn
  version  = "1.28"

  vpc_config {
    subnet_ids              = aws_subnet.private[*].id
    endpoint_private_access = true
    endpoint_public_access  = true
    public_access_cidrs     = ["0.0.0.0/0"]
  }

  encryption_config {
    provider {
      key_arn = aws_kms_key.cluster.arn
    }
    resources = ["secrets"]
  }

  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  depends_on = [
    aws_iam_role_policy_attachment.cluster_AmazonEKSClusterPolicy,
    aws_cloudwatch_log_group.cluster,
  ]
}

resource "aws_eks_node_group" "application_two" {
  cluster_name    = aws_eks_cluster.application_two.name
  node_group_name = "application-two-nodes"
  node_role_arn   = aws_iam_role.node_group.arn
  subnet_ids      = aws_subnet.private[*].id

  scaling_config {
    desired_size = 3
    max_size     = 10
    min_size     = 3
  }

  instance_types = ["t3.large"]
  
  remote_access {
    ec2_ssh_key = aws_key_pair.cluster.key_name
  }
}
```

### ArgoCD for GitOps

```yaml
# gitops/application-two-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: application-two
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/hallcrest/application-two
    targetRevision: HEAD
    path: helm/application-two
    helm:
      valueFiles:
        - values-production.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

## Monitoring and Observability Automation

### Prometheus Configuration

```yaml
# monitoring/prometheus-config.yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alerts.yml"

scrape_configs:
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)

  - job_name: 'api-gateway'
    static_configs:
      - targets: ['api-gateway:3000']
    metrics_path: /metrics

  - job_name: 'user-service'
    static_configs:
      - targets: ['user-service:8000']
    metrics_path: /metrics

  - job_name: 'data-processor'
    static_configs:
      - targets: ['data-processor:8080']
    metrics_path: /actuator/prometheus
```

### Grafana Dashboard as Code

```json
{
  "dashboard": {
    "title": "Application Two - Microservices Overview",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m])) by (service)",
            "legendFormat": "{{service}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))",
            "legendFormat": "95th percentile - {{service}}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) by (service) / sum(rate(http_requests_total[5m])) by (service)",
            "legendFormat": "Error rate - {{service}}"
          }
        ]
      }
    ]
  }
}
```

## Database Automation

### MongoDB Automated Backups

```bash
#!/bin/bash
# scripts/mongodb-backup.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
DATABASE_NAME="application_two"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
mongodump --host $MONGODB_HOST --port $MONGODB_PORT \
          --username $MONGODB_USER --password $MONGODB_PASSWORD \
          --db $DATABASE_NAME \
          --out $BACKUP_DIR/$TIMESTAMP

# Compress backup
tar -czf $BACKUP_DIR/mongodb_backup_$TIMESTAMP.tar.gz -C $BACKUP_DIR $TIMESTAMP

# Upload to S3
aws s3 cp $BACKUP_DIR/mongodb_backup_$TIMESTAMP.tar.gz \
          s3://hallcrest-backups/application-two/mongodb/

# Cleanup local backup
rm -rf $BACKUP_DIR/$TIMESTAMP
rm $BACKUP_DIR/mongodb_backup_$TIMESTAMP.tar.gz

echo "MongoDB backup completed: mongodb_backup_$TIMESTAMP.tar.gz"
```

### PostgreSQL Automated Maintenance

```sql
-- scripts/postgres-maintenance.sql
-- Automated maintenance script run daily

-- Update table statistics
ANALYZE;

-- Vacuum tables
VACUUM (ANALYZE, VERBOSE);

-- Reindex if needed
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN 
        SELECT schemaname, tablename, indexname 
        FROM pg_stat_user_indexes 
        WHERE idx_scan < 10 AND idx_tup_read > 1000
    LOOP
        EXECUTE 'REINDEX INDEX CONCURRENTLY ' || quote_ident(rec.indexname);
        RAISE NOTICE 'Reindexed: %', rec.indexname;
    END LOOP;
END $$;

-- Clean up old logs
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
DELETE FROM access_logs WHERE created_at < NOW() - INTERVAL '30 days';
```

## Security Automation

### Vulnerability Scanning

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:

jobs:
  container-scan:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [api-gateway, user-service, data-processor, analytics-service]
    
    steps:
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ghcr.io/${{ github.repository }}-${{ matrix.service }}:latest
          format: 'sarif'
          output: 'trivy-results-${{ matrix.service }}.sarif'
      
      - name: Upload Trivy scan results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results-${{ matrix.service }}.sarif'

  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high --file=services/api-gateway/package.json
```

## Performance Optimization Automation

### Auto-scaling Configuration

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: application-two-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: user-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "100"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
```

## Troubleshooting Automation

### Automated Incident Response

```python
# scripts/automated-incident-response.py
import requests
import json
from datetime import datetime, timedelta

class IncidentResponder:
    def __init__(self, slack_webhook, pagerduty_key):
        self.slack_webhook = slack_webhook
        self.pagerduty_key = pagerduty_key
    
    def handle_high_error_rate(self, service_name, error_rate):
        """Handle high error rate incidents"""
        
        # Scale up the service
        self.scale_service(service_name, replicas=6)
        
        # Clear caches
        self.clear_service_cache(service_name)
        
        # Notify team
        self.send_slack_alert(
            f"🚨 High error rate detected in {service_name}: {error_rate}%. "
            f"Auto-scaled to 6 replicas and cleared cache."
        )
        
        # Create PagerDuty incident if error rate > 5%
        if error_rate > 5:
            self.create_pagerduty_incident(service_name, error_rate)
    
    def handle_high_latency(self, service_name, latency_p95):
        """Handle high latency incidents"""
        
        # Check and restart unhealthy pods
        self.restart_unhealthy_pods(service_name)
        
        # Increase connection pool sizes
        self.update_connection_pools(service_name)
        
        self.send_slack_alert(
            f"⚠️ High latency detected in {service_name}: {latency_p95}ms. "
            f"Restarted unhealthy pods and increased connection pools."
        )
    
    def scale_service(self, service_name, replicas):
        """Scale Kubernetes deployment"""
        import subprocess
        
        cmd = f"kubectl scale deployment {service_name} --replicas={replicas}"
        subprocess.run(cmd.split(), check=True)
    
    def send_slack_alert(self, message):
        """Send alert to Slack"""
        payload = {
            "text": message,
            "channel": "#alerts",
            "username": "incident-bot"
        }
        requests.post(self.slack_webhook, json=payload)
```

For comprehensive automation support and custom automation requests, contact the DevOps team at devops@hallcrest.engineering.