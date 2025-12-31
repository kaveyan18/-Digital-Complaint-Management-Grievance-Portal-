# 🏙️ ResolveDesk - Next-Gen Digital Complaint Management Portal

> **A premium, automated, and intelligent grievance redressal system for modern residential communities.**

![Status](https://img.shields.io/badge/Status-Completed-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Stack](https://img.shields.io/badge/Stack-MEAN-green)
![License](https://img.shields.io/badge/License-MIT-orange)

## 📖 Overview

**ResolveDesk** is a state-of-the-art Web Application designed to streamline the process of logging, tracking, and resolving complaints within residential or educational campuses. It replaces archaic manual entries with a dynamic, translucent, and animated digital interface.

Built with performance and aesthetics in mind, it features a glassmorphism-inspired UI, real-time status updates, intelligent automated assignments, and comprehensive audit trails.

---

## ✨ Key Features

### 👤 For Residents / Students
-   **Dashboard**: View complaint status summary (Pending, In Progress, Resolved) at a glance.
-   **File Storage**: Securely upload images/documents as proof for complaints.
-   **Real-time Tracking**: Monitor the entire lifecycle of a grievance.
-   **Profile Management**: Manage personal details and change passwords securely.

### 🛠️ For Staff / Technicians
-   **Work Queue**: View assigned complaints in a centralized dashboard.
-   **Proof of Work**: Upload resolution images before closing a ticket.
-   **SLA Indicators**: Visual cues for complaints nearing their Service Level Agreement deadline.

### 👮 For Administrators
-   **Analytics Dashboard**: Visual charts (Bar/Pie) for complaint statistics and staff performance.
-   **Automated Assignment**: Intelligent routing of complaints based on category (e.g., Electrical -> Electrician) and staff load.
-   **Audit Trail**: Complete history of who did what and when for every complaint.
-   **User Management**: Manage residents, staff, and admin accounts.

---

## 🏗️ Technical Architecture

### Frontend (Client-Side)
-   **Framework**: [Angular 18](https://angular.io/) (Latest)
-   **Styling**: Custom CSS3, Glassmorphism, CSS Variables, Responsive Flex/Grid Layouts.
-   **Components**: Modular architecture with reusable components.
-   **State Management**: RxJS Observables & BehaviorSubjects.
-   **Security**: HTTP Interceptors for JWT implementation.

### Backend (Server-Side)
-   **Runtime**: [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/).
-   **Language**: TypeScript for type safety and scalability.
-   **Authentication**: JSON Web Tokens (JWT) with bcrypt encryption.
-   **File Handling**: Multer for efficient file uploads to local storage.
-   **Scheduler**: Node-cron for background SLA monitoring tasks.

### Database
-   **System**: [MySQL](https://www.mysql.com/) (Relational Database).
-   **ORM/Driver**: mysql2 with raw SQL queries for optimized performance.
-   **Schema**: Normalized tables for Users, Complaints, Assignments, Logs, and Settings.

---

## 🚀 Getting Started

### Prerequisites
-   **Node.js**: v18.x or higher.
-   **MySQL**: v8.0 or higher (Ensure the service is running).
-   **Git**: For version control.

### 📥 One-Click Installation (Windows)

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-repo/resolve-desk.git
    cd resolve-desk
    ```
2.  **Run Setup Script**
    Double-click `setup.bat`. This will:
    -   Install all backend dependencies.
    -   Install all frontend dependencies.
    -   Generate environment configuration files.

3.  **Database Setup**
    -   Open your MySQL Client (Workbench/HeidiSQL).
    -   Execute the script at `database/schema.sql`.
    -   Update `backend/.env` with your DB Password.

4.  **Launch**
    Double-click `run.bat` to start the ecosystem.

---

## 🧪 Testing

We use **Jest** for the backend and **Karma/Jasmine** for the frontend.

### Running Backend Tests
```bash
cd backend
npm test
```

### Running Frontend Tests
```bash
cd frontend
npm test
```

---

## 📂 Project Structure

```
matrimony/Cap/
├── backend/                # Express API
│   ├── src/
│   │   ├── config/         # DB & Env Config
│   │   ├── controllers/    # Request Handlers
│   │   ├── middleware/     # Auth & Error Middleware
│   │   ├── models/         # Interfaces
│   │   ├── routes/         # API Endpoints
│   │   ├── scripts/        # Utility Scripts (Audit/SLA)
│   │   ├── services/       # Business Logic
│   │   └── utils/          # Helpers (ID Gen, etc.)
│   └── uploads/            # User uploaded content
├── frontend/               # Angular App
│   ├── src/app/
│   │   ├── components/     # UI Pages (Login, Dashboard, etc.)
│   │   ├── guards/         # Route Protection
│   │   ├── interceptors/   # Token injection
│   │   ├── models/         # TS Interfaces
│   │   └── services/       # API Integration
├── database/               # SQL Schemas
├── docs/                   # Project Documentation
├── run.bat                 # Quick Start Script
└── setup.bat               # Dependency Installer
```

---

## 🔧 API Documentation (Snapshot)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/users/login` | Authenticate user & get Token | ❌ |
| `POST` | `/api/users/register` | Register new resident | ❌ |
| `GET` | `/api/complaints` | Fetch all complaints (filtered by role) | ✅ |
| `POST` | `/api/complaints` | Log a new grievance | ✅ |
| `PUT` | `/api/complaints/:id` | Update status/assign staff | ✅ |
| `GET` | `/api/complaints/stats` | Get analytics data | ✅ |

---

## 🛡️ Security Features
-   **Password Hashing**: Bcrypt for secure password storage.
-   **JWT Auth**: Stateless authentication mechanism.
-   **Role-Based Access Control (RBAC)**: Middleware to restrict creating/viewing admin resources.
-   **Input Validation**: Strict typing and sanitization.

---

## 📞 Contact
**Team ResolveDesk**  
-*Lead Developer*: Kaveyan S
-*Team member*:Rajakarthikeyan V
Muvvala Saiteja
Narra Venkatesh.
-*Email*: dev@resolvedesk.com

---
*Built with ❤️ for the Final Capstone Project 2025.*
