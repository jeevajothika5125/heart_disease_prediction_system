import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { 
  LayoutDashboard, Heart, Activity, Dumbbell, Apple, Moon, 
  TrendingUp, ArrowUpRight, ArrowDownRight, Clock, AlertCircle 
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('6M');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [assessmentParams, setAssessmentParams] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSecureData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      try {
        const res = await fetch('/api/dashboard/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        
        const data = await res.json();
        if (data.success && data.assessment) {
          setAssessmentParams(data.assessment);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
      setLoading(false);
    };
    
    fetchSecureData();
  }, [navigate]);

  const hasAssessment = !!assessmentParams;
  const parsedAssessment = assessmentParams;

  const lp = parsedAssessment?.lifestylePlan || {
    nutrition: { desc: "Complete an assessment to get a personalized meal plan.", status: "Pending", badgeType: "primary" },
    exercise: { desc: "Complete an assessment to get an exercise routine.", status: "Pending", badgeType: "primary" },
    recovery: { desc: "Complete an assessment to generate recovery protocols.", status: "Pending", badgeType: "primary" }
  };

  const inputData = parsedAssessment?.inputData || {};
  const score = parsedAssessment?.score || 0;

  const kpis = {
    overallScore: hasAssessment ? Math.round(100 - score) : "--",
    overallTrend: 0,
    crl: hasAssessment ? inputData.crl : "--",
    crlTrend: 0,
    hr: hasAssessment ? inputData.thalach : "--",
    hrTrend: 0
  };

  const riskFactorsData = [
    { name: 'Cholesterol', your: hasAssessment ? inputData.chol : 0, target: 200 },
    { name: 'Blood Pr.', your: hasAssessment ? inputData.trestbps : 0, target: 120 },
    { name: 'Blood Sugar', your: hasAssessment ? (inputData.fbs == 1 ? 140 : 95) : 0, target: 100 },
    { name: 'Heart Rate', your: hasAssessment ? inputData.thalach : 0, target: 150 },
  ];

  const getRiskAnalysis = () => {
    if (!hasAssessment) return [{ name: 'Pending', value: 100, color: '#e2e8f0' }];
    
    // Calculate simple relative risk deviation for visual weighting
    const cholRisk = Math.max(0, inputData.chol - 200); 
    const bpRisk = Math.max(0, inputData.trestbps - 120);
    const crlRisk = Math.max(0, inputData.crl - 20) * 5; // scaled up logically due to seconds metric
    const hrRisk = Math.max(0, inputData.thalach - 150);
    
    if (cholRisk + bpRisk + crlRisk + hrRisk === 0) {
      return [{ name: 'Optimal Limits', value: 100, color: 'var(--success)' }];
    }
    
    return [
      { name: 'Cholesterol', value: cholRisk, color: 'var(--primary)' },
      { name: 'Blood Pressure', value: bpRisk, color: 'var(--accent)' },
      { name: 'Recovery (CRL)', value: crlRisk, color: '#A855F7' },
      { name: 'Heart Rate', value: hrRisk, color: 'var(--warning)' }
    ].filter(f => f.value > 0);
  };

  const riskDistributionData = getRiskAnalysis();

  const healthScoreData = hasAssessment ? [
    { name: 'Target', score: 100, crl: 15 },
    { name: 'Your Result', score: Math.round(100 - score), crl: inputData.crl },
  ] : [
    { name: 'Target', score: 100, crl: 15 },
    { name: 'Your Result', score: 0, crl: 0 },
  ];

  const generateSimplePlan = () => {
    if (!hasAssessment) return { nutrition: [], exercise: [], recovery: [] };
    
    const p = { nutrition: [], exercise: [], recovery: [] };
    
    if (inputData.trestbps > 130) p.nutrition.push("Swap out salt for herbs and spices to help lower your blood pressure.");
    if (inputData.chol > 200) p.nutrition.push("Eat oatmeal for breakfast and add fish to your meals to naturally lower cholesterol.");
    if (inputData.fbs == 1) p.nutrition.push("Avoid sugary sodas and white bread. Choose whole grains like brown rice.");
    p.nutrition.push("Drink at least 8 glasses of water a day and fill half your plate with colorful vegetables.");
    
    if (inputData.thalach < 130) p.exercise.push("Start with brisk walking, then slowly add 1-minute light jogs to build stamina.");
    if (inputData.crl < 20) p.exercise.push("Always cool down properly after exercising with 5 minutes of slow walking.");
    p.exercise.push("Aim to move your body for at least 30 minutes a day, even if it's just a walk around the neighborhood.");
    
    if (score > 50) p.recovery.push("Because your risk factors are active, set aside 15 minutes a day exclusively for quiet time or deep breathing to relieve stress.");
    p.recovery.push("Try to go to sleep at the exact same time every night to build a healthy heart rhythm.");
    p.recovery.push("Aim for 7 to 8 full hours of rest to give your heart time to recover from the day's strain.");
    
    return p;
  };

  const simplePlan = generateSimplePlan();

  return (
    <div className="dashboard-page relative">
      <div className="container">
        
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Health Analytics</h1>
            <p className="text-muted">Welcome back! Here is your latest cardiovascular health overview.</p>
          </div>
        </div>

        <div className="kpi-grid mb-6">
          <div className="card kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrapper primary">
                <Heart size={20} />
              </div>
              <span className={`badge ${kpis.overallScore >= 80 ? 'badge-success' : 'badge-warning'} flex items-center gap-1`}>
                Target: 90+
              </span>
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Overall Heart Score</span>
              <span className="kpi-value text-gradient">{kpis.overallScore}<span className="text-muted text-sm font-medium"> / 100</span></span>
            </div>
            <div className="kpi-footer">
              <div className="progress-bar"><div className="progress-fill" style={{width: `${kpis.overallScore}%`}}></div></div>
            </div>
          </div>

          <div className="card kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrapper accent">
                <Activity size={20} />
              </div>
              <span className={`badge ${kpis.crl <= 20 ? 'badge-success' : 'badge-warning'} flex items-center gap-1`}>
                Target: &lt;20
              </span>
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Cardiac Recovery Latency (CRL)</span>
              <span className="kpi-value">{kpis.crl}<span className="text-muted text-sm font-medium"> BPM drop</span></span>
            </div>
            <div className="kpi-footer">
              <span className="text-xs text-muted"><strong className="text-success">Optimal range!</strong> Keep it under 20.</span>
            </div>
          </div>

          <div className="card kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrapper warning">
                <TrendingUp size={20} />
              </div>
              <span className={`badge ${kpis.hr <= 100 ? 'badge-success' : 'badge-warning'} flex items-center gap-1`}>
                Target Peak
              </span>
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Avg Resting Heart Rate</span>
              <span className="kpi-value">{kpis.hr}<span className="text-muted text-sm font-medium"> BPM</span></span>
            </div>
            <div className="kpi-footer">
              <span className="text-xs text-muted">Tracking normally this week.</span>
            </div>
          </div>
        </div>

        <div className="charts-grid mb-6">
          <div className="card chart-card main-chart">
            <div className="card-header pb-4 border-b border-border flex justify-between items-center mb-6">
              <h3 className="card-title text-lg m-0">Health Score & CRL Trend</h3>
              <div className="text-sm text-muted flex gap-4">
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-primary" /> Health Score</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-accent" /> CRL</span>
              </div>
            </div>
            <div className="chart-container" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={healthScoreData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCrl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} domain={[50, 100]} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} domain={[0, 60]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-md)' }}
                    itemStyle={{ color: 'var(--text-dark)' }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" name="Health Score" />
                  <Area yAxisId="right" type="monotone" dataKey="crl" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorCrl)" name="CRL" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card chart-card side-chart">
            <div className="card-header pb-4 border-b border-border mb-6">
              <h3 className="card-title text-lg m-0 flex items-center gap-2"><AlertCircle size={18} /> Risk Driver Analysis</h3>
            </div>
            <div className="chart-container flex items-center justify-center relative" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-md)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center flex flex-col items-center justify-center">
                <span className="text-xl font-bold font-outfit">Risk</span>
                <span className="text-xs text-muted">Sources</span>
              </div>
            </div>
          </div>
        </div>

        <div className="charts-grid secondary-grid mb-6">
          <div className="card chart-card">
            <div className="card-header pb-4 border-b border-border mb-6">
              <h3 className="card-title text-lg m-0">Risk Factors vs Target</h3>
            </div>
            <div className="chart-container" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskFactorsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                  <Tooltip 
                    cursor={{fill: 'var(--bg-main)'}}
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-md)' }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="your" name="Your Metrics" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Target Optimal" fill="var(--success)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card chart-card lifestyle-card">
            <div className="card-header pb-4 border-b border-border mb-4">
              <h3 className="card-title text-lg m-0">Lifestyle Recommendations</h3>
            </div>
            
            <div className="lifestyle-list">
              <div className="lifestyle-item">
                <div className="lifestyle-icon bg-secondary-light text-secondary">
                  <Apple size={20} />
                </div>
                <div className="lifestyle-content">
                  <h5 className="lifestyle-title">Nutrition</h5>
                  <p className="lifestyle-desc flex justify-between">
                    <span>{lp.nutrition.desc}</span>
                    <span className={`badge badge-${lp.nutrition.badgeType}`}>{lp.nutrition.status}</span>
                  </p>
                </div>
              </div>

              <div className="lifestyle-item">
                <div className="lifestyle-icon bg-primary-light text-primary">
                  <Dumbbell size={20} />
                </div>
                <div className="lifestyle-content">
                  <h5 className="lifestyle-title">Exercise</h5>
                  <p className="lifestyle-desc flex justify-between">
                    <span>{lp.exercise.desc}</span>
                    <span className={`badge badge-${lp.exercise.badgeType}`}>{lp.exercise.status}</span>
                  </p>
                </div>
              </div>

              <div className="lifestyle-item">
                <div className="lifestyle-icon" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}>
                  <Moon size={20} />
                </div>
                <div className="lifestyle-content">
                  <h5 className="lifestyle-title">Recovery</h5>
                  <p className="lifestyle-desc flex justify-between">
                    <span>{lp.recovery.desc}</span>
                    <span className={`badge badge-${lp.recovery.badgeType}`}>{lp.recovery.status}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <button className="btn btn-outline w-full mt-auto" onClick={() => setShowPlanModal(true)}>
              View Detailed Plan
            </button>
          </div>
        </div>

      </div>

      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setShowPlanModal(false)}>
          <div className="card w-full max-w-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-main)' }}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
              <h3 className="text-xl m-0 font-bold flex items-center gap-2"><Heart className="text-primary" /> Your Simple Action Plan</h3>
              <button onClick={() => setShowPlanModal(false)} className="text-muted hover:text-dark bg-transparent border-none text-2xl cursor-pointer">✕</button>
            </div>
            
            <div className="space-y-6">
              {!hasAssessment ? (
                <p className="text-center text-muted py-8">Please generate an assessment first to unlock your personalized, easy-to-follow plan!</p>
              ) : (
                <div className="flex flex-col gap-6">
                  
                  <div className="p-4 rounded-lg bg-opacity-10 border border-opacity-20" style={{ backgroundColor: 'rgba(14, 165, 233, 0.05)', borderColor: 'var(--secondary)' }}>
                    <h4 className="text-lg font-semibold text-secondary flex items-center gap-2 mb-3 mt-0"><Apple size={20} /> What to Eat</h4>
                    <ul className="list-disc pl-5 text-muted m-0 flex flex-col gap-2">
                       {simplePlan.nutrition.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-opacity-10 border border-opacity-20" style={{ backgroundColor: 'rgba(56, 189, 248, 0.05)', borderColor: 'var(--primary)' }}>
                    <h4 className="text-lg font-semibold text-primary flex items-center gap-2 mb-3 mt-0"><Dumbbell size={20} /> How to Move</h4>
                    <ul className="list-disc pl-5 text-muted m-0 flex flex-col gap-2">
                       {simplePlan.exercise.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-opacity-10 border border-opacity-20" style={{ backgroundColor: 'rgba(168, 85, 247, 0.05)', borderColor: '#A855F7' }}>
                    <h4 className="text-lg font-semibold flex items-center gap-2 mb-3 mt-0" style={{ color: '#A855F7' }}><Moon size={20} /> How to Rest</h4>
                    <ul className="list-disc pl-5 text-muted m-0 flex flex-col gap-2">
                       {simplePlan.recovery.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>

                </div>
              )}
            </div>
            
            <div className="mt-8 pt-4 border-t border-border">
              <button className="btn btn-primary w-full py-3" onClick={() => setShowPlanModal(false)}>Got It, Close Plan</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
