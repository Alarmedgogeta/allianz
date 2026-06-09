import os

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ── Model loading ─────────────────────────────────────────────────────────────
# When Railway runs from the repo root the pkl files are at public/models/.
# The env var MODEL_DIR lets you override this path if needed.
_DEFAULT_MODEL_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "public",
    "models",
)
MODEL_DIR = os.environ.get("MODEL_DIR", _DEFAULT_MODEL_DIR)

_pipeline = joblib.load(os.path.join(MODEL_DIR, "modelo_XGBoost_allianz_dd.pkl"))

# ── Feature columns (must match training order exactly) ───────────────────────
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

# ── Request schema ────────────────────────────────────────────────────────────


class PredictRequest(BaseModel):
    Customer_segment: str
    Line_of_business: str
    Product_type: str
    Annual_premium: float
    Payment_frequency: str
    Customer_age: str  # categorical bucket, e.g. "D = 40-69"
    Customer_type: str
    Customer_region: str
    Customer_province: str
    Broker_region: str
    Broker_province: str
    Broker_cor: float
    Customer_urbanization: str
    Broker_urbanization: str


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(title="Allianz Direct Debit Predictor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


def _build_features(req: PredictRequest) -> pd.DataFrame:
    annual_premium = req.Annual_premium
    customer_type = req.Customer_type
    customer_region = req.Customer_region
    broker_region = req.Broker_region
    customer_province = req.Customer_province
    broker_province = req.Broker_province
    broker_cor = req.Broker_cor
    payment_frequency = req.Payment_frequency

    row = {
        "Customer_segment": req.Customer_segment,
        "Line_of_business": req.Line_of_business,
        "Product_type": req.Product_type,
        "Annual_premium": annual_premium,
        "Premium_log": np.log1p(annual_premium),
        "Payment_frequency": payment_frequency,
        "Customer_age": req.Customer_age,
        "Customer_type": customer_type,
        "Customer_region": customer_region,
        "Customer_province": customer_province,
        "Broker_region": broker_region,
        "Broker_province": broker_province,
        "Broker_cor": broker_cor,
        "Customer_urbanization": req.Customer_urbanization,
        "Broker_urbanization": req.Broker_urbanization,
        "Is_enterprise": int(customer_type == "Enterprise"),
        "Customer_Broker_same_region": int(customer_region == broker_region),
        "Customer_Broker_same_province": int(customer_province == broker_province),
        "Broker_profitable": int(broker_cor < 100),
        "Is_monthly_payment": int(payment_frequency.lower() == "monthly"),
    }

    return pd.DataFrame([row], columns=FEATURE_COLS)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/predict")
def predict(req: PredictRequest):
    df = _build_features(req)
    prediction = int(_pipeline.predict(df)[0])
    probability = float(_pipeline.predict_proba(df)[0][1])
    return {
        "prediction": prediction,
        "probability": round(probability, 4),
        "is_direct_debit": bool(prediction),
    }
