# Crypto Js

A TypeScript library providing cryptographic utilities for encryption, decryption, hashing, and secure key generation.

## Features

- **Encryption/Decryption**: AES-256-CBC encryption with PBKDF2 key derivation
- **Password Hashing**: PBKDF2 hashing with salt generation and verification
- **Secure Key Generation**: Cryptographically secure random bytes and app keys
- **TypeScript Support**: Full type definitions and interfaces

## Installation

```bash
npm install ben-shepherd/crypto-js
```

## Quick Start

```typescript
import { CryptoService } from '@ben-shepherd/crypto-js';

// Initialize with your secret key
const cryptoService = new CryptoService({
  secretKey: 'your-secret-key-here'
});

// Encrypt data
const encrypted = cryptoService.encrypt('sensitive data');

// Decrypt data
const decrypted = cryptoService.decrypt(encrypted);

// Hash passwords
const hashedPassword = cryptoService.hash('user-password');

// Verify passwords
const isValid = cryptoService.verifyHash('user-password', hashedPassword);

// Generate secure keys
const appKey = cryptoService.generateAppKey();
const randomBytes = cryptoService.generateBytesAsString(32);
```

## API Reference

### CryptoService

#### Constructor
```typescript
new CryptoService(config: ICryptoConfig)
```

#### Methods

- `encrypt(data: string): string` - Encrypt data using AES-256-CBC
- `decrypt(encryptedData: string): string` - Decrypt previously encrypted data
- `hash(string: string, salt?: string): string` - Hash string with PBKDF2
- `verifyHash(string: string, hashWithSalt: string): boolean` - Verify hash
- `generateAppKey(): string` - Generate 32-byte hex app key
- `generateBytesAsString(length?: number, encoding?: BufferEncoding): string` - Generate random bytes

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Lint and format
npm run lint
npm run format
```

## License

ISC