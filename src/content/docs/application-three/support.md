---
title: "Application Three - Support Guide"
description: "Mobile app support, troubleshooting, and maintenance for Application Three"
app: "Application Three"
category: "support"
order: 3
lastUpdated: 2025-01-15
tags: ["support", "mobile", "troubleshooting", "aws", "serverless"]
---

# Application Three - Support Guide

This comprehensive support guide covers mobile app troubleshooting, serverless backend support, user assistance, and maintenance procedures for Application Three's mobile-first platform.

## Mobile Support Overview

Application Three is a React Native mobile application with a serverless AWS backend. Support encompasses mobile app issues, backend API problems, authentication concerns, and user experience optimization across iOS and Android platforms.

### Support Structure

| Support Level | Scope | Response Time | Coverage |
|---------------|-------|---------------|----------|
| L1 - User Support | App usage, account issues, basic troubleshooting | 2 hours | 24/7 |
| L2 - Technical Support | App crashes, API errors, device-specific issues | 4 hours | Business hours |
| L3 - Engineering Support | Complex technical issues, backend problems | 8 hours | Business hours |
| L4 - Emergency Support | Critical failures, security incidents | 30 minutes | 24/7 |

### Contact Information

```yaml
Support Contacts:
  User Support:
    Email: "app-support@hallcrest.engineering"
    Chat: "In-app support chat"
    Hours: "24/7"
    
  Technical Support:
    Email: "mobile-tech@hallcrest.engineering"
    Phone: "+1-555-MOBILE"
    Slack: "#app-three-support"
    
  Engineering Support:
    Email: "mobile-engineering@hallcrest.engineering"
    PagerDuty: "Mobile Team"
    Escalation: "CTO"
    
  Emergency:
    Phone: "+1-555-EMERGENCY"
    PagerDuty: "Critical Mobile Issues"
    Response: "30 minutes"
```

## Mobile App Monitoring

### Key Performance Indicators

#### App Performance Metrics
- **App Launch Time**: < 3 seconds cold start, < 1 second warm start
- **Screen Transition Time**: < 500ms average
- **API Response Time**: < 2 seconds for data loading
- **Crash-Free Sessions**: > 99.5%
- **App Store Rating**: > 4.5/5.0

#### User Experience Metrics
- **Daily Active Users (DAU)**: Tracked via Firebase Analytics
- **Session Duration**: Average > 5 minutes
- **Feature Adoption Rate**: > 70% for core features
- **User Retention**: > 80% Day 1, > 50% Day 7, > 30% Day 30

### Monitoring Dashboards

#### Firebase Console Dashboards
Access at: https://console.firebase.google.com

Key metrics:
- Crashlytics: Real-time crash reporting and analysis
- Performance Monitoring: App startup time, HTTP requests, screen rendering
- Analytics: User behavior, conversion funnels, custom events
- Remote Config: Feature flag usage and A/B test results

#### AWS CloudWatch Dashboards
Access at: https://console.aws.amazon.com/cloudwatch

Backend metrics:
- Lambda function performance and errors
- API Gateway request/response metrics
- DynamoDB read/write capacity and throttling
- Cognito authentication success rates

### Alert Configuration

```yaml
# Mobile App Alerts
Mobile Alerts:
  Critical:
    - Crash Rate > 1%: Immediate notification
    - API Error Rate > 5%: Immediate notification
    - Launch Time > 5s: Immediate notification
    - Authentication Failure > 10%: Immediate notification
  
  Warning:
    - Session Duration < 3 minutes: 30-minute delay
    - Feature Adoption < 50%: Daily summary
    - App Store Rating < 4.0: Immediate notification
    - Memory Usage > 200MB: 15-minute delay

# Backend Alerts  
Backend Alerts:
  Critical:
    - Lambda Error Rate > 1%: Immediate notification
    - DynamoDB Throttling: Immediate notification
    - API Gateway 5xx > 0.5%: Immediate notification
    - Cognito Service Down: Immediate notification
  
  Warning:
    - Lambda Duration > 10s: 15-minute delay
    - DynamoDB Read/Write > 80% capacity: 10-minute delay
    - S3 Upload Failures > 2%: 30-minute delay
```

## Common Mobile Issues and Solutions

### App Crashes and Stability Issues

#### Issue: App Crashes on Launch
**Symptoms:**
- App crashes immediately after opening
- Black screen or splash screen freeze
- iOS/Android specific crash logs

**Troubleshooting Steps:**
1. Check crash logs in Firebase Crashlytics
   ```bash
   # Access Crashlytics data
   firebase crashlytics:symbols:upload --app=ios_app_id path/to/dSYMs
   ```

2. Verify device compatibility
   ```typescript
   // Check minimum OS version requirements
   import DeviceInfo from 'react-native-device-info';
   
   const checkDeviceCompatibility = async () => {
     const systemVersion = await DeviceInfo.getSystemVersion();
     const minVersion = Platform.OS === 'ios' ? '12.0' : '21'; // Android API level
     
     if (Platform.OS === 'ios' && parseFloat(systemVersion) < parseFloat(minVersion)) {
       Alert.alert('Unsupported OS Version', 'Please update your iOS version');
     }
   };
   ```

3. Check for memory issues
4. Review recent app updates for regressions

**Resolution:**
- Deploy hotfix for critical crashes
- Rollback to previous stable version if needed
- Increase memory limits for memory-related crashes
- Add more robust error handling and fallbacks

#### Issue: Specific Feature Crashes
**Symptoms:**
- App crashes when using camera
- Crash during file upload
- Crash on specific screen transitions

**Troubleshooting Steps:**
1. Reproduce issue in development environment
2. Check device permissions
   ```typescript
   // Check and request camera permission
   import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
   
   const checkCameraPermission = async () => {
     const permission = Platform.OS === 'ios' 
       ? PERMISSIONS.IOS.CAMERA 
       : PERMISSIONS.ANDROID.CAMERA;
       
     const result = await check(permission);
     if (result !== RESULTS.GRANTED) {
       await request(permission);
     }
   };
   ```

3. Test on different device models
4. Review third-party library compatibility

**Resolution:**
- Add permission checks before feature usage
- Implement graceful degradation for unsupported features
- Update problematic third-party libraries
- Add feature flags to disable problematic features

### Authentication and User Account Issues

#### Issue: Users Cannot Sign In
**Symptoms:**
- "Invalid credentials" errors for valid accounts
- Authentication timeouts
- Social login failures

**Troubleshooting Steps:**
1. Check AWS Cognito service status
   ```bash
   # Check Cognito metrics
   aws cognito-idp describe-user-pool --user-pool-id USER_POOL_ID
   ```

2. Verify user pool configuration
3. Check for rate limiting or account lockouts
4. Test authentication flow in different environments

**Resolution:**
- Reset user password if account is locked
- Increase Cognito rate limits if needed
- Update authentication configuration
- Implement better error messaging for users

#### Issue: Biometric Authentication Failures
**Symptoms:**
- Face ID/Touch ID not working
- Fallback to password authentication
- Biometric prompt not appearing

**Troubleshooting Steps:**
1. Check device biometric settings
2. Verify app permissions for biometric access
3. Test on different device models
4. Review biometric library configuration

**Resolution:**
```typescript
// Robust biometric authentication implementation
import TouchID from 'react-native-touch-id';

const authenticateWithBiometrics = async () => {
  try {
    const biometryType = await TouchID.isSupported();
    if (biometryType) {
      const isAuthenticated = await TouchID.authenticate('Use biometric to sign in');
      return isAuthenticated;
    } else {
      throw new Error('Biometric authentication not supported');
    }
  } catch (error) {
    console.log('Biometric authentication failed:', error);
    // Fallback to password authentication
    return false;
  }
};
```

### Performance and Responsiveness Issues

#### Issue: Slow App Performance
**Symptoms:**
- Laggy animations and transitions
- Slow screen loading times
- High memory usage
- Battery drain complaints

**Troubleshooting Steps:**
1. Use React Native performance profiler
   ```bash
   npx react-native start --reset-cache
   # Enable performance monitoring in development
   ```

2. Analyze bundle size and unnecessary imports
   ```bash
   npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output bundle.js --analyze
   ```

3. Check for memory leaks
4. Review image optimization and caching

**Resolution:**
- Implement code splitting and lazy loading
- Optimize images and use appropriate formats (WebP)
- Add performance monitoring and metrics
- Optimize list rendering with FlatList optimization

```typescript
// Optimized FlatList implementation
const OptimizedList = ({ data }) => {
  const renderItem = useCallback(({ item }) => (
    <ItemComponent item={item} />
  ), []);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      getItemLayout={(data, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
    />
  );
};
```

### Network and Connectivity Issues

#### Issue: API Request Failures
**Symptoms:**
- Network timeout errors
- Intermittent API failures
- Data not syncing properly

**Troubleshooting Steps:**
1. Check AWS API Gateway logs
   ```bash
   aws logs describe-log-groups --log-group-name-prefix "/aws/apigateway/"
   ```

2. Test API endpoints directly
3. Verify network connectivity and DNS resolution
4. Check for rate limiting or throttling

**Resolution:**
- Implement retry logic with exponential backoff
- Add offline mode and data caching
- Improve error handling and user feedback
- Optimize API payload sizes

```typescript
// Robust API client with retry logic
class ApiClient {
  private async requestWithRetry<T>(
    url: string,
    options: RequestInit,
    maxRetries: number = 3
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          timeout: 10000,
        });

        if (response.ok) {
          return await response.json();
        }

        if (response.status >= 400 && response.status < 500) {
          // Client error, don't retry
          throw new Error(`Client error: ${response.status}`);
        }

        if (attempt === maxRetries) {
          throw new Error(`Server error after ${maxRetries} attempts`);
        }
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }
}
```

### Data Synchronization Issues

#### Issue: Offline Data Not Syncing
**Symptoms:**
- Data created offline not appearing after reconnection
- Conflicting data between local and server
- Sync indicators not updating

**Troubleshooting Steps:**
1. Check offline storage implementation
2. Verify sync queue processing
3. Test conflict resolution mechanisms
4. Review network state detection

**Resolution:**
```typescript
// Robust offline sync implementation
import NetInfo from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

class OfflineSyncManager {
  private syncQueue: SyncItem[] = [];
  private isOnline: boolean = true;

  constructor() {
    this.initializeNetworkListener();
    this.loadSyncQueue();
  }

  private initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected;
      if (this.isOnline) {
        this.processSyncQueue();
      }
    });
  }

  async addToSyncQueue(item: SyncItem) {
    this.syncQueue.push({
      ...item,
      timestamp: Date.now(),
      attempts: 0,
    });
    
    await this.saveSyncQueue();
    
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  private async processSyncQueue() {
    const failedItems = [];
    
    for (const item of this.syncQueue) {
      try {
        await this.syncItem(item);
      } catch (error) {
        item.attempts++;
        if (item.attempts < 3) {
          failedItems.push(item);
        } else {
          console.error('Sync failed permanently:', error);
        }
      }
    }
    
    this.syncQueue = failedItems;
    await this.saveSyncQueue();
  }

  private async syncItem(item: SyncItem) {
    switch (item.type) {
      case 'CREATE':
        return await ApiClient.post(item.endpoint, item.data);
      case 'UPDATE':
        return await ApiClient.put(item.endpoint, item.data);
      case 'DELETE':
        return await ApiClient.delete(item.endpoint);
    }
  }
}
```

## Backend Support and Troubleshooting

### AWS Lambda Function Issues

#### Issue: Lambda Function Timeouts
**Symptoms:**
- API requests timing out after 30 seconds
- Partial data processing
- Gateway timeout errors

**Troubleshooting Steps:**
1. Check Lambda function metrics
   ```bash
   aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/"
   aws logs get-log-events --log-group-name "/aws/lambda/function-name"
   ```

2. Analyze function duration and memory usage
3. Review database query performance
4. Check for infinite loops or blocking operations

**Resolution:**
- Optimize database queries and add indexes
- Increase Lambda timeout and memory allocation
- Implement async processing for long-running tasks
- Break down complex operations into smaller functions

#### Issue: Lambda Cold Starts
**Symptoms:**
- Slow initial API responses (5-10 seconds)
- Better performance on subsequent requests
- User complaints about app slowness

**Troubleshooting Steps:**
1. Monitor cold start frequency
2. Analyze function package size
3. Check initialization code performance

**Resolution:**
```typescript
// Lambda optimization for cold starts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

// Initialize clients outside handler
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  maxAttempts: 3,
});

// Implement connection reuse
let isWarm = false;

export const handler = async (event: any) => {
  if (!isWarm) {
    // Initialization code
    await initializeConnections();
    isWarm = true;
  }

  // Handler logic
  return await processRequest(event);
};

// Use provisioned concurrency for critical functions
// Configure in SAM template:
// ProvisionedConcurrencyConfig:
//   ProvisionedConcurrencyMetric: 5
```

### DynamoDB Performance Issues

#### Issue: DynamoDB Throttling
**Symptoms:**
- ProvisionedThroughputExceededException errors
- Slow database operations
- Failed write operations

**Troubleshooting Steps:**
1. Check DynamoDB metrics in CloudWatch
2. Analyze read/write capacity utilization
3. Review access patterns and hot keys
4. Check for uneven data distribution

**Resolution:**
- Enable auto-scaling for DynamoDB tables
- Implement exponential backoff in application code
- Optimize query patterns and use GSIs appropriately
- Consider switching to on-demand billing mode

```typescript
// DynamoDB client with retry logic
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  maxAttempts: 5,
  retryMode: 'adaptive',
});

const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});
```

### Authentication Issues (AWS Cognito)

#### Issue: Cognito Token Expiration
**Symptoms:**
- Users getting logged out frequently
- Authentication errors after idle time
- Token refresh failures

**Troubleshooting Steps:**
1. Check Cognito user pool token settings
2. Verify refresh token implementation
3. Review token validation logic
4. Test token refresh flow

**Resolution:**
```typescript
// Automatic token refresh implementation
import { Auth } from 'aws-amplify';

class AuthService {
  private refreshTimer: NodeJS.Timeout | null = null;

  async initializeTokenRefresh() {
    try {
      const session = await Auth.currentSession();
      const expiresIn = session.getIdToken().getExpiration() - Math.floor(Date.now() / 1000);
      
      // Refresh token 5 minutes before expiration
      const refreshIn = (expiresIn - 300) * 1000;
      
      this.refreshTimer = setTimeout(() => {
        this.refreshToken();
      }, refreshIn);
    } catch (error) {
      console.error('Failed to initialize token refresh:', error);
    }
  }

  private async refreshToken() {
    try {
      const user = await Auth.currentAuthenticatedUser();
      await Auth.currentSession(); // This will refresh the token
      this.initializeTokenRefresh(); // Set up next refresh
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Redirect to login
      this.logout();
    }
  }

  logout() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    Auth.signOut();
  }
}
```

## User Support Procedures

### Common User Issues

#### Issue: Account Recovery
**User Problem:** "I forgot my password and can't access my account"

**Support Steps:**
1. Verify user identity through security questions
2. Check if email address is correct in the system
3. Initiate password reset through Cognito
4. Guide user through reset process
5. Verify successful login

**Support Script:**
```
"I'll help you reset your password. Let me send a reset code to your email address. 
Please check your email (including spam folder) for a message from Application Three. 
The code will expire in 15 minutes, so please use it promptly."
```

#### Issue: Data Not Syncing
**User Problem:** "My data isn't showing up on my other device"

**Support Steps:**
1. Check if user is logged in with same account on both devices
2. Verify internet connectivity on both devices
3. Force sync by pulling down on main screen
4. Check if user has enabled data sync in settings
5. Clear app cache if needed

**Escalation Criteria:**
- Data loss affecting multiple users
- Sync issues persisting after troubleshooting
- Backend sync errors in logs

#### Issue: In-App Purchase Problems
**User Problem:** "I paid for premium but still don't have access"

**Support Steps:**
1. Verify purchase in App Store/Play Store
2. Check subscription status in user account
3. Refresh purchase status in app
4. Contact platform support if needed
5. Manually grant access as temporary solution

### User Communication Templates

#### Password Reset Confirmation
```
Subject: Password Reset Successful - Application Three

Hi [User Name],

Your password has been successfully reset for your Application Three account. 
If you didn't request this change, please contact our support team immediately.

For security:
- Don't share your password with anyone
- Use a strong, unique password
- Enable biometric authentication if available

Need help? Contact us at app-support@hallcrest.engineering

Best regards,
Application Three Support Team
```

#### Feature Announcement
```
Subject: New Features Available in Application Three!

Hi [User Name],

We've just released Application Three v2.1 with exciting new features:

✨ Enhanced camera with AI filters
📊 Advanced analytics dashboard  
🔒 Improved security with biometric login
⚡ Faster sync and offline mode

Update your app to get these features. As always, your feedback helps us improve!

Questions? We're here to help at app-support@hallcrest.engineering

Happy exploring!
Application Three Team
```

## Maintenance Procedures

### Regular Maintenance Tasks

#### Daily Health Checks
```bash
#!/bin/bash
# scripts/daily-health-check.sh

echo "=== Application Three Daily Health Check ==="
echo "Date: $(date)"

# Check mobile app metrics
echo "Checking mobile app health..."
firebase_project_id="application-three-prod"

# Check crash-free sessions rate
crashlytics_data=$(curl -s "https://firebase.googleapis.com/v1beta1/projects/$firebase_project_id/crashlytics" \
  -H "Authorization: Bearer $FIREBASE_TOKEN")

crash_free_rate=$(echo $crashlytics_data | jq '.crashFreeRate')
echo "Crash-free sessions: $crash_free_rate%"

if (( $(echo "$crash_free_rate < 99.5" | bc -l) )); then
  echo "⚠️ WARNING: Crash-free rate below threshold"
fi

# Check backend API health
echo "Checking backend API health..."
api_health=$(curl -s "https://api.app-three.hallcrest.engineering/health")
if [[ $api_health == *"healthy"* ]]; then
  echo "✅ API health check passed"
else
  echo "❌ API health check failed"
fi

# Check AWS Lambda errors
echo "Checking Lambda function errors..."
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Errors \
  --dimensions Name=FunctionName,Value=application-three-user-function \
  --start-time $(date -u -d '1 day ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 86400 \
  --statistics Sum

# Check DynamoDB throttling
echo "Checking DynamoDB throttling..."
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name UserErrors \
  --dimensions Name=TableName,Value=application-three-users \
  --start-time $(date -u -d '1 day ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 86400 \
  --statistics Sum

echo "=== Health check completed ==="
```

#### Weekly Performance Review
```typescript
// scripts/weekly-performance-review.ts
import { CloudWatchClient, GetMetricStatisticsCommand } from '@aws-sdk/client-cloudwatch';
import { FirebaseAdmin } from 'firebase-admin';

class PerformanceReporter {
  private cloudwatch: CloudWatchClient;
  
  constructor() {
    this.cloudwatch = new CloudWatchClient({ region: 'us-east-1' });
  }

  async generateWeeklyReport() {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000);

    const report = {
      mobile: await this.getMobileMetrics(startTime, endTime),
      backend: await this.getBackendMetrics(startTime, endTime),
      users: await this.getUserMetrics(startTime, endTime),
    };

    console.log('Weekly Performance Report:', JSON.stringify(report, null, 2));
    
    // Send to Slack if issues detected
    if (this.detectIssues(report)) {
      await this.sendSlackAlert(report);
    }

    return report;
  }

  private async getMobileMetrics(start: Date, end: Date) {
    // Get Firebase Analytics data
    const analytics = FirebaseAdmin.analytics();
    
    return {
      activeUsers: await analytics.getActiveUsers(start, end),
      sessionDuration: await analytics.getAverageSessionDuration(start, end),
      crashRate: await analytics.getCrashRate(start, end),
      appLaunchTime: await analytics.getAppLaunchTime(start, end),
    };
  }

  private async getBackendMetrics(start: Date, end: Date) {
    const params = {
      StartTime: start,
      EndTime: end,
      Period: 86400, // 1 day
      Statistics: ['Average', 'Sum'],
    };

    // Get Lambda metrics
    const lambdaDuration = await this.cloudwatch.send(new GetMetricStatisticsCommand({
      ...params,
      Namespace: 'AWS/Lambda',
      MetricName: 'Duration',
      Dimensions: [{ Name: 'FunctionName', Value: 'application-three-user-function' }],
    }));

    const lambdaErrors = await this.cloudwatch.send(new GetMetricStatisticsCommand({
      ...params,
      Namespace: 'AWS/Lambda',
      MetricName: 'Errors',
      Dimensions: [{ Name: 'FunctionName', Value: 'application-three-user-function' }],
    }));

    // Get API Gateway metrics
    const apiLatency = await this.cloudwatch.send(new GetMetricStatisticsCommand({
      ...params,
      Namespace: 'AWS/ApiGateway',
      MetricName: 'Latency',
      Dimensions: [{ Name: 'ApiName', Value: 'application-three-api' }],
    }));

    return {
      lambdaDuration: lambdaDuration.Datapoints?.[0]?.Average || 0,
      lambdaErrors: lambdaErrors.Datapoints?.[0]?.Sum || 0,
      apiLatency: apiLatency.Datapoints?.[0]?.Average || 0,
    };
  }

  private detectIssues(report: any): boolean {
    return (
      report.mobile.crashRate > 0.5 ||
      report.backend.lambdaDuration > 5000 ||
      report.backend.apiLatency > 2000 ||
      report.mobile.appLaunchTime > 3000
    );
  }
}

// Run weekly report
new PerformanceReporter().generateWeeklyReport();
```

### Database Maintenance

#### DynamoDB Cleanup and Optimization
```typescript
// scripts/dynamodb-maintenance.ts
import { DynamoDBClient, ScanCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';

class DynamoDBMaintenance {
  private client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient({ region: 'us-east-1' });
  }

  async cleanupOldData() {
    const tableName = 'application-three-user-sessions';
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago

    console.log(`Cleaning up data older than ${cutoffDate.toISOString()}`);

    let lastEvaluatedKey;
    let totalDeleted = 0;

    do {
      const scanParams = {
        TableName: tableName,
        FilterExpression: 'lastAccessed < :cutoff',
        ExpressionAttributeValues: {
          ':cutoff': { S: cutoffDate.toISOString() }
        },
        ProjectionExpression: 'userId, sessionId',
        ExclusiveStartKey: lastEvaluatedKey,
      };

      const result = await this.client.send(new ScanCommand(scanParams));

      if (result.Items) {
        for (const item of result.Items) {
          await this.client.send(new DeleteItemCommand({
            TableName: tableName,
            Key: {
              userId: item.userId,
              sessionId: item.sessionId,
            },
          }));
          totalDeleted++;
        }
      }

      lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    console.log(`Cleanup completed. Deleted ${totalDeleted} old records.`);
  }

  async optimizeIndexes() {
    // Analyze GSI usage and optimize
    console.log('Analyzing Global Secondary Index usage...');
    
    // This would typically involve analyzing CloudWatch metrics
    // and recommending index optimizations
  }
}

// Run maintenance
const maintenance = new DynamoDBMaintenance();
maintenance.cleanupOldData();
```

## Incident Response Procedures

### Mobile App Incident Response

#### Critical App Store Issue (App Rejected/Removed)
**Immediate Actions (0-2 hours):**
1. Contact App Store/Play Store support immediately
2. Assess scope of issue (specific versions, all versions)
3. Prepare hotfix if technical issue identified
4. Notify stakeholders and users

**Short-term Actions (2-24 hours):**
1. Submit app store appeal with detailed response
2. Deploy hotfix version if needed
3. Update user communications
4. Monitor app store review process

**Follow-up Actions:**
1. Review app store guidelines compliance
2. Update CI/CD pipeline to prevent similar issues
3. Document lessons learned

#### Mass User Authentication Failure
**Immediate Actions:**
1. Check AWS Cognito service status
2. Verify DNS and connectivity
3. Enable emergency bypass if available
4. Communicate with affected users

**Escalation Matrix:**
```yaml
Authentication Incident Response:
  Severity 1 (Complete Auth Failure):
    Response Time: 15 minutes
    Escalate To: Engineering Lead, CTO
    Communication: All users via push notification
    
  Severity 2 (Partial Auth Issues):
    Response Time: 1 hour  
    Escalate To: Mobile Team Lead
    Communication: Affected users via email
    
  Severity 3 (Individual User Issues):
    Response Time: 4 hours
    Escalate To: Support Team
    Communication: Direct user support
```

### Backend Incident Response

#### Lambda Function Outage
```bash
#!/bin/bash
# scripts/lambda-incident-response.sh

echo "Lambda Incident Response - $(date)"

FUNCTION_NAME="application-three-user-function"
BACKUP_FUNCTION="application-three-user-function-backup"

# Check function status
echo "Checking function status..."
aws lambda get-function --function-name $FUNCTION_NAME

# Check recent deployments
echo "Checking recent deployments..."
aws lambda list-versions-by-function --function-name $FUNCTION_NAME --max-items 5

# Check CloudWatch logs for errors
echo "Checking recent errors..."
aws logs filter-log-events \
  --log-group-name "/aws/lambda/$FUNCTION_NAME" \
  --start-time $(date -d '1 hour ago' +%s)000 \
  --filter-pattern "ERROR"

# Rollback to previous version if needed
read -p "Rollback to previous version? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  PREVIOUS_VERSION=$(aws lambda list-versions-by-function \
    --function-name $FUNCTION_NAME \
    --query 'Versions[-2].Version' --output text)
  
  echo "Rolling back to version $PREVIOUS_VERSION..."
  aws lambda update-alias \
    --function-name $FUNCTION_NAME \
    --name LIVE \
    --function-version $PREVIOUS_VERSION
fi

# Send incident notification
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-type: application/json' \
  --data "{\"text\":\"🚨 Lambda incident detected for $FUNCTION_NAME. Investigation in progress.\"}"
```

### Communication Templates

#### User Notification for Service Issues
```
🔧 Service Update

We're currently experiencing technical difficulties that may affect app performance. Our team is working on a fix.

What we're doing:
- Identified the issue with our backend services
- Deployed additional resources to handle load
- ETA for full resolution: 30 minutes

What you can do:
- Try refreshing the app
- Check back in a few minutes
- Contact support if issues persist

We'll update you as soon as service is restored. Thank you for your patience!

- Application Three Team
```

#### Post-Incident Report Template
```
Subject: Service Incident Report - Application Three

Incident Summary:
Date: [Date]
Duration: [Start Time] - [End Time] ([Total Duration])
Impact: [Number] users affected, [Feature] unavailable

Root Cause:
[Detailed explanation of what caused the incident]

Timeline:
- [Time]: Issue first detected
- [Time]: Investigation began  
- [Time]: Root cause identified
- [Time]: Fix implemented
- [Time]: Service fully restored

Resolution:
[What was done to fix the issue]

Prevention:
[Steps taken to prevent recurrence]

We apologize for any inconvenience caused. Questions? Contact support@hallcrest.engineering

Application Three Engineering Team
```

## Support Tools and Resources

### Diagnostic Tools

#### Mobile App Diagnostics
```typescript
// src/utils/diagnostics.ts
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class DiagnosticsCollector {
  async collectDiagnostics() {
    const diagnostics = {
      device: await this.getDeviceInfo(),
      app: await this.getAppInfo(),
      network: await this.getNetworkInfo(),
      storage: await this.getStorageInfo(),
      permissions: await this.getPermissionsInfo(),
      timestamp: new Date().toISOString(),
    };

    return diagnostics;
  }

  private async getDeviceInfo() {
    return {
      model: await DeviceInfo.getModel(),
      brand: await DeviceInfo.getBrand(),
      systemVersion: await DeviceInfo.getSystemVersion(),
      platform: Platform.OS,
      totalMemory: await DeviceInfo.getTotalMemory(),
      usedMemory: await DeviceInfo.getUsedMemory(),
      freeDiskStorage: await DeviceInfo.getFreeDiskStorage(),
    };
  }

  private async getAppInfo() {
    return {
      version: await DeviceInfo.getVersion(),
      buildNumber: await DeviceInfo.getBuildNumber(),
      bundleId: await DeviceInfo.getBundleId(),
      installTime: await DeviceInfo.getFirstInstallTime(),
      lastUpdateTime: await DeviceInfo.getLastUpdateTime(),
    };
  }

  private async getNetworkInfo() {
    const NetInfo = require('@react-native-community/netinfo');
    const state = await NetInfo.fetch();
    
    return {
      isConnected: state.isConnected,
      type: state.type,
      strength: state.details?.strength,
      isWifiEnabled: state.details?.isWifiEnabled,
    };
  }

  async exportDiagnostics() {
    const diagnostics = await this.collectDiagnostics();
    const diagnosticsString = JSON.stringify(diagnostics, null, 2);
    
    // Save to device for sharing
    await AsyncStorage.setItem('diagnostics', diagnosticsString);
    
    return diagnosticsString;
  }
}
```

#### Backend Health Check Tool
```bash
#!/bin/bash
# scripts/backend-health-check.sh

API_BASE_URL="https://api.app-three.hallcrest.engineering"
HEALTH_ENDPOINT="$API_BASE_URL/health"

echo "=== Backend Health Check ==="
echo "API Base URL: $API_BASE_URL"
echo "Timestamp: $(date)"

# Test basic connectivity
echo "Testing basic connectivity..."
if curl -f -s $HEALTH_ENDPOINT > /dev/null; then
  echo "✅ Health endpoint accessible"
else
  echo "❌ Health endpoint not accessible"
fi

# Test authentication endpoint
echo "Testing authentication..."
auth_response=$(curl -s -w "%{http_code}" -o /dev/null \
  -X POST "$API_BASE_URL/auth/test" \
  -H "Content-Type: application/json" \
  -d '{"test": true}')

if [ "$auth_response" = "200" ] || [ "$auth_response" = "401" ]; then
  echo "✅ Authentication endpoint responding"
else
  echo "❌ Authentication endpoint error: $auth_response"
fi

# Test database connectivity
echo "Testing database connectivity..."
db_response=$(curl -s "$API_BASE_URL/health/database")
if echo "$db_response" | grep -q "healthy"; then
  echo "✅ Database connectivity OK"
else
  echo "❌ Database connectivity issues: $db_response"
fi

# Check recent Lambda errors
echo "Checking Lambda errors (last hour)..."
error_count=$(aws logs filter-log-events \
  --log-group-name "/aws/lambda/application-three-user-function" \
  --start-time $(date -d '1 hour ago' +%s)000 \
  --filter-pattern "ERROR" \
  --query 'length(events)' --output text)

echo "Lambda errors in last hour: $error_count"

if [ "$error_count" -gt 10 ]; then
  echo "⚠️ WARNING: High error rate detected"
fi

echo "=== Health check completed ==="
```

For comprehensive mobile support and technical assistance, contact the Application Three support team at app-support@hallcrest.engineering or use the in-app support feature.