# Auth Package

## Overview
The Auth package provides authentication and authorization utilities for the Cloud-Based Platform. It integrates with BetterAuth for secure user authentication and implements role-based access control (RBAC) for the platform.

## Features
- OAuth2 integration with Google
- Session management
- Role-based access control
- User authentication utilities
- Secure token handling

## Installation

```bash
bun install
```

## Usage

### Client-side Authentication

```typescript
import { useAuth } from '@cloud-platform/auth/client';

// In your component
const { user, login, logout } = useAuth();

if (user) {
  console.log(`Logged in as: ${user.name}`);
} else {
  // Show login button
}
```

### Server-side Authentication

```typescript
import { verifySession } from '@cloud-platform/auth/server';

// In your API route
const session = await verifySession(request);
if (!session) {
  return new Response('Unauthorized', { status: 401 });
}
```

## Configuration
The auth package requires the following environment variables:

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

## API Reference

### Client Exports
- `useAuth()` - React hook for authentication state and methods
- `AuthProvider` - Context provider for authentication
- `withAuth()` - HOC to protect routes requiring authentication

### Server Exports
- `verifySession(request)` - Verify and validate user session
- `requireRole(role)` - Middleware to require specific user role
- `createSession(user)` - Create a new user session

## Development

```bash
# Run tests
bun test

# Build package
bun run build
```
