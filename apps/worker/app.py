from flask import Flask, jsonify
import os
import sys
import threading
import time
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import atexit

# Memastikan module src bisa dibaca
sys.path.append(os.path.join(os.path.dirname(__file__), '.'))

from src.jobs.ingest_data import ingest_stock_data
from src.jobs.update_forecast import run_forecast
from src.data.tickers import IDX_TICKERS

app = Flask(__name__)

# --- Scheduler Config ---
scheduler = BackgroundScheduler()
is_running = False

def batch_job(job_type="ingest"):
    """
    Background job to process all tickers.
    job_type: 'ingest' or 'forecast'
    """
    print(f"🚀 Starting background {job_type} job for {len(IDX_TICKERS)} tickers...")
    
    for i, ticker in enumerate(IDX_TICKERS):
        try:
            print(f"[{i+1}/{len(IDX_TICKERS)}] Processing {ticker}...")
            if job_type == "ingest":
                ingest_stock_data(ticker)
            elif job_type == "forecast":
                run_forecast(ticker)
            
            # Sleep to respect rate limits (optional)
            time.sleep(2) 
            
        except Exception as e:
            print(f"❌ Error processing {ticker}: {e}")
            
    print(f"✅ Finished {job_type} job.")

@app.route('/healthz', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy", 
        "service": "worker-node",
        "scheduler_running": scheduler.running
    }), 200

@app.route('/start-ingest', methods=['POST'])
def start_ingest():
    # Run in a separate thread to not block the request
    thread = threading.Thread(target=batch_job, args=("ingest",))
    thread.start()
    return jsonify({"status": "started", "message": "Ingestion started in background"}), 202

@app.route('/start-forecast', methods=['POST'])
def start_forecast():
    thread = threading.Thread(target=batch_job, args=("forecast",))
    thread.start()
    return jsonify({"status": "started", "message": "Forecasting started in background"}), 202

@app.route('/schedule', methods=['POST'])
def schedule_jobs():
    """Starts the persistent 24/7 scheduler"""
    if not scheduler.running:
        # Schedule Ingest every day at 18:00 WIB (after market close)
        scheduler.add_job(
            func=lambda: batch_job("ingest"),
            trigger=IntervalTrigger(hours=24),
            id='daily_ingest',
            name='Daily Data Ingestion',
            replace_existing=True
        )
        # Schedule Forecast every day at 19:00 WIB
        scheduler.add_job(
            func=lambda: batch_job("forecast"),
            trigger=IntervalTrigger(hours=24),
            id='daily_forecast',
            name='Daily Forecasting',
            replace_existing=True
        )
        scheduler.start()
        return jsonify({"status": "scheduled", "message": "Jobs scheduled daily."}), 200
    else:
        return jsonify({"status": "already_running", "message": "Scheduler is already running."}), 200

if __name__ == "__main__":
    # Auto-start scheduler if env var says so
    if os.environ.get("ENABLE_SCHEDULER") == "true":
        scheduler.start()
        atexit.register(lambda: scheduler.shutdown())

    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port)