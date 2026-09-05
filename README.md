# ResumeRanker Pro (.NET C# + React + MySQL)

AI-Powered Resume Screening and Candidate Ranking System built with **React 18**, **ASP.NET Core Web API (C#)**, **Google Gemini 2.0 Flash AI**, and **MySQL** on **Aiven Cloud**.

---

## 📁 Project Architecture

```
dotnet-project/
├── frontend/             # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/              # Pages, Components, Services, Types
│   ├── package.json
│   └── vite.config.ts
│
└── backend/              # C# ASP.NET Core Web API (net9.0)
    ├── Controllers/      # REST API Controllers (Auth, Analysis, Admin, KeyPool, etc.)
    ├── Data/             # EF Core DbContext (Pomelo.EntityFrameworkCore.MySql)
    ├── Models/           # Database Entities (User, Candidate, Job, Session, ApiKey)
    ├── Services/         # GeminiAiService, KeyPoolManager, DocumentParserService
    ├── Dockerfile        # Container image for cloud deployment (Render/Koyeb)
    └── Program.cs
```

---

## 🚀 Getting Started

### 1. Run the .NET C# Backend:
```bash
cd backend
dotnet run
```
*Listens on `http://localhost:5000` and connects to Aiven Cloud MySQL.*

### 2. Run the React Frontend:
```bash
cd frontend
npm install
npm run dev
```
*Opens on `http://localhost:5173`.*

---

## ☁️ Deployment

- **Database:** Hosted on **Aiven Cloud MySQL 8.4**
- **Backend:** Ready for deployment to **Render** or **Koyeb** via the provided `Dockerfile`.
- **Frontend:** Ready for deployment to **Vercel** or **Netlify** (Root directory: `frontend`).
