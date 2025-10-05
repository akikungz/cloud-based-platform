# Yuzu - VM Operations Service

Yuzu is the VM operations service for the Cloud-Based Platform, responsible for managing virtual machines in Proxmox VE (PVE) through RabbitMQ message processing.

## Features

- **VM Lifecycle Management**: Create, start, stop, and delete VMs
- **Template-based Provisioning**: Clone VMs from templates
- **Asynchronous Processing**: RabbitMQ-based message queue
- **IP Management**: Automatic IP allocation and tracking
- **Logging**: Comprehensive logging with Pino

## Tech Stack

- **Runtime**: Bun
- **Message Queue**: RabbitMQ with amqplib
- **HTTP Client**: Axios for PVE API communication
- **Validation**: Zod schema validation
- **Logging**: Pino with Loki integration

## Getting Started

### Prerequisites

- Bun 1.2+
- RabbitMQ server
- Access to Proxmox VE API

### Installation

Install dependencies:

```bash
bun install
```

### Development

Start the service with hot reload:

```bash
bun run dev
```

### Environment Variables

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Key environment variables:
- `RABBITMQ_URL`: RabbitMQ connection string
- `PVE_API_URL`: Proxmox VE API URL
- `PVE_USERNAME`: Proxmox VE username
- `PVE_PASSWORD`: Proxmox VE password
- `PVE_REALM`: Proxmox VE authentication realm
- `DATABASE_URL`: PostgreSQL connection string

## Documentation

For detailed information about VM operations, see:
- [VM Operations README](./VM_OPERATIONS_README.md)
- [RabbitMQ Setup](./RABBITMQ_SETUP.md)
- [Yuzu PVE API Flow](../../Yuzu_PVE_API_Flow.md)

## Docker Deployment

Build and run using Docker:

```bash
docker build -t yuzu -f ../../docker/yuzu.dockerfile .
docker run yuzu
```
