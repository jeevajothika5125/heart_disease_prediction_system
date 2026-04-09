from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import random
import os
import json
import smtplib
import uuid
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from app.schema import HeartPredictionRequest, HeartPredictionResponse, RegisterRequest, LoginRequest, VerifyRequest, ProfileUpdateRequest, ForgotPasswordRequest, ResetPasswordRequest
from app.predictor import predict
from apscheduler.schedulers.background import BackgroundScheduler
from app.email_service import run_daily_email_job

app = FastAPI(title="CardioCare AI Backend")

scheduler = BackgroundScheduler()

@app.on_event("startup")
def start_scheduler():
    scheduler.add_job(run_daily_email_job, 'cron', hour=7, minute=0, timezone='Asia/Kolkata')
    scheduler.start()
    print("Background email scheduler started successfully (7:00 AM IST target)")

@app.on_event("shutdown")
def stop_scheduler():
    scheduler.shutdown()

# Allow frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/test-email-job")
def test_email_job():
    run_daily_email_job()
    return {"success": True, "message": "Triggered manual email job run. Check backend terminal and your connected inboxes!"}

@app.get("/")
def read_root():
    return {"status": "ok", "message": "CardioCare AI API is running"}

# --- SECURE EMAIL CONFIGURATION ---
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

# This is the email that will ACT as the "Sender" postman in the background
SENDER_EMAIL = "cardiocareapp884@gmail.com"

# ⚠️ YOU MUST GENERATE A GOOGLE APP PASSWORD TO MAKE THIS WORK ⚠️
# 1. Go to your Google Account Settings -> Security
# 2. Turn on "2-Step Verification" (if not already on)
# 3. Search for "App passwords" in the settings search bar
# 4. Create one for "CardioCare App" and paste the 16-letter code below:
SENDER_PASSWORD = "jmlgcojzbrtalerc"

def send_verification_email(receiver_email: str, code: str):
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = "CardioCare AI - Verification Code"
        message["From"] = SENDER_EMAIL
        message["To"] = receiver_email

        html = f"""
        <html>
          <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                <h2 style="color: #0ea5e9;">CardioCare AI Security</h2>
                <p>Hello,</p>
                <p>Your secure 6-digit verification code is:</p>
                <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <h1 style="color: #334155; margin: 0; letter-spacing: 5px;">{code}</h1>
                </div>
                <p>Please enter this code into the app to complete authentication.</p>
                <p style="color: #64748b; font-size: 12px; margin-top: 30px;">© 2026 CardioCare AI. Security Module.</p>
            </div>
          </body>
        </html>
        """
        message.attach(MIMEText(html, "html"))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=5) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, receiver_email, message.as_string())
            print(f"REAL EMAIL successfully dispatched to {receiver_email}")
    except Exception as e:
        print(f"⚠️ [DEV MODE] Failed to send real email (Network blocked). The Verification Code for {receiver_email} is: {code} ⚠️")
        print(f"Error details: {e}")



DB_FILE = "users_secure_db.json"
def load_db():
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_db(db):
    with open(DB_FILE, "w") as f:
        json.dump(db, f)

# --- SESSION AUTHENTICATION ---
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    db = load_db()
    for email, udata in db.items():
        if udata.get("session_token") == credentials.credentials:
            return email
    raise HTTPException(status_code=401, detail="Invalid or expired session")

@app.post("/auth/register")
def register(data: RegisterRequest):
    db = load_db()
    if data.email in db and db[data.email].get("verified"):
        raise HTTPException(status_code=400, detail="Email already registered and verified")
    
    # Generate true random 6-digit OTP
    otp_code = str(random.randint(100000, 999999))
    
    db[data.email] = {
        "name": data.name,
        "password": data.password,
        "verified": False,
        "verification_code": otp_code,
        "session_token": None,
        "latest_assessment": None
    }
    save_db(db)
    
    # Send actual email to inbox!
    send_verification_email(data.email, otp_code)
    
    return {"success": True, "requires_verification": True, "message": "Verification code sent to email."}

@app.post("/auth/login")
def login(data: LoginRequest):
    db = load_db()
    user = db.get(data.email)
    if not user:
         raise HTTPException(status_code=404, detail="Email not found")
    if user["password"] != data.password:
         raise HTTPException(status_code=401, detail="Incorrect password")
    
    if not user.get("verified", False):
         # They need verification. Generate a fresh code and resend it to them!
         new_otp = str(random.randint(100000, 999999))
         user["verification_code"] = new_otp
         save_db(db)
         send_verification_email(data.email, new_otp)
         return {"success": True, "requires_verification": True, "message": "Fresh verification code sent to your email! Please check your inbox."}
         
    # Sign in directly securely without verification
    token = str(uuid.uuid4())
    user["session_token"] = token
    save_db(db)
    return {"success": True, "requires_verification": False, "token": token, "message": "Login successful"}

@app.post("/auth/verify")
def verify(data: VerifyRequest):
    db = load_db()
    user = db.get(data.email)
    if not user:
         raise HTTPException(status_code=404, detail="Email not found")
         
    if user.get("verification_code") == data.code:
         user["verified"] = True
         token = str(uuid.uuid4())
         user["session_token"] = token
         save_db(db)
         return {"success": True, "token": token, "message": "Verification successful."}
         
    raise HTTPException(status_code=401, detail="Invalid verification code")

@app.post("/auth/forgot-password")
def forgot_password(data: ForgotPasswordRequest):
    db = load_db()
    user = db.get(data.email)
    if not user:
        # Avoid user enumeration by returning a generic success message
        return {"success": True, "message": "If that email is registered, a reset code was sent."}
    
    # Generate true random 6-digit OTP
    otp_code = str(random.randint(100000, 999999))
    user["verification_code"] = otp_code
    save_db(db)
    
    # Send actual email to inbox
    send_verification_email(data.email, otp_code)
    
    return {"success": True, "requires_verification": True, "message": "If that email is registered, a reset code was sent."}

@app.post("/auth/reset-password")
def reset_password(data: ResetPasswordRequest):
    db = load_db()
    user = db.get(data.email)
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")
        
    if user.get("verification_code") == data.code:
        user["password"] = data.new_password
        user["verified"] = True
        user["verification_code"] = None # Clear code after use
        save_db(db)
        return {"success": True, "message": "Password has been successfully changed."}
        
    raise HTTPException(status_code=401, detail="Invalid verification code")

@app.post("/auth/logout")
def logout(email: str = Depends(get_current_user)):
    db = load_db()
    if email in db:
        db[email]["session_token"] = None
        save_db(db)
    return {"success": True}

@app.post("/predict", response_model=HeartPredictionResponse)
def get_prediction(data: HeartPredictionRequest, email: str = Depends(get_current_user)):
    result = predict(data)
    
    # Store this specific user's assessment
    db = load_db()
    if email in db:
        res_dict = result.copy()
        res_dict["inputData"] = data.dict()
        db[email]["latest_assessment"] = res_dict
        save_db(db)
        
    return result

@app.get("/dashboard/me")
def get_my_dashboard(email: str = Depends(get_current_user)):
    db = load_db()
    assessment = db.get(email, {}).get("latest_assessment")
    return {"success": True, "assessment": assessment}

@app.get("/profile/me")
def get_my_profile(email: str = Depends(get_current_user)):
    db = load_db()
    user = db.get(email, {})
    return {
        "success": True, 
        "profile": {
            "email": email,
            "name": user.get("name", "User"),
            "age": user.get("age", ""),
            "gender": user.get("gender", ""),
            "role": user.get("role", "")
        }
    }

@app.post("/profile/update")
def update_profile(data: ProfileUpdateRequest, email: str = Depends(get_current_user)):
    db = load_db()
    if email in db:
        if data.name is not None:
             db[email]["name"] = data.name
        if data.age is not None:
             db[email]["age"] = data.age
        if data.gender is not None:
             db[email]["gender"] = data.gender
        if data.role is not None:
             db[email]["role"] = data.role
        save_db(db)
        return {"success": True, "message": "Profile updated successfully"}
    raise HTTPException(status_code=404, detail="User not found")

