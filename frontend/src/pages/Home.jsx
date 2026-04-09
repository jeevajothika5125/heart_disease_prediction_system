import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Zap, ArrowRight, HeartPulse, BrainCircuit, ActivitySquare } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
        </div>
        
        <div className="container hero-container">
          <div className="hero-content animate-fade-in">
            <div className="badge badge-primary hero-badge">
              <Activity size={14} className="badge-icon" />
              <span>Next-Gen Cardiac Care</span>
            </div>
            
            <h1 className="hero-title">
              Detect Heart Disease With <span className="text-gradient">Clinical Precision</span>
            </h1>
            
            <p className="hero-description">
              Advanced machine learning meets holistic cardiovascular analysis. Leverage our Random Forest model and Cardiac Recovery Latency (CRL) detection for early prevention.
            </p>
            
            <div className="hero-actions">
              <Link to="/predict" className="btn btn-primary btn-lg">
                Start Assessment <ArrowRight size={18} />
              </Link>
              <Link to="/dashboard" className="btn btn-outline btn-lg">
                View Demo Analytics
              </Link>
            </div>
            
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">94.8%</span>
                <span className="stat-label">Model Accuracy</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-value">12+</span>
                <span className="stat-label">Risk Factors</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-value">Instant</span>
                <span className="stat-label">Analysis Time</span>
              </div>
            </div>
          </div>
          
          <div className="hero-image-container animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="hero-image-wrapper">
              <div className="glass-panel main-dashboard-panel">
                <div className="panel-header">
                  <HeartPulse className="text-accent" size={24} />
                  <span>Cardiological Assessment</span>
                </div>
                <div className="panel-body">
                  <div className="ecg-line animate-pulse">
                    <svg viewBox="0 0 500 100" className="ecg-svg">
                      <path d="M 0,50 L 100,50 L 120,50 L 130,20 L 140,80 L 150,50 L 250,50 L 270,50 L 280,10 L 290,90 L 300,50 L 400,50 M 400,50 L 420,50 L 430,20 L 440,80 L 450,50 L 500,50" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="metric-cards">
                    <div className="metric-card">
                      <span className="metric-title">Heart Risk</span>
                      <span className="metric-value text-success">Low</span>
                    </div>
                    <div className="metric-card">
                      <span className="metric-title">Confidence</span>
                      <span className="metric-value">96%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="glass-panel floating-panel panel-1">
                <ShieldCheck className="text-success" size={20} />
                <span>HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Comprehensive Diagnostics</h2>
            <p className="section-subtitle">Our platform leverages state-of-the-art technology to provide actionable health insights.</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper secondary">
                <BrainCircuit size={28} />
              </div>
              <h3 className="feature-title">AI-Powered Prediction</h3>
              <p className="feature-description">
                Utilizes advanced Random Forest algorithms trained on extensive Kaggle datasets to accurately map potential cardiovascular risks.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper accent">
                <ActivitySquare size={28} />
              </div>
              <h3 className="feature-title">CRL Monitoring</h3>
              <p className="feature-description">
                Tracks Cardiac Recovery Latency to catch early symptoms of hidden heart strain, reducing the chance of unexpected events.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper primary">
                <Zap size={28} />
              </div>
              <h3 className="feature-title">Instant Analytics</h3>
              <p className="feature-description">
                A rich dashboard providing a holistic view of your heart health score mapped against comprehensive lifestyle metrics.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
