# Database Package

## Overview
The Database package provides database models, schema definitions, and utilities for the Cloud-Based Platform. It uses Prisma ORM to interact with PostgreSQL and provides a consistent data access layer for all applications in the platform.

## Features
- Prisma ORM integration
- PostgreSQL database schema
- Database migration utilities
- Seeding functionality
- Type-safe database access

## Installation

```bash
bun install
```

## Database Schema
The database schema includes models for:
- User management and authentication
- VM instance tracking
- Request management
- Node status monitoring

## Usage

```typescript
import { db } from '@cloud-platform/database';

// Query users
const users = await db.user.findMany();

// Create a VM instance
const instance = await db.instance.create({
  data: {
    name: 'test-vm',
    vmid: 100,
    state: 'PENDING',
    status: 'CREATING',
    // ...other fields
  }
});
```

## Commands

```bash
# Generate Prisma client
bun prisma:generate

# Push schema to database
bun prisma:db:push

# Open Prisma Studio
bun prisma:studio

# Run database migrations
bun prisma:migrate:dev

# Seed database with initial data
bun db:seed
```

## Configuration
The database package requires the following environment variables:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cloud_platform?schema=public
```

## Development

### Adding a New Model
1. Update the schema in `prisma/schema.prisma`
2. Generate the Prisma client: `bun prisma:generate`
3. Push the changes to the database: `bun prisma:db:push`

### Creating a Migration
```bash
bun prisma:migrate:dev --name add_new_feature
```

### Running Tests
```bash
bun test
```
