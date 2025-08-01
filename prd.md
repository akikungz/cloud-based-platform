# Product Requirements Document (PRD) for Cluster-Based Platform for Supporting Teaching and Academic Activities in the Department of Information Technology

## 1. Executive Summary

This document defines the requirements for building a **Cluster-Based Platform** designed to support teaching and academic projects in the Department of Information Technology. The platform will virtualize Linux environments and provide a web-based interface for students and faculty to manage virtual machines (VMs), enabling a more efficient, scalable, and self-service learning environment.

## 2. Objectives and Goals

- Simplify access to Linux environments required in IT-related coursework.
- Enable self-service VM provisioning for students and faculty.
- Support multi-user access in a scalable cluster infrastructure.
- Provide resource efficiency and reuse of internal server infrastructure.
- Ensure security, monitoring, and data availability.

## 3. Stakeholders

- **Students**: Primary users requiring virtual machines for coursework and projects.
- **Faculty & Advisors**: Manage student VM requests and use VMs for teaching or research.
- **System Administrators**: Maintain platform infrastructure, oversee performance.
- **Academic Management**: Oversee platform utilization, performance, and ROI.

## 4. User Roles & Personas

### Student
- Authenticate via Google (@email.kmutnb.ac.th)
- Request VM instance
- Manage VM state and request extension semesterly

### Faculty/Administrator
- Authenticate via Google (@itm.kmutnb.ac.th)
- Approve/reject VM requests and Extension semesterly requests
- Manage faculty and student instances
- Monitor system usage
- Access cloud storage for academic files

## 5. Functional Requirements

### 5.1 Core Features – Semester 1

#### Virtual Cluster Management
- Deploy Linux VMs using Proxmox API
- Create, modify, delete, and manage VM lifecycle

#### Web Application
- Role-based access (Student, Faculty)
- Google OAuth integration with domain verification
- VM request form (student)
- Request lifecycle management (faculty)
- Instance control panel (start/stop/reset/delete)
- VM renewal request system

### 5.2 Core Features – Semester 2

#### Advanced Infrastructure
- Reverse proxy for external VM access
- Cloud Storage (MinIO-based) integration
- Monitoring system with dashboard (Prometheus, Grafana, Loki, Jaeger)
- Port Forwarding configuration UI
- API access control for Cloud and Proxy modules

#### Performance Evaluation
- Provisioning time metrics (mean, median)
- Concurrent user performance (response time, error rate)

## 6. Non-Functional Requirements

- **Availability**: 24/7 operation with minimal downtime
- **Scalability**: Support at least 100 concurrent VMs
- **Security**: Role-based access control, HTTPS, email domain validation
- **Performance**: VM provisioning < 2 minutes; response time < 300ms under load
- **Maintainability**: Containerized services with Git versioning

## 7. System Architecture Overview

- **Hypervisor Layer**: Proxmox VE for VM management
- **Orchestration Layer**: Container-based microservices (K8s optional)
- **Application Layer**:
  - Backend: ElysiaJS, Bun, PostgreSQL
  - Frontend: ReactJS, TailwindCSS
- **Monitoring Layer**: Prometheus, Grafana, Jaeger, Loki
- **Storage Layer**: MinIO for academic data
- **Security Layer**: Nginx reverse proxy, Google OAuth, SSL/TLS

## 8. Data Flow and Integration

- **Authentication** via Google OAuth
- **VM Provisioning** via API (Proxmox + Cloud-Init)
- **Cloud Storage** access controlled per role
- **Monitoring** data pushed to dashboards
- **Reverse Proxy** routes public access to private VMs

## 9. UI/UX Expectations

- Clean, responsive, and intuitive design (reference: Figma mockups)
- **Students**:
  - Dashboard for active VMs
  - Simple request form
  - Port forwarding selector
- **Faculty**:
  - Dashboard for student VM overview
  - Approvals/denials
  - Cloud storage manager

## 10. Milestones & Timeline

| Phase             | Activities                                               | Timeline    |
|-------------------|----------------------------------------------------------|-------------|
| Semester 1/2568   | System design, hypervisor setup, VM API, base web app    | Jul–Oct     |
| Semester 2/2568   | Proxy, monitoring, storage, final integration            | Dec–Mar     |

## 11. KPIs & Success Metrics

- Average VM provisioning time ≤ 5 minutes
- Uptime ≥ 90% (Because campus electrical not reliable and many times the power is cut off)
- Response time under 300ms (under 100 concurrent users)
- Error rate < 2% under load
- 90%+ user satisfaction in surveys

## 12. Appendix: Tech Stack Summary

### Hardware
- 1 personal laptop (development)
- 10 department-owned servers

### Software Stack
- **Hypervisor**: Proxmox VE
- **Backend**: Bun + ElysiaJS, PostgreSQL, Dragonfly
- **Frontend**: ReactJS, Tailwind CSS
- **Monitoring**: Grafana, Prometheus, Loki, Jaeger, InfluxDB
- **Storage**: MinIO
- **Others**: Docker, GitHub, Nginx, SSL/TLS
