import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, AlertTriangle, CheckCircle, Activity, HeartPulse, ActivitySquare } from 'lucide-react';
import './Predict.css';

const Predict = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('predictFormData');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) { /* ignore */ }
    }
    return {
      age: '',
      sex: '1',
      cp: '0',
      trestbps: '',
      chol: '',
      fbs: '0',
      restecg: '0',
      thalach: '',
      exang: '0',
      oldpeak: '',
      slope: '1',
      ca: '0',
      thal: '2',
      crl: ''
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    localStorage.setItem('predictFormData', JSON.stringify(formData));
  }, [formData]);

  // Maintain cross-session persistence independently from backend 
  useEffect(() => {
    const fetchPreviousAssessment = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        const res = await fetch('/api/dashboard/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.assessment) {
            setResult(data.assessment);
            // Optional: Auto-fill the form with their previous submit values
            if (data.assessment.inputData) {
               setFormData(prev => ({...prev, ...data.assessment.inputData}));
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPreviousAssessment();
  }, []);

  const [showCrlCalc, setShowCrlCalc] = useState(false);
  const [crlCalc, setCrlCalc] = useState({ peakHr: '', postHr: '' });

  const handleCrlChange = (e) => {
    const { name, value } = e.target;
    setCrlCalc(prev => ({ ...prev, [name]: value }));
  };

  const calculateCrl = (e) => {
    e.preventDefault();
    if (crlCalc.peakHr && crlCalc.postHr) {
      const drop = Number(crlCalc.peakHr) - Number(crlCalc.postHr);
      setFormData(prev => ({ ...prev, crl: drop > 0 ? drop : 0 }));
      setShowCrlCalc(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          age: Number(formData.age),
          sex: Number(formData.sex),
          cp: Number(formData.cp),
          trestbps: Number(formData.trestbps),
          chol: Number(formData.chol),
          fbs: Number(formData.fbs),
          restecg: Number(formData.restecg),
          thalach: Number(formData.thalach),
          exang: Number(formData.exang),
          oldpeak: Number(formData.oldpeak),
          slope: Number(formData.slope),
          ca: Number(formData.ca),
          thal: Number(formData.thal),
          crl: Number(formData.crl)
        }),
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      data.inputData = {
        age: Number(formData.age),
        sex: Number(formData.sex),
        cp: Number(formData.cp),
        trestbps: Number(formData.trestbps),
        chol: Number(formData.chol),
        fbs: Number(formData.fbs),
        restecg: Number(formData.restecg),
        thalach: Number(formData.thalach),
        exang: Number(formData.exang),
        oldpeak: Number(formData.oldpeak),
        slope: Number(formData.slope),
        ca: Number(formData.ca),
        thal: Number(formData.thal),
        crl: Number(formData.crl)
      };
      
      setResult(data);
      // The backend now securely saves this to the user's isolated profile
    } catch (error) {
      console.error('Error fetching prediction:', error);
      alert('Failed to connect to the prediction server. Please ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="predict-page">
      <div className="container predict-container">
        
        <div className="predict-header text-center">
          <div className="icon-wrapper primary mx-auto mb-4">
            <Stethoscope size={32} />
          </div>
          <h1 className="section-title">Cardiological Assessment</h1>
          <p className="section-subtitle">
            Enter patient vitals and metrics to generate an AI-powered risk prediction using our Random Forest model and CRL detection.
          </p>
        </div>

        <div className="predict-content grid">
          
          <div className="form-column">
            <div className="card predict-card">
              <h3 className="card-title flex items-center gap-2 mb-6">
                <Activity size={20} className="text-primary"/> 
                Patient Vitals Form
              </h3>
              
              <form onSubmit={handlePredict} className="predict-form">
                
                <h4 className="form-section-title">Basic Information</h4>
                <div className="form-grid">
                  <div className="input-group">
                    <label className="input-label">Age (Years)</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} className="input-field" placeholder="e.g., 45" required min="1" max="120" />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Sex</label>
                    <div className="select-wrapper">
                      <select name="sex" value={formData.sex} onChange={handleChange} className="input-field select-field">
                        <option value="1">Male</option>
                        <option value="0">Female</option>
                      </select>
                    </div>
                  </div>
                </div>

                <h4 className="form-section-title mt-4">Clinical Metrics</h4>
                <div className="form-grid">
                  <div className="input-group">
                    <label className="input-label">Chest Pain Type</label>
                    <div className="select-wrapper">
                      <select name="cp" value={formData.cp} onChange={handleChange} className="input-field select-field">
                        <option value="0">Typical Angina</option>
                        <option value="1">Atypical Angina</option>
                        <option value="2">Non-anginal Pain</option>
                        <option value="3">Asymptomatic</option>
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Resting Blood Pressure (mm Hg)</label>
                    <input type="number" name="trestbps" value={formData.trestbps} onChange={handleChange} className="input-field" placeholder="e.g., 120" required min="50" max="250" />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Serum Cholesterol (mg/dl)</label>
                    <input type="number" name="chol" value={formData.chol} onChange={handleChange} className="input-field" placeholder="e.g., 200" required min="100" max="600" />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Fasting Blood Sugar &gt; 120 mg/dl</label>
                    <div className="select-wrapper">
                      <select name="fbs" value={formData.fbs} onChange={handleChange} className="input-field select-field">
                        <option value="0">False</option>
                        <option value="1">True</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Resting ECG</label>
                    <div className="select-wrapper">
                      <select name="restecg" value={formData.restecg} onChange={handleChange} className="input-field select-field">
                        <option value="0">Normal</option>
                        <option value="1">ST-T Wave Abnormality</option>
                        <option value="2">Left Ventricular Hypertrophy</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Max Heart Rate Achieved</label>
                    <input type="number" name="thalach" value={formData.thalach} onChange={handleChange} className="input-field" placeholder="e.g., 150" required min="60" max="220" />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Exercise Induced Angina</label>
                    <div className="select-wrapper">
                      <select name="exang" value={formData.exang} onChange={handleChange} className="input-field select-field">
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">ST Depression (Oldpeak)</label>
                    <input type="number" step="0.1" name="oldpeak" value={formData.oldpeak} onChange={handleChange} className="input-field" placeholder="e.g., 1.0" required min="0" max="10" />
                  </div>
                </div>

                <h4 className="form-section-title mt-4">Advanced Diagnostics</h4>
                <div className="form-grid">
                  <div className="input-group">
                    <label className="input-label">Peak Exercise ST Segment Slope</label>
                    <div className="select-wrapper">
                      <select name="slope" value={formData.slope} onChange={handleChange} className="input-field select-field">
                        <option value="0">Upsloping</option>
                        <option value="1">Flat</option>
                        <option value="2">Downsloping</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Number of Major Vessels</label>
                    <div className="select-wrapper">
                      <select name="ca" value={formData.ca} onChange={handleChange} className="input-field select-field">
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Thalassemia</label>
                    <div className="select-wrapper">
                      <select name="thal" value={formData.thal} onChange={handleChange} className="input-field select-field">
                        <option value="1">Normal</option>
                        <option value="2">Fixed Defect</option>
                        <option value="3">Reversable Defect</option>
                      </select>
                    </div>
                  </div>

                  <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                    <div className="flex justify-between items-center mb-2">
                      <label className="input-label text-primary font-bold mb-0">Cardiac Recovery Latency (CRL)</label>
                      <button 
                        type="button" 
                        className="text-xs text-primary font-medium hover:underline bg-transparent border-none p-0 cursor-pointer"
                        style={{ background: 'none' }}
                        onClick={() => setShowCrlCalc(!showCrlCalc)}
                      >
                        {showCrlCalc ? 'Close CRL Tools' : 'Detect via HR Attributes'}
                      </button>
                    </div>

                    {showCrlCalc && (
                      <div className="p-4 mb-3 border border-primary rounded-md" style={{ backgroundColor: 'rgba(56, 189, 248, 0.05)', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                        <h5 className="text-sm font-semibold text-primary mb-3 mt-0">CRL Detection Engine</h5>
                        <p className="text-xs text-muted mb-3 mt-0">Measure heart rate at peak exercise, then re-measure exactly 1 minute after rest.</p>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-xs text-muted mb-1 block">Peak Heart Rate (BPM)</label>
                            <input type="number" name="peakHr" value={crlCalc.peakHr} onChange={handleCrlChange} className="input-field text-sm" placeholder="e.g. 165" />
                          </div>
                          <div>
                            <label className="text-xs text-muted mb-1 block">1-Min Post Recovery HR</label>
                            <input type="number" name="postHr" value={crlCalc.postHr} onChange={handleCrlChange} className="input-field text-sm" placeholder="e.g. 145" />
                          </div>
                        </div>
                        <button type="button" onClick={calculateCrl} className="btn btn-primary w-full py-2 text-sm">
                          Calculate & Auto-Fill Drop
                        </button>
                      </div>
                    )}

                    <input type="number" name="crl" value={formData.crl} onChange={handleChange} className="input-field border-primary" placeholder="BPM drop (Auto-filled by tool or manual)" required min="0" max="100" />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full mt-6" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                       <HeartPulse className="animate-pulse" /> Analyzing Vitals...
                    </span>
                  ) : (
                    'Generate Assessment'
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="result-column">
            {!result && !isLoading && (
              <div className="empty-state card">
                <div className="empty-icon text-muted">
                  <ActivitySquare size={48} />
                </div>
                <h4>No Assessment Generated</h4>
                <p className="text-muted text-center mt-2">
                  Fill out the patient vitals form completely and click "Generate Assessment" to see the prediction results.
                </p>
              </div>
            )}
            
            {isLoading && (
              <div className="loading-state card">
                <div className="loading-spinner">
                  <div className="spinner-ring"></div>
                </div>
                <h4>Processing Data</h4>
                <p className="text-muted mb-4">Our Random Forest model is analyzing 14 health parameters...</p>
                <div className="analysis-steps">
                  <div className="step active"><CheckCircle size={16} /> Data Normalization</div>
                  <div className="step active"><CheckCircle size={16} /> Feature Extraction</div>
                  <div className="step processing"><Activity size={16} className="animate-pulse" /> Inference Generation</div>
                </div>
              </div>
            )}

            {result && !isLoading && (
              <div className={`result-card card animate-fade-in ${result.risk === 'High Risk' ? 'border-accent' : 'border-success'}`}>
                <div className="result-header">
                  <div className={`result-badge ${result.risk === 'High Risk' ? 'bg-accent-light text-accent' : 'bg-success-light text-success'}`}>
                    {result.risk === 'High Risk' ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
                  </div>
                  <h3 className="result-title mb-0">{result.risk}</h3>
                </div>
                
                <div className="score-meter mt-6">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Risk Score</span>
                    <span className="font-bold">{result.score}%</span>
                  </div>
                  <div className="meter-track">
                    <div 
                      className={`meter-fill ${result.risk === 'High Risk' ? 'bg-accent' : 'bg-success'}`}
                      style={{ width: `${result.score}%` }}
                    ></div>
                  </div>
                </div>

                <div className="crl-status mt-6 mb-2 p-4 rounded-md bg-opacity-20 flex gap-4 items-center" style={{ backgroundColor: 'var(--bg-main)' }}>
                  <HeartPulse className="text-primary" size={24} />
                  <div>
                    <h5 className="font-semibold m-0 text-sm">CRL Diagnosis: {result.crlStatus}</h5>
                    <p className="text-xs text-muted m-0 mt-1">Cardiac Recovery Latency is a key indicator for early prevention.</p>
                  </div>
                </div>

                <div className="recommendations mt-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Activity size={18} /> Recommended Actions
                  </h4>
                  <ul className="rec-list">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="rec-item">
                        <div className="rec-dot"></div>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-8">
                  <button className="btn btn-outline w-full" onClick={() => {
                    setResult(null);
                  }}>
                    Reset Form
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predict;
