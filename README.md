# FinStock

AI-powered **Indian stock research platform** built with **Next.js 14, FastAPI, PostgreSQL, Redis, and Gemini AI**.

This platform provides intelligent stock analysis, AI-generated research reports, and financial insights for Indian markets.

---

# Architecture

Monorepo structure:

```
/frontend        → Next.js 14 (App Router UI)
/backend         → FastAPI API server
/ai-engine       → Gemini AI prompt orchestration
/data-pipeline   → Data ingestion and scraping scripts
```

---

# Implemented MVP Features

### Stock Research

* Global **stock search**
* **SSR stock detail pages** (`/stocks/[symbol]`)
* **Interactive price charts** (1D / 1W / 1M / 1Y / 5Y)
* **Key metrics cards** with formula explanations
* **Financial statements**

  * Income Statement
  * Balance Sheet
  * Cash Flow

### AI Analysis

* **AI Chat Assistant** (floating orange button)
* **AI-generated research reports**
* **Smart Score (0-5)** stock rating
* **Risk Score** using weighted factor models

### Financial Data

* **Shareholding pie chart**
* **Competitor comparison table**
* **Corporate actions**
* **Insider trades**
* **Bulk / block deals**
* **Documents section**
* **News sentiment feed**

### Investment Tools

* **Returns calculator**
* **Projection chart**

### Performance

* **Redis caching** for dashboard responses

---

# Scoring Engine

The Smart Score and Risk Score use a **normalized factor pipeline** including:

* Profitability
* Growth
* Valuation
* Momentum
* Financial Health

The system applies a **bounded walk-forward ML adjustment** to improve scoring reliability.

---

# Quick Start (Docker)

### 1. Copy environment templates

```
backend/.env.example   → backend/.env
frontend/.env.example  → frontend/.env.local
```

### 2. Start infrastructure and applications

```
docker compose up --build
```

### 3. Open in browser

Frontend

```
http://localhost:3000
```

Backend API Docs

```
http://localhost:8000/docs
```

---

# Running Locally (Without Docker)

## Backend

```
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
```

Run server:

```
uvicorn app.main:app --reload
```

---

## Frontend

```
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

# Data Pipeline

Starter database schema:

```
data-pipeline/sql/schema.sql
```

Market data ingestion:

```
data-pipeline/scripts/fetch_market_data.py
```

NSE/BSE scraping:

```
data-pipeline/scripts/scrape_nse_bse.py
```

Google News market scraping:

```
data-pipeline/scripts/scrape_google_market_news.py
```

Scoring engine validation:

```
data-pipeline/scripts/validate_scoring_engine.py
```

---

# Groww API Integration

Groww integration uses the official **growwapi Python SDK**.

Configure authentication in backend `.env` using **one** of the following modes:

### Access Token

```
GROWW_AUTH_MODE=access_token
GROWW_ACCESS_TOKEN=your_token
```

### API Key + Secret

```
GROWW_AUTH_MODE=api_secret
GROWW_API_KEY=your_key
GROWW_API_SECRET=your_secret
```

### TOTP Authentication

```
GROWW_AUTH_MODE=totp
GROWW_TOTP_TOKEN=your_token
GROWW_TOTP_SECRET=your_secret
```

---

# Notes

* External providers include **graceful fallback demo data** for MVP reliability.
* **Redis** is used for response caching.
* **Stock pages are server-side rendered (SSR)** using Next.js.
* Designed for **scalability and modular AI integration**.

---

# Tech Stack

**Frontend**

* Next.js 14
* TypeScript
* TailwindCSS
* Recharts

**Backend**

* FastAPI
* PostgreSQL
* Redis

**AI**

* Gemini-API

**Infrastructure**

* Docker
* Docker Compose

---

# Project Status

Current stage: **MVP**

Future improvements planned:

* Portfolio tracking
* Backtesting engine
* Options analytics
* Advanced ML scoring
* Real-time market streaming
