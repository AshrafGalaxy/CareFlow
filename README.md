<p align="center">
  <img src="assets/logo.svg" alt="CareFlow Logo" width="180">
</p>

<h1 align="center">CareFlow</h1>

<p align="center">
  <strong>Your Intelligent, Real-Time AI Health Companion</strong><br>
  <em>Built to revolutionize personal health management through AI-driven insights.</em>
</p>

<p align="center">
  <a href="https://github.com/AshrafGalaxy/CareFlow/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  </a>
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Frontend-Next.js_14-black?logo=next.js" alt="Next.js">
  </a>
  <a href="https://fastapi.tiangolo.com/">
    <img src="https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi" alt="FastAPI">
  </a>
  <a href="https://python.org/">
    <img src="https://img.shields.io/badge/AI-Python_3.12-3776AB?logo=python" alt="Python">
  </a>
  <img src="https://img.shields.io/badge/Status-Hackathon_Ready-success.svg" alt="Status">
</p>

---

## 🚀 The Vision

**CareFlow** is a modern, privacy-focused health management platform designed for the future. Built from the ground up for our hackathon presentation, CareFlow centralizes your medical timeline, analyzes complex medical reports using AI OCR, tracks medication adherence in real-time, and provides an active AI companion (CareBot) to answer your health queries based *strictly* on your actual medical history.

### 🔴 The Problem
Modern healthcare data is heavily fragmented. Patients struggle to understand complex medical terminology in their lab reports, frequently miss critical medication doses, and lack a centralized timeline of their own health history. This leads to anxiety, poor adherence, and a disconnect between doctor visits.

### 🟢 The CareFlow Solution
CareFlow bridges the gap between clinical data and patient comprehension. By leveraging Large Language Models (LLMs) and advanced OCR, we translate raw medical data into actionable, easy-to-understand insights—all accessible via an interactive, gamified dashboard.

---

## 📸 Sneak Peek
> *(Tip for hackathon: Insert a GIF or screenshot of your dashboard here!)*
<p align="center">
  <img src="https://via.placeholder.com/800x400.png?text=CareFlow+Dashboard+Preview" alt="CareFlow Dashboard Preview" width="100%">
</p>

---

## ✨ Key Innovations

- 🤖 **Interactive AI CareBot:** A vectorized, physics-based companion that lives natively on your dashboard. It doesn't just chat; it holds context of your entire medical timeline, providing instant, personalized health insights.
- 📄 **Smart Report Analyzer:** Upload PDFs or images of blood tests or medical reports. The built-in Vision OCR and LLM pipeline automatically extracts key metrics, flags abnormal values, and suggests critical follow-up questions for your next doctor's appointment.
- ⏱️ **Unified Health Timeline:** A chronologically generated, highly interactive visualization of your past appointments, uploaded reports, and medication histories. Never lose track of a diagnosis again.
- 💊 **Medication Adherence Tracking:** Real-time charting to track daily pill intake alongside visual indicators and alert systems for missed doses.
- 🔒 **Zero-Trust Security Layer:** Health data requires the utmost privacy. We built a fully fledged JWT authentication and Role-Based Access Control (RBAC) system to protect highly sensitive records.

---

## 🏗️ Technical Architecture

CareFlow uses a decoupled, highly scalable microservice architecture. It combines a lightning-fast Edge-rendered frontend with a heavy-lifting Python AI backend.

```mermaid
graph TD
    %% Frontend Layer
    subgraph Frontend [Next.js Client]
        UI[Shadcn UI + Tailwind]
        Zustand[Zustand State Store]
        UI <--> Zustand
    end

    %% Backend Layer
    subgraph Backend [FastAPI Server]
        API[Router Endpoints]
        Auth[JWT + RBAC Middleware]
        Services[Core Services]
        
        API --> Auth
        Auth --> Services
    end

    %% AI Layer
    subgraph AI_Engine [AI & Document Engine]
        OCR[Vision OCR Extraction]
        LLM[LangChain / LLM Chat]
        Vector[FAISS Vector Store]
        
        OCR --> LLM
        LLM <--> Vector
    end

    %% Data Layer
    subgraph Database [PostgreSQL]
        Models[SQLAlchemy Models]
        Schema[(CareFlow DB)]
        
        Models --> Schema
    end

    %% Connections
    Zustand <--> |REST API Calls| API
    Services <--> AI_Engine
    Services <--> Models
```

---

## 💻 Tech Stack

| Category | Technologies Used |
| :--- | :--- |
| **Frontend UI/UX** | Next.js 14, React, Tailwind CSS, Shadcn UI, Framer Motion |
| **State Management**| Zustand, React Query |
| **Backend API** | Python 3.12, FastAPI, Pydantic |
| **AI & NLP** | LangChain, FAISS Vector Store, Multi-modal OCR |
| **Database & ORM** | PostgreSQL (Dockerized), SQLite, SQLAlchemy, Alembic |

---

## 🛠️ Getting Started (Local Development)

Want to run CareFlow locally? Follow these steps to get the microservices up and running.

### Prerequisites
- Node.js >= 18.x
- Python >= 3.10
- Docker Desktop (for Postgres)

### 1. Clone the Repository
```bash
git clone https://github.com/AshrafGalaxy/CareFlow.git
cd CareFlow
```

### 2. Backend Setup
```bash
# Set up the python virtual environment
python -m venv venv
source venv/Scripts/activate # On Windows

# Install requirements
cd backend
pip install -r requirements.txt

# Start the FastAPI Server (runs on http://localhost:8000)
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
# Install dependencies
cd frontend
npm install

# Start the Next.js development server (runs on http://localhost:3000)
npm run dev
```

### 4. Dockerized Database (Optional)
If you wish to run the full stack with a production-grade PostgreSQL instance locally:
```bash
docker-compose up -d
```

---

## 👥 Meet the Team

Built with ❤️ by passionate developers aiming to revolutionize digital health

<a href="https://github.com/AshrafGalaxy/CareFlow/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=AshrafGalaxy/CareFlow" alt="Contributors list"/>
</a>

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
