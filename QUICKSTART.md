# ⚡ Quick Start Guide - Omnior AI DevOps Orchestrator

Get up and running in under 5 minutes with this quick start guide.

## 🚀 One-Command Setup

### Prerequisites Check
```bash
# Verify you have the required software
docker --version && node --version && git --version
```

### Clone and Run
```bash
# Clone the repository
git clone https://github.com/ancourn/Omnioragent.git
cd Omnioragent

# Make setup script executable and run
chmod +x setup.sh && ./setup.sh dev
```

### Access the Application
Open your browser to: **http://localhost:3000/orchestrator**

## 🎯 3-Step Tutorial

### Step 1: Run Sample Pipeline
1. Click the **"Run Sample Pipeline"** button
2. Wait for the pipeline to complete (about 30 seconds)
3. View the execution logs in the dashboard

### Step 2: Explore Generated Files
```bash
# Check what was generated
ls -la/workspace/

# View the generated application
ls -la/workspace/run-*/repo/
```

### Step 3: Create Your Own App
1. In the dashboard, enter a custom goal like:
   - "Build a blog with user authentication"
   - "Create a task management system"
   - "Generate a weather dashboard"
2. Click **"Run Sample Pipeline"** or enter the log path manually
3. Monitor the execution and explore the results

## 🛠️ Alternative Setup Methods

### Method 1: Docker Compose (Recommended)
```bash
# Development mode
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build

# Production mode
docker-compose up --build -d
```

### Method 2: Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:3000/orchestrator
```

### Method 3: Direct Node.js
```bash
# Install dependencies globally
npm install -g nodemon

# Run the application
nodemon server.ts
```

## 🔧 Common Commands

| Command | Description |
|---------|-------------|
| `./setup.sh dev` | Start development server |
| `./setup.sh prod` | Start production server |
| `./setup.sh logs` | View container logs |
| `./setup.sh stop` | Stop all containers |
| `./setup.sh clean` | Clean up everything |

## 📊 What You Get

### Generated Application Structure
```
generated-app/
├── backend/           # FastAPI application
│   ├── app/
│   │   └── main.py    # Main application file
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/          # React application
│   ├── src/
│   │   ├── App.js     # Main React component
│   │   └── index.js   # Entry point
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

### Features Included
- ✅ JWT Authentication System
- ✅ RESTful API Endpoints
- ✅ Database Integration (SQLite/PostgreSQL)
- ✅ React Frontend with Authentication UI
- ✅ Docker Containerization
- ✅ Health Check Endpoints
- ✅ Production-Ready Configuration

## 🐛 Quick Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Docker Issues
```bash
# Restart Docker service
sudo systemctl restart docker

# Clean Docker cache
docker system prune -f
```

### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod +x setup.sh
```

## 🎯 Sample Goals to Try

Copy and paste these goals into the orchestrator:

```bash
# Simple TODO app
"Build a TODO web app with users, JWT auth, and a /health endpoint."

# Blog application
"Create a blog application with user authentication and post management."

# Weather dashboard
"Build a weather dashboard that displays current weather and forecasts."

# Task management
"Generate a task management system with teams and projects."
```

## 📈 Next Steps

1. **Explore Templates**: Check the `/templates` directory for available templates
2. **Customize**: Modify templates to add your own features
3. **Deploy**: Use `./setup.sh prod` to run in production mode
4. **Extend**: Add new pipeline stages or templates

## 🚀 Production Deployment

```bash
# Build and start production container
./setup.sh prod

# Verify it's running
curl http://localhost:3000/api/health

# Access the dashboard
open http://localhost:3000/orchestrator
```

---

**🎉 You're ready to go!** The Omnior AI DevOps Orchestrator is now running and ready to generate web applications from natural language descriptions.

For detailed documentation, see [SETUP.md](./SETUP.md).