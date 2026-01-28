import pandas as pd
import numpy as np

def calculate_rsi(series, period=14):
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def generate_advisor_insight(df):
    """
    Generates a 'Raffles Concierge' style insight based on technical indicators.
    Returns a dictionary with sentiment, score, and the 'concierge_message'.
    """
    if len(df) < 50:
        return {
            "sentiment": "NEUTRAL",
            "score": 50,
            "title": "Insufficient Data",
            "message": "We are currently gathering more market intelligence to provide an accurate assessment, Sir."
        }
    
    # Calculate Indicators
    close = df['close']
    rsi = calculate_rsi(close, 14).iloc[-1]
    
    # SMA/EMA
    sma_20 = close.rolling(window=20).mean().iloc[-1]
    ema_20 = close.ewm(span=20, adjust=False).mean().iloc[-1]
    sma_50 = close.rolling(window=50).mean().iloc[-1]
    
    current_price = close.iloc[-1]
    
    # Logic for Raffles Concierge
    # 1. Trend Analysis
    trend = "Sideways"
    if current_price > sma_50 and current_price > ema_20:
        trend = "Bullish"
    elif current_price < sma_50 and current_price < ema_20:
        trend = "Bearish"
        
    # 2. RSI Analysis
    rsi_status = "Neutral"
    if rsi > 70:
        rsi_status = "Overbought"
    elif rsi < 30:
        rsi_status = "Oversold"
        
    # 3. Concierge Script Generation
    sentiment = "NEUTRAL"
    score = 50
    title = "Market Observation"
    message = "The market is currently showing mixed signals, Sir. Patience is advised."
    
    if trend == "Bullish":
        if rsi_status == "Oversold":
            # Golden Buying Opportunity (Uptrend + Dip)
            sentiment = "STRONG BUY"
            score = 90
            title = "Prime Accumulation Zone"
            message = "An exceptional opportunity, Sir. The asset is in a strong uptrend yet currently undervalued. Ideally positioned for accumulation."
        
        elif rsi_status == "Overbought":
            # Caution (Uptrend but expensive)
            sentiment = "HOLD"
            score = 65
            title = "Momentum is High"
            message = "The trend is robust, but the price is slightly extended. I would advise holding your current position rather than chasing, Sir."
            
        else:
            # Steady Uptrend
            sentiment = "BUY"
            score = 75
            title = "Steady Growth Trajectory"
            message = "Performance remains solid with a healthy upward trajectory. Adding to your portfolio at these levels appears prudent."
            
    elif trend == "Bearish":
        if rsi_status == "Overbought":
            # Strong Sell (Downtrend + Expensive)
            sentiment = "STRONG SELL"
            score = 10
            title = "Capital Preservation Advised"
            message = "The structure is weakening and price is elevated. It would be wise to liquidate positions to preserve your capital, Sir."
            
        elif rsi_status == "Oversold":
            # Potential Reversal (Downtrend + Cheap)
            sentiment = "WATCHLIST"
            score = 40
            title = "Potential Reversal Forming"
            message = "The asset is heavily discounted. While still risky, it warrants close observation for a potential reversal entry."
            
        else:
            # Steady Downtrend
            sentiment = "SELL"
            score = 25
            title = "Negative Outlook"
            message = "The prevailing trend is downward. I cannot recommend entry at this time; existing exposure should be minimized."

    return {
        "sentiment": sentiment,
        "score": score,
        "title": title,
        "message": message,
        "indicators": {
            "rsi": round(rsi, 2),
            "ema_20": round(ema_20, 2),
            "trend": trend
        }
    }
