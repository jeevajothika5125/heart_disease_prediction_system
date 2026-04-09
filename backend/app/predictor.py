import pickle
import os
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'model', 'heart_model.pkl')

model = None

def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
    print(f"Model loaded: {model is not None}")

def predict(data):
    if model is None:
        load_model()
        
    features = np.array([[
        data.age, data.sex, data.cp, data.trestbps, data.chol, data.fbs, 
        data.restecg, data.thalach, data.exang, data.oldpeak, data.slope, 
        data.ca, data.thal, data.crl
    ]])
    
    # Get probabilities
    proba = model.predict_proba(features)[0]
    risk_score = proba[1] * 100  # Probability of class 1
    
    is_high_risk = risk_score > 50
    
    recommendations = []
    
    # Accurate, real-time lifestyle recommendations based on exact result
    if data.chol > 240:
        recommendations.append("Your cholesterol is elevated. Switch to a diet rich in Omega-3s and high soluble fiber to reduce LDL.")
    elif data.chol > 200:
        recommendations.append("Borderline high cholesterol. Consider cutting back on saturated and trans fats.")
        
    if data.trestbps > 130:
        recommendations.append("Elevated resting blood pressure detected. Limit daily sodium intake to under 1,500mg and manage stress.")
        
    if data.fbs == 1.0:
        recommendations.append("Fasting blood sugar is above 120 mg/dl. Minimize refined carbohydrates and added sugars.")
        
    if data.crl > 30:
        recommendations.append("CRITICAL: Delayed Cardiac Recovery Latency (>30s) detected. High likelihood of underlying issues.")
    elif data.crl > 20:
        recommendations.append("Moderate Cardiac Recovery Latency. Incorporate gentle Zone 2 cardio to improve heart vagal tone.")

    if data.thalach < 130 and data.age < 60:
        recommendations.append("Maximum heart rate achieved is lower than optimal for your age group. Engage in supervised interval training.")
        
    if data.cp > 0 and is_high_risk:
        recommendations.append("You reported angina-like chest pain with high overall risk. Consult a cardiologist immediately for a stress test.")

    # Fallbacks if metrics align perfectly
    if not recommendations:
        if is_high_risk:
            recommendations = [
                "Your overall profile indicates high risk despite normal generic markers.",
                "Schedule a comprehensive cardiovascular screening.",
                "Maintain a strictly controlled, heart-healthy lifestyle."
            ]
        else:
            recommendations = [
                "Your vitals are looking excellent.",
                "Maintain your current balanced diet and exercise regimen.",
                "Continue routine annual checkups."
            ]
            
    # Keep strictly top 4 priority recommendations
    recommendations = recommendations[:4]
        
    if data.crl > 30:
        crl_status = 'High Risk'
    elif data.crl > 20:
        crl_status = 'Moderate Risk'
    else:
        crl_status = 'Optimal / Low Risk'

    # Generate Structured Lifestyle Plan for Dashboard
    lifestyle_plan = {
        "nutrition": {
            "desc": "Maintain a balanced heart-healthy diet.",
            "status": "On Track",
            "badgeType": "success"
        },
        "exercise": {
             "desc": "150 mins zone 2 cardio per week.",
             "status": "On Track",
             "badgeType": "success"
        },
        "recovery": {
             "desc": "Aim for 7.5 hours of sleep minimum.",
             "status": "Improving",
             "badgeType": "primary"
        }
    }

    if data.chol > 200:
        lifestyle_plan["nutrition"] = {
            "desc": "High cholesterol. Prioritize Omega-3 rich foods and soluble fiber.",
            "status": "Priority",
            "badgeType": "warning"
        }
    if data.trestbps > 130:
        lifestyle_plan["nutrition"] = {
            "desc": "Elevated BP. Strictly limit sodium to under 1,500mg daily.",
            "status": "Priority",
            "badgeType": "warning"
        }
    if data.fbs == 1.0:
        lifestyle_plan["nutrition"] = {
            "desc": "High fasting blood sugar. Adopt a low-glycemic, low-sugar meal plan.",
            "status": "Priority",
            "badgeType": "warning"
        }
        
    if data.crl > 30:
        lifestyle_plan["exercise"] = {
             "desc": "High Risk CRL. Ensure strict supervision from a cardiologist before any routine.",
             "status": "Critical",
             "badgeType": "accent"
        }
    elif data.crl > 20:
        lifestyle_plan["exercise"] = {
             "desc": "Moderate CRL Risk. Begin steady-state endurance training under guidance.",
             "status": "Action Needed",
             "badgeType": "warning"
        }
    if data.thalach < 130 and data.age < 60:
        lifestyle_plan["exercise"] = {
             "desc": "Low Max HR capacity. Add supervised interval/HIIT training.",
             "status": "Action Needed",
             "badgeType": "warning"
        }
    
    if is_high_risk:
        lifestyle_plan["recovery"] = {
             "desc": "High overall strain. Ensure 8+ hours sleep and limit daily stress.",
             "status": "Critical",
             "badgeType": "accent"
        }
    elif data.cp > 0:
         lifestyle_plan["recovery"] = {
             "desc": "Chest exertion noted. Avoid strenuous workouts until cleared by doctor.",
             "status": "Priority",
             "badgeType": "warning"
        }
    
    return {
        "risk": "High Risk" if is_high_risk else "Low Risk",
        "score": round(risk_score, 1),
        "recommendations": recommendations,
        "crlStatus": crl_status,
        "lifestylePlan": lifestyle_plan
    }
