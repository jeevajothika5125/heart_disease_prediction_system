import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, Mail, Lock, User, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showVerification, setShowVerification] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  
  const [verifyCode, setVerifyCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', newPassword: '' });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      if (isForgotPassword) {
        // Handle Forgot Password First Step
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Request failed");
        
        setSuccessMsg(data.message || "Reset code sent.");
        setIsForgotPassword(false);
        setShowResetPassword(true);
      } else if (showResetPassword) {
         // Handle password reset
         const res = await fetch('/api/auth/reset-password', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, code: verifyCode, new_password: formData.newPassword })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Reset failed");
        
        setSuccessMsg("Password reset successfully! You can now sign in.");
        setShowResetPassword(false);
        setIsLogin(true);
        setVerifyCode("");
        setFormData(prev => ({ ...prev, password: '', newPassword: '' }));
      } else if (isLogin) {
        const res = await fetch('/api/auth/login', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Login failed");
        
        if (data.requires_verification) {
          setShowVerification(true);
        } else {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userEmail', formData.email);
          if (onLogin) onLogin();
          setFormData({ name: '', email: '', password: '', newPassword: '' });
          navigate('/dashboard');
        }
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Registration failed");
        
        if (data.requires_verification) {
          setShowVerification(true);
        }
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const res = await fetch('/api/auth/verify', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, code: verifyCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Verification failed");
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', formData.email);
        if (onLogin) onLogin();
        setVerifyCode("");
        setFormData({ name: '', email: '', password: '', newPassword: '' });
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setIsForgotPassword(false);
    setShowResetPassword(false);
    setErrorMsg("");
    setSuccessMsg("");
  };
  
  const handleForgotPassword = (e) => {
    e.preventDefault();
    setIsForgotPassword(true);
    setIsLogin(false);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const getFormHeader = () => {
    if (showVerification) return { title: 'Security Verification', desc: 'Enter the 6-digit verification code sent to your email.' };
    if (showResetPassword) return { title: 'Reset Password', desc: 'Enter your verification code and new password.' };
    if (isForgotPassword) return { title: 'Recover Account', desc: 'Enter your email to receive a password reset code.' };
    return isLogin 
        ? { title: 'Welcome Back', desc: 'Enter your credentials to access your dashboard' }
        : { title: 'Create an Account', desc: 'Join CardioCare AI today and take control of your heart health' };
  };

  const header = getFormHeader();

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Visual / Brand Side */}
        <div className="auth-brand-section">
          <div className="auth-brand-content">
            <Link to="/" className="auth-logo">
              <HeartPulse className="logo-icon white" size={36} />
              <span>CardioCare <span>AI</span></span>
            </Link>
            
            <div className="brand-text">
              <h2>Your Heart Health,<br />Powered by Intelligence.</h2>
              <p>Sign in to access personalized predictions, track your health metrics, and get instant lifestyle recommendations.</p>
            </div>
            
            <div className="security-badge">
              <ShieldCheck size={20} />
              <span>HIPAA Compliant Data Security</span>
            </div>
          </div>
          
          <div className="auth-bg-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>

        {/* Form Side */}
        <div className="auth-form-section">
          <div className="form-header">
            <h2>{header.title}</h2>
            <p className="text-muted">{header.desc}</p>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-md text-sm border font-medium" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 mb-4 rounded-md text-sm border font-medium" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
              {successMsg}
            </div>
          )}

          {showVerification ? (
            <form onSubmit={handleVerify} className="auth-form">
              <div className="input-group">
                <label className="input-label" htmlFor="code">Secure 6-Digit Verification Code</label>
                <div className="input-wrapper">
                  <ShieldCheck size={18} className="input-icon" />
                  <input
                    type="text"
                    id="code"
                    className="input-field with-icon tracking-widest text-center text-lg font-bold"
                    placeholder="------"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-block mt-4 auth-submit-btn flex justify-center items-center gap-2">
                <span>Verify & Authenticate</span>
                <ArrowRight size={18} />
              </button>
              <button type="button" className="btn btn-outline btn-block mt-3" onClick={() => setShowVerification(false)}>
                Cancel & Go Back
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
              {!isLogin && !isForgotPassword && !showResetPassword && (
                <div className="input-group">
                  <label className="input-label" htmlFor="name">Full Name</label>
                  <div className="input-wrapper">
                    <User size={18} className="input-icon" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      autoComplete="off"
                      className="input-field with-icon"
                      placeholder="E.g., John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      required={!isLogin && !isForgotPassword && !showResetPassword}
                    />
                  </div>
                </div>
              )}

              {(!showResetPassword || showResetPassword) && (
                <div className="input-group">
                  <label className="input-label" htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      autoComplete="off"
                      className="input-field with-icon"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={showResetPassword}
                    />
                  </div>
                </div>
              )}
              
              {showResetPassword && (
                <>
                  <div className="input-group">
                    <label className="input-label" htmlFor="code">Verification Code</label>
                    <div className="input-wrapper">
                      <ShieldCheck size={18} className="input-icon" />
                      <input
                        type="text"
                        id="code"
                        className="input-field with-icon tracking-widest text-center"
                        placeholder="------"
                        maxLength={6}
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label" htmlFor="newPassword">New Password</label>
                    <div className="input-wrapper">
                      <Lock size={18} className="input-icon" />
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        autoComplete="new-password"
                        className="input-field with-icon"
                        placeholder="••••••••"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {!isForgotPassword && !showResetPassword && (
                <div className="input-group">
                  <div className="flex justify-between items-center mb-2">
                    <label className="input-label mb-0" htmlFor="password">Password</label>
                    {isLogin && (
                      <a href="#" onClick={handleForgotPassword} className="forgot-password-link">Forgot Password?</a>
                    )}
                  </div>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input
                      type="password"
                      id="password"
                      name="password"
                      autoComplete="new-password"
                      className="input-field with-icon"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-block mt-4 auth-submit-btn">
                <span>
                  {isForgotPassword ? 'Send Reset Code' 
                  : showResetPassword ? 'Reset Password'
                  : (isLogin ? 'Sign In' : 'Create Account')}
                </span>
                <ArrowRight size={18} />
              </button>
              
              {(isForgotPassword || showResetPassword) && (
                <button type="button" className="btn btn-outline btn-block mt-3 flex justify-center items-center gap-2" onClick={() => { setIsForgotPassword(false); setShowResetPassword(false); setIsLogin(true); setErrorMsg(""); }}>
                  <ArrowLeft size={16} />
                  Back to Sign In
                </button>
              )}
            </form>
          )}

          {(!isForgotPassword && !showResetPassword) && (
            <div className="auth-footer">
              <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button type="button" onClick={toggleMode} className="switch-mode-btn">
                  {isLogin ? 'Sign Up' : 'Log In'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
