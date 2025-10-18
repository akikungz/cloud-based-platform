# Midori - Cloud Platform Frontend

Midori is the frontend web application for the Cloud-Based Platform, providing a modern and responsive user interface for managing virtual machines and cloud resources.

## Features

- **VM Management**: Create, monitor, and manage virtual machines
- **Resource Dashboard**: View resource usage and allocation
- **User Authentication**: Secure login and account management
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 15.5
- **UI Libraries**: Material UI 7.3, Tailwind CSS 4
- **Runtime**: Bun
- **State Management**: React Context API
- **API Integration**: Momoi client

## Getting Started

### Prerequisites

- Bun 1.2+ or Node.js 20+
- Docker (optional, for containerized development)

### Installation

1. Install dependencies:

```bash
bun install
```

### Development

Run the development server:

## Performance testing

Test public pages (/, /sign-in) by default against http://localhost:3000:

```
npm run dev &
npm run perf -w apps/midori -- --duration 10 --concurrency 10
```

Override base or target paths:

```
npm run perf -w apps/midori -- --base http://localhost:3000 --paths /,/sign-in
```

Add --out perf-report.json to write a JSON report.
```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Environment Variables

Copy the example environment file and adjust as needed:

```bash
cp .env.example .env.local
```

Key environment variables:
- `MOMOI_API_URL`: URL to the Momoi API service
- `NEXT_PUBLIC_APP_URL`: Public URL of the application

## Docker Deployment

Build and run using Docker:

```bash
docker build -t midori -f ../../docker/midori.dockerfile .
docker run -p 3000:3000 midori
```

## Learn More

- [Project Documentation](../../README.md)
- [Next.js Documentation](https://nextjs.org/docs)
