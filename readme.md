# Cluster-Based Platform for Supporting Teaching and Academic Activities in the Department of Information Technology

## Table of Content
- Introduction
- The purpose of the Special Project
- Scope of the Special Project
- Tools
- Expected results

## Introduction
This project is a cluster-based platform designed to support teaching and academic activities in the Department of Information Technology. It aims to provide a robust infrastructure for managing virtual machines, facilitating educational activities, and enhancing the learning experience for students.

And this project is a part of the Special Project course in the 4th year of the Bachelor of Engineering program in Information and Network Engineering, Faculty of Industrial Technology and Management, King Mongkut's University of Technology North Bangkok (Prachinburi Campus).

## The purpose of the Special Project
- Design and develop Virtual Cluster Platform to support teaching and project work in the Department of Information Technology
- To develop a Role-Based Access Control (RBAC) web application considering ease of use, system stability and access security
- To improve the efficiency of using server resources available within the department through the development of a centralized cluster 

# Scope of the Special Project
- Server Management: The platform will manage virtual machines, allowing users to create, modify, and delete instances as needed.
- Web Application: A web application will be developed to provide a user-friendly interface for managing virtual machines and accessing educational resources.
- Reverse Proxy: The platform will include a reverse proxy to manage traffic and enhance security.
- Monitoring and Logging: The platform will implement monitoring and logging features to track system performance and user activities.
- Performance Testing: The platform will undergo performance testing to ensure it can handle the expected load and provide a smooth user experience.

## Tools
- Hypervisor: [Proxmox VE](https://www.proxmox.com/en/proxmox-ve)
- Backend: [Bun](https://bun.sh/) with [ElysiaJS](https://elysiajs.com/)
- Frontend: [React](https://reactjs.org/) with [Tailwind CSS](https://tailwindcss.com/) and [Material UI](https://mui.com/)
- Database: [PostgreSQL](https://www.postgresql.org/)
- Memory Cache: [Dragonfly](https://www.dragonflydb.io/)
- Message Broker: [RabbitMQ](https://www.rabbitmq.com/)
- Monitoring: [Prometheus](https://prometheus.io/), [InfluxDB](https://www.influxdata.com/) and [Grafana](https://grafana.com/)
- Tracing: [Jaeger](https://www.jaegertracing.io/)
- Logging: [Grafana Loki](https://grafana.com/oss/loki/)
- Containerization: [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- Version Control: [Git](https://git-scm.com/)
- Documentation: [Markdown](https://www.markdownguide.org/) and [LaTeX](https://www.latex-project.org/)
- Other Libraries: 
  - [Zod](https://zod.dev/) for schema validation
  - [Drizzle ORM](https://orm.drizzle.team/) for database interactions
  - [Axios](https://axios-http.com/) for HTTP requests
  - [BetterAuth](https://www.better-auth.com/) for authentication (in this case, Google OAuth2)

## Expected results
- A practical cluster platform system within the Department of Information Technology
- A Linux virtual machine system that can be created and managed quickly
- Make full use of the available servers in the department
- Obtain projects that can be applied in practice within the department
- Other projects that can be used practically in the department by being on the cluster platform
