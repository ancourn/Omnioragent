#!/bin/bash

# Omnior AI DevOps Orchestrator - Docker Setup Script
# This script helps set up and run the containerized Omnior orchestrator

set -e

echo "🚀 Setting up Omnior AI DevOps Orchestrator with Docker"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Create necessary directories
echo -e "${YELLOW}📁 Creating necessary directories...${NC}"
mkdir -p workspace templates

# Set permissions
echo -e "${YELLOW}🔧 Setting permissions...${NC}"
chmod +x setup.sh 2>/dev/null || true

# Function to show help
show_help() {
    echo "Omnior AI DevOps Orchestrator - Docker Setup"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  prod     Build and run in production mode"
    echo "  dev      Build and run in development mode (hot reload)"
    echo "  build    Build the Docker image"
    echo "  stop     Stop running containers"
    echo "  clean    Clean up containers and volumes"
    echo "  logs     Show container logs"
    echo "  status   Show container status"
    echo "  help     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev      # Start in development mode"
    echo "  $0 prod     # Start in production mode"
    echo "  $0 logs     # View logs"
}

# Function to run in development mode
run_dev() {
    echo -e "${GREEN}🔧 Starting Omnior in development mode...${NC}"
    docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build -d
    echo -e "${GREEN}✅ Development server started!${NC}"
    echo -e "${YELLOW}📱 Access the dashboard at: http://localhost:3000/orchestrator${NC}"
    echo -e "${YELLOW}🔍 View logs with: $0 logs${NC}"
}

# Function to run in production mode
run_prod() {
    echo -e "${GREEN}🚀 Starting Omnior in production mode...${NC}"
    docker-compose up --build -d
    echo -e "${GREEN}✅ Production server started!${NC}"
    echo -e "${YELLOW}📱 Access the dashboard at: http://localhost:3000/orchestrator${NC}"
    echo -e "${YELLOW}🔍 View logs with: $0 logs${NC}"
}

# Function to build the image
build_image() {
    echo -e "${YELLOW}🏗️  Building Docker image...${NC}"
    docker-compose build
    echo -e "${GREEN}✅ Docker image built successfully!${NC}"
}

# Function to stop containers
stop_containers() {
    echo -e "${YELLOW}🛑 Stopping containers...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ Containers stopped!${NC}"
}

# Function to clean up
clean_up() {
    echo -e "${YELLOW}🧹 Cleaning up containers and volumes...${NC}"
    docker-compose down -v --remove-orphans
    docker system prune -f
    echo -e "${GREEN}✅ Cleanup completed!${NC}"
}

# Function to show logs
show_logs() {
    echo -e "${YELLOW}📋 Showing container logs...${NC}"
    docker-compose logs -f
}

# Function to show status
show_status() {
    echo -e "${YELLOW}📊 Container Status:${NC}"
    docker-compose ps
}

# Main script logic
case "${1:-}" in
    "dev")
        run_dev
        ;;
    "prod")
        run_prod
        ;;
    "build")
        build_image
        ;;
    "stop")
        stop_containers
        ;;
    "clean")
        clean_up
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac