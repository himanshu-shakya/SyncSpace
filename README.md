# 🚀 SyncSpace — Collaborative Knowledge Management & Real-Time Markdown Editor

A full-stack, enterprise-grade collaborative Markdown documentation and knowledge-base platform built with **Spring Boot 3** and **Next.js 14**. Designed for engineering teams, university researchers, and students to create, organize, and edit technical notes with live split-screen preview and real-time STOMP WebSockets synchronization.

---

## 📸 Key Features
- ⚡ **Spring Boot 3 Backend:** Monolithic REST API with Spring Data JPA, Hibernate ORM, and Spring Security.
- 🔐 **JWT & BCrypt Authentication:** Stateless authentication with cryptographic HS384 signatures and salted password hashing.
- 👥 **Workspaces & Fine-Grained RBAC:** Organize documents into custom workspaces; share documents with `OWNER`, `EDITOR`, or `VIEWER` permissions.
- 📝 **Live Markdown Split-Pane Editor:** Real-time synchronized split-screen editing with GFM (GitHub Flavored Markdown), syntax highlighting, word count, debounced auto-save (2s), and manual save (`Ctrl+S`).
- 🔄 **Real-Time Collaboration:** STOMP protocol over WebSockets (`/ws`, `/topic/document/{id}`) providing live peer-editing indicators.
- 🖼️ **Media & Attachment Uploads:** Secure multipart file uploads with MIME validation, 5MB file caps, path-traversal prevention, and static image serving.
- 🌐 **OAuth2 Delegation Flow:** Extensible social login structure supporting Google/GitHub profiles.
- 💾 **Zero-Setup File Database:** File-backed persistent database (`./data/syncspace_db`) ensures complete data persistence without external database installations.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Backend** | Java 17/21, Spring Boot 3.3.4, Spring Security 6, Spring Data JPA, Hibernate, Spring WebSocket (STOMP) |
| **Database** | Persistent File-Backed H2 (Production-ready switch to PostgreSQL available via `application.yml`) |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, TanStack React Query, Axios, Lucide React, React Markdown |
| **Security** | JSON Web Tokens (JJWT 0.12.6), BCrypt Password Encoder, CORS Middleware |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Java:** JDK 17 or higher (`java -version`)
- **Maven:** 3.8+ (`mvn -version`)
- **Node.js:** v18+ & npm (`node -version`, `npm -version`)

---

### 1. Start Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
*Backend runs at:* `http://localhost:8080`  
*Health Check:* `http://localhost:8080/api/health`

---

### 2. Start Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
*Frontend opens at:* `http://localhost:3000`

---

## 🔑 Default Demo Account (Pre-Seeded)
The system automatically initializes a default student account and sample documentation on first boot:
- **Email:** `student@college.edu`
- **Password:** `password123`

---

## 🧪 Automated End-to-End Test Suite
Run the automated 13-stage verification script to test authentication, document CRUD, workspaces, sharing RBAC, media uploads, and cleanup:
```bash
chmod +x scripts/verify_e2e.sh
./scripts/verify_e2e.sh
```

---

## 📚 Viva Defense & Documentation
- Detailed Technical Viva Q&A Guide: [VIVA_GUIDE.md](file:///Users/sagar/Downloads/project/SyncSpace/VIVA_GUIDE.md)
- Complete System Architecture Document: [ARCHITECTURE.md](file:///Users/sagar/Downloads/project/SyncSpace/ARCHITECTURE.md)

