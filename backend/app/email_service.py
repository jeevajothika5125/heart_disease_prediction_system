import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json
import os
import pytz
from datetime import datetime

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "cardiocareapp884@gmail.com"
SENDER_PASSWORD = "jmlgcojzbrtalerc"
DB_FILE = "users_secure_db.json"

def get_diet_plan(risk_level: str):
    if risk_level == "High Risk":
        return {
            "breakfast": "Oatmeal with flaxseeds + 1 apple + green tea",
            "snack1": "Handful of almonds + 1 orange",
            "lunch": "Brown rice + grilled vegetables + dal + cucumber salad",
            "snack2": "Green tea + roasted chickpeas",
            "dinner": "Vegetable soup + whole wheat chapati + sautéed greens",
            "tip": "Avoid high sodium foods and stay hydrated throughout the day.",
            "activity": "30 minutes of brisk walking or light cardio."
        }
    elif risk_level == "Moderate Risk":
        return {
            "breakfast": "Multigrain toast with avocado + black coffee",
            "snack1": "1 Apple + walnut mix",
            "lunch": "Quinoa bowl with mixed beans + roasted veggies",
            "snack2": "Unsweetened yogurt with berries",
            "dinner": "Grilled fish/tofu + steamed broccoli + small portion sweet potato",
            "tip": "Lower saturated fats and control your carbohydrate intake.",
            "activity": "45 minutes of moderate aerobic exercise (cycling or brisk walk)."
        }
    else: # Low Risk
        return {
            "breakfast": "Scrambled eggs/paneer + whole grain toast + fruit",
            "snack1": "Fresh fruit bowl",
            "lunch": "Balanced meal (rice/roti + lean protein + vegetables)",
            "snack2": "Handful of mixed nuts",
            "dinner": "Light pasta or chicken/tofu curry + salad",
            "tip": "Maintain your balanced diet and stay consistent with healthy habits.",
            "activity": "30-60 minutes of your favorite physical activity or strength training."
        }

def send_daily_health_email(receiver_email: str, user_data: dict):
    try:
        name = user_data.get("name", "User")
        assessment = user_data.get("latest_assessment")
        
        if not assessment:
            # Skip sending email if they haven't generated an assessment yet
            return
            
        risk_level = assessment.get("risk", "Low Risk")
        score = assessment.get("score", 0.0)
        
        # User input factors
        input_data = assessment.get("inputData", {})
        chol = input_data.get("chol", "N/A")
        bp = input_data.get("trestbps", "N/A")
        crl = input_data.get("crl", "N/A")
        
        diet = get_diet_plan(risk_level)
        
        message = MIMEMultipart("alternative")
        message["Subject"] = "CardioCare AI - Your Daily Health Plan"
        message["From"] = SENDER_EMAIL
        message["To"] = receiver_email

        html = f"""
        <html>
          <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                <h2 style="color: #0ea5e9;">CardioCare AI Health Plan</h2>
                <p><strong>Good Morning {name},</strong></p>
                
                <p>Your latest heart health assessment shows:</p>
                <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p style="margin: 5px 0;">Risk Level: <strong style="color: {'#ef4444' if risk_level == 'High Risk' else '#f59e0b' if risk_level == 'Moderate Risk' else '#10b981'};">{risk_level}</strong></p>
                    <p style="margin: 5px 0;">Risk Score: <strong>{score}%</strong></p>
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 8px;">Key Factors: Chol {chol} mg/dL | BP {bp} mmHg | CRL {crl}s</p>
                </div>

                <p>Based on your profile, here is your personalized full-day plan for today:</p>
                
                <div style="margin: 20px 0;">
                    <p style="margin: 5px 0; font-size: 16px;">🍽️ <strong>Breakfast</strong></p>
                    <p style="margin: 0 0 15px 25px; color: #475569;">{diet['breakfast']}</p>
                    
                    <p style="margin: 5px 0; font-size: 16px;">🍏 <strong>Mid-Morning Snack</strong></p>
                    <p style="margin: 0 0 15px 25px; color: #475569;">{diet['snack1']}</p>
                    
                    <p style="margin: 5px 0; font-size: 16px;">🍛 <strong>Lunch</strong></p>
                    <p style="margin: 0 0 15px 25px; color: #475569;">{diet['lunch']}</p>
                    
                    <p style="margin: 5px 0; font-size: 16px;">☕ <strong>Evening Snack</strong></p>
                    <p style="margin: 0 0 15px 25px; color: #475569;">{diet['snack2']}</p>
                    
                    <p style="margin: 5px 0; font-size: 16px;">🍲 <strong>Dinner</strong></p>
                    <p style="margin: 0 0 15px 25px; color: #475569;">{diet['dinner']}</p>
                </div>
                
                <div style="background-color: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; padding: 10px 15px; margin-bottom: 15px;">
                    <p style="margin: 0 0 5px 0;">💡 <strong>Health Tip:</strong></p>
                    <p style="margin: 0; color: #334155;">{diet['tip']}</p>
                </div>
                
                <div style="background-color: rgba(14, 165, 233, 0.1); border-left: 4px solid #0ea5e9; padding: 10px 15px; margin-bottom: 25px;">
                    <p style="margin: 0 0 5px 0;">🏃 <strong>Activity Recommendation:</strong></p>
                    <p style="margin: 0; color: #334155;">{diet['activity']}</p>
                </div>

                <p style="font-style: italic; color: #64748b;">Stay consistent, and take care of your heart!</p>
                <p style="margin-top: 20px;">Regards,<br><strong>CardioCare AI App</strong></p>
            </div>
          </body>
        </html>
        """
        message.attach(MIMEText(html, "html"))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=5) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, receiver_email, message.as_string())
            print(f"Daily personalized health email sent to {receiver_email}")
            
    except Exception as e:
        print(f"⚠️ [DEV MODE] Failed to send email (Network blocked). Previewing Health Plan for {receiver_email}:")
        print("====== EMAIL CONTENT PREVIEW ======")
        print(f"Risk: {risk_level} | Health Tip: {diet['tip']} | Breakfast: {diet['breakfast']}")
        print("===================================")
        print(f"Error details: {e}")

def run_daily_email_job():
    print(f"[{datetime.now()}] Running scheduled daily health email job...")
    if not os.path.exists(DB_FILE):
        return
        
    try:
        with open(DB_FILE, "r") as f:
            db = json.load(f)
            
        for email, user_data in db.items():
            if user_data.get("session_token"):  # Only send to authenticated active users
                send_daily_health_email(email, user_data)
                
    except Exception as e:
        print(f"Error reading database for daily emails: {e}")
