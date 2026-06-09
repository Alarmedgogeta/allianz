# Allianz Predict Direct Debit — Study Case Instructions for Building a Supervised ML Notebook

## Purpose of this document

Use this Markdown file as the **context and instruction prompt** for later creating a complete Jupyter Notebook (`.ipynb`) for the Allianz Predict Direct Debit case.

The notebook must simulate that we are part of the **Data Analyst / Data Office team at Allianz Benelux**. The objective is to design and implement a supervised machine learning project that predicts whether an insurance contract is paid through **direct debit**. The final notebook should be written as a professional academic/business analytics case, with enough explanation for a technical leader and a business leader to understand the logic, results, and recommendations.

The notebook must follow the same style and structure as the attached Titanic example notebook: clear markdown sections, commented Python code, exploratory analysis, preprocessing, model training, evaluation, comparison, interpretation, and final conclusions.

---

## 1. Business Context

Allianz is a multinational insurance and financial services company. In this case, Allianz Benelux wants to increase the percentage of insurance contracts paid through **direct debit**.

Direct debit is valuable because it allows Allianz to collect premium payments automatically and more predictably. This can improve the company’s cash flow, reduce administrative workload, lower the risk of late payments, and help shorten the cash conversion cycle. From the client perspective, direct debit is also convenient because payments are automatic, punctual, and easier to plan.

The business issue is that Allianz has a relatively low adoption of direct debit compared with the market average. The case indicates that direct debit is used in approximately **65% of insurance contracts on average**, but only around **21% of Allianz contracts** are paid through direct debit.

Because a campaign targeting every customer would be expensive and inefficient, the Data Office team must create a data-driven strategy to identify the contracts or customer profiles with the highest probability of adopting or already using direct debit. This predictive model can help Allianz prioritize customers, brokers, regions, and product segments for future campaigns.

---

## 2. Main Business Problem

### Problem statement

Allianz wants to predict whether an insurance contract uses direct debit based on contract, customer, broker, and product characteristics.

The notebook should frame the problem as a **binary supervised classification problem**:

- Target variable: `Is_direct_debit`
- Class `1`: The contract uses direct debit.
- Class `0`: The contract does not use direct debit.

### Business question

> Which customers, brokers, products, and contract characteristics are associated with the use of direct debit, and how can Allianz use a predictive model to prioritize future direct debit adoption campaigns?

### Business impact

The notebook must explain that improving direct debit adoption can help Allianz:

- Improve predictability of cash inflows.
- Reduce manual collection and administrative costs.
- Reduce late or missed payments.
- Improve working capital management.
- Shorten the accounts receivable period within the cash conversion cycle.
- Identify customer and broker segments that should be targeted first.
- Support data-driven decision-making for finance, sales, broker management, and marketing teams.

---

## 3. Project Objective

The objective of the notebook is to apply supervised machine learning to the Allianz case in order to:

1. Understand the structure and quality of the dataset.
2. Clean and prepare the data for classification.
3. Explore patterns related to direct debit usage.
4. Train multiple classification models.
5. Compare the models using appropriate metrics.
6. Select the best model for the business problem.
7. Interpret the most relevant variables.
8. Generate recommendations for Allianz management.

The notebook must be written as if we are presenting a real internal analytics project to Allianz’s technical and business leaders.

---

## 4. Methodology: CRISP-DM Structure

The notebook should explicitly follow the CRISP-DM methodology because the Allianz case mentions that the Data Office team uses this framework.

The notebook should include these phases:

1. **Business Understanding**
   - Explain the direct debit adoption problem.
   - Explain why the problem matters for Allianz.
   - Define the target variable and business goal.

2. **Data Understanding**
   - Load the dataset.
   - Review columns, data types, missing values, duplicates, and distributions.
   - Understand the contract, customer, broker, and product levels.

3. **Data Preparation**
   - Clean missing values.
   - Encode categorical variables.
   - Scale numerical variables when required.
   - Remove or handle columns that should not be used as direct predictors.
   - Split data into training and testing sets.

4. **Modeling**
   - Train multiple supervised classification models:
     - Decision Tree
     - Random Forest
     - Logistic Regression
     - Support Vector Machine
     - XGBoost, if available
   - Use consistent preprocessing across models.

5. **Evaluation**
   - Compare models using classification metrics.
   - Analyze confusion matrices.
   - Discuss trade-offs between precision, recall, F1-score, and business usefulness.
   - Select the best model.

6. **Deployment / Business Recommendations**
   - Explain how Allianz could use the model in practice.
   - Recommend target segments or operational actions.
   - Explain limitations and future improvements.

---

## 5. Dataset Context

The dataset should represent insurance contracts from Allianz property and casualty claims in Belgium. Each row represents one contract.

The data is structured across three business levels:

1. **Contract / product level**
   - Product type
   - Line of business
   - Annual premium
   - Payment frequency
   - Customer segment
   - Direct debit flag

2. **Customer level**
   - Customer ID
   - Customer age group
   - Customer type
   - Customer urbanization
   - Customer region
   - Customer province

3. **Broker level**
   - Broker account number
   - Broker urbanization
   - Broker region
   - Broker province
   - Broker combined ratio

The notebook must explain that the data is at the **contract level**, so one customer can have more than one contract.

---

## 6. Expected Dataset Columns

The notebook should expect a dataset with columns similar to the following:

| Column | Type | Meaning |
|---|---:|---|
| `Broker_account_number` | categorical / object | Broker identifier |
| `Contract_number` | categorical / object | Contract identifier |
| `Customer_segment` | categorical / object | Contract segment such as Retail, SME, or Midcorp |
| `Line_of_business` | categorical / object | Insurance line of business |
| `Product_type` | categorical / object | Product-specific category |
| `Annual_premium` | float | Annual premium charged for the contract |
| `Payment_frequency` | categorical / object | Payment frequency of the insurance premium |
| `Customer_ID` | integer / object | Customer identifier |
| `Customer_age` | categorical / object | Customer age bucket; enterprises may appear as `No age` |
| `Customer_type` | categorical / object | Physical person or enterprise |
| `Customer_urbanization` | categorical / object | Urban or rural zone for the customer |
| `Customer_region` | categorical / object | Customer region in Belgium |
| `Customer_province` | categorical / object | Customer province in Belgium |
| `Broker_urbanization` | categorical / object | Urban or rural zone for the broker |
| `Broker_region` | categorical / object | Broker region in Belgium |
| `Broker_province` | categorical / object | Broker province in Belgium |
| `Is_direct_debit` | integer | Target variable: 0 = no direct debit, 1 = direct debit |
| `Broker_cor` | float | Broker combined ratio; lower values indicate better profitability |

If the real dataset is not available, the notebook may use a simulated dataset that follows this same structure. If a simulated dataset is used, the notebook must clearly state that the data is simulated based on the Allianz case context.

---

## 7. Notebook Structure Required

The generated notebook should follow this structure.

### 0. Title and Executive Summary

Start with a markdown cell containing:

```markdown
# Allianz Predict Direct Debit with Machine Learning

**Role:** Data Analyst Team — Allianz Data Office  
**Project type:** Supervised Machine Learning Classification  
**Business goal:** Predict direct debit usage and identify priority segments for adoption campaigns.
```

Include a short executive summary explaining:

- What problem is being solved.
- Why it matters to Allianz.
- What machine learning approach will be used.
- What the final output will be.

---

### 1. Import Libraries

The notebook should import libraries for:

- Data manipulation: `pandas`, `numpy`
- Visualization: `matplotlib.pyplot`, `seaborn`
- Data splitting and preprocessing:
  - `train_test_split`
  - `ColumnTransformer`
  - `Pipeline`
  - `OneHotEncoder`
  - `StandardScaler`
  - `SimpleImputer`
- Models:
  - `DecisionTreeClassifier`
  - `RandomForestClassifier`
  - `LogisticRegression`
  - `SVC`
  - `XGBClassifier` from `xgboost`, if installed
- Metrics:
  - `accuracy_score`
  - `precision_score`
  - `recall_score`
  - `f1_score`
  - `classification_report`
  - `confusion_matrix`
  - `roc_auc_score`
  - `roc_curve`
- Model persistence:
  - `joblib`

Important: If `xgboost` is not installed, the notebook should either:
1. Include a commented installation instruction, or
2. Use `GradientBoostingClassifier` from scikit-learn as a fallback.

---

### 2. Load the Dataset

Add a section for loading the dataset. The filename can be flexible, but use a clear placeholder such as:

```python
df = pd.read_csv("data/allianz_direct_debit.csv")
```

If no dataset exists, include an optional section that simulates the dataset based on the expected columns.

The notebook must show:

```python
df.head()
df.info()
df.shape
```

---

### 3. Data Understanding and Exploratory Data Analysis

This section should include:

#### 3.1 General dataset overview

Show:

- Number of rows and columns.
- Data types.
- Missing values per column.
- Percentage of missing values.
- Number of duplicate rows.
- Number of unique customers, contracts, and brokers.

Suggested code outputs:

```python
df.isnull().sum()
(df.isnull().sum() / len(df) * 100).round(2)
df.duplicated().sum()
df.nunique()
```

#### 3.2 Target variable distribution

Analyze `Is_direct_debit`:

- Count of contracts with and without direct debit.
- Percentage of direct debit usage.
- Bar chart of the target variable.

Explain whether the dataset is imbalanced. Since the case says Allianz direct debit adoption is low, the notebook should expect possible class imbalance.

#### 3.3 Categorical variable analysis

Create count plots or percentage tables for direct debit usage by:

- `Customer_segment`
- `Line_of_business`
- `Product_type`
- `Payment_frequency`
- `Customer_age`
- `Customer_type`
- `Customer_region`
- `Customer_province`
- `Broker_region`
- `Broker_province`
- `Customer_urbanization`
- `Broker_urbanization`

The analysis should identify which categories have higher and lower direct debit usage.

#### 3.4 Numerical variable analysis

Analyze:

- `Annual_premium`
- `Broker_cor`

Use:

- Descriptive statistics.
- Histograms.
- Boxplots comparing direct debit vs non-direct debit.
- Optional log transformation for `Annual_premium` if skewed.

#### 3.5 Business observations from EDA

Include a markdown cell summarizing observations, for example:

- Whether monthly payment frequency is strongly related to direct debit.
- Whether certain customer segments have higher adoption.
- Whether broker location or broker profitability is associated with payment method.
- Whether enterprise customers behave differently from physical persons.
- Whether certain product types have lower adoption and represent opportunities.

Avoid inventing exact results. The notebook should generate observations based on the actual dataset outputs.

---

### 4. Data Preparation

This section should be very detailed because it is worth a large part of the rubric.

#### 4.1 Define target and features

Set:

```python
target = "Is_direct_debit"
```

Potential identifiers to exclude from modeling:

- `Contract_number`
- `Customer_ID`
- `Broker_account_number`

These identifiers should usually be removed as direct predictors because they are unique IDs and may cause memorization instead of generalization. However, the notebook can still use them for aggregation or reporting.

#### 4.2 Handle missing values

Use appropriate strategies:

- For categorical columns: impute with `"Unknown"` or the mode.
- For numerical columns: impute with median.
- For `Customer_age`, keep `"No age"` as a valid category because it indicates an enterprise customer.
- For `Broker_cor`, impute with median if missing.

Explain every decision.

#### 4.3 Handle duplicates

Check for duplicated records and remove them only if they are exact duplicates.

#### 4.4 Feature engineering

Create optional but useful features:

- `Premium_log`: log transformation of `Annual_premium` using `np.log1p`.
- `Is_enterprise`: 1 if `Customer_type` is enterprise, otherwise 0.
- `Customer_Broker_same_region`: 1 if customer and broker region are the same, otherwise 0.
- `Customer_Broker_same_province`: 1 if customer and broker province are the same, otherwise 0.
- `Broker_profitable`: 1 if `Broker_cor < 100`, otherwise 0.
- `Is_monthly_payment`: 1 if `Payment_frequency` indicates monthly payment, otherwise 0.

Important: The case notes that Allianz obliges monthly payment contracts to use direct debit. Therefore, the notebook must discuss whether `Payment_frequency` could create data leakage or an overly obvious rule. The notebook should run at least one of these strategies:

- **Strategy A:** Include `Payment_frequency` and explain that it is highly predictive but may reflect a business rule.
- **Strategy B:** Train an alternative model excluding `Payment_frequency` to understand customer and broker drivers beyond the mandatory monthly payment rule.

The notebook should preferably compare both strategies if time allows.

#### 4.5 Encode categorical variables

Use a preprocessing pipeline:

- `OneHotEncoder(handle_unknown="ignore")` for categorical variables.
- `StandardScaler()` for numerical variables when required.

Tree-based models do not require scaling, but Logistic Regression and SVM benefit from scaling. The cleanest approach is to use a `ColumnTransformer` inside pipelines.

#### 4.6 Train-test split

Use:

```python
train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)
```

Use `stratify=y` to preserve the class distribution.

#### 4.7 Class imbalance handling

Since direct debit adoption may be low, evaluate class imbalance. Possible methods:

- Use `class_weight="balanced"` for Logistic Regression, Decision Tree, Random Forest, and SVM.
- Optionally use oversampling on the training set only.
- Do not apply oversampling before the train-test split.

The notebook should explain why recall and F1-score may be more useful than accuracy if the target class is imbalanced.

---

### 5. Model Selection and Justification

The notebook must test the following models.

#### 5.1 Decision Tree

Use:

```python
DecisionTreeClassifier(
    max_depth=5,
    min_samples_leaf=20,
    class_weight="balanced",
    random_state=42
)
```

Justification:

- Easy to interpret.
- Useful for explaining business rules.
- Helps identify variables that split customers into direct debit vs non-direct debit groups.

Potential weakness:

- Can overfit if not limited by depth or minimum samples.

#### 5.2 Random Forest

Use:

```python
RandomForestClassifier(
    n_estimators=200,
    max_depth=None,
    min_samples_leaf=10,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1
)
```

Justification:

- Usually stronger predictive performance than a single tree.
- Reduces overfitting by averaging many trees.
- Provides feature importance for business interpretation.

Potential weakness:

- Less interpretable than a single decision tree.

#### 5.3 Logistic Regression

Use:

```python
LogisticRegression(
    max_iter=1000,
    class_weight="balanced",
    random_state=42
)
```

Justification:

- Good baseline model.
- Interpretable coefficients.
- Useful to understand direction of relationships between features and probability of direct debit.

Potential weakness:

- Assumes mostly linear relationships.
- May underperform if relationships are complex.

#### 5.4 Support Vector Machine

Use:

```python
SVC(
    kernel="rbf",
    C=1.0,
    gamma="scale",
    class_weight="balanced",
    probability=True,
    random_state=42
)
```

Justification:

- Can capture non-linear decision boundaries.
- Useful to test whether complex separation improves results.

Potential weakness:

- Less interpretable.
- Can be slower on large datasets.
- Requires scaled data.

#### 5.5 XGBoost

Use if the library is available:

```python
XGBClassifier(
    n_estimators=300,
    learning_rate=0.05,
    max_depth=4,
    subsample=0.8,
    colsample_bytree=0.8,
    eval_metric="logloss",
    random_state=42
)
```

If the target is imbalanced, calculate `scale_pos_weight`:

```python
scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()
```

Then pass it to the model.

Justification:

- Strong gradient boosting model.
- Often performs well on tabular business data.
- Captures non-linear relationships and interactions.

Potential weakness:

- Requires more tuning.
- Less explainable than Logistic Regression or Decision Tree unless feature importance or SHAP is used.

Important note: The user mentioned “support vector machines (xg boost)”. In the notebook, treat SVM and XGBoost as separate models because they are different algorithms.

---

### 6. Training Approach

Use pipelines to keep preprocessing consistent.

Recommended structure:

```python
models = {
    "Decision Tree": DecisionTreeClassifier(...),
    "Random Forest": RandomForestClassifier(...),
    "Logistic Regression": LogisticRegression(...),
    "Support Vector Machine": SVC(...),
    "XGBoost": XGBClassifier(...)
}
```

For each model:

1. Build a pipeline with preprocessing and classifier.
2. Train the model on `X_train`, `y_train`.
3. Predict on `X_test`.
4. Calculate metrics.
5. Store results in a comparison table.

---

## 7. Evaluation Metrics

The notebook must calculate and explain:

- **Accuracy:** Overall percentage of correct predictions.
- **Precision:** Of predicted direct debit contracts, how many were actually direct debit.
- **Recall:** Of actual direct debit contracts, how many were correctly identified.
- **F1-score:** Balance between precision and recall.
- **ROC-AUC:** Ability of the model to rank direct debit vs non-direct debit contracts.
- **Confusion matrix:** Show false positives and false negatives.

Business interpretation:

- A **false positive** means Allianz may target a customer who is unlikely to use direct debit. This wastes campaign resources.
- A **false negative** means Allianz misses a customer who may have been a good candidate for direct debit adoption. This represents missed business opportunity.
- If the campaign cost is low, prioritize **recall**.
- If the campaign cost is high or broker attention is limited, prioritize **precision**.
- If both matter, prioritize **F1-score** and ROC-AUC.

The notebook should include a results table like:

| Model | Accuracy | Precision | Recall | F1-score | ROC-AUC |
|---|---:|---:|---:|---:|---:|
| Decision Tree | calculated | calculated | calculated | calculated | calculated |
| Random Forest | calculated | calculated | calculated | calculated | calculated |
| Logistic Regression | calculated | calculated | calculated | calculated | calculated |
| Support Vector Machine | calculated | calculated | calculated | calculated | calculated |
| XGBoost | calculated | calculated | calculated | calculated | calculated |

---

## 8. Visualizations Required

The notebook should include the following visualizations:

1. Target distribution: direct debit vs non-direct debit.
2. Direct debit percentage by customer segment.
3. Direct debit percentage by payment frequency.
4. Direct debit percentage by customer type.
5. Direct debit percentage by customer region.
6. Direct debit percentage by broker region.
7. Distribution of annual premium by direct debit status.
8. Distribution of broker combined ratio by direct debit status.
9. Confusion matrix for each model.
10. Model comparison bar chart for F1-score and/or ROC-AUC.
11. Feature importance for tree-based models.
12. Optional ROC curves for all models.

Use clear titles and axis labels. Each chart should include a short markdown interpretation.

---

## 9. Model Interpretation

After selecting the best model, the notebook must interpret the most important drivers.

For tree-based models:

```python
model.named_steps["classifier"].feature_importances_
```

For Logistic Regression:

```python
model.named_steps["classifier"].coef_
```

The notebook should translate technical findings into business language.

Example interpretation format:

- If `Payment_frequency_Monthly` is the strongest predictor, explain the business rule and possible leakage.
- If `Customer_segment_Retail` is important, explain that retail customers may behave differently than SMEs or Midcorp clients.
- If `Broker_region` or `Broker_cor` is important, explain that broker behavior may influence payment method adoption.
- If `Annual_premium` is important, explain whether premium size may affect willingness to use automatic payments.
- If `Customer_type_Enterprise` is important, explain the difference between physical persons and business customers.

---

## 10. Recommended Final Model Selection

The notebook should not assume the winning model before running the data. However, it should follow this decision logic:

- If Random Forest or XGBoost obtains the best F1-score and ROC-AUC, recommend it as the operational model.
- If the Decision Tree is close in performance, recommend it as an explainable model for business workshops.
- If Logistic Regression performs similarly to complex models, recommend it because it is simpler and easier to explain.
- If SVM performs well but is hard to interpret, mention that it may be less useful for management decision-making unless prediction performance is the only priority.

The final recommendation should balance:

- Predictive performance.
- Interpretability.
- Business usefulness.
- Ease of deployment.
- Campaign targeting needs.

---

## 11. Business Recommendations

The final notebook must include a section written as if presenting to Allianz management.

Recommended structure:

### Recommendation 1: Prioritize high-probability contracts

Use the selected model to score contracts without direct debit and rank them by predicted probability.

Example:

```python
non_dd_contracts = df[df["Is_direct_debit"] == 0].copy()
non_dd_contracts["direct_debit_probability"] = best_model.predict_proba(non_dd_contracts[features])[:, 1]
top_targets = non_dd_contracts.sort_values("direct_debit_probability", ascending=False).head(100)
```

Explain that Allianz can start with the top-ranked contracts instead of targeting all customers.

### Recommendation 2: Segment campaigns by customer and product profile

Use EDA and feature importance to identify segments with high potential.

Examples:

- Specific customer segments.
- Product types.
- Regions or provinces.
- Broker groups.
- Customer types.

### Recommendation 3: Work with brokers

If broker-related variables are important, recommend broker-specific actions:

- Train brokers with low direct debit conversion.
- Share dashboards with broker-level adoption rates.
- Incentivize brokers who improve direct debit adoption.

### Recommendation 4: Validate the monthly payment rule

If `Payment_frequency` dominates the model, recommend building a second model excluding it so Allianz can identify deeper behavioral drivers beyond mandatory monthly contracts.

### Recommendation 5: Pilot campaign and measure results

Recommend a pilot:

- Select top predicted customers without direct debit.
- Contact them with a targeted campaign.
- Track conversion rate.
- Compare against a control group.
- Use results to retrain and improve the model.

---

## 12. Code Commenting Requirements

The generated notebook must include comments in code explaining:

- Why libraries are imported.
- How the dataset is loaded.
- Why missing values are handled in specific ways.
- Why categorical variables are encoded.
- Why train-test split uses stratification.
- Why each model is selected.
- What each evaluation metric means.
- How to interpret confusion matrices.
- How the selected model supports business action.

The code should be easy for a professor, teammate, or business analyst to follow.

---

## 13. Academic Rubric Alignment

The notebook must clearly satisfy the project rubric.

### Selection of the Problem — 15 pts

The notebook must explain that the problem is highly relevant to Allianz because direct debit improves cash flow reliability, reduces administrative workload, and supports working capital management.

### Data Preparation — 20 pts

The notebook must show step-by-step preparation:

- Missing values.
- Duplicate validation.
- Data type validation.
- Feature engineering.
- Encoding.
- Scaling.
- Train-test split.
- Class imbalance strategy.

### Implementation and Evaluation — 25 pts

The notebook must implement and evaluate multiple classification models:

- Decision Tree
- Random Forest
- Logistic Regression
- Support Vector Machine
- XGBoost or fallback model

The notebook must compare results using accuracy, precision, recall, F1-score, ROC-AUC, classification report, and confusion matrix.

### Presentation — 25 pts

The notebook must contain business-friendly interpretation and final recommendations that could later be converted into slides.

It should include:

- Problem description and business impact.
- Model explanation and justification.
- Results and interpretation.
- Recommendations for Allianz.

### Commented Code — 15 pts

The notebook code must be clear, organized, and commented.

---

## 14. Suggested Notebook Sections

Use this exact outline when creating the `.ipynb` file:

1. **Title and Executive Summary**
2. **Business Understanding**
3. **Data Dictionary and Case Context**
4. **Import Libraries**
5. **Load Dataset**
6. **Initial Data Inspection**
7. **Exploratory Data Analysis**
   - Target variable distribution
   - Customer-level analysis
   - Broker-level analysis
   - Contract/product-level analysis
   - Numerical variable analysis
8. **Data Cleaning**
9. **Feature Engineering**
10. **Preprocessing Pipeline**
11. **Train-Test Split**
12. **Class Imbalance Review**
13. **Model 1: Decision Tree**
14. **Model 2: Random Forest**
15. **Model 3: Logistic Regression**
16. **Model 4: Support Vector Machine**
17. **Model 5: XGBoost**
18. **Model Comparison**
19. **Confusion Matrices**
20. **ROC-AUC and ROC Curves**
21. **Feature Importance and Interpretation**
22. **Selection of Final Model**
23. **Business Recommendations**
24. **Limitations**
25. **Next Steps**
26. **Final Conclusions**
27. **Optional: Save Model with Joblib**

---

## 15. Tone and Writing Style

The notebook should be written in a professional but understandable style.

Write as if the author is a member of Allianz’s data analytics team explaining the project internally.

Use first-person plural when appropriate:

- “We analyzed...”
- “We selected...”
- “We recommend...”

Avoid overly academic or generic explanations. Every section should connect back to the Allianz business problem.

---

## 16. Expected Final Conclusion

The notebook should end with a conclusion similar to this, but adapted to the actual results:

> This project shows how Allianz can use supervised machine learning to identify contracts and customer profiles that are more likely to use direct debit. By comparing several classification models, we can select a model that balances predictive performance and business interpretability. The model can support a targeted campaign strategy, helping Allianz increase direct debit adoption without contacting every customer. This approach can improve cash flow reliability, reduce collection complexity, and support better working capital management.

---

## 17. Important Constraints

- Do not claim exact model results before running the notebook.
- Do not invent dataset statistics unless they come from the actual dataset or a clearly marked simulation.
- If using simulated data, clearly label it as simulated.
- Avoid using identifiers such as `Contract_number`, `Customer_ID`, and `Broker_account_number` as direct predictors unless explicitly justified.
- Discuss possible leakage from `Payment_frequency`.
- Use stratified train-test split.
- Use class imbalance handling if needed.
- Compare all required models.
- Include business interpretation after technical evaluation.
- Make the notebook suitable for later conversion into a presentation.
