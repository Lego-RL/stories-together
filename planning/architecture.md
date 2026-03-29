# Stories Together: System Architecture

This document outlines the technical foundation for **Stories Together**, a collaborative storytelling platform designed for scalability, real-time interaction, and cross-platform compatibility.

---

## 1. Tech Stack Overview

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 15+ (React)** | Core web application framework |
| **Styling** | **Tailwind CSS** | Responsive, utility-first UI design |
| **API Backend** | **FastAPI (Python 3.12+)** | High-performance asynchronous REST API |
| **Database** | **PostgreSQL** | Relational storage for users, stories, and passages |
| **Caching/Real-time**| **Redis** | Passage locking and WebSocket message brokering |
| **Authentication** | **FastAPI-Users (JWT)** | Secure user sessions and cross-platform tokens |
| **Deployment** | **Vercel / Render** | Edge-hosting (Frontend) and Cloud-hosting (Backend) |

---


