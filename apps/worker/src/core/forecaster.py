import pandas as pd
from statsmodels.tsa.holtwinters import ExponentialSmoothing

def generate_forecast(prices, days=7):
    if len(prices) < 10:
        return []
    
    try:
        model = ExponentialSmoothing(
            prices, 
            trend='add', 
            seasonal=None, 
            initialization_method="estimated"
        ).fit()
        
        forecast = model.forecast(steps=days)
        return forecast.tolist()
    except Exception:
        return []