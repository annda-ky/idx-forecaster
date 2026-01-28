from flask import Flask, jsonify
import os
import sys

# Memastikan module src bisa dibaca
sys.path.append(os.path.join(os.path.dirname(__file__), '.'))

from src.jobs.ingest_data import ingest_stock_data
from src.jobs.update_forecast import run_forecast

app = Flask(__name__)

@app.route('/healthz', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "worker-node"}), 200

@app.route('/run-ingest', methods=['POST'])
def trigger_ingest():
    tickers = ["BBCA.JK", "TLKM.JK", "GOTO.JK", "BMRI.JK", "ASII.JK"]
    results = {}
    for t in tickers:
        try:
            ingest_stock_data(t)
            results[t] = "Success"
        except Exception as e:
            results[t] = str(e)
    return jsonify({"status": "done", "details": results}), 200

@app.route('/run-forecast', methods=['POST'])
def trigger_forecast():
    tickers = ["BBCA.JK", "TLKM.JK", "GOTO.JK", "BMRI.JK", "ASII.JK"]
    results = {}
    for t in tickers:
        try:
            run_forecast(t)
            results[t] = "Success"
        except Exception as e:
            results[t] = str(e)
    return jsonify({"status": "done", "details": results}), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port)