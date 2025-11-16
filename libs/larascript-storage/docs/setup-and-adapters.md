# Storage Service Setup and Adapters

This guide covers how to set up a storage service and create custom storage adapters for the Larascript Storage package.

## Setting Up a Storage Service

### Basic Setup

```typescript
import { StorageService } from '@larascript-framework/larascript-storage';

// Define your storage configuration
const storageConfig = {
  driver: 'fs', // or 's3'
  storageDir: '/path/to/storage',
  uploadsDir: '/path/to/storage/uploads',
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_BUCKET,
    region: process.env.AWS_DEFAULT_REGION
  }
};

// Create the storage service
const storageService = new StorageService(storageConfig);

// Use the configured driver
const file = await storageService.put('path/to/file.txt', 'uploads/');

// Switch to S3 driver
const s3Storage = storageService.s3();
await s3Storage.put('path/to/file.txt', 'uploads/');
```

### Service Provider Setup

In a Larascript application, you can register the storage service as a provider:

```typescript
// app/providers/StorageServiceProvider.ts
import { ServiceProvider } from '@larascript-framework/larascript-core';
import { StorageService } from '@larascript-framework/larascript-storage';

export class StorageServiceProvider extends ServiceProvider {
  register(): void {
    this.app.singleton('storage', () => {
      const config = this.app.config('storage');
      return new StorageService(config);
    });
  }

  boot(): void {
    // Any boot-time initialization
  }
}
```

### Configuration File

Create a storage configuration file:

```typescript
// config/storage.config.ts
export default {
  driver: process.env.STORAGE_DRIVER || 'fs',
  storageDir: process.env.STORAGE_DIR || './storage',
  uploadsDir: process.env.UPLOADS_DIR || './storage/uploads',
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_BUCKET,
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1'
  }
};
```

## Creating Custom Storage Adapters

### Basic Adapter Structure

All storage adapters must implement the `IGenericStorage` interface:

```typescript
import { IGenericStorage, IStorageFile, IStorageService } from '@larascript-framework/larascript-storage';

export class CustomStorageAdapter implements IGenericStorage {
  constructor(
    private config: any,
    private storageService: IStorageService
  ) {}

  getStorageService(): IStorageService {
    return this.storageService;
  }

  async put(file: IStorageFile | string, destination?: string): Promise<IStorageFile> {
    // Implementation for storing files
    throw new Error('Method not implemented.');
  }

  async get(file: IStorageFile | string, ...args: unknown[]): Promise<IStorageFile> {
    // Implementation for retrieving files
    throw new Error('Method not implemented.');
  }

  async delete(file: IStorageFile | string): Promise<void> {
    // Implementation for deleting files
    throw new Error('Method not implemented.');
  }
}
```

### Google Cloud Storage Adapter Example

```typescript
// storage/adapters/GoogleCloudStorageAdapter.ts
import { Storage } from '@google-cloud/storage';
import { IGenericStorage, IStorageFile, IStorageService } from '@larascript-framework/larascript-storage';

export class GoogleCloudStorageAdapter implements IGenericStorage {
  private storage: Storage;
  private bucket: string;

  constructor(
    private config: any,
    private storageService: IStorageService
  ) {
    this.storage = new Storage({
      projectId: config.projectId,
      keyFilename: config.keyFilename,
      // Or use credentials object
      // credentials: {
      //   client_email: config.clientEmail,
      //   private_key: config.privateKey
      // }
    });
    this.bucket = config.bucket;
  }

  getStorageService(): IStorageService {
    return this.storageService;
  }

  async put(file: IStorageFile | string, destination?: string): Promise<IStorageFile> {
    const filePath = typeof file === 'string' ? file : file.path;
    const fileName = destination || filePath.split('/').pop() || 'file';
    
    const bucket = this.storage.bucket(this.bucket);
    const gcsFile = bucket.file(fileName);
    
    // Upload the file
    await gcsFile.save(filePath, {
      metadata: {
        contentType: this.getContentType(fileName)
      }
    });

    // Return storage file object
    return {
      path: fileName,
      url: `https://storage.googleapis.com/${this.bucket}/${fileName}`,
      size: (await gcsFile.getMetadata())[0].size,
      lastModified: new Date((await gcsFile.getMetadata())[0].timeCreated)
    } as IStorageFile;
  }

  async get(file: IStorageFile | string, ...args: unknown[]): Promise<IStorageFile> {
    const fileName = typeof file === 'string' ? file : file.path;
    const bucket = this.storage.bucket(this.bucket);
    const gcsFile = bucket.file(fileName);
    
    const [metadata] = await gcsFile.getMetadata();
    
    return {
      path: fileName,
      url: `https://storage.googleapis.com/${this.bucket}/${fileName}`,
      size: metadata.size,
      lastModified: new Date(metadata.timeCreated)
    } as IStorageFile;
  }

  async delete(file: IStorageFile | string): Promise<void> {
    const fileName = typeof file === 'string' ? file : file.path;
    const bucket = this.storage.bucket(this.bucket);
    const gcsFile = bucket.file(fileName);
    
    await gcsFile.delete();
  }

  private getContentType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'json': 'application/json'
    };
    
    return contentTypes[ext || ''] || 'application/octet-stream';
  }
}
```

### Registering Custom Adapters

After creating your custom storage adapter, you can register it with the storage service using the `addAdapterOnce` method:

```typescript
import { StorageService } from '@larascript-framework/larascript-storage';
import { GoogleCloudStorageAdapter } from './adapters/GoogleCloudStorageAdapter';

// Create storage service
const storageService = new StorageService(config);

// Register custom adapter
storageService.addAdapterOnce('gcs', new GoogleCloudStorageAdapter(gcsConfig, storageService));

// Now you can use the custom adapter
const gcsStorage = storageService.driver('gcs');
await gcsStorage.put('path/to/file.txt', 'uploads/');
```

### Using Custom Adapters

The `addAdapterOnce` method allows you to register custom adapters after the storage service is initialized. This is useful for:

1. **Dynamic Adapter Registration**: Add adapters at runtime
2. **Plugin-Style Architecture**: Register third-party storage adapters
3. **Conditional Adapter Loading**: Load adapters based on configuration or environment

Example with multiple custom adapters:

```typescript
import { StorageService } from '@larascript-framework/larascript-storage';
import { GoogleCloudStorageAdapter } from './adapters/GoogleCloudStorageAdapter';
import { AzureBlobStorageAdapter } from './adapters/AzureBlobStorageAdapter';

// Create storage service
const storageService = new StorageService(config);

// Register multiple custom adapters
storageService.addAdapterOnce('gcs', new GoogleCloudStorageAdapter(gcsConfig, storageService));
storageService.addAdapterOnce('azure', new AzureBlobStorageAdapter(azureConfig, storageService));

// Use different adapters
const gcsStorage = storageService.driver('gcs');
const azureStorage = storageService.driver('azure');

// Store files using different backends
await gcsStorage.put('file1.txt', 'uploads/');
await azureStorage.put('file2.txt', 'uploads/');
```

**Note**: The `addAdapterOnce` method will throw an error if you try to register an adapter with a name that already exists. This prevents duplicate registrations and ensures adapter names are unique.

### Service Provider Integration

In a Larascript application, you can register custom adapters in your service provider:

```typescript
// app/providers/StorageServiceProvider.ts
import { ServiceProvider } from '@larascript-framework/larascript-core';
import { StorageService } from '@larascript-framework/larascript-storage';
import { GoogleCloudStorageAdapter } from './adapters/GoogleCloudStorageAdapter';

export class StorageServiceProvider extends ServiceProvider {
  register(): void {
    this.app.singleton('storage', () => {
      const config = this.app.config('storage');
      const storageService = new StorageService(config);
      
      // Register custom adapters if configured
      if (config.customAdapters?.gcs) {
        storageService.addAdapterOnce('gcs', new GoogleCloudStorageAdapter(
          config.customAdapters.gcs, 
          storageService
        ));
      }
      
      return storageService;
    });
  }
}
```

## Best Practices

1. **Environment Variables**: Always use environment variables for sensitive configuration
2. **Error Handling**: Implement proper error handling in your adapters
3. **Type Safety**: Use TypeScript interfaces for configuration objects
4. **Testing**: Write unit tests for your custom adapters
5. **Documentation**: Document any custom configuration options
6. **Validation**: Validate configuration before creating adapters
7. **Logging**: Add appropriate logging for debugging storage operations

## Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure proper permissions for file system storage
2. **Network Issues**: Check network connectivity for cloud storage
3. **Configuration Errors**: Validate all required configuration parameters
4. **File Size Limits**: Be aware of file size limits for different storage providers
