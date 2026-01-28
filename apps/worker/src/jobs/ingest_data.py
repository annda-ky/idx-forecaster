import sys
import os
import yfinance as yf
import pandas as pd
import numpy as np

# Setup path agar bisa import dari src.db
sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))

from src.db.client import supabase

def calculate_indicators(df):
    # 1. Hitung SMA 20
    df['sma_20'] = df['Close'].rolling(window=20).mean()
    
    # 2. Hitung EMA 20
    df['ema_20'] = df['Close'].ewm(span=20, adjust=False).mean()
    
    # 3. Hitung RSI 14
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    
    rs = gain / loss
    df['rsi_14'] = 100 - (100 / (1 + rs))
    
    df = df.fillna(0)
    return df

def ingest_company_profile(symbol: str, ticker_obj):
    print(f"ℹ️  Fetching profile for {symbol}...")
    try:
        info = ticker_obj.info
        
        # Mapping data dari yfinance ke tabel kita
        profile_data = {
            "symbol": symbol,
            "company_name": info.get('longName', symbol),
            "sector": info.get('sector', 'Unknown'),
            "industry": info.get('industry', 'Unknown'),
            "description": info.get('longBusinessSummary', 'No description available.'),
            "market_cap": info.get('marketCap', 0),
            "pe_ratio": info.get('trailingPE', 0),
            "dividend_yield": info.get('dividendYield', 0)
        }

        # Upsert ke Supabase
        supabase.table("company_profiles").upsert(profile_data).execute()
        print(f"✅ Profile updated for {symbol}")
        
    except Exception as e:
        print(f"⚠️ Failed to update profile for {symbol}: {e}")

def ingest_stock_data(symbol: str):
    print(f"📥 Fetching data for {symbol}...")
    
    ticker = yf.Ticker(symbol)
    
    # 1. Ingest Profil Perusahaan (Sekalian)
    ingest_company_profile(symbol, ticker)

    # 2. Ingest Harga Historis
    hist = ticker.history(period="2y")
    
    if hist.empty:
        print(f"❌ No data found for {symbol}")
        return

    hist = calculate_indicators(hist)

    records = []
    for date, row in hist.iterrows():
        records.append({
            "symbol": symbol,
            "date": date.strftime('%Y-%m-%d'),
            "open": row['Open'],
            "high": row['High'],
            "low": row['Low'],
            "close": row['Close'],
            "volume": int(row['Volume']),
            "sma_20": row['sma_20'] if row['sma_20'] != 0 else None,
            "ema_20": row['ema_20'] if row['ema_20'] != 0 else None,
            "rsi_14": row['rsi_14'] if row['rsi_14'] != 0 else None
        })

    batch_size = 1000
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        try:
            supabase.table("stock_prices").upsert(batch, on_conflict="symbol, date").execute()
            print(f"✅ Upserted batch {i//batch_size + 1} for {symbol}")
        except Exception as e:
            print(f"⚠️ Error upserting prices: {e}")

