import pandas as pd
from datetime import datetime, timedelta
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from src.db.client import supabase
from src.core.forecaster import generate_forecast

def run_forecast(ticker_symbol):
    print(f"Forecasting: {ticker_symbol}")
    
    response = supabase.table("stock_prices") \
        .select("date, close") \
        .eq("symbol", ticker_symbol) \
        .order("date") \
        .execute()
    
    data = response.data
    if not data:
        print(f"No data for {ticker_symbol}")
        return

    df = pd.DataFrame(data)
    df['close'] = pd.to_numeric(df['close'])
    
    forecast_values = generate_forecast(df['close'])
    
    if not forecast_values:
        print("Not enough data to forecast")
        return

    last_date_str = df.iloc[-1]['date']
    last_date = datetime.strptime(last_date_str, '%Y-%m-%d')
    
    predictions = []
    for i, price in enumerate(forecast_values):
        next_date = last_date + timedelta(days=i+1)
        
        while next_date.weekday() >= 5:
            next_date += timedelta(days=1)

        predictions.append({
            "symbol": ticker_symbol,
            "forecast_date": next_date.strftime('%Y-%m-%d'),
            "predicted_price": round(price, 2),
            "model_version": "v1-holt-linear"
        })
        
        last_date = next_date

    try:
        supabase.table("predictions").upsert(predictions).execute()
        print(f"Saved {len(predictions)} predictions for {ticker_symbol}")
    except Exception as e:
        print(f"Error saving predictions: {e}")

    # --- Raffles Concierge (AI Advisor) ---
    try:
        from src.core.advisor import generate_advisor_insight
        insight = generate_advisor_insight(df)
        
        insight_record = {
            "symbol": ticker_symbol,
            "sentiment": insight["sentiment"],
            "score": insight["score"],
            "title": insight["title"],
            "message": insight["message"],
            "rsi": insight["indicators"]["rsi"],
            "ema_20": insight["indicators"]["ema_20"],
            "trend": insight["indicators"]["trend"],
            "updated_at": datetime.now().isoformat()
        }
        
        # Upsert to 'stock_insights' table
        supabase.table("stock_insights").upsert(insight_record).execute()
        print(f"Saved AI Insight for {ticker_symbol}")
        
    except Exception as e:
        print(f"Error generating/saving AI insight: {e}")

if __name__ == "__main__":
    run_forecast("BBCA.JK")
