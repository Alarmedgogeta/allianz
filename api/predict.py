from __future__ import annotations

import json
import math
from functools import lru_cache
from http.server import BaseHTTPRequestHandler
from pathlib import Path
from typing import Any

import numpy as np
import onnxruntime as rt


# ── Model directory (try co-located api/model/ first, then project-relative) ──
def get_model_dir() -> Path:
    candidates = [
        Path(__file__).resolve().parent / "model",
        Path.cwd() / "api" / "model",
        Path.cwd() / "public" / "models",
    ]
    for candidate in candidates:
        if (candidate / "booster.onnx").exists():
            return candidate
    return candidates[0]


MODEL_DIR = get_model_dir()


@lru_cache(maxsize=1)
def load_params() -> dict[str, Any]:
    with open(MODEL_DIR / "preprocessor_params.json", encoding="utf-8") as fh:
        return json.load(fh)


@lru_cache(maxsize=1)
def load_session() -> tuple[rt.InferenceSession, str]:
    session = rt.InferenceSession(str(MODEL_DIR / "booster.onnx"))
    input_name = session.get_inputs()[0].name
    return session, input_name


# ── Inference helpers ─────────────────────────────────────────────────────────

def derive_features(body: dict[str, Any]) -> dict[str, Any]:
    annual_premium = float(body["Annual_premium"])
    customer_type = body["Customer_type"]
    customer_region = body["Customer_region"]
    broker_region = body["Broker_region"]
    customer_province = body["Customer_province"]
    broker_province = body["Broker_province"]
    broker_cor = float(body["Broker_cor"])
    payment_frequency = body["Payment_frequency"]

    return {
        **body,
        "Premium_log": math.log1p(annual_premium),
        "Is_enterprise": 1.0 if customer_type == "Enterprise" else 0.0,
        "Customer_Broker_same_region": 1.0 if customer_region == broker_region else 0.0,
        "Customer_Broker_same_province": 1.0 if customer_province == broker_province else 0.0,
        "Broker_profitable": 1.0 if broker_cor < 100 else 0.0,
        "Is_monthly_payment": 1.0 if payment_frequency.lower() == "monthly" else 0.0,
    }


def preprocess(data: dict[str, Any]) -> np.ndarray:
    params = load_params()

    cat_features: list[float] = []
    for col in params["cat_columns"]:
        cats = params["categories"][col]
        val = str(data.get(col, ""))
        cat_features.extend(1.0 if str(c) == val else 0.0 for c in cats)

    num_features: list[float] = []
    for i, col in enumerate(params["num_columns"]):
        val = float(data.get(col, 0.0))
        mean = params["scaler_mean"][i]
        std = params["scaler_std"][i] or 1.0
        num_features.append((val - mean) / std)

    return np.array([cat_features + num_features], dtype=np.float32)


def predict(body: dict[str, Any]) -> dict[str, Any]:
    enriched = derive_features(body)
    x = preprocess(enriched)
    session, input_name = load_session()
    outputs = session.run(None, {input_name: x})
    # XGBoost ONNX: outputs[0] = label, outputs[1] = probabilities
    prediction = int(outputs[0][0])
    probability = float(outputs[1][0][1])
    return {
        "prediction": prediction,
        "probability": round(probability, 4),
        "is_direct_debit": bool(prediction),
    }


# ── Vercel handler helpers (mirrors the reference repo pattern) ───────────────

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


# ── Vercel entrypoint ─────────────────────────────────────────────────────────

class handler(BaseHTTPRequestHandler):  # noqa: N801 – Vercel requires lowercase "handler"

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
