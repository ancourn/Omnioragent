# 🚀 Omnior AI DevOps Orchestrator

A comprehensive AI-powered development orchestration platform that automates web application generation from natural language descriptions. Built with Next.js, featuring a complete pipeline from specification to deployment.

## ✨ Features

### 🤖 AI DevOps Pipeline
- **Natural Language Processing**: Convert user goals into structured development plans
- **Automated Code Generation**: Generate complete web applications with backend and frontend
- **Template System**: Pre-built FastAPI + React templates with authentication and database
- **Pipeline Monitoring**: Real-time dashboard for tracking execution progress
- **Quality Assurance**: Built-in testing and validation steps

### 🏗️ Architecture
- **Orchestrator Engine**: TypeScript-based pipeline runner
- **Dashboard UI**: Modern React interface with shadcn/ui components
- **Template Management**: Organized template system for different application types
- **Workspace Management**: Persistent storage for generated applications
- **Containerization**: Full Docker support for reproducible deployments

### 🛠️ Technology Stack
- **Frontend**: Next.js 15, React 18, TypeScript 5
- **UI Components**: shadcn/ui, Tailwind CSS 4, Lucide Icons
- **Backend**: FastAPI templates with JWT authentication
- **Database**: SQLite/PostgreSQL support with Prisma ORM
- **Containerization**: Docker & Docker Compose
- **Real-time**: WebSocket support for live updates

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access the orchestrator dashboard
open http://localhost:3000/orchestrator
```

### Docker Containerization

#### Prerequisites
- Docker (https://docs.docker.com/get-docker/)
- Docker Compose (https://docs.docker.com/compose/install/)

#### Development Mode (Hot Reload)
```bash
# Start in development mode with hot reload
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build

# Or use the setup script
chmod +x setup.sh
./setup.sh dev
```

#### Production Mode
```bash
# Build and run in production
docker-compose up --build --detach

# Or use the setup script
./setup.sh prod
```

#### Alternative: Using Setup Script
```bash
# Show available commands
./setup.sh help

# Start development mode
./setup.sh dev

# Start production mode
./setup.sh prod

# Build image only
./setup.sh build

# Stop containers
./setup.sh stop

# View logs
./setup.sh logs

# Show status
./setup.sh status

# Clean up
./setup.sh clean
```

## 📊 Dashboard Usage

### Running a Pipeline
1. Navigate to `/orchestrator` in your browser
2. Click "Run Sample Pipeline" to execute a demo
3. Monitor the real-time execution logs
4. View generated artifacts in the workspace

### Pipeline Steps
1. **Planner**: Analyzes natural language goal and creates development plan
2. **Specifier**: Generates OpenAPI specs and database schema
3. **Coder**: Copies and adapts template files
4. **Tester**: Runs automated tests (simulated)
5. **Fixer**: Addresses any issues found
6. **Deployer**: Prepares deployment configuration
7. **Evaluator**: Validates against acceptance criteria

### Loading Existing Logs
1. Enter the path to a `pipeline_log.json` file
2. Click "Load" to view execution history
3. Review step-by-step progress with status indicators

## 🏗️ Project Structure

```
├── src/app/
│   ├── api/orchestrator/
│   │   ├── route.ts              # Main orchestrator API
│   │   └── logs/route.ts         # Logs API endpoint
│   ├── orchestrator/
│   │   └── page.tsx              # Dashboard UI
│   └── page.tsx                  # Homepage
├── templates/
│   └── webapp_fastapi_postgres_react/
│       ├── backend/               # FastAPI application template
│       ├── frontend/              # React application template
│       └── docker-compose.yml     # Template containerization
├── workspace/                    # Generated run artifacts (mounted volume)
├── Dockerfile                     # Container build configuration
├── docker-compose.yml            # Production deployment
├── docker-compose.override.yml   # Development configuration
├── .dockerignore                 # Docker build exclusions
└── setup.sh                      # Setup and management script
```

## 🔧 Configuration

### Environment Variables
- `NODE_ENV`: Set to 'development' or 'production'
- `PORT`: Application port (default: 3000)
- `NEXT_TELEMETRY_DISABLED`: Disable Next.js telemetry

### Docker Volumes
- `./workspace:/app/workspace`: Persistent storage for generated applications
- `./templates:/app/templates`: Template directory access

### Pipeline Configuration
Pipeline behavior can be customized by modifying:
- Template files in `/templates/`
- Pipeline logic in `/src/app/api/orchestrator/route.ts`
- Dashboard UI in `/src/app/orchestrator/page.tsx`

## 📝 API Endpoints

### Orchestrator API
- `GET /api/orchestrator` - API status and endpoints
- `POST /api/orchestrator` - Execute pipeline with natural language goal
  ```json
  {
    "goal": "Build a TODO web app with users, JWT auth, and a /health endpoint."
  }
  ```

### Logs API
- `GET /api/orchestrator/logs?path=<file_path>` - Load pipeline logs

### Health Check
- `GET /api/health` - Application health status

## 🐳 Docker Deployment

### Production Deployment
```bash
# Build and start production container
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Development Workflow
```bash
# Start development container with hot reload
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build

# The application will be available at http://localhost:3000
# Changes to source files will trigger automatic rebuilds
```

### Container Management
```bash
# View container status
docker-compose ps

# View logs
docker-compose logs -f

# Stop and remove containers
docker-compose down

# Clean up volumes
docker-compose down -v

# Rebuild and start
docker-compose up --build --force-recreate
```

## 🔍 Generated Application Structure

When the pipeline runs, it creates complete web applications with:

### Backend (FastAPI)
- JWT authentication system
- RESTful API endpoints
- Database models and migrations
- Docker containerization
- Health check endpoints

### Frontend (React)
- Authentication UI
- CRUD operations
- Responsive design
- API integration
- Docker containerization

### Deployment
- Docker Compose configuration
- Environment variable support
- Health checks
- Production-ready setup

## 🛠️ Development

### Adding New Templates
1. Create template directory in `/templates/`
2. Add backend and frontend structure
3. Include Docker configuration
4. Update template selection logic in orchestrator

### Extending Pipeline
1. Modify pipeline stages in `/src/app/api/orchestrator/route.ts`
2. Add new step functions
3. Update logging and error handling
4. Test with sample goals

### Customizing Dashboard
1. Edit UI components in `/src/app/orchestrator/page.tsx`
2. Add new visualizations or controls
3. Update API calls for new features
4. Test user interactions

## 🐛 Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check Docker logs
docker-compose logs

# Verify Docker is running
docker --version
docker-compose --version

# Check port availability
netstat -tulpn | grep :3000
```

#### Pipeline Fails
1. Check workspace directory permissions
2. Verify template files exist
3. Review pipeline logs in dashboard
4. Check API endpoint responses

#### Dashboard Not Loading
1. Verify container is running: `docker-compose ps`
2. Check logs: `docker-compose logs`
3. Ensure port 3000 is available
4. Try accessing `http://localhost:3000/orchestrator`

### Getting Help
- Check container logs: `./setup.sh logs`
- Verify Docker installation
- Review this README for configuration details
- Check template file structure

## 📈 Monitoring

### Health Checks
The application includes built-in health monitoring:
- Container health checks in Docker Compose
- API health endpoint at `/api/health`
- Pipeline execution logging
- Real-time dashboard updates

### Logging
- Application logs: `docker-compose logs`
- Pipeline execution: Dashboard UI
- API requests: Console output
- Error tracking: Built-in error handling

## 🔒 Security

### Best Practices
- Use environment variables for sensitive data
- Implement proper authentication in generated apps
- Regular security updates for dependencies
- Secure file permissions
- Network isolation in production

### Docker Security
- Use official base images
- Regular security scanning
- Minimal privilege containers
- Secure volume mounting
- Network segmentation

## 🚀 Deployment

### Production Deployment
```bash
# Build and start production containers
./setup.sh prod

# Or manually
docker-compose up --build -d

# Verify deployment
curl http://localhost:3000/api/health
```

### Scaling
- Use Docker Swarm or Kubernetes for multi-container deployments
- Implement load balancing for high availability
- Set up monitoring and alerting
- Configure backup and recovery procedures

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your improvements
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for the AI-powered development community. Supercharged by Next.js and Docker 🚀