# Context Diagram - Cloud-Based Platform for Supporting Teaching and Academic Activities

## System Overview
This context diagram illustrates the interaction between users and the cloud-based platform system for managing virtual machines and supporting academic activities in the Department of Information Technology.

## Context Diagram

```mermaid
---
config:
  layout: elk
  look: neo
---
flowchart TD
 subgraph subGraph0["External Entities"]
        A["ผู้ใช้<br>Users<br>Staff &amp; Students"]
  end
 subgraph subGraph1["Cloud-Based Platform System"]
        B["เว็ปแอปพลิเคชันจัดการ<br>เครื่องเสมือนและ<br>กิจกรรมการเรียนการสอน<br>Cloud-Based Platform<br>for Teaching &amp; Academic Activities"]
  end
 subgraph subGraph2["User Actions/Functions"]
        C1["สร้างคำขอเครื่องเสมือน<br>Create VM Instance Request"]
        C2["จัดการเครื่องเสมือน<br>Manage VM Instances"]
        C3["อนุมัติคำขอ<br>Approve Requests"]
        C4["จัดการหลักสูตร<br>Manage Courses"]
        C5["จัดการภาคการศึกษา<br>Manage Semesters"]
        C6["จัดการบุคลากร<br>Manage Staff"]
        C7["ตรวจสอบสถานะ<br>Check Instance Status"]
        C8["ขยายเวลาใช้งาน<br>Extend Usage Time"]
        C9["ตั้งค่าบัญชี<br>Account Settings"]
        C10["ดูรายงาน<br>View Reports"]
        C11["จัดการการเข้าถึง<br>Manage Access Control"]
  end
 subgraph subGraph3["System Outputs"]
        D1["แสดงรายการเครื่องเสมือน<br>Display VM Instance List"]
        D2["แสดงสถานะเครื่องเสมือน<br>Display Instance Status"]
        D3["แสดงรายการคำขอ<br>Display Request List"]
        D4["แสดงข้อมูลหลักสูตร<br>Display Course Information"]
        D5["แสดงข้อมูลภาคการศึกษา<br>Display Semester Information"]
        D6["แสดงรายงานการใช้งาน<br>Display Usage Reports"]
        D7["แสดงการแจ้งเตือน<br>Display Notifications"]
  end
    A -- initiates --> C1 & C2 & C3 & C4 & C5 & C6 & C7 & C8 & C9 & C10 & C11
    C1 --> B
    C2 --> B
    C3 --> B
    C4 --> B
    C5 --> B
    C6 --> B
    C7 --> B
    C8 --> B
    C9 --> B
    C10 --> B
    C11 --> B
    B --> D1 & D2 & D3 & D4 & D5 & D6 & D7
    D1 -- displays --> A
    D2 -- displays --> A
    D3 -- displays --> A
    D4 -- displays --> A
    D5 -- displays --> A
    D6 -- displays --> A
    D7 -- displays --> A
     A:::userClass
     B:::systemClass
     C1:::actionClass
     C2:::actionClass
     C3:::actionClass
     C4:::actionClass
     C5:::actionClass
     C6:::actionClass
     C7:::actionClass
     C8:::actionClass
     C9:::actionClass
     C10:::actionClass
     C11:::actionClass
     D1:::outputClass
     D2:::outputClass
     D3:::outputClass
     D4:::outputClass
     D5:::outputClass
     D6:::outputClass
     D7:::outputClass
```

## System Components

### Main System
**Cloud-Based Platform for Supporting Teaching and Academic Activities**
- A web application system that manages virtual machines and supports academic activities
- Built with microservices architecture (Midori, Momoi, Yuzu)
- Provides role-based access control for staff and students

### User Roles
1. **Staff** - Instructors and administrators who can:
   - Approve student requests
   - Manage all VM instances
   - Manage courses and semesters
   - Manage staff accounts

2. **Students** - Users who can:
   - Create VM instance requests
   - Manage their own instances
   - View their request status
   - Extend usage time

### Key Functions
1. **VM Instance Management** - Create, configure, start, stop, and delete virtual machines
2. **Request Management** - Submit and approve VM instance requests
3. **Course Management** - Manage academic courses and their VM requirements
4. **Semester Management** - Manage academic semesters and enrollment periods
5. **Staff Management** - Manage staff accounts and permissions
6. **Access Control** - Role-based authentication and authorization
7. **Monitoring** - Track instance status and resource usage
8. **Reporting** - Generate usage reports and analytics

### System Outputs
1. **VM Instance Lists** - Display available and user's VM instances
2. **Status Information** - Show real-time status of VM instances
3. **Request Lists** - Display pending, approved, and rejected requests
4. **Course Information** - Show available courses and their requirements
5. **Semester Information** - Display current and upcoming semesters
6. **Usage Reports** - Show resource utilization and usage statistics
7. **Notifications** - Display system alerts and status updates

## Data Flow
1. **User Input** → Users initiate actions through the web interface
2. **System Processing** → The platform processes requests through its microservices
3. **Data Storage** → Information is stored in PostgreSQL database
4. **VM Operations** → VM management is handled through Proxmox VE integration
5. **Output Display** → Results are displayed back to users through the web interface

## Technology Stack
- **Frontend**: Next.js with Material UI and Tailwind CSS
- **Backend**: Elysia.js API service
- **VM Management**: Proxmox VE integration
- **Database**: PostgreSQL with Prisma ORM
- **Message Queue**: RabbitMQ for asynchronous operations
- **Authentication**: BetterAuth for secure access control
