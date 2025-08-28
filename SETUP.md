# 🚀 Omnior AI DevOps Orchestrator - Complete Setup Guide

This guide will help you set up and run the Omnior AI DevOps Orchestrator in a new environment without any errors or mistakes.

## 📋 Prerequisites

### System Requirements
- **Operating System**: macOS, Linux, or Windows (with WSL2)
- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For version control
- **4GB+ RAM**: Minimum memory requirement
- **2GB+ Disk Space**: For installation and generated files

### Required Software Installation

#### 1. Node.js and npm
```bash
# macOS (using Homebrew)
brew install node

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Windows
# Download from https://nodejs.org/en/download/

# Verify installation
node --version
npm --version
```

#### 2. Docker and Docker Compose
```bash
# macOS
brew install docker docker-compose

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
newgrp docker

# Windows
# Download Docker Desktop from https://www.docker.com/products/docker-desktop

# Verify installation
docker --version
docker-compose --version
```

#### 3. Git
```bash
# macOS
brew install git

# Ubuntu/Debian
sudo apt-get install git

# Windows
# Download from https://git-scm.com/download/win

# Verify installation
git --version
```

## 🛠️ Installation Steps

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/ancourn/Omnioragent.git

# Navigate to the project directory
cd Omnioragent

# Verify the structure
ls -la
```

### Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Verify installation
npm list --depth=0
```

### Step 3: Set Up the Environment

```bash
# Create necessary directories
mkdir -p workspace templates

# Set proper permissions
chmod +x setup.sh

# Verify directory structure
ls -la
```

### Step 4: Verify the Setup

```bash
# Check if all required files exist
ls -la Dockerfile docker-compose.yml docker-compose.override.yml .dockerignore setup.sh

# Check source code structure
ls -la src/app/
```

## 🚀 Running the Application

### Option 1: Using Setup Script (Recommended)

The setup script provides an easy way to manage the application:

```bash
# Show available commands
./setup.sh help

# Start in development mode (with hot reload)
./setup.sh dev

# Start in production mode
./setup.sh prod

# Build Docker image only
./setup.sh build

# View container logs
./setup.sh logs

# Show container status
./setup.sh status

# Stop containers
./setup.sh stop

# Clean up containers and volumes
./setup.sh clean
```

### Option 2: Manual Docker Commands

#### Development Mode
```bash
# Start development container with hot reload
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build

# The application will be available at:
# http://localhost:3000/orchestrator
```

#### Production Mode
```bash
# Build and start production container
docker-compose up --build --detach

# Access the application
open http://localhost:3000/orchestrator
```

### Option 3: Local Development (Without Docker)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access the application
open http://localhost:3000/orchestrator
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development:

```bash
# Create environment file
cat > .env.local << EOF
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
PORT=3000
EOF
```

### Docker Configuration

The Docker setup includes:

- **Production**: Optimized build with health checks
- **Development**: Hot reload with volume mounting
- **Volumes**: Persistent storage for workspace and templates
- **Ports**: 3000 exposed for web access

## 🧪 Testing the Installation

### 1. Verify API Endpoints

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test orchestrator API
curl -X POST http://localhost:3000/api/orchestrator \
  -H "Content-Type: application/json" \
  -d '{"goal": "Build a simple TODO app"}'
```

### 2. Test the Dashboard

1. Open your browser
2. Navigate to `http://localhost:3000/orchestrator`
3. Click "Run Sample Pipeline"
4. Monitor the execution logs
5. Verify that files are generated in the workspace

### 3. Verify Generated Files

```bash
# Check workspace directory
ls -la workspace/

# Verify generated application structure
ls -la workspace/run-*/
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Port 3000 Already in Use
```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
export PORT=3001
npm run dev
```

#### 2. Docker Not Running
```bash
# Start Docker service
sudo systemctl start docker

# Or start Docker Desktop (macOS/Windows)

# Verify Docker is running
docker info
```

#### 3. Permission Denied Errors
```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
newgrp docker

# Fix file permissions
sudo chown -R $USER:$USER .
chmod +x setup.sh
```

#### 4. Node.js Version Issues
```bash
# Check Node.js version
node --version

# If version < 18, upgrade using nvm
nvm install 18
nvm use 18
```

#### 5. Docker Build Failures
```bash
# Clean Docker cache
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache

# Check build logs
docker-compose logs --build
```

#### 6. Application Not Starting
```bash
# Check container logs
docker-compose logs

# Check container status
docker-compose ps

# Restart containers
docker-compose restart
```

### Debug Commands

```bash
# Full system check
./setup.sh status

# Detailed logs
./setup.sh logs

# Health check
curl http://localhost:3000/api/health

# Test orchestrator
curl -X POST http://localhost:3000/api/orchestrator \
  -H "Content-Type: application/json" \
  -d '{"goal": "test"}'
```

## 📊 Project Structure

```
Omnioragent/
├── src/app/
│   ├── api/orchestrator/
│   │   ├── route.ts              # Main orchestrator API
│   │   └── logs/route.ts         # Logs API endpoint
│   ├── orchestrator/
│   │   └── page.tsx              # Dashboard UI
│   ├── api/health/
│   │   └── route.ts              # Health check endpoint
│   └── page.tsx                  # Homepage
├── templates/
│   └── webapp_fastapi_postgres_react/
│       ├── backend/               # FastAPI application template
│       ├── frontend/              # React application template
│       └── docker-compose.yml     # Template containerization
├── workspace/                    # Generated run artifacts
├── Dockerfile                     # Container build configuration
├── docker-compose.yml            # Production deployment
├── docker-compose.override.yml   # Development configuration
├── .dockerignore                 # Docker build exclusions
├── setup.sh                      # Setup and management script
├── package.json                  # Node.js dependencies
└── README.md                     # Project documentation
```

## 🎯 First Run Guide

### Step 1: Start the Application
```bash
./setup.sh dev
```

### Step 2: Access the Dashboard
- Open browser to `http://localhost:3000/orchestrator`
- You should see the Omnior Pipeline Dashboard

### Step 3: Run Sample Pipeline
- Click "Run Sample Pipeline" button
- Wait for the pipeline to complete
- Monitor the execution logs in real-time

### Step 4: Explore Generated Files
- Check the `workspace/` directory
- Examine the generated FastAPI + React application
- Review the pipeline logs

### Step 5: Test Custom Goals
- Enter your own natural language goal
- Example: "Build a blog with user authentication"
- Execute and monitor the pipeline

## 🔒 Security Considerations

### Docker Security
- Use official base images
- Regular security updates
- Minimal privilege containers
- Network segmentation

### Application Security
- Environment variables for sensitive data
- Input validation
- Secure file permissions
- Regular dependency updates

## 📈 Performance Optimization

### Docker Optimization
- Multi-stage builds
- Layer caching
- Minimal base images
- Resource limits

### Application Optimization
- Code splitting
- Lazy loading
- Efficient database queries
- Caching strategies

## 🚀 Deployment

### Local Deployment
```bash
./setup.sh prod
```

### Cloud Deployment
The application can be deployed to any cloud platform that supports Docker:
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform

### Production Checklist
- [ ] Set up environment variables
- [ ] Configure database connections
- [ ] Set up monitoring and logging
- [ ] Configure backup and recovery
- [ ] Set up SSL/TLS certificates
- [ ] Configure domain and DNS
- [ ] Set up CI/CD pipeline

## 🤝 Getting Help

### Resources
- **GitHub Repository**: https://github.com/ancourn/Omnioragent
- **Issues**: Report bugs and request features
- **Documentation**: Comprehensive guides and API reference

### Support
- Check the troubleshooting section
- Review the logs for error messages
- Verify system requirements
- Check for known issues

---

**🎉 Congratulations! You have successfully set up the Omnior AI DevOps Orchestrator!**

The system is now ready to generate web applications from natural language descriptions. Start by running the sample pipeline and then experiment with your own goals.