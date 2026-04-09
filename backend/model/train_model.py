# import pandas as pd
# import numpy as np
# from sklearn.ensemble import RandomForestClassifier
# import pickle
# import os

# # Create a robust, high-fidelity synthetic heart disease dataset
# np.random.seed(42)
# n_samples = 5000

# data = {
#     'age': np.random.randint(29, 77, n_samples),
#     'sex': np.random.choice([0, 1], n_samples),
#     'cp': np.random.choice([0, 1, 2, 3], n_samples, p=[0.4, 0.3, 0.2, 0.1]),
#     'trestbps': np.random.randint(94, 200, n_samples),
#     'chol': np.random.randint(126, 564, n_samples),
#     'fbs': np.random.choice([0, 1], n_samples, p=[0.85, 0.15]),
#     'restecg': np.random.choice([0, 1, 2], n_samples, p=[0.5, 0.4, 0.1]),
#     'thalach': np.random.randint(71, 202, n_samples),
#     'exang': np.random.choice([0, 1], n_samples, p=[0.7, 0.3]),
#     'oldpeak': np.random.uniform(0.0, 6.2, n_samples),
#     'slope': np.random.choice([0, 1, 2], n_samples, p=[0.4, 0.4, 0.2]),
#     'ca': np.random.choice([0, 1, 2, 3, 4], n_samples, p=[0.6, 0.2, 0.1, 0.05, 0.05]),
#     'thal': np.random.choice([0, 1, 2, 3], n_samples, p=[0.05, 0.4, 0.4, 0.15]),
#     'crl': np.random.randint(5, 45, n_samples),
# }

# df = pd.DataFrame(data)

# # Score based strictly on standard clinical diagnostic thresholds
# # When multiple high-risk factors combine, the likelihood of disease skyrockets
# risk_points = np.zeros(n_samples)

# risk_points += (df['age'] > 55).astype(int)
# risk_points += (df['cp'] >= 2).astype(int) * 2
# risk_points += (df['trestbps'] > 130).astype(int)
# risk_points += (df['chol'] > 240).astype(int)
# risk_points += (df['fbs'] == 1).astype(int) * 2
# risk_points += (df['restecg'] >= 1).astype(int)
# # Max HR risk: if thalach is < 70% of age-predicted max
# risk_points += (df['thalach'] < (n_samples * 0 + 220 - df['age']) * 0.7).astype(int) * 2
# risk_points += (df['exang'] == 1).astype(int) * 2
# risk_points += (df['oldpeak'] >= 2.0).astype(int) * 2
# risk_points += (df['slope'] == 1).astype(int) 
# risk_points += (df['ca'] >= 1).astype(int) * 2
# risk_points += (df['thal'] >= 2).astype(int) * 2
# risk_points += ((df['crl'] > 20) & (df['crl'] <= 30)).astype(int) * 1 # Moderate CRL Risk
# risk_points += (df['crl'] > 30).astype(int) * 3 # High CRL Risk

# # Anyone with 6 or more risk points is classified as diseased
# df['target'] = (risk_points >= 6).astype(int)

# X = df.drop('target', axis=1)
# y = df['target']

# # Train Random Forest
# print("Training Random Forest Classifier on 14 attributes...")
# model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
# model.fit(X, y)
# print(f"Training accuracy: {model.score(X, y):.4f}")

# # Save the trained model
# os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
# model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'heart_model.pkl')

# with open(model_path, 'wb') as f:
#     pickle.dump(model, f)

# print(f"Model successfully saved to {model_path}")

import pandas as pd
import numpy as np
import pickle

from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score

# ===============================
# 1️⃣ Load Dataset
# ===============================
df = pd.read_csv("heart.csv")

print("Initial Shape:", df.shape)

# ===============================
# 2️⃣ Data Cleaning
# ===============================
df.drop_duplicates(inplace=True)

# Fill missing values (if any)
df.fillna(df.median(numeric_only=True), inplace=True)

print("After Cleaning:", df.shape)

# ===============================
# 3️⃣ Features & Target
# ===============================
X = df.drop("target", axis=1)
y = df["target"]

# ===============================
# 4️⃣ Train-Test Split
# ===============================
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    stratify=y,
    random_state=42
)

# ===============================
# 5️⃣ Pipeline
# ===============================
pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("rf", RandomForestClassifier(random_state=42))
])

# ===============================
# 6️⃣ Hyperparameter Tuning
# ===============================
param_grid = {
    "rf__n_estimators": [200, 300],
    "rf__max_depth": [6, 8, 10],
    "rf__min_samples_split": [2, 5, 10],
    "rf__min_samples_leaf": [1, 2, 4],
    "rf__max_features": ["sqrt", "log2"]
}

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

grid = GridSearchCV(
    pipeline,
    param_grid,
    cv=cv,
    scoring="roc_auc",
    n_jobs=-1,
    verbose=2
)

# ===============================
# 7️⃣ Train Model
# ===============================
print("\n🔄 Training model with cross-validation...")
grid.fit(X_train, y_train)

best_model = grid.best_estimator_

print("\n✅ Best Parameters:")
print(grid.best_params_)

# ===============================
# 8️⃣ Evaluate Model
# ===============================
y_pred = best_model.predict(X_test)
y_prob = best_model.predict_proba(X_test)[:, 1]

accuracy = accuracy_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_prob)

print("\n📊 Model Performance")
print("Accuracy:", round(accuracy * 100, 2), "%")
print("ROC-AUC:", round(roc_auc, 4))

print("\n📊 Classification Report:")
print(classification_report(y_test, y_pred))

print("\n📊 Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# ===============================
# 9️⃣ Cross-validation Score
# ===============================
print("\n📊 Best Cross-validation ROC-AUC:", grid.best_score_)

# ===============================
# 🔟 Feature Importance
# ===============================
importances = best_model.named_steps['rf'].feature_importances_
features = X.columns

importance_df = pd.DataFrame({
    "Feature": features,
    "Importance": importances
}).sort_values(by="Importance", ascending=False)

print("\n📊 Feature Importance:")
print(importance_df)

# ===============================
# 1️⃣1️⃣ Save Model
# ===============================
with open("heart_model.pkl", "wb") as f:
    pickle.dump(best_model, f)

print("\n💾 Model saved as heart_model.pkl")