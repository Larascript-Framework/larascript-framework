# Larascript Storage

A unified storage abstraction for the Larascript framework that provides a consistent API for file storage and retrieval across different storage backends.

## Features

- **Multi-backend Support**: File system and S3 storage drivers
- **Unified API**: Consistent interface regardless of storage backend
- **File Upload Handling**: Built-in support for moving uploaded files
- **Type Safety**: Full TypeScript support with comprehensive interfaces
- **Flexible Configuration**: Easy switching between storage drivers

## Installation

```bash
npm install larascript-framework/larascript-storage
```

## Quick Start

```typescript
import { StorageService } from '@larascript-framework/larascript-storage';

// Create a storage service instance
const storage = new StorageService(config);

// Store a file
const file = await storage.put('path/to/file.txt', 'uploads/');

// Retrieve a file
const retrievedFile = await storage.get('uploads/file.txt');

// Delete a file
await storage.delete('uploads/file.txt');
```

## Storage Drivers

### File System Storage
```typescript
// Use file system storage
const fsStorage = storage.fileSystem();
await fsStorage.put('local-file.txt', 'uploads/');
```

### S3 Storage
```typescript
// Use S3 storage
const s3Storage = storage.s3();
await s3Storage.put('local-file.txt', 'uploads/');
```

## File Upload Handling

```typescript
// Move an uploaded file to permanent storage
const uploadedFile = await storage.moveUploadedFile(
  uploadedFileData,
  'uploads/documents/'
);
```

## API Reference

### StorageService

The main storage service that provides access to different storage drivers.

#### Methods

- `driver(key: string)`: Get a specific storage driver
- `fileSystem()`: Get the file system storage driver
- `s3()`: Get the S3 storage driver
- `moveUploadedFile(file, destination?)`: Move uploaded file to permanent location
- `getStorageDirectory()`: Get the base storage directory
- `getUploadsDirectory()`: Get the uploads directory

### IGenericStorage

Core storage interface implemented by all storage drivers.

#### Methods

- `put(file, destination?)`: Store a file
- `get(file)`: Retrieve a file
- `delete(file)`: Delete a file

## Configuration

Configure your storage service with the appropriate settings for your environment:

```typescript
const config = {
  driver: 'fs', // or 's3'
  storageDir: '/path/to/storage',
  uploadsDir: '/path/to/storage/uploads',
  s3: {
    accessKeyId: 'your-s3-access-key',
    secretAccessKey: 'your-s3-secret-key',
    bucket: 'your-bucket-name',
    region: 'us-east-1'
  }
};
```

## Advanced Setup and Custom Adapters

For detailed information on setting up storage services and creating custom storage adapters, see the [Setup and Adapters Guide](./docs/setup-and-adapters.md).

This guide covers:
- Service provider setup for Larascript applications
- Creating custom storage adapters (Google Cloud Storage, Azure Blob Storage, etc.)
- Advanced configuration options
- Best practices and troubleshooting

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the package
pnpm build

# Lint code
pnpm lint
```

## License

ISC