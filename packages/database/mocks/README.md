# Prisma Mock System for Testing

This directory contains a comprehensive Prisma mock system designed to simplify testing with your Prisma database. The system provides utilities for setting up test data, managing test scenarios, and performing common test operations.

## Features

- **Mock Data Generators**: Pre-defined mock data for all Prisma models
- **Database Setup Utilities**: Easy setup and teardown of test databases
- **Test Scenarios**: Common testing scenarios pre-configured
- **Test Helpers**: Utility functions for common test operations
- **Test Assertions**: Custom assertion helpers for database testing

## Quick Start

### Basic Usage

```typescript
import { describe, expect, it, beforeEach } from "bun:test";
import { db } from "@momoi/libs/db";
import { createPrismaMockSetup, createPrismaTestHelpers } from "@momoi/libs/db/mocks";

describe("My Test Suite", () => {
  let mockSetup: ReturnType<typeof createPrismaMockSetup>;
  let testHelpers: ReturnType<typeof createPrismaTestHelpers>;

  beforeEach(async () => {
    mockSetup = createPrismaMockSetup(db);
    testHelpers = createPrismaTestHelpers(db);
    
    // Setup complete test environment
    await mockSetup.setupCompleteTestEnvironment();
  });

  it("should test something", async () => {
    // Your test logic here
    const users = await testHelpers.getDb().user.findMany();
    expect(users.length).toBeGreaterThan(0);
  });
});
```

### Using Test Scenarios

```typescript
import { PrismaTestScenarios } from "@momoi/libs/db/mocks";

describe("Student Tests", () => {
  let testScenarios: PrismaTestScenarios;

  beforeEach(async () => {
    const mockSetup = createPrismaMockSetup(db);
    testScenarios = new PrismaTestScenarios(mockSetup);
  });

  it("should handle student with active instance", async () => {
    await testScenarios.studentWithActiveInstance();
    
    // Test your student logic here
    const activeInstances = await db.instance.findMany({
      where: { state: "active" }
    });
    expect(activeInstances.length).toBeGreaterThan(0);
  });
});
```

## API Reference

### PrismaMockSetup

The main class for setting up and managing test database state.

#### Methods

- `resetDatabase()`: Clears all data from the database
- `setupBasicData()`: Sets up basic test data (users, staff, courses, etc.)
- `setupInstanceData()`: Sets up instance-related test data
- `setupInstanceRequestData()`: Sets up instance request test data
- `setupCompleteTestEnvironment()`: Sets up all test data
- `createCustomUser(userData)`: Creates a custom user for testing
- `createCustomInstance(instanceData)`: Creates a custom instance for testing
- `createCustomInstanceRequest(requestData)`: Creates a custom instance request for testing

### PrismaTestScenarios

Pre-configured test scenarios for common use cases.

#### Available Scenarios

- `studentWithActiveInstance()`: Student with running instances
- `studentWithPendingRequest()`: Student with pending instance requests
- `staffWithMultipleCourses()`: Staff member with multiple courses
- `systemWithMaintenanceNode()`: System with a node in maintenance mode

### PrismaTestHelpers

Utility functions for common test operations.

#### Methods

- `assertUserExists(userId)`: Asserts that a user exists
- `assertInstanceExists(instanceId)`: Asserts that an instance exists
- `assertInstanceRequestExists(requestId)`: Asserts that an instance request exists
- `getUserByEmail(email)`: Gets a user by email
- `getUserInstances(userId)`: Gets all instances for a user
- `getUserInstanceRequests(userId)`: Gets all instance requests for a user
- `getAllStaff()`: Gets all staff members
- `getActiveInstances()`: Gets all active instances
- `getPendingInstanceRequests()`: Gets all pending instance requests
- `getAvailableIpAddresses()`: Gets all available IP addresses
- `getOnlinePveNodes()`: Gets all online PVE nodes
- `getCurrentSamester()`: Gets the current active samester
- `countInstancesByStatus(status)`: Counts instances by status
- `countInstanceRequestsByState(state)`: Counts instance requests by state
- `getInstanceWithRelations(instanceId)`: Gets instance with all relations
- `getInstanceRequestWithRelations(requestId)`: Gets instance request with all relations
- `cleanupTestData()`: Cleans up test data selectively
- `createTestUser(overrides)`: Creates a test user with custom properties
- `createTestInstance(overrides)`: Creates a test instance with custom properties
- `createTestInstanceRequest(overrides)`: Creates a test instance request with custom properties

### PrismaTestAssertions

Custom assertion helpers for database testing.

#### Methods

- `assertObjectPropertiesMatch(actual, expected, properties)`: Asserts that objects have matching properties
- `assertDateIsRecent(date, maxMinutesAgo)`: Asserts that a date is recent
- `assertArrayContainsObject(array, expectedObject, properties)`: Asserts that an array contains an object
- `assertNumberInRange(value, min, max)`: Asserts that a number is within a range

## Mock Data

The system includes pre-defined mock data for all Prisma models:

### Users
- `PrismaMockData.users.student`: Test student user
- `PrismaMockData.users.staff`: Test staff user
- `PrismaMockData.users.admin`: Test admin user

### Staff List
- `PrismaMockData.staffList.main`: Main staff member
- `PrismaMockData.staffList.assistant1`: First assistant
- `PrismaMockData.staffList.assistant2`: Second assistant

### Instance Courses
- `PrismaMockData.instanceCourses.intro`: Introduction course
- `PrismaMockData.instanceCourses.advanced`: Advanced course

### PVE Nodes
- `PrismaMockData.pveNodes.primary`: Primary node (online)
- `PrismaMockData.pveNodes.secondary`: Secondary node (online)
- `PrismaMockData.pveNodes.maintenance`: Maintenance node

### Instance Templates
- `PrismaMockData.instanceTemplates.ubuntu`: Ubuntu template
- `PrismaMockData.instanceTemplates.centos`: CentOS template

### Networks
- `PrismaMockData.networks.primary`: Primary network
- `PrismaMockData.networks.secondary`: Secondary network

### IP Addresses
- `PrismaMockData.ipAddresses.primary`: Primary network IPs
- `PrismaMockData.ipAddresses.secondary`: Secondary network IPs

### Samesters
- `PrismaMockData.samesters.current`: Current active samester
- `PrismaMockData.samesters.next`: Next samester

### Instances
- `PrismaMockData.instances.active`: Active running instance
- `PrismaMockData.instances.pending`: Pending instance

### Instance Requests
- `PrismaMockData.instanceRequests.course`: Course request
- `PrismaMockData.instanceRequests.project`: Project request

### Instance Request Extends
- `PrismaMockData.instanceRequestExtends.basic`: Basic extend request

## Best Practices

### 1. Use beforeEach for Setup
Always use `beforeEach` to set up your test environment:

```typescript
beforeEach(async () => {
  await mockSetup.setupCompleteTestEnvironment();
});
```

### 2. Use Test Scenarios for Common Cases
For common testing scenarios, use the pre-configured scenarios:

```typescript
it("should handle student workflow", async () => {
  await testScenarios.studentWithActiveInstance();
  // Your test logic here
});
```

### 3. Use Helpers for Complex Queries
Use the test helpers for complex database operations:

```typescript
const userInstances = await testHelpers.getUserInstances("test-student-id");
```

### 4. Use Custom Assertions
Use the custom assertions for database-specific validations:

```typescript
PrismaTestAssertions.assertDateIsRecent(instance.created_at);
```

### 5. Clean Up When Needed
Use selective cleanup for tests that need to clean up specific data:

```typescript
afterEach(async () => {
  await testHelpers.cleanupTestData();
});
```

## Migration from Existing Tests

If you have existing tests that manually set up data, you can migrate them to use this system:

### Before (Manual Setup)
```typescript
beforeEach(async () => {
  // Reset database
  await db.instance_request_extends.deleteMany();
  await db.instance_request.deleteMany();
  // ... more manual cleanup
  
  // Create test data
  await db.user.createMany({
    data: [
      { id: "test-student-id", email: "student@test.com", name: "Student" },
      // ... more manual data creation
    ]
  });
});
```

### After (Using Mock System)
```typescript
beforeEach(async () => {
  await mockSetup.setupCompleteTestEnvironment();
});
```

## Examples

See `example-usage.test.ts` for comprehensive examples of how to use all the features of the Prisma mock system.

## Troubleshooting

### Common Issues

1. **Foreign Key Constraint Errors**: Make sure to use `resetDatabase()` which deletes in the correct order
2. **Test Data Conflicts**: Use unique identifiers or call `resetDatabase()` between tests
3. **Missing Relations**: Use the helper methods that include relations (e.g., `getInstanceWithRelations`)

### Debug Tips

1. Use `testHelpers.getDb()` to access the raw Prisma client for debugging
2. Check the mock data in `PrismaMockData` to understand the test data structure
3. Use the assertion helpers to validate your test data

## Contributing

When adding new mock data or test scenarios:

1. Add new mock data to `PrismaMockData` class
2. Add new setup methods to `PrismaMockSetup` if needed
3. Add new test scenarios to `PrismaTestScenarios` if needed
4. Add new helper methods to `PrismaTestHelpers` if needed
5. Update this README with new features
6. Add examples to `example-usage.test.ts`
