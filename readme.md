# Cloud-Based Platform for Supporting Teaching and Academic Activities

## Table of Contents
- [Cloud-Based Platform for Supporting Teaching and Academic Activities](#cloud-based-platform-for-supporting-teaching-and-academic-activities)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Project Purpose](#project-purpose)
  - [Project Scope](#project-scope)
  - [System Architecture](#system-architecture)
  - [Components](#components)
    - [Midori (Frontend)](#midori-frontend)
    - [Momoi (API Service)](#momoi-api-service)
    - [Yuzu (VM Operations)](#yuzu-vm-operations)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Development Environment](#development-environment)
  - [Deployment](#deployment)
  - [Technologies](#technologies)
  - [Project Structure](#project-structure)
  - [Contributing](#contributing)
  - [License](#license)

## Introduction
This project is a cloud-based platform designed to support teaching and academic activities in the Department of Information Technology. It aims to provide a robust infrastructure for managing virtual machines, facilitating educational activities, and enhancing the learning experience for students.

This project is part of the Special Project course in the 4th year of the Bachelor of Engineering program in Information and Network Engineering, Faculty of Industrial Technology and Management, King Mongkut's University of Technology North Bangkok (Prachinburi Campus).

## Project Purpose
- Design and develop a Virtual Cluster Platform to support teaching and project work in the Department of Information Technology
- Implement a Role-Based Access Control (RBAC) web application with a focus on ease of use, system stability, and access security
- Improve the efficiency of server resources available within the department through a centralized cloud management platform

## Project Scope
- **VM Management**: Create, configure, start, stop, and delete virtual machines on demand
- **User Management**: Role-based access control for students, instructors, and administrators
- **Resource Allocation**: Efficient allocation of computing resources based on course requirements
- **Monitoring & Logging**: Comprehensive system monitoring and activity logging
- **Web Interface**: Intuitive web application for managing all platform features
- **API Services**: RESTful API for programmatic access to platform capabilities
- **Security**: Secure authentication and authorization mechanisms

## System Architecture
The platform follows a microservices architecture with three main components:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Users    │───▶│    Midori    │───▶│    Momoi    │───▶│    Yuzu     │
│  (Browser)  │     │  (Frontend) │     │ (API Layer) │     │(VM Service) │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                              │                    │
                                              ▼                    ▼
                                        ┌─────────────┐     ┌─────────────┐
                                        │  Database   │     │  Proxmox VE │
                                        │ (PostgreSQL)│     │ (Hypervisor)│
                                        └─────────────┘     └─────────────┘
```

## Components

### Midori (Frontend)
The web interface built with Next.js, providing a responsive and intuitive user experience for managing VMs and platform resources.

[View Midori Documentation](./apps/midori/README.md)

### Momoi (API Service)
The core API service built with Elysia.js, handling authentication, user management, and communication between the frontend and VM operations service.

[View Momoi Documentation](./apps/momoi/README.md)

### Yuzu (VM Operations)
The VM management service that interfaces with Proxmox VE through RabbitMQ to create, configure, and manage virtual machines.

[View Yuzu Documentation](./apps/yuzu/README.md)

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) 1.2.0 or higher
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [PostgreSQL](https://www.postgresql.org/) 15 or higher
- [RabbitMQ](https://www.rabbitmq.com/) 3.12 or higher
- [Proxmox VE](https://www.proxmox.com/en/proxmox-ve) access (for production)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/akikungz/cloud-based-platform.git
   cd cloud-based-platform
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Development Environment
Start the development environment using Docker Compose:

```bash
docker-compose up -d
```

This will start the infrastructure services (database, message queue, and monitoring). You can then run each application in development mode:

```bash
# Start Midori (Frontend)
cd apps/midori
bun dev

# Start Momoi (API)
cd apps/momoi
bun dev

# Start Yuzu (VM Operations)
cd apps/yuzu
bun dev
```

## Deployment

### Infrastructure Services
The `docker-compose.yaml` file provides infrastructure services (PostgreSQL, RabbitMQ, Prometheus, Jaeger, Grafana, Loki):

```bash
docker-compose up -d
```

### Application Services
The application services (Midori, Momoi, Yuzu) are currently configured to run separately. To deploy them:

1. **Using Docker**: Build and run each service using the provided Dockerfiles in the `docker/` directory
2. **Using Bun**: Run each service directly with `bun start` after setting up environment variables

For production deployment, it's recommended to use a container orchestration system like Kubernetes or enable the commented service definitions in `docker-compose.yaml`.

## Technologies
- **Runtime**: [Bun](https://bun.sh/)
- **Frontend**: [Next.js](https://nextjs.org/) with [Material UI](https://mui.com/) and [Tailwind CSS](https://tailwindcss.com/)
- **API**: [Elysia.js](https://elysiajs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/orm)
- **Message Queue**: [RabbitMQ](https://www.rabbitmq.com/)
- **Hypervisor**: [Proxmox VE](https://www.proxmox.com/en/proxmox-ve)
- **Monitoring**: 
  - [Prometheus](https://prometheus.io/)
  - [Jaeger](https://www.jaegertracing.io/)
  - [Grafana](https://grafana.com/)
  - [Loki](https://grafana.com/oss/loki/)
- **Containerization**: [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- **Authentication**: [BetterAuth](https://www.better-auth.com/)
- **Validation**: [Zod](https://zod.dev/)

## Project Structure
```
cloud-based-platform/
├── apps/                  # Application services
│   ├── midori/            # Frontend web application
│   ├── momoi/             # API service
│   └── yuzu/              # VM operations service
├── packages/              # Shared packages
│   ├── auth/              # Authentication utilities
│   ├── database/          # Database models and utilities
│   └── utils/             # Common utilities
├── config/                # Configuration files
├── docker/                # Docker configuration
└── docker-compose.yaml    # Docker Compose configuration
```

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
