# Momoi - API Service

Momoi is the core API service for the Cloud-Based Platform, providing endpoints for VM management, user authentication, and system monitoring.

## Features

- **RESTful API**: Comprehensive endpoints for platform functionality
- **OpenAPI Documentation**: Auto-generated API documentation
- **Telemetry Integration**: Jaeger tracing and Prometheus metrics
- **Message Queue Integration**: RabbitMQ for asynchronous operations

## Tech Stack

- **Framework**: Elysia.js
- **Runtime**: Bun
- **Database**: PostgreSQL via Prisma ORM
- **Validation**: Zod
- **Logging**: Pino with Loki integration
- **Monitoring**: OpenTelemetry, Prometheus

## Getting Started

### Prerequisites

- Bun 1.2+
- PostgreSQL database
- RabbitMQ (for production)

### Installation

Install dependencies:

```bash
bun install
```

### Development

Start the development server with hot reload:

```bash
bun run dev
```

The API will be available at http://localhost:3001/

### Environment Variables

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Key environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `RABBITMQ_URL`: RabbitMQ connection string
- `PORT`: API port (default: 3001)
- `LOG_LEVEL`: Logging level (default: info)

## API Documentation

When running in development mode, OpenAPI documentation is available at:
- http://localhost:3001/swagger

## Docker Deployment

Build and run using Docker:

```bash
docker build -t momoi -f ../../docker/momoi.dockerfile .
docker run -p 3001:3001 momoi
```