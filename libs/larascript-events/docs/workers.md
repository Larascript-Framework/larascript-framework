# Workers

The worker system in `@larascript-framework/larascript-events` provides background processing capabilities for handling long-running events and queue-based event processing. Workers allow you to process events asynchronously, handle retries, and manage failed event processing.

## Overview

Workers are designed to handle events that:
- Require long processing time
- Need to be processed in the background
- Should be retried on failure
- Need to be queued for later processing

## Core Components

### WorkerService

The main service responsible for running workers and processing queued events.

```typescript
import { WorkerService } from '@larascript-framework/larascript-events';

const workerService = new WorkerService();
```

### IWorkerRepository

Interface for managing worker data persistence. Implementations should handle:
- Storing worker data
- Retrieving queued workers
- Managing worker lifecycle

```typescript
interface IWorkerRepository {
  getWorkers(): Promise<IWorkerModel[]>;
}
```

### IWorkerModel

Represents a single worker instance with its associated data and lifecycle methods.

```typescript
interface IWorkerModel {
  createWorkerData(data: IWorkerAttributes): Promise<void>;
  updateWorkerData(data: IWorkerAttributes): Promise<void>;
  getWorkerData<T extends IWorkerAttributes = IWorkerAttributes>(): T | null;
  saveWorkerData(): Promise<void>;
  deleteWorkerData(): Promise<void>;
}
```

### IWorkerAttributes

Defines the structure of worker data:

```typescript
interface IWorkerAttributes {
  payload: TSerializableValues | null;
  attempts: number;
  retries: number;
  queueName: string;
  eventName: string;
  error?: string;
  failedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

## Worker Options

When running a worker, you can configure various options:

```typescript
type TEventWorkerOptions = {
  queueName: string;           // Name of the queue to process
  retries: number;             // Maximum number of retry attempts
  runAfterSeconds: number;     // Delay before processing
  runOnce?: boolean;           // Process only once
  workerCreator: IWorkerCreatorConstructor; // Worker creator class
}
```

## Setting Up Workers

### 1. Configure Dependencies

```typescript
import { WorkerService } from '@larascript-framework/larascript-events';
import { LoggerService } from '@larascript-framework/larascript-logger';

const workerService = new WorkerService();

// Set required dependencies
workerService.setLogger(new LoggerService());
workerService.setEventService(eventService);
workerService.setWorkerRepository(workerRepository);
workerService.setWorkerCreator(workerCreator);
```

### 2. Create Worker Repository

Implement the `IWorkerRepository` interface to handle worker data persistence:

```typescript
class DatabaseWorkerRepository implements IWorkerRepository {
  async getWorkers(): Promise<IWorkerModel[]> {
    // Fetch workers from database
    const workers = await this.db.collection('workers').find({
      deletedAt: null,
      attempts: { $lt: this.maxRetries }
    });
    
    return workers.map(worker => new WorkerModel(worker));
  }
}
```

### 3. Create Worker Creator

Implement the `IWorkerCreator` interface to create worker models:

```typescript
class DatabaseWorkerCreator implements IWorkerCreator {
  createWorkerModel(data: IWorkerAttributes): IWorkerModel {
    return new DatabaseWorkerModel(data);
  }
  
  createFailedWorkerModel(data: IWorkerAttributes): IWorkerModel {
    return new DatabaseFailedWorkerModel(data);
  }
}
```

## Running Workers

### Basic Worker Execution

```typescript
const options: TEventWorkerOptions = {
  queueName: 'email-queue',
  retries: 3,
  runAfterSeconds: 0,
  workerCreator: DatabaseWorkerCreator
};

await workerService.runWorker(options);
```

### Continuous Worker Processing

For continuous processing, you can run workers in a loop:

```typescript
async function runContinuousWorker() {
  while (true) {
    try {
      await workerService.runWorker({
        queueName: 'default',
        retries: 3,
        runAfterSeconds: 0,
        workerCreator: DatabaseWorkerCreator
      });
      
      // Wait before next iteration
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Worker error:', error);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}
```

## Event Queue Integration

### Creating Queue-Compatible Events

Events that should be processed by workers should implement the `getQueueName()` method:

```typescript
import { BaseEvent } from '@larascript-framework/larascript-events';

class EmailNotificationEvent extends BaseEvent<{ userId: string; message: string }> {
  async execute(): Promise<void> {
    // Long-running email sending logic
    await this.sendEmail(this.getPayload().userId, this.getPayload().message);
  }

  getQueueName(): string {
    return 'email-queue';
  }
}
```

### Dispatching to Queue

When dispatching events, they will be automatically queued if a queue driver is configured:

```typescript
// Dispatch event - will be queued for worker processing
await eventService.dispatch(new EmailNotificationEvent({
  userId: '123',
  message: 'Welcome to our platform!'
}));
```

## Error Handling and Retries

### Automatic Retry Logic

Workers automatically handle retries when events fail:

```typescript
// Worker automatically retries failed events
const options: TEventWorkerOptions = {
  queueName: 'default',
  retries: 3,           // Maximum 3 retry attempts
  runAfterSeconds: 60,  // Wait 60 seconds between retries
  workerCreator: DatabaseWorkerCreator
};
```

### Failed Event Handling

Failed events are tracked with error information:

```typescript
// Failed worker data structure
{
  payload: { userId: '123', message: 'Welcome!' },
  attempts: 3,
  retries: 3,
  queueName: 'email-queue',
  eventName: 'EmailNotificationEvent',
  error: 'SMTP connection failed',
  failedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
}
```

## Monitoring and Logging

### Worker Logging

Workers provide detailed logging for monitoring:

```typescript
// Worker logs include:
// - Number of queued items
// - Processing status
// - Error details
// - Retry attempts

workerService.runWorker(options);
// Output: "Queued items: 5"
// Output: "Processing EmailNotificationEvent for user 123"
// Output: "Event processing failed: SMTP error"
```

### Health Checks

Monitor worker health by checking queue status:

```typescript
async function checkWorkerHealth() {
  const workers = await workerRepository.getWorkers();
  
  console.log(`Active workers: ${workers.length}`);
  console.log(`Failed workers: ${workers.filter(w => w.getWorkerData()?.error).length}`);
  
  return {
    active: workers.length,
    failed: workers.filter(w => w.getWorkerData()?.error).length,
    total: workers.length
  };
}
```

## Best Practices

### 1. Queue Naming

Use descriptive queue names for different types of work:

```typescript
// Good queue names
getQueueName(): string {
  return 'email-notifications';
}

getQueueName(): string {
  return 'image-processing';
}

getQueueName(): string {
  return 'data-export';
}
```

### 2. Retry Configuration

Configure appropriate retry settings based on event type:

```typescript
// For critical events - more retries
const criticalOptions: TEventWorkerOptions = {
  queueName: 'critical-notifications',
  retries: 5,
  runAfterSeconds: 30,
  workerCreator: DatabaseWorkerCreator
};

// For non-critical events - fewer retries
const standardOptions: TEventWorkerOptions = {
  queueName: 'standard-notifications',
  retries: 2,
  runAfterSeconds: 60,
  workerCreator: DatabaseWorkerCreator
};
```

### 3. Error Handling

Implement proper error handling in your events:

```typescript
class RobustEmailEvent extends BaseEvent<{ userId: string; message: string }> {
  async execute(): Promise<void> {
    try {
      await this.sendEmail(this.getPayload().userId, this.getPayload().message);
    } catch (error) {
      // Log detailed error information
      console.error('Email sending failed:', {
        userId: this.getPayload().userId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      // Re-throw to trigger retry mechanism
      throw error;
    }
  }
}
```

### 4. Resource Management

Ensure proper cleanup in long-running workers:

```typescript
async function runManagedWorker() {
  const workerService = new WorkerService();
  
  // Set up signal handlers for graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Shutting down worker gracefully...');
    // Clean up resources
    await cleanup();
    process.exit(0);
  });
  
  // Run worker with error handling
  while (true) {
    try {
      await workerService.runWorker(options);
    } catch (error) {
      console.error('Worker error:', error);
      // Implement exponential backoff
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}
```

## Integration Examples

### Express.js Integration

```typescript
import express from 'express';
import { WorkerService } from '@larascript-framework/larascript-events';

const app = express();
const workerService = new WorkerService();

// Health check endpoint
app.get('/health/workers', async (req, res) => {
  try {
    const health = await checkWorkerHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual worker trigger endpoint
app.post('/workers/run', async (req, res) => {
  try {
    await workerService.runWorker({
      queueName: req.body.queueName || 'default',
      retries: req.body.retries || 3,
      runAfterSeconds: req.body.runAfterSeconds || 0,
      workerCreator: DatabaseWorkerCreator
    });
    
    res.json({ success: true, message: 'Worker started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Cron Job Integration

```typescript
import cron from 'node-cron';
import { WorkerService } from '@larascript-framework/larascript-events';

const workerService = new WorkerService();

// Run workers every minute
cron.schedule('* * * * *', async () => {
  try {
    await workerService.runWorker({
      queueName: 'default',
      retries: 3,
      runAfterSeconds: 0,
      workerCreator: DatabaseWorkerCreator
    });
  } catch (error) {
    console.error('Cron worker error:', error);
  }
});
```

## Troubleshooting

### Common Issues

1. **Workers not processing events**
   - Check if events are being queued properly
   - Verify worker repository implementation
   - Ensure event service is properly configured

2. **Events failing repeatedly**
   - Review error logs for specific failure reasons
   - Check if payload data is valid
   - Verify external service dependencies

3. **Memory leaks**
   - Ensure proper cleanup in event handlers
   - Monitor worker process memory usage
   - Implement proper error boundaries

### Debug Mode

Enable debug logging for detailed worker information:

```typescript
// Set up detailed logging
const logger = new LoggerService();
logger.setLevel('debug');

workerService.setLogger(logger);
```

## API Reference

### WorkerService

#### Methods

- `runWorker(options: TEventWorkerOptions): Promise<void>`
- `setWorkerRepository(repository: IWorkerRepository): void`
- `setLogger(logger: ILoggerService): void`
- `setEventService(service: IEventService): void`
- `setWorkerCreator(creator: IWorkerCreator): void`

### TEventWorkerOptions

```typescript
{
  queueName: string;                    // Queue to process
  retries: number;                      // Max retry attempts
  runAfterSeconds: number;              // Processing delay
  runOnce?: boolean;                    // Single run mode
  workerCreator: IWorkerCreatorConstructor; // Creator class
}
```

### IWorkerAttributes

```typescript
{
  payload: TSerializableValues | null;  // Event payload
  attempts: number;                     // Current attempts
  retries: number;                      // Max retries
  queueName: string;                    // Queue name
  eventName: string;                    // Event class name
  error?: string;                       // Error message
  failedAt?: Date;                      // Failure timestamp
  createdAt: Date;                      // Creation timestamp
  updatedAt: Date;                      // Update timestamp
  deletedAt?: Date;                     // Deletion timestamp
}
```
