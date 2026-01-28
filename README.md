# IDX Forecaster - Raffles Heritage Edition 🏛️✨

<div align="center">

![License](https://img.shields.io/badge/LICENSE-MIT-D4AF37?style=for-the-badge&logo=opensourceinitiative&logoColor=white)
![Version](https://img.shields.io/badge/VERSION-2.0.0-black?style=for-the-badge)
![Status](https://img.shields.io/badge/STATUS-ACTIVE-success?style=for-the-badge)
![Theme](https://img.shields.io/badge/THEME-RAFFLES_HERITAGE-1A1D23?style=for-the-badge&color=D4AF37)

**Institutional-Grade Stock Analysis & Forecasting Dashboard**

[View Demo](http://localhost:3000) • [Report Bug](https://github.com/yourusername/idx-forecaster/issues) • [Request Feature](https://github.com/yourusername/idx-forecaster/issues)

</div>

---

## 🦅 Overview

**IDX Forecaster** is a premium stock analysis platform tailored for the Indonesian Stock Exchange (IDX). Featuring the luxurious **"Raffles Heritage"** aesthetic, it combines deep financial data with high-end visual design.

It goes beyond simple charting by providing **AI-Driven Insights** ("Raffles Concierge"), real-time market screening, and institutional-grade forecasting models.

![Dashboard Preview](http://localhost:3000/dashboard-preview.png)

## 💻 Tech Stack

### Frontend Core

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Backend & AI Engine

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/scikit_learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)

### Infrastructure & Database

![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## 🌟 Key Features

| Feature                    | Description                                                                                                |
| :------------------------- | :--------------------------------------------------------------------------------------------------------- |
| **🏛️ Raffles Heritage UI** | A sophisticated blend of Deep Graphite, Warm Gold, and Creamy Ivory using **Playfair Display**.            |
| **🎩 Raffles Concierge**   | **AI-powered assistant** that translates technical indicators (RSI, SMA) into actionable narrative advice. |
| **🕯️ Pro Charting**        | Interactive **OHLC Candlestick charts** with technical overlays and precision tooltips.                    |
| **📊 Market Screener**     | Real-time screener for **700+ IDX Stocks** with "Top Gainers" and "Most Active" filters.                   |
| **⚡ Real-time Data**      | Background Python workers fetch and process market data 24/7 using robust scheduling.                      |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- **Supabase** Project

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/idx-forecaster.git
cd idx-forecaster
```

### 2. Frontend Setup

```bash
cd apps/web
npm install
# Create .env.local with Supabase credentials
npm run dev
```

### 3. Worker Setup (AI Engine)

```bash
cd apps/worker
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

---

## 🤝 Roadmap

- [x] **Raffles Heritage Theme** (Gold/Black Luxury UI)
- [x] **Information Architecture** (Leaderboard, Portfolio, Panels)
- [x] **AI Concierge** (Natural Language Insights)
- [x] **Market Wide Scaling** (All IDX Tickers)
- [ ] **Smart Limit Orders** (Automated Buying)
- [ ] **Sultan's Vault** (Wealth Analytics)

---

<div align="center">

**Built with ❤️ for Indonesian Traders**

</div>
