<h1 align="center">Hunter AI</h1>

<p align="center">
  <strong>An AI-powered career intelligence platform that transforms resumes into living skill profiles, provides granular ATS analysis, and streamlines the application workflow.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-v0.1.0-blue.svg?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/build-passing-brightgreen.svg?style=flat-square" alt="Build" />
  <img src="https://img.shields.io/badge/status-active_development-success.svg?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/React-19-61dafb.svg?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/FastAPI-0.136-009688.svg?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
</p>

Hunter AI solves the two biggest bottlenecks in the modern job search: the excessive time it takes to manually tailor resumes for individual job applications, and the noise of standard job portals where irrelevant listings bury the right opportunities. By combining a high-performance React frontend with an AI-driven FastAPI backend, Hunter AI acts as your personal, automated career agent.

---

## Table of Contents

- [Core Features](#core-features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Deployment](#deployment)
- [Design System](#design-system)

---

## Core Features

### 1. Dynamic Preference Filtering (The Likability Slider)
Say goodbye to rigid dropdown filters. Input your preferences in natural language (e.g., remote status, location, specific skills, salary range).
- **Priority Stack:** Your preferences are ranked by importance.
- **The Slider:** A dynamic UI slider filters jobs in real-time. As you decrease the slider, lower-priority constraints are dropped off, ensuring your absolute must-haves remain active while broadening the search net.

### 2. ATS Score Breakdown & Visualization
When clicking on a job card, you get a detailed, visual breakdown of your ATS (Applicant Tracking System) score:
- **Match Indicator:** A dynamic percentage ring indicating overall match strength.
- **Keyword & Skill Analysis:** Highlights matching skills in green and missing skills in grey, with an expanding dropdown for exact job description keyword matches.
- **Semantic Experience Check:** AI evaluates your past roles and responsibilities against the job description to calculate true relevance, rather than just keyword stuffing.
- **Deficit Analytics:** A bar chart showing exactly where points were lost (Education, Formatting, Experience) out of the total 100%.

### 3. AI LaTeX Tailoring Workspace (Split-Pane Editor)
A Claude-style workspace dedicated to live resume generation:
- **Chat Interface:** A built-in chat UI where you can prompt the AI to make specific edits (e.g., *"Highlight my machine learning experience for this role"*).
- **Smart Patching:** The AI doesn't rewrite the whole document; it patches specific LaTeX blocks back into the source, drastically speeding up rendering time.
- **Live PDF Preview:** See your newly tailored PDF rendered instantly on the right side of the screen. 
- **Auto-Cleaning Storage:** Automatically manages your tailored resumes, keeping only the most recent generations to prevent download folder clutter.

### 4. Smart Application Tracker
- **Duplicate Guard:** Generates unique cryptographic keys based on internship/job metadata to ensure you never see a job you've already applied to.
- **Automated Logging:** Downloading a tailored PDF or flagging a card automatically syncs the job to your SQLite/Postgres database.

---

## Architecture & Tech Stack

Hunter AI is built using a modern, decoupled architecture designed for speed, type safety, and seamless AI integration.

### Frontend
| Layer | Technology |
|-------|------------|
| **Framework** | React 19 |
| **Language** | TypeScript |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS v4 (with custom design tokens) |
| **Animation** | GSAP 3 + ScrollTrigger |

### Backend & AI
| Layer | Technology |
|-------|------------|
| **Framework** | FastAPI |
| **Language** | Python 3.11+ |
| **AI Orchestration** | LangChain Core & Community |
| **LLM Providers** | Google GenAI, Groq |
| **Database** | SQLAlchemy (PostgreSQL / SQLite) |
| **Document Processing**| PyMuPDF |

---

## Project Structure

```text
hunter-ai/
├── backend/                  # FastAPI Application
│   ├── routes/               # API Endpoints (e.g., matches_router.py)
│   ├── models/               # SQLAlchemy Database Models
│   ├── services/             # AI & LLM business logic
│   └── pyproject.toml        # Python dependencies (uv/pip)
│
├── frontend/                 # React UI Application
│   ├── app/                  # Application routing and global CSS
│   ├── components/           # Reusable UI components (e.g., AppShell.tsx)
│   ├── lib/                  # Utilities and Supabase clients
│   ├── package.json          # Node dependencies
│   └── vite.config.ts        # Vite configuration
│
└── assets/                   # Static assets & dummy PDFs
