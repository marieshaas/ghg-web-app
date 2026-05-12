"""
GHG ML Prediction Microservice (Flask)
- Loads model once at startup, keeps it in memory
- POST /retrain  → retrain model in background, reload into memory
- GET  /predict/total → predict next month total emission
- GET  /health   → service + model status
"""

from flask import Flask, jsonify
import threading
import json
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()
sys.path.append(str(Path(__file__).parent))

from predictor import GHGPredictor, predict_total_emission

app = Flask(__name__)
_retrain_lock = threading.Lock()
_retrain_status = {"running": False, "last_retrain": None, "last_error": None}

# Global predictor — loaded once at startup
predictor = GHGPredictor()


@app.get('/health')
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': predictor.model is not None,
        'model_version': predictor.metadata.get('training_date', 'unknown') if predictor.metadata else None,
        'retrain_running': _retrain_status['running'],
        'last_retrain': _retrain_status['last_retrain'],
    })


@app.get('/predict/total')
def predict_total():
    result = predict_total_emission()
    return jsonify(result)


@app.get('/predict/suppliers')
def predict_suppliers():
    result = predictor.predict_per_supplier()
    return jsonify(result)


@app.post('/retrain')
def retrain():
    """
    Trigger model retrain in background.
    If train.py exists, runs it first to produce new model files.
    Then reloads model into memory (no downtime — old model serves until reload).
    """
    if _retrain_status['running']:
        return jsonify({'success': False, 'message': 'Retrain already in progress'}), 409

    def do_retrain():
        _retrain_status['running'] = True
        _retrain_status['last_error'] = None
        try:
            train_script = Path(__file__).parent / 'train.py'
            if train_script.exists():
                import subprocess
                print('[retrain] Running train.py...')
                subprocess.run(
                    ['python', str(train_script)],
                    check=True,
                    cwd=str(Path(__file__).parent)
                )
                print('[retrain] train.py complete')
            else:
                print('[retrain] No train.py found — skipping training, just reloading model files')

            predictor.load_model()
            from datetime import datetime
            _retrain_status['last_retrain'] = datetime.now().isoformat()
            print(f'[retrain] Model reloaded at {_retrain_status["last_retrain"]}')

        except Exception as e:
            _retrain_status['last_error'] = str(e)
            print(f'[retrain] Error: {e}')
        finally:
            _retrain_status['running'] = False

    thread = threading.Thread(target=do_retrain, daemon=True)
    thread.start()

    return jsonify({'success': True, 'message': 'Retrain started in background'})


if __name__ == '__main__':
    port = int(os.getenv('ML_SERVICE_PORT', 5000))
    print(f'[ml_service] Starting on port {port}')
    app.run(host='0.0.0.0', port=port)
