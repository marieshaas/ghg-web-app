import json
import sys
from pathlib import Path
import os

sys.path.append(str(Path(__file__).parent))

try:
    from predictor import predict_total_emission

    raw_result = predict_total_emission()

    if raw_result.get("success"):
        total = raw_result["total_predicted"]

        cleaned = {
            "success": True,
            "total_predicted": round(float(total), 2),
        }
    else:
        cleaned = {"success": False, "error": raw_result.get("error", "Unknown error")}

    print(json.dumps(cleaned))
    sys.stdout.flush()

except Exception as e:
    import traceback
    print(json.dumps({
        "success": False,
        "error": "Fatal error in run_prediction.py",
        "details": str(e),
        "traceback": traceback.format_exc()
    }))
    sys.stdout.flush()
    sys.exit(1)