# API Documentation Example

## System Overview

The **Cloud-Based Platform** provides a comprehensive API for managing virtual machines and user authentication.

## Authentication

### Login Endpoint

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user with email and password

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user123",
    "name": "John Student",
    "email": "student@example.com",
    "role": "student"
  }
}
```

## Virtual Machine Management

### List User VMs

**Endpoint:** `GET /api/instances`

**Description:** Retrieve all virtual machines for the authenticated user

**Response:**
```json
{
  "instances": [
    {
      "id": "vm-001",
      "name": "Ubuntu Development",
      "status": "running",
      "template": "ubuntu-22.04",
      "resources": {
        "cpu": 2,
        "memory": 4096,
        "storage": 50
      },
      "ipAddress": "192.168.1.100",
      "createdAt": "2024-10-01T10:00:00Z"
    }
  ]
}
```

### Create New VM

**Endpoint:** `POST /api/instances`

**Description:** Create a new virtual machine from template

**Request Body:**
```json
{
  "name": "My Development VM",
  "template": "ubuntu-22.04",
  "resources": {
    "cpu": 2,
    "memory": 4096,
    "storage": 50
  }
}
```

## Error Handling

All API endpoints return standard HTTP status codes:

* `200` - Success
* `201` - Created successfully  
* `400` - Bad Request
* `401` - Unauthorized
* `403` - Forbidden
* `404` - Not Found
* `500` - Internal Server Error

**Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": ["Email is required", "Password must be at least 8 characters"]
  }
}
```

## Rate Limiting

API requests are limited to:
* **Authentication:** 5 requests per minute per IP
* **VM Operations:** 10 requests per minute per user
* **Data Retrieval:** 100 requests per minute per user

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```