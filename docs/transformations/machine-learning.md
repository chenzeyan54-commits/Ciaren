---
title: Machine Learning Nodes
description: Reference overview for Ciaren's machine learning nodes — split, feature engineering, model definitions, training, prediction, evaluation, and cross-validation.
search: ml machine learning train predict evaluate split scale encode pca feature importance cross validate
layout: doc
---

# Machine Learning Nodes

These nodes appear under **Machine Learning** in the palette by default — a
plain `pip install ciaren` already includes scikit-learn and MLflow. See the
[ML Quick Start](../guide/ml-quickstart.md) for an end-to-end walkthrough.

All ML nodes run on scikit-learn (with optional XGBoost / LightGBM via
`pip install "ciaren[ml]"`) and convert to pandas at the model boundary, so
they work whether the flow's engine is polars or pandas.

<FlowPipeline
  :nodes='[
    {"type":"input","label":"File Input","detail":"dataset with target"},
    {"type":"ml","label":"Train / Test Split","detail":"seed + stratify"},
    {"type":"ml","label":"Scale Features","detail":"normalize numerics"},
    {"type":"ml","label":"Train Classifier","detail":"model → MLflow"},
    {"type":"ml","label":"Predict","detail":"test data + model wire"},
    {"type":"ml","label":"Evaluate","detail":"accuracy · AUC · F1"},
    {"type":"output","label":"File Output","detail":"metrics table"}
  ]'
/>

## Individual Node References

Each machine learning node has its own reference page documenting configuration, generated Python code, guardrails, and tips:

### Data Preparation & Feature Engineering

- **[Train / Test Split](./train-test-split.md)** (`trainTestSplit`) — Splits incoming rows into training and test partitions.
- **[Scale Features](./scale-features.md)** (`scaleFeatures`) — Standardizes, min-max normalizes, or robust-scales numeric features.
- **[Encode Categories](./encode-categories.md)** (`encodeCategories`) — One-hot or ordinal encodes categorical columns.
- **[Select Features](./select-features.md)** (`selectFeatures`) — Feature selection via variance threshold, correlation filtering, or SelectKBest.
- **[Reduce Dimensions](./reduce-dimensions.md)** (`reduceDimensions`) — Dimensionality reduction via Principal Component Analysis (PCA).

### Model Training

- **[Train Classifier](./train-classifier.md)** (`mlTrainClassifier`) — Trains classification algorithms (Logistic Regression, Random Forest, XGBoost, LightGBM, SVM, KNN) and logs to MLflow.
- **[Train Regressor](./train-regressor.md)** (`mlTrainRegressor`) — Trains regression models (Linear, Ridge, Lasso, Random Forest, SVR, XGBoost, LightGBM) and logs to MLflow.
- **[Train Clustering](./train-clustering.md)** (`mlTrainClustering`) — Fits clustering algorithms (K-Means, DBSCAN, Agglomerative) and logs to MLflow.
- **[Train Forecaster](./train-forecaster.md)** (`mlTrainForecaster`) — Fits time-series forecasting models.
- **[Train Dim. Reduction](./train-dim-reduction.md)** (`mlTrainDimReduction`) — Fits dimensionality reduction models (PCA) and logs to MLflow.

### Model Definitions (Unfitted)

- **[Classifier Model](./classifier-model.md)** (`mlClassifierModel`) — Configures an unfitted classification model reference for cross-validation.
- **[Regressor Model](./regressor-model.md)** (`mlRegressorModel`) — Configures an unfitted regression model reference for cross-validation.

### Inference, Evaluation & Interpretability

- **[Predict](./predict.md)** (`mlPredict`) — Generates predictions using a wired model or MLflow model URI.
- **[Evaluate](./evaluate.md)** (`mlEvaluate`) — Computes metrics (classification, regression, or clustering) and returns a tidy metrics table.
- **[Feature Importance](./feature-importance.md)** (`featureImportance`) — Extracts feature importance scores and rankings from trained tree and linear models.
- **[Cross-Validate](./cross-validate.md)** (`mlCrossValidate`) — Evaluates generalization across resampling folds using unfitted model definitions.

---

## What Evaluate produces

<DataTransform
  transform="Evaluate (task=classification, prediction_column=prediction)"
  :before='{
    "columns":["customer_id","churn","prediction"],
    "rows":[[1,1,1],[2,0,0],[3,0,1]]
  }'
  :after='{
    "columns":["metric","value"],
    "rows":[["accuracy",0.6667],["precision",0.5],["recall",1.0],["f1",0.6667]]
  }'
/>

## Model definition nodes vs. Train nodes

**Classifier Model** and **Regressor Model** configure an estimator without
fitting it, logging it, registering it, or producing predictions. Their `model`
output is a **model configuration reference**: it carries the algorithm, target,
feature columns, hyperparameters, and preprocessing recipe that another node can
use later.

Use these nodes with **Cross-Validate**. Cross-validation needs to fit one fresh
clone of the estimator per fold, with preprocessing refit inside each fold. If a
flow used a Train node as the input to Cross-Validate, it would first train a
final full-data model and then train the fold models too. Ciaren avoids that
ambiguous and wasteful pattern by accepting only **Classifier Model** or
**Regressor Model** on Cross-Validate's `model` input.

| Goal | Use | Why |
| --- | --- | --- |
| Estimate generalization or compare settings | **Classifier/Regressor Model → Cross-Validate** | Cross-Validate owns the fold fitting loop and returns fold scores. |
| Produce the final artifact for scoring or registration | **Train Classifier/Regressor → Predict / Feature Importance / Register Model** | Train nodes fit once on their input data and log the trained model to MLflow. |
| Do both evaluation and deployment | First evaluate with **Model → Cross-Validate**, then train the chosen setup with **Train** | Keeps evaluation separate from the final artifact so users know exactly what was fitted. |

## See also

- [ML Quick Start](../guide/ml-quickstart.md)
- [Scheduling](../guide/scheduling.md) — periodic retraining
- [All transformations](./overview.md)