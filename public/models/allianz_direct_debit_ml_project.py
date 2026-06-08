#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Allianz - Predicción de uso de Direct Debit con Machine Learning supervisado
==============================================================================

Objetivo del proyecto:
    Construir un modelo de clasificación supervisada para predecir si un contrato
    de Allianz utiliza Direct Debit (Is_direct_debit = 1) o no (Is_direct_debit = 0).

Contexto del caso:
    El caso indica que Allianz quiere aumentar el uso de Direct Debit porque mejora
    la confiabilidad del flujo de efectivo, reduce trabajo administrativo y puede
    ayudar a disminuir el Cash Conversion Cycle. El objetivo práctico del modelo es
    identificar contratos/clientes con mayor probabilidad de adoptar Direct Debit,
    para priorizar campañas comerciales sin contactar a toda la cartera.

Dataset esperado:
    Archivo: Allianz Data.xlsx
    Hoja:    AllianzDirectDebitData
    Target:  Is_direct_debit

Autor: Felix Villarreal Vera / Proyecto ML supervisado
"""

# =============================
# 1. Importación de bibliotecas
# =============================

import argparse
import os
import warnings
from datetime import datetime

import joblib as joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import RandomForestClassifier
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
    RocCurveDisplay,
    PrecisionRecallDisplay,
    ConfusionMatrixDisplay,
)
from sklearn.model_selection import GridSearchCV, StratifiedKFold, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

warnings.filterwarnings("ignore")


# =============================
# 2. Configuración general
# =============================

RANDOM_STATE = 42
DEFAULT_INPUT_FILE = "Allianz Data.xlsx"
DEFAULT_SHEET_NAME = "AllianzDirectDebitData"
TARGET_COL = "Is_direct_debit"

OUTPUT_DIR = "allianz_outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)


# =====================================
# 3. Funciones auxiliares del proyecto
# =====================================

def make_one_hot_encoder():
    """Crea un OneHotEncoder compatible con versiones nuevas y anteriores de scikit-learn."""
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
    """Carga la base de datos desde Excel y valida que la hoja exista."""
    if not os.path.exists(input_file):
        raise FileNotFoundError(
            f"No se encontró el archivo '{input_file}'. Coloca este script en la misma carpeta "
            f"que '{DEFAULT_INPUT_FILE}' o usa --input_file."
        )

    df = pd.read_excel(input_file, sheet_name=sheet_name, engine="openpyxl")

    # Permite trabajar rápido en pruebas sin cambiar el flujo del proyecto completo.
    if sample_rows is not None and sample_rows > 0 and sample_rows < len(df):
        df = df.sample(n=sample_rows, random_state=RANDOM_STATE).reset_index(drop=True)

    return df


def clean_and_engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Limpieza y feature engineering.

    Reglas principales:
      - El target es Is_direct_debit.
      - 'No age' se conserva como categoría válida, porque en el caso representa empresas.
      - Los contratos mensuales se marcan como Monthly_mandatory_direct_debit porque el caso
        menciona que Allianz obliga Direct Debit para pagos mensuales.
      - Se agregan variables de volumen por cliente y broker usando los IDs internamente.
      - Se eliminan IDs crudos antes de entrenar para evitar memorizar contratos/clientes.
    """
    df = df.copy()

    # Normaliza nombres de columnas por seguridad.
    df.columns = [str(c).strip() for c in df.columns]

    if TARGET_COL not in df.columns:
        raise ValueError(f"No se encontró la columna target esperada: {TARGET_COL}")

    # Elimina duplicados exactos.
    df = df.drop_duplicates().reset_index(drop=True)

    # Asegura tipo numérico del target.
    df[TARGET_COL] = pd.to_numeric(df[TARGET_COL], errors="coerce")
    df = df[df[TARGET_COL].isin([0, 1])].copy()
    df[TARGET_COL] = df[TARGET_COL].astype(int)

    # Variables numéricas limpias.
    for col in ["Annual_premium", "Broker_cor"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Feature: log del premium para reducir efecto de valores extremos.
    if "Annual_premium" in df.columns:
        df["Annual_premium_log1p"] = np.log1p(df["Annual_premium"].clip(lower=0))

    # Feature: flag de pago mensual obligatorio.
    if "Payment_frequency" in df.columns:
        df["Monthly_mandatory_direct_debit"] = (
            df["Payment_frequency"].astype(str).str.strip().str.lower().eq("monthly")
        ).astype(int)

        # Feature ordinal entendible para frecuencia anual de cobro.
        frequency_map = {
            "annually": 1,
            "semi-annually": 2,
            "quarterly": 4,
            "monthly": 12,
        }
        df["Payments_per_year"] = (
            df["Payment_frequency"].astype(str).str.strip().str.lower().map(frequency_map)
        )

    # Feature: volumen de contratos por cliente y broker.
    if "Customer_ID" in df.columns:
        df["Customer_contract_count"] = df.groupby("Customer_ID")["Customer_ID"].transform("count")
    if "Broker_account_number" in df.columns:
        df["Broker_contract_count"] = df.groupby("Broker_account_number")["Broker_account_number"].transform("count")

    # Feature: distancia simple entre broker y cliente por región/provincia.
    if {"Customer_region", "Broker_region"}.issubset(df.columns):
        df["Same_customer_broker_region"] = (df["Customer_region"] == df["Broker_region"]).astype(int)
    if {"Customer_province", "Broker_province"}.issubset(df.columns):
        df["Same_customer_broker_province"] = (df["Customer_province"] == df["Broker_province"]).astype(int)

    # Convierte texto vacío a NaN para que el imputador lo trate correctamente.
    object_cols = df.select_dtypes(include=["object"]).columns.tolist()
    for col in object_cols:
        df[col] = df[col].replace(r"^\s*$", np.nan, regex=True)

    return df


def split_features_target(df: pd.DataFrame):
    """Separa X/y y elimina identificadores de alta cardinalidad para evitar leakage."""
    y = df[TARGET_COL].astype(int)

    # IDs que describen entidades únicas, pero no deberían usarse directamente para predecir.
    # Se usaron solo para crear conteos agregados antes de eliminarlos.
    id_cols_to_drop = [
        "Broker_account_number",
        "Contract_number",
        "Customer_ID",
    ]

    X = df.drop(columns=[TARGET_COL], errors="ignore")
    X = X.drop(columns=[c for c in id_cols_to_drop if c in X.columns], errors="ignore")

    return X, y


def build_preprocessor(X: pd.DataFrame) -> ColumnTransformer:
    """Construye el preprocesamiento: imputación, escalamiento numérico y One-Hot Encoding."""
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

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
        ],
        remainder="drop",
    )

    return preprocessor


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
    """Entrena modelos de comparación: baseline, regresión logística y Random Forest."""
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
        "RandomForest_initial": Pipeline(
            steps=[
                ("preprocessor", preprocessor),
                (
                    "model",
                    RandomForestClassifier(
                        n_estimators=200,
                        max_depth=None,
                        min_samples_leaf=10,
                        class_weight="balanced_subsample",
                        random_state=RANDOM_STATE,
                        n_jobs=-1,
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


def tune_random_forest(X_train, y_train, preprocessor: ColumnTransformer):
    """Optimiza Random Forest con GridSearchCV usando F1 de la clase positiva."""
    rf_pipe = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            (
                "model",
                RandomForestClassifier(
                    class_weight="balanced_subsample",
                    random_state=RANDOM_STATE,
                    n_jobs=-1,
                ),
            ),
        ]
    )

    # Grid moderado para que sea viable en equipos personales.
    param_grid = {
        "model__n_estimators": [150, 300],
        "model__max_depth": [10, 20, None],
        "model__min_samples_leaf": [5, 20],
    }

    cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=RANDOM_STATE)

    grid = GridSearchCV(
        estimator=rf_pipe,
        param_grid=param_grid,
        scoring="f1",
        cv=cv,
        n_jobs=-1,
        verbose=1,
    )

    print("\nOptimizando Random Forest con GridSearchCV...")
    grid.fit(X_train, y_train)
    print(f"Mejores hiperparámetros: {grid.best_params_}")
    print(f"Mejor F1 promedio CV: {grid.best_score_:.4f}")

    return grid.best_estimator_, grid.best_params_, grid.best_score_


def evaluate_model(model_name: str, model, X_test, y_test) -> dict:
    """Evalúa un modelo y devuelve métricas principales."""
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


def save_evaluation_plots(best_model, X_test, y_test):
    """Guarda matriz de confusión, curva ROC y Precision-Recall."""
    y_pred = best_model.predict(X_test)
    y_score = best_model.predict_proba(X_test)[:, 1]

    # Matriz de confusión
    cm = confusion_matrix(y_test, y_pred)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=["No DD", "Direct Debit"])
    disp.plot(values_format="d")
    plt.title("Matriz de confusión - Direct Debit")
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "confusion_matrix.png"), dpi=200)
    plt.close()

    # ROC Curve
    RocCurveDisplay.from_predictions(y_test, y_score)
    plt.title("Curva ROC - Direct Debit")
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "roc_curve.png"), dpi=200)
    plt.close()

    # Precision-Recall Curve
    PrecisionRecallDisplay.from_predictions(y_test, y_score)
    plt.title("Curva Precision-Recall - Direct Debit")
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "precision_recall_curve.png"), dpi=200)
    plt.close()


def save_feature_importance(best_model, top_n: int = 25):
    """Guarda ranking de importancia de variables para el Random Forest."""
    rf = best_model.named_steps["model"]
    preprocessor = best_model.named_steps["preprocessor"]

    feature_names = get_feature_names(preprocessor)
    importances = rf.feature_importances_

    fi = pd.DataFrame({"feature": feature_names, "importance": importances})
    fi = fi.sort_values("importance", ascending=False).reset_index(drop=True)
    fi.to_csv(os.path.join(OUTPUT_DIR, "feature_importance.csv"), index=False)

    top_fi = fi.head(top_n).sort_values("importance", ascending=True)
    plt.figure(figsize=(10, max(6, top_n * 0.25)))
    plt.barh(top_fi["feature"], top_fi["importance"])
    plt.title(f"Top {top_n} variables más importantes")
    plt.xlabel("Importancia")
    plt.ylabel("Variable")
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "feature_importance_top.png"), dpi=200)
    plt.close()

    return fi


def export_predictions(best_model, X_test, y_test):
    """Exporta predicciones del conjunto de prueba."""
    probs = best_model.predict_proba(X_test)[:, 1]
    preds = best_model.predict(X_test)

    predictions = X_test.copy()
    predictions["actual_Is_direct_debit"] = y_test.values
    predictions["predicted_Is_direct_debit"] = preds
    predictions["probability_direct_debit"] = probs

    predictions.to_csv(os.path.join(OUTPUT_DIR, "test_predictions.csv"), index=False)
    return predictions


def export_business_candidates(best_model, df_clean: pd.DataFrame, X_all: pd.DataFrame, top_n: int = 500):
    """
    Exporta contratos candidatos para campaña:
      - No usan Direct Debit actualmente.
      - No son mensuales, porque los mensuales ya están obligados a Direct Debit según el caso.
      - Tienen alta probabilidad estimada de usar/adoptar Direct Debit.
    """
    probs = best_model.predict_proba(X_all)[:, 1]
    scored = df_clean.copy()
    scored["probability_direct_debit"] = probs

    mask = scored[TARGET_COL].eq(0)
    if "Payment_frequency" in scored.columns:
        mask &= ~scored["Payment_frequency"].astype(str).str.lower().eq("monthly")

    candidates = scored.loc[mask].copy()
    candidates = candidates.sort_values("probability_direct_debit", ascending=False).head(top_n)

    # Enmascara IDs antes de exportar para presentación.
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


def write_project_summary(metrics_df: pd.DataFrame, best_model_name: str, best_params: dict, fi: pd.DataFrame):
    """Genera un resumen ejecutivo en TXT para apoyar la presentación."""
    top_features = fi.head(10)[["feature", "importance"]].to_string(index=False)
    metrics_text = metrics_df.to_string(index=False)

    summary = f"""
Resumen ejecutivo - Allianz Direct Debit ML Project
Fecha de ejecución: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

1. Problema de negocio
El proyecto busca predecir qué contratos tienen mayor probabilidad de utilizar Direct Debit.
Esto permite priorizar campañas comerciales y operativas hacia contratos con mayor potencial,
sin realizar una campaña masiva costosa.

2. Modelo seleccionado
Modelo final: {best_model_name}
Justificación: Random Forest fue seleccionado porque funciona bien con datos tabulares mixtos
(categóricos y numéricos), captura relaciones no lineales, es robusto a valores extremos y ofrece
importancia de variables, lo cual ayuda a explicar los resultados a líderes técnicos y de negocio.

Mejores hiperparámetros:
{best_params}

3. Métricas de evaluación
{metrics_text}

Interpretación sugerida:
- Precision: de los contratos predichos como Direct Debit, qué proporción realmente lo son.
- Recall: de los contratos que realmente usan Direct Debit, qué proporción detectó el modelo.
- F1-score: balance entre precision y recall.
- ROC-AUC: capacidad general del modelo para separar contratos con y sin Direct Debit.

4. Variables más importantes
{top_features}

5. Recomendaciones
- Priorizar campañas en contratos no mensuales que aún no usan Direct Debit y tengan alta probabilidad estimada.
- Usar las variables de mayor importancia para personalizar mensajes comerciales por frecuencia de pago,
  producto, tipo de cliente, región y monto de prima.
- Monitorear desempeño después de la campaña: adopción real, tasa de contacto, conversiones y falsos positivos.
- Reentrenar el modelo periódicamente con datos nuevos para evitar degradación por cambios en comportamiento.
- Considerar datos adicionales en el futuro: historial de pagos, antigüedad del cliente, reclamaciones,
  interacciones comerciales y respuestas a campañas previas.

6. Archivos generados
- metrics_summary.csv
- feature_importance.csv
- feature_importance_top.png
- confusion_matrix.png
- roc_curve.png
- precision_recall_curve.png
- test_predictions.csv
- top_direct_debit_campaign_candidates.csv
- allianz_direct_debit_model.pkl
""".strip()

    with open(os.path.join(OUTPUT_DIR, "project_summary.txt"), "w", encoding="utf-8") as f:
        f.write(summary)


# =============================
# 4. Flujo principal del script
# =============================

def main():
    parser = argparse.ArgumentParser(description="Allianz Direct Debit supervised ML classification project")
    parser.add_argument("--input_file", default=DEFAULT_INPUT_FILE, help="Ruta al archivo Excel de Allianz")
    parser.add_argument("--sheet_name", default=DEFAULT_SHEET_NAME, help="Nombre de la hoja con datos")
    parser.add_argument("--sample_rows", type=int, default=None, help="Número opcional de filas para pruebas rápidas")
    parser.add_argument("--test_size", type=float, default=0.20, help="Proporción para test set")
    parser.add_argument("--skip_tuning", action="store_true", help="Usar Random Forest inicial sin GridSearchCV")
    args = parser.parse_args()

    print("\n=== Allianz Direct Debit ML Project ===")
    print(f"Archivo: {args.input_file}")
    print(f"Hoja: {args.sheet_name}")

    # 1) Cargar datos
    df = load_data(args.input_file, args.sheet_name, args.sample_rows)
    print(f"Datos cargados: {df.shape[0]:,} filas x {df.shape[1]:,} columnas")

    # 2) Limpieza y preparación
    df_clean = clean_and_engineer_features(df)
    X, y = split_features_target(df_clean)

    print("\nDistribución del target:")
    print(y.value_counts(normalize=True).rename("proportion"))
    print(y.value_counts().rename("count"))

    # 3) Split estratificado
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=args.test_size,
        stratify=y,
        random_state=RANDOM_STATE,
    )

    # 4) Preprocesamiento
    preprocessor = build_preprocessor(X_train)

    # 5) Entrenar modelos de referencia
    fitted_models = train_models(X_train, y_train, preprocessor)

    # 6) Tuning del modelo elegido
    if args.skip_tuning:
        best_model_name = "RandomForest_initial"
        best_model = fitted_models[best_model_name]
        best_params = "Tuning omitido por parámetro --skip_tuning"
        best_cv_score = np.nan
    else:
        best_model_name = "RandomForest_tuned"
        best_model, best_params, best_cv_score = tune_random_forest(X_train, y_train, preprocessor)
        fitted_models[best_model_name] = best_model

    # 7) Evaluación comparativa
    metrics = []
    for model_name, model in fitted_models.items():
        metrics.append(evaluate_model(model_name, model, X_test, y_test))

    metrics_df = pd.DataFrame(metrics).sort_values("f1_score", ascending=False)
    metrics_df.to_csv(os.path.join(OUTPUT_DIR, "metrics_summary.csv"), index=False)

    # 8) Visualizaciones del mejor modelo
    save_evaluation_plots(best_model, X_test, y_test)
    fi = save_feature_importance(best_model, top_n=25)

    # 9) Exportar predicciones y candidatos de campaña
    export_predictions(best_model, X_test, y_test)
    export_business_candidates(best_model, df_clean, X, top_n=500)

    # 10) Guardar modelo completo con preprocesamiento incluido
    joblib.dump(best_model, os.path.join(OUTPUT_DIR, "allianz_direct_debit_model.pkl"))

    # 11) Resumen ejecutivo
    write_project_summary(metrics_df, best_model_name, best_params, fi)

    print("\n=== Proceso terminado correctamente ===")
    print(f"Archivos generados en la carpeta: {OUTPUT_DIR}")
    print("Archivo principal para revisar: allianz_outputs/project_summary.txt")


if __name__ == "__main__":
    main()
