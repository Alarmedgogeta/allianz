"""
Run this script ONCE in your local Python environment (the one that has
scikit-learn 1.8 + xgboost 2.x installed — the same env used to train the model).

Usage (from the project root):
    python scripts/export_model.py

Outputs two files that must be committed to git:
    api/model/booster.onnx               – XGBoost booster in ONNX format
    api/model/preprocessor_params.json   – fitted OHE categories + scaler params

These files let api/predict.py run with only onnxruntime + numpy on Vercel
(~185 MB total, well under Vercel's 500 MB Lambda limit).
Model files are placed in api/model/ so Vercel's includeFiles bundles them
with the function (matches the reference project pattern).
"""

import json
import os
import sys
from pathlib import Path

import joblib
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SRC_MODEL_DIR = ROOT / "public" / "models"
OUT_MODEL_DIR = ROOT / "api" / "model"
OUT_MODEL_DIR.mkdir(parents=True, exist_ok=True)

PIPELINE_PATH = SRC_MODEL_DIR / "modelo_XGBoost_allianz_dd.pkl"
ENCODER_PATH = SRC_MODEL_DIR / "encoder_XGBoost_allianz_dd.pkl"
BOOSTER_OUT = OUT_MODEL_DIR / "booster.onnx"
PARAMS_OUT = OUT_MODEL_DIR / "preprocessor_params.json"


def main() -> None:
    print("Loading pipeline …")
    pipeline = joblib.load(PIPELINE_PATH)

    # ── Export XGBoost booster to ONNX ────────────────────────────────────────
    classifier = pipeline.named_steps.get("classifier") or list(
        pipeline.named_steps.values()
    )[-1]
    booster = classifier.get_booster()
    booster.save_model(BOOSTER_OUT)
    print(f"Saved booster ONNX → {BOOSTER_OUT}")

    # ── Extract preprocessor parameters ───────────────────────────────────────
    # The encoder pkl is the fitted ColumnTransformer (same as pipeline['preprocessor']).
    # Prefer to load it directly so we don't depend on step naming.
    preprocessor = joblib.load(ENCODER_PATH)

    cat_columns: list[str] = []
    categories: dict[str, list[str]] = {}
    num_columns: list[str] = []
    scaler_mean: list[float] = []
    scaler_std: list[float] = []

    for _name, transformer, cols in preprocessor.transformers_:
        if _name == "remainder":
            continue

        # Detect categorical vs numerical by looking for OneHotEncoder
        steps = getattr(transformer, "named_steps", {})
        if "encoder" in steps:
            # Categorical pipeline: imputer → OneHotEncoder
            ohe = steps["encoder"]
            cat_columns = list(cols)
            for col, cats in zip(cols, ohe.categories_):
                categories[col] = [str(c) for c in cats]
        elif "scaler" in steps:
            # Numerical pipeline: imputer → StandardScaler
            scaler = steps["scaler"]
            num_columns = list(cols)
            scaler_mean = [float(m) for m in scaler.mean_]
            scaler_std = [float(s) for s in np.sqrt(scaler.var_)]

    params = {
        "cat_columns": cat_columns,
        "categories": categories,
        "num_columns": num_columns,
        "scaler_mean": scaler_mean,
        "scaler_std": scaler_std,
    }

    with open(PARAMS_OUT, "w", encoding="utf-8") as fh:
        json.dump(params, fh, indent=2, ensure_ascii=False)
    print(f"Saved preprocessor params → {PARAMS_OUT}")

    # Quick sanity check
    import onnxruntime as rt  # noqa: PLC0415 – only needed here

    sess = rt.InferenceSession(str(BOOSTER_OUT))
    print(f"ONNX input : {sess.get_inputs()[0].name}  shape={sess.get_inputs()[0].shape}")
    print(f"ONNX outputs: {[o.name for o in sess.get_outputs()]}")
    print("Export complete ✓")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
