---
title: "Application Two - Support Guide"
description: "Microservices support, monitoring, and troubleshooting for Application Two"
app: "Application Two"
category: "support"
order: 3
lastUpdated: 2025-01-15
tags: ["support", "microservices", "monitoring", "troubleshooting"]
---

# Application Two - Support Guide

This comprehensive support guide covers monitoring, troubleshooting, and maintenance procedures for Application Two's microservices platform. The distributed nature of the system requires specialized support strategies for service-to-service communication, data consistency, and performance optimization.

## Microservices Support Overview

Application Two consists of multiple interconnected services, each requiring specific monitoring and support approaches:

- **API Gateway**: Entry point and routing
- **User Service**: User management and authentication
- **Data Processing Service**: Data ingestion and processing
- **Analytics Service**: Real-time analytics and reporting
- **Message Queue**: Kafka for event streaming
- **Databases**: PostgreSQL, MongoDB, Redis, Elasticsearch

### Support Tier Structure

| Tier | Scope | Response Time | Escalation |
|------|-------|---------------|------------|
| L1 | User interface issues, basic connectivity | 1 hour | Service desk |
| L2 | Service-specific problems, API errors | 2 hours | Service owners |
| L3 | Cross-service issues, performance problems | 4 hours | Architecture team |
| L4 | System-wide failures, data corruption | 30 minutes | Engineering leads |

## Service Health Monitoring

### Service-Level Indicators (SLIs)

#### API Gateway
- **Availability**: > 99.9%
- **Latency**: < 100ms (95th percentile)
- **Throughput**: > 5000 requests/minute
- **Error Rate**: < 0.1%

#### Individual Services
- **Response Time**: < 500ms (95th percentile)
- **CPU Usage**: < 70%
- **Memory Usage**: < 80%
- **Disk Usage**: < 85%

### Monitoring Dashboards

Access the centralized monitoring at: https://monitoring.hallcrest.engineering/application-two

#### Service Overview Dashboard
Key metrics:
- Service availability heatmap
- Inter-service communication latency
- Error rates by service and endpoint
- Request volume and distribution

#### Infrastructure Dashboard
Monitoring widgets:
- Kubernetes cluster health
- Pod resource utilization
- Network traffic between services
- Database connection pools

### Alert Configuration

```yaml
# alerts/service-alerts.yml
groups:
  - name: application-two-alerts
    rules:
      # API Gateway Alerts
      - alert: APIGatewayDown
        expr: up{job="api-gateway"} == 0
        for: 2m
        labels:
          severity: critical
          service: api-gateway
        annotations:
          summary: "API Gateway is down"
          description: "API Gateway has been down for more than 2 minutes"

      - alert: HighLatencyAPIGateway
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="api-gateway"}[5m])) > 0.1
        for: 5m
        labels:
          severity: warning
          service: api-gateway
        annotations:
          summary: "High latency in API Gateway"
          description: "95th percentile latency is {{ $value }}s"

      # Service Communication Alerts
      - alert: ServiceCommunicationFailure
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 3m
        labels:
          severity: critical
        annotations:
          summary: "High error rate between services"
          description: "Error rate is {{ $value }} errors per second"

      # Database Alerts
      - alert: DatabaseConnectionPoolExhausted
        expr: db_connections_active / db_connections_max > 0.9
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool near exhaustion"
          description: "Connection pool is {{ $value | humanizePercentage }} full"
```

## Common Issues and Troubleshooting

### Service Discovery and Communication Issues

#### Issue: Service-to-Service Communication Failures
**Symptoms:**
- 503 Service Unavailable errors
- Timeouts between services
- Cascading failures across services

**Troubleshooting Steps:**
1. Check service registration in discovery system
   ```bash
   kubectl get endpoints -n production
   kubectl describe service user-service
   ```

2. Verify network policies and security groups
   ```bash
   kubectl get networkpolicies -n production
   kubectl describe networkpolicy allow-internal
   ```

3. Test service connectivity
   ```bash
   kubectl exec -it deployment/api-gateway -- curl -v http://user-service:8000/health
   ```

4. Check DNS resolution
   ```bash
   kubectl exec -it deployment/api-gateway -- nslookup user-service
   ```

**Resolution:**
- Restart services with connectivity issues
- Verify service mesh configuration (if using Istio)
- Check firewall rules and security groups
- Validate service discovery registration

#### Issue: Circuit Breaker Triggered
**Symptoms:**
- Requests failing fast without reaching downstream service
- Circuit breaker open state in monitoring
- Error messages indicating circuit breaker activation

**Troubleshooting Steps:**
1. Check circuit breaker metrics
   ```bash
   curl http://api-gateway:3000/metrics | grep circuit_breaker
   ```

2. Review downstream service health
3. Check circuit breaker configuration
4. Monitor recovery attempts

**Resolution:**
- Fix downstream service issues
- Manually reset circuit breaker if needed
- Adjust circuit breaker thresholds if too sensitive

### Database and Data Consistency Issues

#### Issue: MongoDB Replica Set Issues
**Symptoms:**
- Write operations failing
- Read preference errors
- Replica set status showing problems

**Troubleshooting Steps:**
1. Check replica set status
   ```javascript
   // Connect to MongoDB
   rs.status()
   rs.conf()
   ```

2. Verify network connectivity between replicas
   ```bash
   kubectl exec -it mongodb-primary-0 -- mongo --eval "rs.status()"
   ```

3. Check logs for replica set issues
   ```bash
   kubectl logs mongodb-primary-0 | grep -i replica
   ```

**Resolution:**
- Restart problematic replica members
- Re-add failed replicas to the set
- Check network policies between MongoDB pods

#### Issue: Kafka Message Processing Lag
**Symptoms:**
- Increasing consumer lag
- Delayed data processing
- Messages piling up in topics

**Troubleshooting Steps:**
1. Check consumer group lag
   ```bash
   kubectl exec -it kafka-0 -- kafka-consumer-groups.sh \
     --bootstrap-server localhost:9092 \
     --describe --group data-processor-group
   ```

2. Monitor topic partitions
   ```bash
   kubectl exec -it kafka-0 -- kafka-topics.sh \
     --bootstrap-server localhost:9092 \
     --describe --topic data-events
   ```

3. Check consumer health
   ```bash
   kubectl logs deployment/data-processor | grep -i kafka
   ```

**Resolution:**
- Scale up consumer instances
- Increase partition count for topics
- Optimize message processing logic
- Check for processing bottlenecks

### Performance Issues

#### Issue: High Memory Usage Across Services
**Symptoms:**
- Services getting OOMKilled
- Slow response times
- Memory usage alerts firing

**Troubleshooting Steps:**
1. Identify memory-intensive services
   ```bash
   kubectl top pods -n production --sort-by=memory
   ```

2. Generate heap dumps for analysis
   ```bash
   # For Java services
   kubectl exec -it deployment/data-processor -- jmap -dump:format=b,file=/tmp/heap.hprof 1
   
   # For Python services
   kubectl exec -it deployment/user-service -- python -m memory_profiler app.py
   ```

3. Analyze memory trends
4. Check for memory leaks in logs

**Resolution:**
- Increase memory limits temporarily
- Deploy memory leak fixes
- Optimize data structures and caching
- Implement proper garbage collection tuning

#### Issue: Database Query Performance Degradation
**Symptoms:**
- Slow API responses
- Database CPU spikes
- Query timeout errors

**Troubleshooting Steps:**
1. Identify slow queries
   ```sql
   -- PostgreSQL
   SELECT query, mean_time, calls, total_time
   FROM pg_stat_statements
   ORDER BY mean_time DESC LIMIT 10;
   
   -- MongoDB
   db.setProfilingLevel(2)
   db.system.profile.find().sort({millis: -1}).limit(10)
   ```

2. Check index usage
   ```sql
   -- PostgreSQL
   SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
   FROM pg_stat_user_indexes
   WHERE idx_scan = 0;
   ```

3. Analyze query execution plans
   ```sql
   EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users WHERE email = 'test@example.com';
   ```

**Resolution:**
- Add missing database indexes
- Optimize query structures
- Implement query result caching
- Consider read replicas for read-heavy workloads

### Data Synchronization Issues

#### Issue: Event Processing Out of Order
**Symptoms:**
- Data inconsistencies between services
- Business logic errors due to ordering
- Duplicate processing of events

**Troubleshooting Steps:**
1. Check Kafka topic configuration
   ```bash
   kubectl exec -it kafka-0 -- kafka-configs.sh \
     --bootstrap-server localhost:9092 \
     --describe --entity-type topics --entity-name data-events
   ```

2. Verify consumer offset management
3. Review event timestamps and ordering
4. Check for processing retries

**Resolution:**
- Implement idempotent event processing
- Use event ordering keys in Kafka
- Implement event sourcing patterns
- Add correlation IDs for tracking

## Maintenance Procedures

### Service-Specific Maintenance

#### Daily Health Checks
```bash
#!/bin/bash
# scripts/daily-health-check.sh

echo "=== Application Two Daily Health Check ==="
echo "Date: $(date)"

# Check all service deployments
echo "Checking service deployments..."
kubectl get deployments -n production -o wide

# Check service endpoints
echo "Checking service endpoints..."
services=("api-gateway" "user-service" "data-processor" "analytics-service")
for service in "${services[@]}"; do
    echo "Testing $service..."
    kubectl exec -it deployment/api-gateway -- curl -f http://$service/health || echo "❌ $service health check failed"
done

# Check database connections
echo "Checking database connections..."
kubectl exec -it deployment/user-service -- python -c "
import psycopg2
try:
    conn = psycopg2.connect('$DATABASE_URL')
    print('✅ PostgreSQL connection successful')
    conn.close()
except Exception as e:
    print(f'❌ PostgreSQL connection failed: {e}')
"

# Check Kafka cluster
echo "Checking Kafka cluster..."
kubectl exec -it kafka-0 -- kafka-broker-api-versions.sh --bootstrap-server localhost:9092

# Check Redis cluster
echo "Checking Redis cluster..."
kubectl exec -it redis-0 -- redis-cli ping

echo "=== Health check completed ==="
```

#### Weekly Performance Review
```bash
#!/bin/bash
# scripts/weekly-performance-review.sh

# Generate performance report
echo "=== Weekly Performance Report ==="
echo "Week ending: $(date)"

# Service response times
echo "Average response times (last 7 days):"
curl -s "http://prometheus:9090/api/v1/query?query=avg_over_time(histogram_quantile(0.95,rate(http_request_duration_seconds_bucket[7d]))[7d:1h])"

# Error rates
echo "Error rates by service (last 7 days):"
curl -s "http://prometheus:9090/api/v1/query?query=rate(http_requests_total{status=~'5..'}[7d])/rate(http_requests_total[7d])"

# Resource utilization
echo "Resource utilization trends:"
kubectl top nodes
kubectl top pods -n production --sort-by=cpu

# Database performance
echo "Database query performance:"
kubectl exec -it postgres-0 -- psql -c "
SELECT query, calls, mean_time, total_time 
FROM pg_stat_statements 
WHERE calls > 100 
ORDER BY mean_time DESC 
LIMIT 10;"

echo "=== Performance review completed ==="
```

### Database Maintenance

#### MongoDB Maintenance
```javascript
// scripts/mongodb-maintenance.js
// Weekly MongoDB maintenance tasks

// Check replica set health
rs.status();

// Compact collections to reclaim space
db.runCommand({compact: "processed_data"});
db.runCommand({compact: "analytics_data"});

// Update index statistics
db.processed_data.reIndex();
db.analytics_data.reIndex();

// Check index usage
db.processed_data.aggregate([{$indexStats: {}}]);

// Clean up old data (older than 6 months)
var sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

db.processed_data.deleteMany({
    "processed_at": {$lt: sixMonthsAgo}
});

print("MongoDB maintenance completed");
```

#### Kafka Maintenance
```bash
#!/bin/bash
# scripts/kafka-maintenance.sh

# Clean up old log segments
kubectl exec -it kafka-0 -- kafka-log-dirs.sh --bootstrap-server localhost:9092 --describe

# Check topic configurations
kubectl exec -it kafka-0 -- kafka-topics.sh --bootstrap-server localhost:9092 --list

# Monitor consumer group lag
kubectl exec -it kafka-0 -- kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 \
  --describe --all-groups

# Rebalance partitions if needed
kubectl exec -it kafka-0 -- kafka-reassign-partitions.sh \
  --bootstrap-server localhost:9092 \
  --reassignment-json-file /tmp/reassignment.json \
  --execute

echo "Kafka maintenance completed"
```

## Disaster Recovery

### Service Recovery Procedures

#### Complete System Outage Recovery
1. **Assess Infrastructure**
   ```bash
   # Check cluster status
   kubectl cluster-info
   kubectl get nodes
   kubectl get namespaces
   ```

2. **Restore Core Services**
   ```bash
   # Start databases first
   kubectl apply -f k8s/databases/
   
   # Wait for databases to be ready
   kubectl wait --for=condition=ready pod -l app=postgres --timeout=300s
   kubectl wait --for=condition=ready pod -l app=mongodb --timeout=300s
   kubectl wait --for=condition=ready pod -l app=redis --timeout=300s
   ```

3. **Deploy Application Services**
   ```bash
   # Deploy in dependency order
   kubectl apply -f k8s/user-service/
   kubectl apply -f k8s/data-processor/
   kubectl apply -f k8s/analytics-service/
   kubectl apply -f k8s/api-gateway/
   ```

4. **Verify Service Communication**
   ```bash
   # Test service mesh connectivity
   kubectl exec -it deployment/api-gateway -- ./scripts/connectivity-test.sh
   ```

#### Data Recovery Procedures
```bash
#!/bin/bash
# scripts/data-recovery.sh

echo "Starting data recovery process..."

# Restore PostgreSQL from backup
if [ "$RESTORE_POSTGRES" = "true" ]; then
    BACKUP_FILE="postgres_backup_$(date +%Y%m%d).sql"
    aws s3 cp s3://hallcrest-backups/application-two/postgres/$BACKUP_FILE ./
    kubectl exec -i postgres-0 -- psql < $BACKUP_FILE
fi

# Restore MongoDB from backup
if [ "$RESTORE_MONGODB" = "true" ]; then
    BACKUP_FILE="mongodb_backup_$(date +%Y%m%d).tar.gz"
    aws s3 cp s3://hallcrest-backups/application-two/mongodb/$BACKUP_FILE ./
    tar -xzf $BACKUP_FILE
    kubectl cp ./mongodb_backup mongodb-primary-0:/tmp/
    kubectl exec -it mongodb-primary-0 -- mongorestore /tmp/mongodb_backup
fi

# Verify data integrity
kubectl exec -it deployment/user-service -- python scripts/verify-data-integrity.py
kubectl exec -it deployment/analytics-service -- python scripts/verify-analytics-data.py

echo "Data recovery completed"
```

### RTO/RPO Targets

| Component | RTO | RPO | Recovery Strategy |
|-----------|-----|-----|-------------------|
| API Gateway | 10 minutes | 0 | Stateless, quick restart |
| User Service | 15 minutes | 5 minutes | Database backup + logs |
| Data Processor | 30 minutes | 15 minutes | Message replay + state recovery |
| Analytics Service | 1 hour | 30 minutes | Recompute from source data |
| Databases | 2 hours | 15 minutes | Backup restoration |

## Security Incident Response

### Incident Classification

#### Severity 1: Critical Security Breach
- Unauthorized access to production data
- Active security exploit in progress
- Complete service compromise

**Immediate Actions:**
1. Isolate affected services
   ```bash
   kubectl scale deployment suspicious-service --replicas=0
   kubectl apply -f security/network-isolation.yaml
   ```

2. Collect forensic evidence
   ```bash
   kubectl logs deployment/affected-service > incident-logs-$(date +%s).txt
   kubectl get events --sort-by=.metadata.creationTimestamp > events-$(date +%s).txt
   ```

3. Notify security team immediately

#### Severity 2: Security Vulnerability
- Known vulnerability in dependencies
- Potential security misconfiguration
- Suspicious activity detected

**Response Actions:**
1. Assess vulnerability impact
2. Apply security patches
3. Update container images
4. Review access logs

### Security Monitoring

```yaml
# monitoring/security-alerts.yml
groups:
  - name: security-alerts
    rules:
      - alert: SuspiciousAPIActivity
        expr: rate(http_requests_total{status=~"4.."}[5m]) > 10
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High rate of 4xx errors detected"
          description: "{{ $value }} 4xx errors per second"

      - alert: UnauthorizedDatabaseAccess
        expr: increase(postgres_stat_database_tup_returned[5m]) > 10000
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Unusual database access pattern"
          description: "High volume of database reads detected"

      - alert: PodSecurityViolation
        expr: increase(kubernetes_audit_total{verb="create",objectRef_resource="pods"}[5m]) > 5
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Unusual pod creation activity"
```

## Performance Optimization

### Auto-scaling Strategies

#### Horizontal Pod Autoscaler (HPA)
```yaml
# k8s/autoscaling/user-service-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: user-service-hpa
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
  - type: Object
    object:
      metric:
        name: requests_per_second
      describedObject:
        apiVersion: v1
        kind: Service
        name: user-service
      target:
        type: Value
        value: "100"
```

#### Vertical Pod Autoscaler (VPA)
```yaml
# k8s/autoscaling/data-processor-vpa.yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: data-processor-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: data-processor
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: data-processor
      maxAllowed:
        cpu: 2
        memory: 4Gi
      minAllowed:
        cpu: 100m
        memory: 256Mi
```

### Caching Optimization

```python
# scripts/cache-optimization.py
import redis
import json
from datetime import timedelta

class CacheOptimizer:
    def __init__(self, redis_client):
        self.redis = redis_client
    
    def analyze_cache_performance(self):
        """Analyze cache hit rates and optimize TTLs"""
        
        # Get cache statistics
        info = self.redis.info()
        hit_rate = info['keyspace_hits'] / (info['keyspace_hits'] + info['keyspace_misses'])
        
        print(f"Current cache hit rate: {hit_rate:.2%}")
        
        # Identify frequently accessed keys
        frequent_keys = self.redis.execute_command('MEMORY', 'USAGE-PATTERNS')
        
        # Optimize TTLs based on access patterns
        for key_pattern, stats in frequent_keys.items():
            if stats['access_frequency'] > 100:  # High frequency
                # Increase TTL for frequently accessed data
                self.redis.expire(key_pattern, timedelta(hours=24))
            elif stats['access_frequency'] < 10:  # Low frequency
                # Decrease TTL for rarely accessed data
                self.redis.expire(key_pattern, timedelta(hours=1))
    
    def optimize_memory_usage(self):
        """Optimize Redis memory usage"""
        
        # Enable compression for large values
        large_keys = self.redis.execute_command('MEMORY', 'USAGE-BY-KEY')
        for key, size in large_keys.items():
            if size > 1024 * 1024:  # 1MB
                value = self.redis.get(key)
                compressed_value = self.compress_value(value)
                self.redis.set(key, compressed_value)
```

## Support Tools and Resources

### Diagnostic Tools

#### Service Mesh Debugging
```bash
#!/bin/bash
# scripts/service-mesh-debug.sh

echo "=== Service Mesh Diagnostics ==="

# Check Istio proxy status
kubectl exec -it deployment/user-service -c istio-proxy -- pilot-agent request GET stats/prometheus

# Verify mTLS certificates
kubectl exec -it deployment/user-service -c istio-proxy -- openssl s_client -connect analytics-service:8000 -cert /etc/certs/cert-chain.pem -key /etc/certs/key.pem

# Check service mesh configuration
istioctl proxy-config cluster user-service-pod.production
istioctl proxy-config listener user-service-pod.production
istioctl proxy-config route user-service-pod.production

# Analyze traffic flow
istioctl x describe pod user-service-pod.production
```

#### Database Connection Analysis
```python
# scripts/db-connection-analysis.py
import psycopg2
import pymongo
import redis
from datetime import datetime

def analyze_postgresql_connections():
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Check active connections
    cursor.execute("""
        SELECT datname, usename, application_name, client_addr, state, 
               now() - query_start as duration
        FROM pg_stat_activity 
        WHERE state != 'idle'
        ORDER BY duration DESC;
    """)
    
    connections = cursor.fetchall()
    print(f"Active PostgreSQL connections: {len(connections)}")
    
    # Check for long-running queries
    long_queries = [conn for conn in connections if conn[5] and conn[5].total_seconds() > 300]
    if long_queries:
        print(f"Warning: {len(long_queries)} queries running longer than 5 minutes")
    
    conn.close()

def analyze_mongodb_connections():
    client = pymongo.MongoClient(MONGODB_URI)
    db = client.admin
    
    # Check current operations
    current_ops = db.current_op()
    active_ops = [op for op in current_ops['inprog'] if op.get('secs_running', 0) > 10]
    
    print(f"Active MongoDB operations: {len(active_ops)}")
    
    # Check connection pool
    server_info = client.server_info()
    print(f"MongoDB server version: {server_info['version']}")

if __name__ == "__main__":
    analyze_postgresql_connections()
    analyze_mongodb_connections()
```

### Support Contacts

#### Escalation Matrix
```yaml
Support Contacts:
  L1 Support:
    - Name: "Application Two Support Team"
      Email: "app-two-support@hallcrest.engineering"
      Slack: "#app-two-support"
      Hours: "24/7"
  
  L2 Support:
    - Name: "Service Owners"
      API Gateway: "frontend-team@hallcrest.engineering"
      User Service: "identity-team@hallcrest.engineering"
      Data Processor: "data-team@hallcrest.engineering"
      Analytics: "analytics-team@hallcrest.engineering"
  
  L3 Support:
    - Name: "Architecture Team"
      Email: "architecture@hallcrest.engineering"
      Phone: "+1-555-ARCH"
      Escalation: "CTO"
  
  Emergency:
    - Name: "On-Call Engineer"
      PagerDuty: "https://hallcrest.pagerduty.com"
      Phone: "+1-555-EMERGENCY"
      Response: "15 minutes"
```

For immediate support needs or to report critical issues, contact the Application Two support team at app-two-support@hallcrest.engineering or through the PagerDuty escalation system.