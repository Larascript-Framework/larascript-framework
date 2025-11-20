# Larascript Framework

Larascript is a modern, type-safe Node.js framework designed for building scalable applications with a focus on developer experience. This monorepo contains the main framework application and a collection of modular packages that can be used independently or together.

This project is currently in beta stage and under active development. It is not recommended for use in production environments at this time. We suggest using it only for small-scale applications and experimental projects while we work on stabilizing the features and APIs.

## 📖 Full Documentation

**[https://www.larascriptnode.com](https://www.larascriptnode.com)**


## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Package Manager**: pnpm
- **Build Tool**: Turbo (monorepo orchestration)
- **Testing**: Jest
- **Linting**: ESLint
- **Database**: PostgreSQL, MongoDB
- **ORM**: Utilizes Sequelize for initial schema setup, complemented by Larascript's custom schema system
- **Web Framework**: Express.js
- **Template Engine**: EJS
- **Authentication**: JWT, bcrypt
- **Email**: Nodemailer, Resend
- **Cloud**: AWS SDK

## 📋 Prerequisites

- **Node.js**
- **pnpm** (Fast, reliable, and secure dependency management)
- **Turborepo** (Monorepo management tool for managing multiple packages)
- **Docker** (Platform for developing, shipping, and running applications in containers)
- **Docker Compose** (Tool for defining and running multi-container Docker applications)

## 🚀 Quick Start

### Clone the repository

```bash
# Clone the repository
git clone <repository-url>
cd larascript-framework
```

### Setting Up Git Remote

Make sure your own repository is setup instead of the original - update the git remote:

```bash
# Remove the original remote
git remote remove origin

# Add your own repository as the new remote
git remote add origin https://github.com/yourusername/your-repo-name.git

# Or if using SSH
git remote add origin git@github.com:yourusername/your-repo-name.git

# Verify the new remote
git remote -v

# Push to your repository (if you want to keep the history)
git push -u origin main
```

### Framework Setup

```bash
# Install dependencies
pnpm install --ignore-scripts

# Build all packages
turbo run build --filter="./libs/*"

# Navigate to the framework application
cd apps/larascript-framework

# Add write permissions to logs directory
chmod -R 755 storage

# Start PostgreSQL and MongoDB
pnpm db:up

# Run setup command (optional - populates .env with configured settings)
pnpm setup

# Run database migrations
pnpm run dev migrate:up

# Start development environment
pnpm run dev
```

### Development

```bash
# Start api in development mode
cd apps/api
pnpm run dev

# Run tests across all packages 
# (Concurrency is set to 1 to avoid race conditions)
turbo run test --filter="./libs/*" --concurrency=1

# Run tests for a specific package
turbo run test --filter="@larascript-framework/larascript-core" --concurrency=1

# Build all packages
turbo run build --filter="./libs/*"

# Build api application
turbo run build --filter="./apps/api"

# Lint all packages
turbo run lint

# Linting using pnpm
cd apps/api
pnpm run lint


```

### Database Setup

```bash
# Start PostgreSQL and MongoDB
pnpm run db:up

# Stop databases
pnpm run db:down

# Restart databases
pnpm run db:restart
```

### API Production

```bash
# Start API with Docker
pnpm run api:up

# Stop API
pnpm run api:down

# Access API container shell
pnpm run api:sh
```

##  Development Scripts


| Script              | Description                                                                            |
|---------------------|----------------------------------------------------------------------------------------|
| build               | Compile TypeScript and update module paths.                                            |
| build:watch         | Watch and compile TypeScript continuously.                                             |
| fix-eslint          | Automatically fix ESLint issues in the src directory.                                  |
| fix                 | Alias for fix-eslint.          
| tslint              | Run TSLint on the project using the specified TypeScript configuration.                ||
| start               | Start the application using the compiled JavaScript output.                            |
| dev                 | Run the application in development mode using nodemon to watch for changes and restart on updates. |
| tinker              | Execute tinker.ts with nodemon for explorative coding.                                 |
| postinstall         | Execute build script after package installation.                                       |
| test                | Run tests using Jest in single-threaded mode.                                          |
| test:watch          | Continuously run tests on file change using Jest.                                      |
| test:coverage       | Generate test coverage reports with Jest.                                              |
| test:all            | Run all test variations, including Jest tests.                                         |
| setup               | Execute setup script with TypeScript executor.                                         |
| network:up          | Set up Docker network using docker-compose.                                            |
| db:up               | Start PostgreSQL and MongoDB databases.                                                |
| db:down             | Stop PostgreSQL and MongoDB databases.                                                 |
| db:restart          | Restart databases.                                                                     |
| db:postgres:up      | Start PostgreSQL service.                                                              |
| db:postgres:down    | Stop PostgreSQL service.                                                               |
| db:mongodb:up       | Start MongoDB service.                                                                 |
| db:mongodb:down     | Stop MongoDB service.                                                                  |
| api:up              | Start API service. (production mode)                                                                    |
| api:down            | Stop API and associated network services. (production mode)                                              |
| api:sh              | Start a bash shell in the API Docker container. (production mode)                                        |

These scripts are designed to manage tasks related to building, testing, and running your application, as well as managing Docker services for databases and APIs.




## 👨‍💻 Author

**Ben Shepherd** - ben.shepherd@gmx.com

- LinkedIn: [Benjamin Shepherd](https://www.linkedin.com/in/benjamin-programmer/)

---

**Note**: This is a monorepo managed with pnpm workspaces and Turbo. Each package can be used independently or as part of the larger Larascript ecosystem.
