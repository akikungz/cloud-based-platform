# Data Flow Diagram - Cloud-Based Platform

This document provides a comprehensive data flow diagram for the Cloud-Based Platform for Supporting Teaching and Academic Activities, showing how data flows through the system components and external services.

## System Overview

The platform follows a microservices architecture with three main application components:
- **Midori**: Frontend web application (Next.js + Material UI + TailwindCSS)
- **Momoi**: API service (Elysia.js + Better Auth + OpenAPI)
- **Yuzu**: VM operations service (RabbitMQ consumer + Proxmox VE integration)

## Architecture Highlights

### Technology Stack
- **Frontend**: Next.js 15 with React 19, Material UI, TailwindCSS, Turbopack
- **Backend API**: Elysia.js with CORS, OpenAPI, OpenTelemetry, Prometheus metrics
- **Authentication**: Better Auth with Google OAuth, Prisma adapter
- **Database**: PostgreSQL with Prisma ORM
- **Message Queue**: RabbitMQ for asynchronous VM operations
- **VM Management**: Proxmox VE API integration with comprehensive VM lifecycle management
- **Monitoring**: Prometheus, Jaeger, Loki, Grafana stack
- **Runtime**: Bun for all Node.js services

### Key Features
- VM lifecycle management (create, delete, resize, status control)
- Template-based VM provisioning with automatic IP allocation
- Role-based access control (students, staff, administrators)
- Comprehensive monitoring and distributed tracing
- Asynchronous message processing for VM operations

## Data Flow Diagram

```mermaid
---
config:
  layout: elk
---
flowchart TB
 subgraph s1["Users"]
        User["Users<br>(Students, Staff, Admins)"]
  end
 
 subgraph s2["Frontend Layer"]
        Browser["Web Browser"]
        Midori["Midori Frontend<br>• Next.js 15 + React 19<br>• Material UI + TailwindCSS<br>• Better Auth Client<br>• Eden API Client"]
  end
 
 subgraph s3["Authentication"]
        GoogleOAuth["Google OAuth 2.0<br>• Profile & Email Scopes<br>• Account Linking"]
        BetterAuth["Better Auth<br>• Session Management<br>• Role-based Access<br>• Prisma Adapter"]
  end
 
 subgraph s4["API Layer"]
        Momoi["Momoi API Service<br>• Elysia.js + OpenAPI<br>• CORS + Validation<br>• Prometheus Metrics<br>• OpenTelemetry Tracing"]
  end
 
 subgraph s5["Database Layer"]
        PostgreSQL[("PostgreSQL Database<br>• User Management<br>• VM Instance Tracking<br>• Request Approvals<br>• IP Address Management<br>• Instance Templates")]
        PrismaClient["Prisma Client<br>• Type-safe ORM<br>• Migration Management<br>• Query Optimization"]
  end
 
 subgraph s6["Message Queue"]
        RabbitMQ["RabbitMQ<br>• Exchange: vm.operations<br>• Queue: yuzu.vm.operations<br>• Routing: vm.*<br>• Message Persistence"]
  end
 
 subgraph s7["VM Operations"]
        Yuzu["Yuzu VM Service<br>• RabbitMQ Consumer<br>• VM Lifecycle Management<br>• IP Allocation<br>• Template Cloning<br>• Status Monitoring"]
        ProxmoxVE["Proxmox VE<br>• QEMU/KVM VMs<br>• LXC Containers<br>• Template Storage<br>• Network Management<br>• Resource Allocation"]
  end
 
 subgraph s8["Monitoring Stack"]
        Prometheus["Prometheus<br>• Metrics Collection<br>• Service Monitoring<br>• Alert Rules"]
        Jaeger["Jaeger<br>• Distributed Tracing<br>• Request Tracking<br>• Performance Analysis"]
        Loki["Loki<br>• Log Aggregation<br>• Structured Logging<br>• Query Interface"]
        Grafana["Grafana<br>• Monitoring Dashboard<br>• Alerting<br>• Data Visualization"]
  end

    %% User interactions
    User --> Browser
    Browser --> Midori
    
    %% Frontend to API communication
    Midori <--> Momoi
    Midori --> GoogleOAuth
    
    %% Authentication flows
    GoogleOAuth --> BetterAuth
    BetterAuth <--> Momoi
    BetterAuth <--> PrismaClient
    
    %% API to database
    Momoi <--> PrismaClient
    PrismaClient <--> PostgreSQL
    
    %% Async VM operations
    Momoi --> RabbitMQ
    RabbitMQ --> Yuzu
    Yuzu <--> PrismaClient
    Yuzu <--> ProxmoxVE
    
    %% Monitoring data flows
    Momoi --> Prometheus
    Momoi --> Jaeger
    Momoi --> Loki
    Yuzu --> Prometheus
    Yuzu --> Jaeger
    Yuzu --> Loki
    
    %% Monitoring aggregation
    Prometheus --> Grafana
    Jaeger --> Grafana
    Loki --> Grafana
    
    %% Response flows
    Browser <-- Midori
    
    %% Styling
    classDef userClass fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef frontendClass fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef authClass fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef apiClass fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef dataClass fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef queueClass fill:#e0f2f1,stroke:#00796b,stroke-width:2px
    classDef vmClass fill:#fff8e1,stroke:#f9a825,stroke-width:2px
    classDef monitoringClass fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px
    classDef externalClass fill:#f1f8e9,stroke:#689f38,stroke-width:2px
    
    class User userClass
    class Browser,Midori frontendClass
    class GoogleOAuth,BetterAuth authClass
    class Momoi apiClass
    class PostgreSQL,PrismaClient dataClass
    class RabbitMQ queueClass
    class Yuzu,ProxmoxVE vmClass
    class Prometheus,Jaeger,Loki,Grafana monitoringClass
```

## Component Details

### Frontend Layer (Midori)
**Technology**: Next.js 15, React 19, Material UI, TailwindCSS
- **User Interface**: Responsive web application with modern Material Design
- **Authentication**: Integrated Better Auth client for Google OAuth
- **API Communication**: Eden client for type-safe API calls to Momoi
- **Features**: VM management interface, user dashboard, admin panels

### API Layer (Momoi)
**Technology**: Elysia.js, Better Auth, OpenAPI, CORS
- **REST API**: OpenAPI-documented endpoints with automatic validation
- **Authentication**: Better Auth server with Google OAuth integration
- **Monitoring**: Prometheus metrics and OpenTelemetry tracing
- **Security**: CORS protection, role-based access control
- **Features**: User management, VM request processing, message queue publishing

### Authentication System
**Technology**: Better Auth, Google OAuth 2.0, Prisma Adapter
- **Provider**: Google OAuth with profile and email scopes
- **Session Management**: Secure session handling with database persistence
- **Role System**: Student, staff, and administrator roles
- **Security**: Token-based authentication with proper validation

### Database Layer
**Technology**: PostgreSQL, Prisma ORM
- **Data Models**: Users, sessions, VM instances, templates, requests
- **Features**: Type-safe queries, migration management, connection pooling
- **VM Tracking**: Instance states, IP allocations, resource management
- **Audit Trail**: Request approvals, user activities, system events

### Message Queue (RabbitMQ)
**Configuration**: 
- Exchange: `vm.operations`
- Queue: `yuzu.vm.operations` 
- Routing: `vm.*`
- **Purpose**: Asynchronous VM operations to prevent API blocking
- **Reliability**: Message persistence and acknowledgment
- **Scalability**: Multiple consumer support for load distribution

### VM Operations Service (Yuzu)
**Technology**: Bun runtime, RabbitMQ consumer, Axios HTTP client
- **VM Lifecycle**: Create, delete, resize, start, stop, suspend, resume
- **Template Management**: Clone VMs from predefined templates
- **Network Management**: Automatic IP allocation and configuration
- **PVE Integration**: Comprehensive Proxmox VE API client
- **Operations**:
  - `vm.create`: Clone from template, configure network, allocate IP
  - `vm.delete`: Stop VM, delete from PVE, release IP
  - `vm.resize`: Disk resizing with validation
  - `vm.status`: Power state management

### Hypervisor Layer (Proxmox VE)
**Technology**: Proxmox VE, QEMU/KVM, LXC
- **VM Types**: QEMU virtual machines and LXC containers
- **Storage**: Template storage and VM disk management
- **Networking**: Virtual networks, VLAN support, IP management
- **Resources**: CPU, memory, disk allocation and monitoring
- **API**: RESTful API for all management operations

### Monitoring Stack
**Technology**: Prometheus, Jaeger, Loki, Grafana
- **Metrics**: Service performance, VM resource usage, API response times
- **Tracing**: Request flow tracking across all services
- **Logging**: Structured logs with correlation IDs
- **Dashboards**: Real-time monitoring and alerting
- **Integration**: OpenTelemetry for standardized observability

## Data Flow Patterns

### VM Creation Flow
1. **User Request**: User submits VM creation request via Midori
2. **API Processing**: Momoi validates request, stores in database
3. **Admin Approval**: Request requires approval workflow
4. **Message Publishing**: Approved request published to RabbitMQ
5. **VM Creation**: Yuzu consumes message, creates VM in Proxmox VE
6. **Status Updates**: Database updated with VM status and details
7. **User Notification**: Frontend reflects new VM availability

### Authentication Flow
1. **OAuth Initiation**: User clicks Google login in Midori
2. **Google OAuth**: Redirect to Google for authentication
3. **Callback Processing**: Better Auth processes OAuth callback
4. **Session Creation**: Secure session created and stored
5. **Role Assignment**: User role determined and applied
6. **Frontend Access**: Authenticated user gains access to features

### Monitoring Data Flow
1. **Metrics Collection**: Services emit metrics to Prometheus
2. **Trace Generation**: OpenTelemetry traces sent to Jaeger
3. **Log Aggregation**: Structured logs forwarded to Loki
4. **Dashboard Updates**: Grafana queries all monitoring sources
5. **Alert Processing**: Automated alerts on threshold breaches

## Security Considerations

- **Authentication**: OAuth 2.0 with secure session management
- **Authorization**: Role-based access control throughout system
- **API Security**: CORS protection, input validation, rate limiting
- **VM Security**: Isolated networks, template hardening
- **Data Protection**: Encrypted connections, secure credential storage
- **Audit Logging**: Comprehensive activity tracking and monitoring