# Larascript Views

A lightweight EJS template rendering service for the Larascript Framework.

## Installation

```bash
npm install ben-shepherd/larascript-views
```

## Quick Start

```typescript
import { ViewService } from '@ben-shepherd/larascript-views';

// Initialize the view service
const viewService = new ViewService({
  resourcesDir: './views'
});

// Render a template
const html = await viewService.render({
  view: 'welcome',
  data: {
    name: 'World',
    title: 'Hello'
  }
});
```

## Features

- **EJS Template Support**: Render `.ejs` templates with data
- **Simple API**: Clean, promise-based interface
- **TypeScript Ready**: Full type definitions included
- **Lightweight**: Minimal dependencies

## API Reference

### ViewService

Main service for rendering templates.

```typescript
class ViewService {
  constructor(config: IViewServiceConfig)
  render(data: RenderData): Promise<string>
  ejs(): IViewRenderService
}
```

### Configuration

```typescript
interface IViewServiceConfig {
  resourcesDir: string; // Directory containing your .ejs templates
}
```

### Render Data

```typescript
interface RenderData {
  view: string;                    // Template name (with or without .ejs extension)
  data?: Record<string, unknown>;  // Data to pass to the template
}
```

## Examples

### Basic Template Rendering

```typescript
import { ViewService } from '@ben-shepherd/larascript-views';

const viewService = new ViewService({
  resourcesDir: './src/views'
});

// Template: ./src/views/welcome.ejs
const html = await viewService.render({
  view: 'welcome',
  data: { name: 'Alice' }
});
```

### Using Partials

```typescript
// Template: ./src/views/layout.ejs
const layout = await viewService.render({
  view: 'layout',
  data: {
    title: 'My Page',
    content: '<p>Page content here</p>'
  }
});
```

### Template Example

```ejs
<!-- ./src/views/welcome.ejs -->
<!DOCTYPE html>
<html>
<head>
    <title><%= title %></title>
</head>
<body>
    <h1>Welcome, <%= name %>!</h1>
    <% if (showGreeting) { %>
        <p>Nice to see you!</p>
    <% } %>
</body>
</html>
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Lint and format
npm run lint
npm run format
```

## License

ISC