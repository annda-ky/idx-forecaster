import sys
import os
import pytest
import pandas as pd
import numpy as np

sys.path.append(os.path.join(os.path.dirname(__file__), '../'))

from src.core.forecaster import generate_forecast

def test_forecast_length():
    data = pd.Series(np.arange(100, 150))
    result = generate_forecast(data, days=7)
    assert len(result) == 7

def test_forecast_not_empty():
    data = pd.Series([100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110])
    result = generate_forecast(data, days=7)
    assert result is not None
    assert len(result) > 0

def test_forecast_insufficient_data():
    data = pd.Series([100, 101, 102])
    result = generate_forecast(data, days=7)
    assert result == []

def test_forecast_values_type():
    data = pd.Series(np.arange(100, 130))
    result = generate_forecast(data, days=5)
    assert isinstance(result, list)
    assert all(isinstance(x, (int, float)) for x in result)