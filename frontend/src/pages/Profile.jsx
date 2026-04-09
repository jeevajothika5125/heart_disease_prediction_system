import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Activity, Save, Settings } from 'lucide-react';
import './Dashboard.css'; // Reuse dashboard styles for cards

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    role: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        const res = await fetch('/api/profile/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.profile) {
            setProfile(data.profile);
          }
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: profile.name,
          age: profile.age ? parseInt(profile.age, 10) : null,
          gender: profile.gender,
          role: profile.role
        })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: data.detail || 'Failed to update profile' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network connection failed' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center flex-col items-center h-full mt-24">
        <div className="spinner-ring mb-4" />
        <p className="text-muted">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto mt-8">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <User className="text-primary" /> User Profile
          </h2>
          <button 
            className="btn btn-outline" 
            onClick={() => {
              if (isEditing) handleSave();
              else setIsEditing(true);
            }}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Edit Profile')}
          </button>
        </div>

        {message.text && (
          <div className={`p-3 mb-6 rounded-md text-sm ${message.type === 'success' ? 'bg-success-light text-success' : 'bg-accent-light text-accent'}`}>
            {message.text}
          </div>
        )}

        <div className="grid gap-6">
          <div className="input-group">
            <label className="input-label flex items-center gap-2">
              <Mail size={16} /> Email Address (Read Only)
            </label>
            <input 
              type="email" 
              value={profile.email} 
              disabled 
              className="input-field bg-gray-50 opacity-70"
            />
          </div>

          <div className="input-group">
            <label className="input-label flex items-center gap-2">
              <User size={16} /> Full Name
            </label>
            <input 
              type="text" 
              name="name"
              value={profile.name} 
              onChange={handleChange}
              disabled={!isEditing}
              className={`input-field ${!isEditing ? 'opacity-80' : 'border-primary'}`}
              placeholder="Enter your full name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label flex items-center gap-2">
                <Calendar size={16} /> Age
              </label>
              <input 
                type="number" 
                name="age"
                value={profile.age || ''} 
                onChange={handleChange}
                disabled={!isEditing}
                className={`input-field ${!isEditing ? 'opacity-80' : 'border-primary'}`}
                placeholder="Years"
              />
            </div>

            <div className="input-group">
              <label className="input-label flex items-center gap-2">
                <Activity size={16} /> Gender
              </label>
              <select 
                name="gender"
                value={profile.gender || ''} 
                onChange={handleChange}
                disabled={!isEditing}
                className={`input-field select-field ${!isEditing ? 'opacity-80' : 'border-primary'}`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label flex items-center gap-2">
                <Settings size={16} /> Account Type
              </label>
              <select 
                name="role"
                value={profile.role || ''} 
                onChange={handleChange}
                disabled={!isEditing}
                className={`input-field select-field ${!isEditing ? 'opacity-80' : 'border-primary'}`}
              >
                <option value="">Select Account Type</option>
                <option value="Doctor">Doctor</option>
                <option value="Individual User">Individual User</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
