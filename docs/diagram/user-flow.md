# Cloud-Based Platform User Flow

### Table of Contents
- [Cloud-Based Platform User Flow](#cloud-based-platform-user-flow)
    - [Table of Contents](#table-of-contents)
    - [Authentication](#authentication)
    - [Dashboard Overview](#dashboard-overview)
    - [Student Flow - Frontend](#student-flow---frontend)
      - [Instance Request](#instance-request)
      - [After Request Approval](#after-request-approval)
      - [Instance Extension Request](#instance-extension-request)
      - [Reverse Proxy Configuration](#reverse-proxy-configuration)
    - [Lecturer and Admin Flow - Frontend](#lecturer-and-admin-flow---frontend)
      - [Instance Approval Request](#instance-approval-request)
      - [Bulk Approval of Instance Requests](#bulk-approval-of-instance-requests)
      - [Instance Extension Approval Request and Bulk Approval](#instance-extension-approval-request-and-bulk-approval)
      - [Instance Management by Lecturer/Admin](#instance-management-by-lectureradmin)
    - [Admin Flow - Frontend](#admin-flow---frontend)
      - [Course Management](#course-management)
      - [Semester Management](#semester-management)
      - [Lecture Management](#lecture-management)

### Authentication
```mermaid
flowchart TD
    A[Start] --> B{User is a IT Department, FITM, KMUTNB?}
    B -- No --> X[Access denied page]
    B -- Yes --> C{Student or Staff?}
    C -- Student --> D[Login with Student Credentials]
    C -- Staff --> E{Lecturer or Admin?}
    E -- Lecturer --> F[Login with Lecturer Credentials]
    E -- Admin --> G[Login with Admin Credentials]
```

### Dashboard Overview
```mermaid
flowchart LR
    A[Login Successful] --> B{User Role}
    B -- Student --> C[Student Dashboard]
    B -- Lecturer --> D[Lecturer Dashboard]
    B -- Admin --> E[Admin Dashboard]

    C --> C1[Overview]
    C --> C2[Instances]
    C --> C3[Instance requests]
    C --> C4[Instance extensions requests]

    D --> D1[Overview]
    D --> D2[Instances]
    D --> D4[Instance creation]
    D --> D3[Instances management]
    D --> D5[Instance approval requests]

    E --> E1[Overview]
    E --> E2[All instances management]
    E --> E3[All instance requests management]
    E --> E4[All instance extensions and requests management]
    E --> E5[Course management]
    E --> E6[Semester management]
    E --> E7[Lecture management]
    <!-- E --> E8[Template management - Future Work] -->
```

### Student Flow - Frontend

#### Instance Request
```mermaid
flowchart TD
    A[Start] --> B[Access Student Dashboard]
    B --> C[Navigate to Instance request section]
    C --> D[Click on 'Request new instance' button]
    D --> E[Fill Out instance request form]
    E --> F[Submit request]
    F --> G{Request submitted successfully?}
    G -- Yes --> H[Receive confirmation notification]
    G -- No --> I[Display error message and retry]
```

- **Instance request form details**
  - Required Fields:
    - Title for instance request
    - Description for instance request
    - Course selection
    - Template selection (Operating System and Software)
    - Instance specifications (CPU, RAM, Storage)
  - Optional Fields:
    - Instance details (Hostname) - if left blank, a random hostname will be generated

#### After Request Approval
```mermaid
flowchart TD
    A[Request Approved Notification] --> B[Access Student Dashboard]
    B --> C[Navigate to Instances request section]
    C --> D{Check request status?}
    D -- Approved --> E[View instance details]
    D -- Pending --> F[Wait for approval]
    D -- Rejected --> G[Receive rejection notification]
    E --> H[Instance state is 'Pending Creation']
    H --> I[Click on 'Create Instance' button]
    I --> J[Instance state is 'Active' and status is 'Pending']
    J --> K[Receive instance ready notification]
    K --> L[Access and use the instance]
```

#### Instance Extension Request
```mermaid
flowchart TD
    A[Start] --> B[Access Student Dashboard]
    B --> C[Navigate to Instance management]
    C --> D[Select instance]
    D --> E[Click on 'Request extension' button]
    E --> F{If semester is ending soon?}
    F -- Yes --> G[Fill Out extension request form]
    F -- No --> H[Extension not allow if semester is not ending soon]
    G --> I[Submit extension request]
```

- **Instance extension request form details**
  - Required Fields:
    - Title for extension request
    - Description for extension request

#### Reverse Proxy Configuration
```mermaid
flowchart TD
    A[Start] --> B[Access Dashboard]
    B --> C[Navigate to Instances section]
    C --> D[Select instance]
    D --> E[Click on 'Forwarding Rules' button]
    E --> F{Choose menu option?}
    F -- Add --> G1[Click on 'Add port forwarding rule' button]
    G1 --> G2[Fill Out port forwarding rule form]
    G2 --> G3[Submit port forwarding rule]

    F -- View --> H1[View existing port forwarding rules]
    F -- Edit --> I1[Select rule to edit]
    I1 --> I2[Modify rule details]
    I2 --> I3[Submit changes]
```

- **Port forwarding rule form details and editing (TCP only)**
  - Port (Required)
  - Description (Optional)

### Lecturer and Admin Flow - Frontend

#### Instance Approval Request
```mermaid
flowchart TD
    A[Start] --> B[Access Lecturer/Admin Dashboard]
    B --> C[Navigate to Instance approval requests section]
    C --> D{Select instance request to review}
    D --> E[Review instance request details]
    E --> F{Approve or Reject?}
    F -- Approve --> G1[Click on 'Approve' button]
    F -- Details --> H1[Click on 'Details' button to view more information]
    F -- Reject --> I1[Click on 'Reject' button]

    G1 --> G2[Submit approval]

    I1 --> I2[Fill Out rejection reason]
    I2 --> I3[Submit rejection]

    H1 --> H2[View detailed information about the request]
    H2 --> H3{Change specifications?}
    H3 -- Yes --> H4[Modify specifications]
    H4 --> H5[Submit modified specifications]
    H4 --> H6[Approve with modified specifications]
```

- **Instance approval request form details**
  - Reason (optional)
- **Instance specification modification details**
  - Modifiable Fields:
    - CPU
    - RAM
    - Storage

#### Bulk Approval of Instance Requests
```mermaid
flowchart TD
    A[Start] --> B[Access Lecturer/Admin Dashboard]
    B --> C[Navigate to Instance approval requests section]
    C --> D[Select multiple instance requests]
    D --> E{Approve or Reject selected requests?}
    E -- Approve --> F1[Click on 'Bulk Approve' button]
    E -- Reject --> G1[Click on 'Bulk Reject' button]

    F1 --> F2[Submit bulk approval]

    G1 --> G2[Fill Out rejection reason for all selected requests]
    G2 --> G3[Submit bulk rejection]
```

- **Bulk approval/rejection form details**
  - Reason (optional)

#### Instance Extension Approval Request and Bulk Approval
```mermaid
flowchart TD
    A[Start] --> B[Access Lecturer/Admin Dashboard]
    B --> C[Navigate to Instance extension requests section]
    C --> D{Select instance extension request to review}
    D --> E[Review instance extension request details]
    E --> F{Approve or Reject?}
    F -- Approve --> G1[Click on 'Approve' button]
    F -- Reject --> I1[Click on 'Reject' button]

    G1 --> G2[Submit approval]

    I1 --> I2[Fill Out rejection reason]
    I2 --> I3[Submit rejection]
```

- **Instance extension approval request form details**
  - Reason (optional)

#### Instance Management by Lecturer/Admin
```mermaid
flowchart TD
    A[Start] --> B[Access Lecturer/Admin Dashboard]
    B --> C[Navigate to Instances section]
    C --> D{Select instance tab}
    D -- User Instances --> E1[Tab 'User Instances']
    D -- Course Instances --> F1[Tab 'Course Instances']
    D -- All Instances (Admin) --> G1[Tab 'All Instances']

    E1 --> E2[View and manage instances created by users]
    F1 --> F2[View and manage instances associated with courses]
    G1 --> G2[View and manage all instances in the system]

    E2 --> H[Perform management actions: Start, Stop, Restart, Delete]
    F2 --> H
    G2 --> H

    F2 --> I1[Manage state of instances: Active, Inactive, Archived]
    G2 --> I2[Manage state of instances: Active, Inactive, Archived and Deleted]
```

- **Instance management actions**
  - Start
  - Stop
  - Restart
  - Delete
- **Instance states**
  - Active
  - Inactive
  - Archive
  - Delete (Admin only)

### Admin Flow - Frontend

#### Course Management
```mermaid
flowchart TD
    A[Start] --> B[Access Admin Dashboard]
    B --> C[Navigate to Course management section]
    C --> D{Select action}
    D -- Add Course --> E1[Click on 'Add Course' button]
    D -- Edit Course --> F1[Select course to edit]

    E1 --> E2[Fill Out course details form]
    E2 --> E3[Submit new course]

    F1 --> F2[Modify course details]
    F2 --> F3[Submit changes]
```

- **Course details form**
  - Course Name (Required)
  - Course Code (Required)
  - Description (Optional)
  - Instructors (Optional) - select from existing lecturers, can be added later, can be multiple instructors

#### Semester Management
```mermaid
flowchart TD
    A[Start] --> B[Access Admin Dashboard]
    B --> C[Navigate to Semester management section]
    C --> D{Select action}
    D -- Add Semester --> E1[Click on 'Add Semester' button]
    D -- View Semesters --> F1[View list of semesters]

    E1 --> E2[Fill Out semester details form]
    E2 --> E3[Submit new semester]

    F1 --> F2[List of semesters with details]
    F2 --> F3{Edit or Activate semester?}
    F3 -- Edit --> G1[Select semester to edit]
    F3 -- Activate --> H1[Select semester to activate]

    G1 --> G2[Modify semester details]
    G2 --> G3[Submit changes]

    H1 --> H2[Confirm activation of semester]
```

- **Semester details form**
  - Semester Name (Required)
  - Start Date (Required)
  - End Date (Required)

#### Lecture Management
```mermaid
flowchart TD
    A[Start] --> B[Access Admin Dashboard]
    B --> C[Navigate to Lecture management section]
    C --> D{Select action}
    D -- Add Lecture --> E1[Click on 'Add Lecture' button]
    D -- View Lectures --> F1[View list of lectures]

    E1 --> E2[Fill Out lecture details form]
    E2 --> E3[Submit new lecture]

    F1 --> F2[List of lectures with details]
    F2 --> F3{Edit lecture?}
    F3 -- Edit --> G1[Select lecture to edit]

    G1 --> G2[Modify lecture details: Role, Course Assignment]
    G2 --> G3[Submit changes]
```

- **Lecture details form**
  - Primary Email (Required)
  - Secondary Email (Optional)
- **Lecture assignment details**
  - Select Course (Optional) - can be multiple courses
  - Select Role (Required) - Lecturer or Admin (Default: Lecturer)