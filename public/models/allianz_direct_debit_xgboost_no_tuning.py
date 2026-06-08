#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Allianz - Predicción de Direct Debit usando XGBoost sin tuning
==============================================================

Objetivo:
    Entrenar un modelo supervisado de clasificación binaria para predecir si un
    contrato utiliza Direct Debit (Is_direct_debit = 1) o no (Is_direct_debit = 0).

Diferencia vs. script original:
    - Se mantiene la misma lógica de carga, limpieza, feature engineering,
      evaluación y exportación de resultados.
    - Se reemplaza Random Forest por XGBoost.
    - No se usa GridSearchCV ni hyperparameter tuning para que el fitting sea más rápido.

Archivo esperado:
    Allianz Data.xlsx
Hoja esperada:
    AllianzDirectDebitData
"""

# =============================
# 1. Importación de bibliotecas
# =============================

import argparse
import os
import pickle
import warnings
from datetime import datetime

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    ConfusionMatrixDisplay,
    PrecisionRecallDisplay,
    RocCurveDisplay,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

try:
    from xgboost import XGBClassifier
except ImportError as exc:
    raise ImportError(
        "No se encontró la librería xgboost. Instálala con: python -m pip install xgboost"
    ) from exc

warnings.filterwarnings("ignore")


# =============================
# 2. Configuración general
# =============================

RANDOM_STATE = 42
DEFAULT_INPUT_FILE = "Allianz Data.xlsx"
DEFAULT_SHEET_NAME = "AllianzDirectDebitData"
TARGET_COL = "Is_direct_debit"
OUTPUT_DIR = "allianz_xgboost_outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)


# =====================================
# 3. Funciones auxiliares
# =====================================

def make_one_hot_encoder():
    """Crea OneHotEncoder compatible con versiones nuevas y anteriores de sklearn."""
    try:
        return OneHotEncoder(handle_unknown="ignore", sparse_output=True)
    except TypeError:
        return OneHotEncoder(handle_unknown="ignore", sparse=True)


def mask_identifier(value):
    """Enmascara identificadores para que los outputs sean más seguros para presentación."""
    if pd.isna(value):
        return np.nan
    text = str(value)
    if len(text) <= 6:
        return "***"
    return text[:3] + "***" + text[-3:]


def load_data(input_file: str, sheet_name: str, sample_rows: int | None = None) -> pd.DataFrame:
    """Carga el dataset desde Excel."""
    if not os.path.exists(input_file):
        raise FileNotFoundError(
            f"No se encontró el archivo '{input_file}'. Coloca el script en la misma carpeta "
            f"que '{DEFAULT_INPUT_FILE}' o usa --input_file."
        )

    df = pd.read_excel(input_file, sheet_name=sheet_name, engine="openpyxl")

    if sample_rows is not None and sample_rows > 0 and sample_rows < len(df):
        df = df.sample(n=sample_rows, random_state=RANDOM_STATE).reset_index(drop=True)

    return df


def clean_and_engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Limpia datos y crea variables con lógica de negocio.

    Decisiones principales:
      - Se conserva 'No age' como categoría válida porque representa empresas.
      - Se crea una bandera para pagos mensuales, ya que en el caso estos pagos están
        asociados a uso obligatorio de Direct Debit.
      - Se crean conteos por cliente y broker para capturar volumen de relación.
      - Se eliminan IDs crudos antes de entrenar para evitar memorización/leakage.
    """
    df = df.copy()
    df.columns = [str(c).strip() for c in df.columns]

    if TARGET_COL not in df.columns:
        raise ValueError(f"No se encontró la columna target esperada: {TARGET_COL}")

    df = df.drop_duplicates().reset_index(drop=True)

    df[TARGET_COL] = pd.to_numeric(df[TARGET_COL], errors="coerce")
    df = df[df[TARGET_COL].isin([0, 1])].copy()
    df[TARGET_COL] = df[TARGET_COL].astype(int)

    for col in ["Annual_premium", "Broker_cor"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    if "Annual_premium" in df.columns:
        df["Annual_premium_log1p"] = np.log1p(df["Annual_premium"].clip(lower=0))

    if "Payment_frequency" in df.columns:
        df["Monthly_mandatory_direct_debit"] = (
            df["Payment_frequency"].astype(str).str.strip().str.lower().eq("monthly")
        ).astype(int)

        frequency_map = {
            "annually": 1,
            "semi-annually": 2,
            "quarterly": 4,
            "monthly": 12,
        }
        df["Payments_per_year"] = (
            df["Payment_frequency"].astype(str).str.strip().str.lower().map(frequency_map)
        )

    if "Customer_ID" in df.columns:
        df["Customer_contract_count"] = df.groupby("Customer_ID")["Customer_ID"].transform("count")

    if "Broker_account_number" in df.columns:
        df["Broker_contract_count"] = df.groupby("Broker_account_number")["Broker_account_number"].transform("count")

    if {"Customer_region", "Broker_region"}.issubset(df.columns):
        df["Same_customer_broker_region"] = (df["Customer_region"] == df["Broker_region"]).astype(int)

    if {"Customer_province", "Broker_province"}.issubset(df.columns):
        df["Same_customer_broker_province"] = (df["Customer_province"] == df["Broker_province"]).astype(int)

    object_cols = df.select_dtypes(include=["object"]).columns.tolist()
    for col in object_cols:
        df[col] = df[col].replace(r"^\s*$", np.nan, regex=True)

    return df


def split_features_target(df: pd.DataFrame):
    """Separa variables predictoras y target, eliminando IDs crudos."""
    y = df[TARGET_COL].astype(int)

    id_cols_to_drop = [
        "Broker_account_number",
        "Contract_number",
        "Customer_ID",
    ]

    X = df.drop(columns=[TARGET_COL], errors="ignore")
    X = X.drop(columns=[c for c in id_cols_to_drop if c in X.columns], errors="ignore")

    return X, y


def build_preprocessor(X: pd.DataFrame) -> ColumnTransformer:
    """Preprocesamiento: imputación, escalamiento numérico y One-Hot Encoding."""
    numeric_features = X.select_dtypes(include=["number", "bool"]).columns.tolist()
    categorical_features = [c for c in X.columns if c not in numeric_features]

    numeric_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler(with_mean=False)),
        ]
    )

    categorical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", make_one_hot_encoder()),
        ]
    )

    return ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
        ],
        remainder="drop",
    )


def get_feature_names(preprocessor: ColumnTransformer) -> list[str]:
    """Obtiene nombres de variables después del preprocesamiento."""
    feature_names = []

    for name, transformer, columns in preprocessor.transformers_:
        if name == "remainder" or transformer == "drop":
            continue
        if name == "num":
            feature_names.extend(columns)
        elif name == "cat":
            encoder = transformer.named_steps["onehot"]
            try:
                encoded_names = encoder.get_feature_names_out(columns)
            except AttributeError:
                encoded_names = encoder.get_feature_names(columns)
            feature_names.extend(encoded_names)

    return list(feature_names)


def train_models(X_train, y_train, preprocessor: ColumnTransformer):
    """
    Entrena modelos sin tuning:
      - Baseline para comparar contra clase mayoritaria.
      - Logistic Regression como referencia interpretable.
      - XGBoost como modelo principal.
    """
    negative_count = int((y_train == 0).sum())
    positive_count = int((y_train == 1).sum())
    scale_pos_weight = negative_count / positive_count if positive_count > 0 else 1

    models = {
        "Baseline_most_frequent": Pipeline(
            steps=[
                ("preprocessor", preprocessor),
                ("model", DummyClassifier(strategy="most_frequent")),
            ]
        ),
        "LogisticRegression_baseline": Pipeline(
            steps=[
                ("preprocessor", preprocessor),
                (
                    "model",
                    LogisticRegression(
                        max_iter=1000,
                        class_weight="balanced",
                        random_state=RANDOM_STATE,
                        n_jobs=-1,
                    ),
                ),
            ]
        ),
        "XGBoost_no_tuning": Pipeline(
            steps=[
                ("preprocessor", preprocessor),
                (
                    "model",
                    XGBClassifier(
                        n_estimators=250,
                        max_depth=6,
                        learning_rate=0.08,
                        subsample=0.85,
                        colsample_bytree=0.85,
                        min_child_weight=5,
                        objective="binary:logistic",
                        eval_metric="logloss",
                        scale_pos_weight=scale_pos_weight,
                        random_state=RANDOM_STATE,
                        n_jobs=-1,
                        tree_method="hist",
                    ),
                ),
            ]
        ),
    }

    fitted_models = {}
    for model_name, pipe in models.items():
        print(f"\nEntrenando modelo: {model_name}")
        pipe.fit(X_train, y_train)
        fitted_models[model_name] = pipe

    return fitted_models


def evaluate_model(model_name: str, model, X_test, y_test) -> dict:
    """Evalúa un modelo y regresa métricas principales."""
    y_pred = model.predict(X_test)

    if hasattr(model, "predict_proba"):
        y_score = model.predict_proba(X_test)[:, 1]
    else:
        y_score = y_pred

    metrics = {
        "model": model_name,
        "accuracy": accuracy_score(y_test, y_pred),
        "precision": precision_score(y_test, y_pred, zero_division=0),
        "recall": recall_score(y_test, y_pred, zero_division=0),
        "f1_score": f1_score(y_test, y_pred, zero_division=0),
        "roc_auc": roc_auc_score(y_test, y_score) if len(np.unique(y_test)) > 1 else np.nan,
        "average_precision": average_precision_score(y_test, y_score) if len(np.unique(y_test)) > 1 else np.nan,
    }

    print(f"\n===== Resultados: {model_name} =====")
    print(pd.Series(metrics).drop("model"))
    print("\nClassification report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    return metrics


def choose_best_model(fitted_models: dict, metrics_df: pd.DataFrame):
    """Selecciona el mejor modelo por F1-score, priorizando XGBoost si hay empate."""
    metrics_sorted = metrics_df.sort_values(["f1_score", "roc_auc"], ascending=False)
    best_model_name = metrics_sorted.iloc[0]["model"]
    return best_model_name, fitted_models[best_model_name]


def save_evaluation_plots(best_model, X_test, y_test):
    """Guarda matriz de confusión, ROC y Precision-Recall."""
    y_pred = best_model.predict(X_test)
    y_score = best_model.predict_proba(X_test)[:, 1]

    cm = confusion_matrix(y_test, y_pred)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=["No DD", "Direct Debit"])
    disp.plot(values_format="d")
    plt.title("Matriz de confusión - XGBoost Direct Debit")
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "confusion_matrix.png"), dpi=200)
    plt.close()

    RocCurveDisplay.from_predictions(y_test, y_score)
    plt.title("Curva ROC - XGBoost Direct Debit")
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "roc_curve.png"), dpi=200)
    plt.close()

    PrecisionRecallDisplay.from_predictions(y_test, y_score)
    plt.title("Curva Precision-Recall - XGBoost Direct Debit")
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "precision_recall_curve.png"), dpi=200)
    plt.close()


def save_feature_importance(best_model, top_n: int = 25):
    """Guarda importancia de variables del modelo XGBoost."""
    model = best_model.named_steps["model"]
    preprocessor = best_model.named_steps["preprocessor"]

    feature_names = get_feature_names(preprocessor)
    importances = model.feature_importances_

    fi = pd.DataFrame({"feature": feature_names, "importance": importances})
    fi = fi.sort_values("importance", ascending=False).reset_index(drop=True)
    fi.to_csv(os.path.join(OUTPUT_DIR, "feature_importance.csv"), index=False)

    top_fi = fi.head(top_n).sort_values("importance", ascending=True)
    plt.figure(figsize=(10, max(6, top_n * 0.25)))
    plt.barh(top_fi["feature"], top_fi["importance"])
    plt.title(f"Top {top_n} variables más importantes - XGBoost")
    plt.xlabel("Importancia")
    plt.ylabel("Variable")
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "feature_importance_top.png"), dpi=200)
    plt.close()

    return fi


def export_predictions(best_model, X_test, y_test):
    """Exporta predicciones del test set."""
    probs = best_model.predict_proba(X_test)[:, 1]
    preds = best_model.predict(X_test)

    predictions = X_test.copy()
    predictions["actual_Is_direct_debit"] = y_test.values
    predictions["predicted_Is_direct_debit"] = preds
    predictions["probability_direct_debit"] = probs

    predictions.to_csv(os.path.join(OUTPUT_DIR, "test_predictions.csv"), index=False)
    return predictions


def export_business_candidates(best_model, df_clean: pd.DataFrame, X_all: pd.DataFrame, top_n: int = 500):
    """Exporta contratos no-DD con mayor probabilidad estimada para campaña."""
    probs = best_model.predict_proba(X_all)[:, 1]
    scored = df_clean.copy()
    scored["probability_direct_debit"] = probs

    mask = scored[TARGET_COL].eq(0)
    if "Payment_frequency" in scored.columns:
        mask &= ~scored["Payment_frequency"].astype(str).str.lower().eq("monthly")

    candidates = scored.loc[mask].copy()
    candidates = candidates.sort_values("probability_direct_debit", ascending=False).head(top_n)

    for col in ["Broker_account_number", "Contract_number", "Customer_ID"]:
        if col in candidates.columns:
            candidates[col + "_masked"] = candidates[col].apply(mask_identifier)
            candidates = candidates.drop(columns=[col])

    keep_cols = [
        c
        for c in [
            "Contract_number_masked",
            "Customer_ID_masked",
            "Customer_segment",
            "Line_of_business",
            "Product_type",
            "Annual_premium",
            "Payment_frequency",
            "Customer_age",
            "Customer_type",
            "Customer_region",
            "Customer_province",
            "Customer_urbanization",
            "Broker_region",
            "Broker_province",
            "Broker_urbanization",
            "Broker_cor",
            "probability_direct_debit",
        ]
        if c in candidates.columns
    ]

    candidates[keep_cols].to_csv(
        os.path.join(OUTPUT_DIR, "top_direct_debit_campaign_candidates.csv"),
        index=False,
    )

    return candidates[keep_cols]


def write_project_summary(metrics_df: pd.DataFrame, best_model_name: str, fi: pd.DataFrame):
    """Genera resumen ejecutivo para presentación."""
    top_features = fi.head(10)[["feature", "importance"]].to_string(index=False)
    metrics_text = metrics_df.to_string(index=False)

    summary = f"""
Resumen ejecutivo - Allianz Direct Debit ML Project con XGBoost
Fecha de ejecución: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

1. Problema de negocio
El proyecto predice qué contratos tienen mayor probabilidad de utilizar Direct Debit.
Esto ayuda a priorizar campañas comerciales hacia contratos con mayor potencial,
evitar campañas masivas costosas y apoyar la mejora del flujo de efectivo.

2. Modelo principal
Modelo final seleccionado: {best_model_name}

Se usó XGBoost sin tuning porque:
- Es un modelo potente para datos tabulares.
- Captura relaciones no lineales entre variables.
- Maneja bien combinaciones de variables numéricas y categóricas después del One-Hot Encoding.
- Suele tener buen desempeño sin necesidad de entrenar decenas de combinaciones como en GridSearchCV.
- Es más rápido que hacer tuning completo porque se entrena una sola configuración.

3. Limpieza y preparación
- Se eliminaron duplicados exactos.
- Se validó que Is_direct_debit solo tuviera valores 0 y 1.
- Se convirtieron Annual_premium y Broker_cor a numérico.
- Se conservó 'No age' como categoría válida porque representa empresas.
- Se eliminaron IDs crudos antes del entrenamiento para evitar que el modelo memorice contratos o clientes.
- Se imputaron valores faltantes y se aplicó One-Hot Encoding a variables categóricas.

4. Feature engineering
- Annual_premium_log1p: reduce efecto de valores extremos en primas.
- Monthly_mandatory_direct_debit: identifica pagos mensuales, relevantes porque el caso indica que los contratos mensuales usan Direct Debit.
- Payments_per_year: convierte frecuencia de pago en intensidad anual de pagos.
- Customer_contract_count y Broker_contract_count: capturan volumen de relación.
- Same_customer_broker_region/province: capturan cercanía geográfica entre cliente y broker.

5. Métricas de evaluación
{metrics_text}

Interpretación:
- Precision: confiabilidad de las predicciones positivas.
- Recall: capacidad de encontrar contratos que realmente usan Direct Debit.
- F1-score: balance entre precision y recall.
- ROC-AUC: capacidad general de separar contratos con y sin Direct Debit.

6. Variables más importantes
{top_features}

7. Resultados buscados
- Medir si XGBoost supera el baseline y la regresión logística.
- Identificar variables que más influyen en la adopción de Direct Debit.
- Generar una lista priorizada de contratos candidatos para campañas.
- Exportar visualizaciones y métricas listas para presentación.

8. Archivos generados
- metrics_summary.csv
- feature_importance.csv
- feature_importance_top.png
- confusion_matrix.png
- roc_curve.png
- precision_recall_curve.png
- test_predictions.csv
- top_direct_debit_campaign_candidates.csv
- allianz_xgboost_direct_debit_model.pkl
""".strip()

    with open(os.path.join(OUTPUT_DIR, "project_summary.txt"), "w", encoding="utf-8") as f:
        f.write(summary)


# =============================
# 4. Flujo principal
# =============================

def main():
    parser = argparse.ArgumentParser(description="Allianz Direct Debit ML project with XGBoost, no tuning")
    parser.add_argument("--input_file", default=DEFAULT_INPUT_FILE, help="Ruta al archivo Excel de Allianz")
    parser.add_argument("--sheet_name", default=DEFAULT_SHEET_NAME, help="Nombre de la hoja de datos")
    parser.add_argument("--sample_rows", type=int, default=None, help="Número opcional de filas para pruebas rápidas")
    parser.add_argument("--test_size", type=float, default=0.20, help="Proporción del test set")
    args = parser.parse_args()

    print("\n=== Allianz Direct Debit ML Project - XGBoost sin tuning ===")
    print(f"Archivo: {args.input_file}")
    print(f"Hoja: {args.sheet_name}")

    # 1) Carga de datos
    df = load_data(args.input_file, args.sheet_name, args.sample_rows)
    print(f"Datos cargados: {df.shape[0]:,} filas x {df.shape[1]:,} columnas")

    # 2) Limpieza y feature engineering
    df_clean = clean_and_engineer_features(df)
    X, y = split_features_target(df_clean)

    print("\nDistribución del target:")
    print(y.value_counts(normalize=True).rename("proportion"))
    print(y.value_counts().rename("count"))

    # 3) Train/Test split estratificado
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=args.test_size,
        stratify=y,
        random_state=RANDOM_STATE,
    )

    # 4) Preprocesamiento
    preprocessor = build_preprocessor(X_train)

    # 5) Entrenamiento sin tuning
    fitted_models = train_models(X_train, y_train, preprocessor)

    # 6) Evaluación
    metrics = []
    for model_name, model in fitted_models.items():
        metrics.append(evaluate_model(model_name, model, X_test, y_test))

    metrics_df = pd.DataFrame(metrics).sort_values("f1_score", ascending=False)
    metrics_df.to_csv(os.path.join(OUTPUT_DIR, "metrics_summary.csv"), index=False)

    # 7) Seleccionar mejor modelo por F1-score
    best_model_name, best_model = choose_best_model(fitted_models, metrics_df)
    print(f"\nMejor modelo seleccionado: {best_model_name}")

    # 8) Visualizaciones e importancia de variables
    save_evaluation_plots(best_model, X_test, y_test)
    fi = save_feature_importance(best_model, top_n=25)

    # 9) Exportar predicciones y candidatos
    export_predictions(best_model, X_test, y_test)
    export_business_candidates(best_model, df_clean, X, top_n=500)

    # 10) Guardar modelo con pickle para evitar dependencia de joblib
    with open(os.path.join(OUTPUT_DIR, "allianz_xgboost_direct_debit_model.pkl"), "wb") as f:
        pickle.dump(best_model, f)

    # 11) Resumen ejecutivo
    write_project_summary(metrics_df, best_model_name, fi)

    print("\n=== Proceso terminado correctamente ===")
    print(f"Archivos generados en la carpeta: {OUTPUT_DIR}")
    print("Archivo principal para revisar: allianz_xgboost_outputs/project_summary.txt")


if __name__ == "__main__":
    main()
