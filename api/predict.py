from __future__ import annotations

import json
import math
from functools import lru_cache
from http.server import BaseHTTPRequestHandler
from pathlib import Path
from typing import Any

import joblib
import pandas as pd


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


def get_model_dir() -> Path:
    candidates = [
        Path(__file__).resolve().parent / "model",
        Path.cwd() / "api" / "model",
        Path.cwd() / "public" / "models",
    ]
    for candidate in candidates:
        if (candidate / "modelo_XGBoost_allianz_dd.pkl").exists():
            return candidate
    return candidates[0]


MODEL_DIR = get_model_dir()


@lru_cache(maxsize=1)
def load_pipeline():
    return joblib.load(MODEL_DIR / "modelo_XGBoost_allianz_dd.pkl")


def build_features(body: dict[str, Any]) -> pd.DataFrame:
    annual_premium = float(body["Annual_premium"])
    customer_type = body["Customer_type"]
    customer_region = body["Customer_region"]
    broker_region = body["Broker_region"]
    customer_province = body["Customer_province"]
    broker_province = body["Broker_province"]
    broker_cor = float(body["Broker_cor"])
    payment_frequency = body["Payment_frequency"]

    row = {
        "Customer_segment": body["Customer_segment"],
        "Line_of_business": body["Line_of_business"],
        "Product_type": body["Product_type"],
        "Annual_premium": annual_premium,
        "Premium_log": math.log1p(annual_premium),
        "Payment_frequency": payment_frequency,
        "Customer_age": body["Customer_age"],
        "Customer_type": customer_type,
        "Customer_region": customer_region,
        "Customer_province": customer_province,
        "Broker_region": broker_region,
        "Broker_province": broker_province,
        "Broker_cor": broker_cor,
        "Customer_urbanization": body["Customer_urbanization"],
        "Broker_urbanization": body["Broker_urbanization"],
        "Is_enterprise": 1 if customer_type == "Enterprise" else 0,
        "Customer_Broker_same_region": 1 if customer_region == broker_region else 0,
        "Customer_Broker_same_province": 1 if customer_province == broker_province else 0,
        "Broker_profitable": 1 if broker_cor < 100 else 0,
        "Is_monthly_payment": 1 if payment_frequency.lower() == "monthly" else 0,
    }

    return pd.DataFrame([row], columns=FEATURE_COLS)


def predict(body: dict[str, Any]) -> dict[str, Any]:
    pipeline = load_pipeline()
    df = build_features(body)
    prediction = int(pipeline.predict(df)[0])
    probability = float(pipeline.predict_proba(df)[0][1])
    return {
        "prediction": prediction,
        "probability": round(probability, 4),
        "is_direct_debit": bool(prediction),
    }


def json_response(h: BaseHTTPRequestHandler, payload: dict[str, Any], status: int = 200) -> None:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    h.send_response(status)
    h.send_header("Content-Type", "application/json; charset=utf-8")
    h.send_header("Content-Length", str(len(body)))
    h.send_header("Access-Control-Allow-Origin", "*")
    h.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
    h.send_header("Access-Control-Allow-Headers", "Content-Type")
    h.end_headers()
    h.wfile.write(body)


def handle_options(h: BaseHTTPRequestHandler) -> None:
    h.send_response(204)
    h.send_header("Access-Control-Allow-Origin", "*")
    h.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
    h.send_header("Access-Control-Allow-Headers", "Content-Type")
    h.end_headers()


def read_json_body(h: BaseHTTPRequestHandler) -> dict[str, Any]:
    length = int(h.headers.get("content-length", "0") or "0")
    if length <= 0:
        raise ValueError("JSON body required.")
    raw = h.rfile.read(length)
    try:
        payload = json.loads(raw.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError("Invalid JSON body.") from exc
    if not isinstance(payload, dict):
        raise ValueError("Body must be a JSON object.")
    return payload


class handler(BaseHTTPRequestHandler):  # noqa: N801 – Vercel requires lowercase

    def do_OPTIONS(self) -> None:
        handle_options(self)

    def do_POST(self) -> None:
        try:
            body = read_json_body(self)
            json_response(self, predict(body))
        except Exception as exc:  # noqa: BLE001
            json_response(self, {"error": str(exc)}, 400)

    def log_message(self, *_: object) -> None:
        pass
