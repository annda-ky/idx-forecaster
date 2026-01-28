# IDX Forecaster - Raffles Heritage Edition 🏛️✨

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Active-success.svg)
![Theme](https://img.shields.io/badge/theme-Raffles%20Heritage-D4AF37.svg)

**IDX Forecaster** is a premium, institutional-grade stock analysis dashboard tailored for the Indonesian Stock Exchange (IDX).

Featuring the luxurious **"Raffles Heritage"** aesthetic, it combines deep financial data with high-end visual design, offering real-time technical analysis, AI-driven insights, and a comprehensive market screener.

![Dashboard Preview](http://localhost:3000/dashboard-preview.png)

## 🌟 Key Features

### 1. The "Raffles Heritage" Experience

- **Luxury UI**: A sophisticated blend of Deep Graphite, Warm Gold, and Creamy Ivory.
- **Typography**: Uses **Playfair Display** (Serif) for headings and **Poppins** (Sans) for modern readability.
- **Glassmorphism**: Premium frosted glass panels for a depth-rich interface.

### 2. Raffles Concierge (AI Advisor) 🎩

- **Personalized Insights**: An "AI Concierge" that interprets technical indicators (RSI, SMA, EMA) into natural language advice.
- **Real-time Analysis**: Powered by a Python backend that processes market data 24/7.
- **Narrative Logic**: Tells you _why_ to Buy or Sell (e.g., "Prime Accumulation Zone").

### 3. Professional Charting 🕯️

- **Interactive Candlestick Charts**: Full OHLC visualization using Recharts.
- **Technical Overlays**: SMA-20, EMA-20, and RSI-14 indicators overlaid on price action.
- **Crosshair Tooltips**: Precision data inspection.

### 4. Market Screener 📊

- **Coverage**: Supports **All IDX Stocks** (700+ Tickers).
- **Smart Filters**: Instantly find Top Gainers, Top Losers, and Most Active stocks.
- **Real-time Search**: Autocomplete search bar powered by Supabase.

---

## 🛠️ Technology Stack

### Frontend (User Interface)

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom CSS Variables
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

### Backend (Worker & AI)

- **Runtime**: Python 3.10+
- **Framework**: Flask (API) + APScheduler (Background Jobs)
- **Data Processing**: Pandas, NumPy, YFinance
- **AI Logic**: Rule-based Expert System (Technical Analysis Engine)

### Database & Infra

- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime Subscriptions

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- Supabase Project

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/idx-forecaster.git
cd idx-forecaster
```

### 2. Setup Database (Supabase)

1.  Create a project on Supabase.
2.  Run the migration files located in `supabase/migrations/` in your Supabase SQL Editor to create tables:
    - `company_profiles`
    - `stock_prices`
    - `predictions`
    - `stock_insights` (New!)

### 3. Configure Environment

Create a `.env` file in `apps/web` and `apps/worker`:

**apps/web/.env.local**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

**apps/worker/.env**

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PORT=8080
ENABLE_SCHEDULER=true
```

### 4. Run the Python Worker (Data Engine)

The worker fetches data and generates AI insights.

```bash
cd apps/worker
# Create virtual env
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run the worker
python app.py
```

_The scheduler will start ingesting data for all IDX stocks in the background._

### 5. Run the Frontend (Dashboard)

```bash
cd apps/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📅 Roadmap

- [x] **Phase 1**: Design System & Global Styles (Raffles Theme).
- [x] **Phase 2**: Core Components (Charts, Tables).
- [x] **Phase 3**: AI Features (Concierge, Sentiment Gauge).
- [x] **Phase 4**: Market Scaling (All IDX Stocks).
- [ ] **Phase 5**: Smart Limit Orders (Pending Implementation).
- [ ] **Phase 6**: Sultan's Vault Analytics.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
