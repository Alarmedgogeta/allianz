from http.server import BaseHTTPRequestHandler
import json
import os

import joblib
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_pipeline = joblib.load(os.path.join(BASE_DIR, "public", "models", "modelo_XGBoost_allianz_dd.pkl"))

FEATURE_COLS = [
    "Customer_segment",
    "Line_of_business",
    "Product_type",
    "Annual_premium",
    "Premium_log",
    "Payment_frequency",
    "Customer_age",
    "Customer_type",
    "Customer_region",
    "Customer_province",
    "Broker_region",
    "Broker_province",
    "Broker_cor",
    "Customer_urbanization",
    "Broker_urbanization",
    "Is_enterprise",
    "Customer_Broker_same_region",
    "Customer_Broker_same_province",
    "Broker_profitable",
    "Is_monthly_payment",
]


def _build_features(data: dict) -> pd.DataFrame:
    annual_premium = float(data.get("Annual_premium", 0))
    customer_type = str(data.get("Customer_type", ""))
    customer_region = str(data.get("Customer_region", ""))
    broker_region = str(data.get("Broker_region", ""))
    customer_province = str(data.get("Customer_province", ""))
    broker_province = str(data.get("Broker_province", ""))
    broker_cor = float(data.get("Broker_cor", 0))
    payment_frequency = str(data.get("Payment_frequency", ""))

    row = {
        "Customer_segment": data.get("Customer_segment"),
        "Line_of_business": data.get("Line_of_business"),
        "Product_type": data.get("Product_type"),
        "Annual_premium": annual_premium,
        "Premium_log": np.log1p(annual_premium),
        "Payment_frequency": payment_frequency,
        "Customer_age": data.get("Customer_age"),
        "Customer_type": customer_type,
        "Customer_region": customer_region,
        "Customer_province": customer_province,
        "Broker_region": broker_region,
        "Broker_province": broker_province,
        "Broker_cor": broker_cor,
        "Customer_urbanization": data.get("Customer_urbanization"),
        "Broker_urbanization": data.get("Broker_urbanization"),
        "Is_enterprise": int(customer_type == "Enterprise"),
        "Customer_Broker_same_region": int(customer_region == broker_region),
        "Customer_Broker_same_province": int(customer_province == broker_province),
        "Broker_profitable": int(broker_cor < 100),
        "Is_monthly_payment": int(payment_frequency.lower() == "monthly"),
    }

    return pd.DataFrame([row], columns=FEATURE_COLS)


class handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length).decode("utf-8"))

            df = _build_features(body)
            prediction = int(_pipeline.predict(df)[0])
            probability = float(_pipeline.predict_proba(df)[0][1])

            payload = {
                "prediction": prediction,
                "probability": round(probability, 4),
                "is_direct_debit": bool(prediction),
            }
            self._respond(200, payload)
        except Exception as exc:
            self._respond(500, {"error": str(exc)})

    def _respond(self, status: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self._cors()
        self.end_headers()
        self.wfile.write(body)
