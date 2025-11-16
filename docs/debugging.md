# Debugging Guide

This guide provides common debugging techniques and solutions for issues you might encounter while working with the Larascript monorepo.

## TypeScript Type Checking

### Check if types are working correctly

You can verify that TypeScript types are working properly across the entire monorepo by running:

```bash
tsc --noEmit
```

This command will perform type checking without generating output files, making it useful for validating type safety.

### Common TypeScript Issues

#### Dist Folder Errors

If you see lots of errors from files located in the `dist` folder, the likelihood is that somewhere a package requires building.

**Solution:**
1. Build all packages in the monorepo:
   ```bash
   pnpm build
   ```

2. Or build a specific package:
   ```bash
   pnpm --filter <package-name> build
   ```

3. If using Turbo, you can also run:
   ```bash
   pnpm turbo build
   ```

## Common Debugging Scenarios

### Package Dependencies

#### Missing Dependencies
If you encounter module resolution errors, check:
- Package dependencies in `package.json`
- Workspace references using `workspace:*`
- TypeScript path mappings in `tsconfig.json`

#### Missing Import Errors
If you're getting "Cannot find module" or "Module not found" errors, you most likely need to:

1. **Add the package to the package.json dependencies:**
   ```bash
   pnpm add <package-name>
   ```

2. **Run the build to ensure the package is properly linked:**
   ```bash
   pnpm build
   ```

3. **For workspace packages, ensure they're properly referenced:**
   ```json
   {
     "dependencies": {
       "@larascript-framework/package-name": "workspace:*"
     }
   }
   ```

#### Circular Dependencies
Look for circular imports between packages:
```bash
pnpm --filter <package-name> build
```

### Build Issues

#### Clean Build
If you're experiencing strange build behavior, try a clean build:
```bash
# Remove all node_modules and dist folders
pnpm clean

# Reinstall dependencies
pnpm install

# Rebuild everything
pnpm build
```

#### Turbo Cache Issues
Clear Turbo cache if builds seem stale:
```bash
pnpm turbo clean
```

### Testing Issues

#### Jest Configuration
If tests are failing, verify:
- Jest configuration in each package
- Test file patterns in `jest.config.js`
- Import paths in test files

#### Test Environment
Ensure the test environment is properly set up:
```bash
pnpm test
```

### Linting Issues

#### ESLint Configuration
Check ESLint configuration:
```bash
pnpm lint
```

#### Auto-fix Issues
Try auto-fixing linting issues:
```bash
pnpm lint:fix
```

### Development Server Issues

#### Port Conflicts
If the development server won't start, check for port conflicts:
```bash
# Check what's using a specific port
netstat -ano | findstr :<port-number>
```

#### Environment Variables
Ensure all required environment variables are set in `.env` files.

## Debugging Tools

### VS Code Extensions
Recommended extensions for debugging:
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Jest Runner

### Console Logging
Add strategic console logs to debug runtime issues:
```typescript
console.log('Debug:', { variable, context });
```

### Breakpoints
Use breakpoints in your IDE for step-by-step debugging.

## Performance Issues

### Build Performance
If builds are slow:
1. Check Turbo cache is working
2. Verify parallel execution in `turbo.json`
3. Consider using `--parallel` flag for faster builds

### Memory Issues
If you encounter memory issues:
1. Increase Node.js memory limit: `--max-old-space-size=4096`
2. Check for memory leaks in long-running processes
3. Monitor memory usage during builds

## Getting Help

If you're still experiencing issues:
1. Check the existing documentation in the `docs/` folder
2. Review the package-specific README files
3. Check the commit history for similar issues
4. Create an issue with detailed reproduction steps
