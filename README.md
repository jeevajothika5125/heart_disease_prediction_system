# ❤️ Heart Disease Prediction System

An AI-powered full-stack web application that predicts the risk of heart disease based on patient clinical data using Machine Learning.

---

## 🚀 Overview

This project combines **Machine Learning + Full Stack Development** to provide an intelligent system that:

* Predicts heart disease risk using clinical parameters
* Displays results through an interactive dashboard
* Supports user authentication
* Enables real-time prediction via API integration

---

## 🧠 Tech Stack

### 🎨 Frontend

* React (Vite)
* Tailwind CSS
* Axios

### ⚙️ Backend

* FastAPI (Python)
* JWT Authentication
* REST APIs

### 🤖 AI Engine

* Scikit-learn
* Random Forest Classifier
* Pandas, NumPy
* Joblib (model persistence)

---

## 📊 Features

* 🔐 User Authentication (Login/Register)
* 📈 Heart Disease Risk Prediction
* 📊 Risk Score Visualization Dashboard
* 🤖 Machine Learning Integration
* ⚡ Real-time API Communication
* 🧾 Clean and Modular Architecture

---


---

## ⚙️ Installation & Setup

### 🔹 1. Clone Repository

```
git clone https://github.com/your-username/heart_disease_prediction_system.git
cd heart_disease_prediction_system
```

---

### 🔹 2. Backend Setup (FastAPI)

```
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

API Docs:

```
http://127.0.0.1:8000/docs
```

---

### 🔹 3. Frontend Setup (React)

```
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 🤖 Model Training

To retrain the ML model:

```
cd backend/model
python train_model.py
```

---

## 📡 API Endpoints

| Method | Endpoint  | Description                |
| ------ | --------- | -------------------------- |
| POST   | /predict  | Predict heart disease risk |
| POST   | /login    | User login                 |
| POST   | /register | User registration          |

---

## 📈 Prediction Output

* Risk Score (0–100%)
* Risk Category:

  * Low Risk
  * High Risk

---

## 🔐 Authentication

* JWT-based authentication
* Token stored in localStorage
* Secured API access

---

## ⚠️ Important Notes

* Model file (`.pkl`) is not included for size/security reasons
* Use `.gitignore` to exclude unnecessary files
* Dataset used for training: `heart.csv`

---

## 🌟 Future Enhancements

* 📊 Advanced Data Visualization (charts, trends)
* 📩 Email Alerts & Health Recommendations
* 🧠 Explainable AI (SHAP)
* ☁️ Deployment (Vercel + Render)
* 📱 Mobile Responsive UI

---

## 👩‍💻 Author

** Jeevajothika D**
** Pre-Final Year Student**
** Department of AIDS**

---

## 📜 License

This project is for academic and educational purposes.

---

## 💡 Final Note

This project demonstrates the integration of **AI with full-stack development** to solve real-world healthcare problems.

---
