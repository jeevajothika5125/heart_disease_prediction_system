import { Link, useLocation } from 'react-router-dom';
import { HeartPulse, LayoutDashboard, Stethoscope, MessageSquare, LogIn, LogOut, User } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ isAuthenticated, onLogout }) => {
  const location = useLocation();

  const navLinks = isAuthenticated ? [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Predict', path: '/predict', icon: Stethoscope },
    { name: 'Assistant', path: '/chatbot', icon: MessageSquare },
    { name: 'Profile', path: '/profile', icon: User },
  ] : [];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="navbar-logo">
          <HeartPulse className="logo-icon" size={28} />
          <span className="logo-text">CardioCare <span className="logo-accent">AI</span></span>
        </Link>

        <div className="navbar-links">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            
            return (
              <Link 
                key={link.name} 
                to={link.path} 
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="navbar-actions">
          {!isAuthenticated ? (
            <Link to="/login" className="btn btn-outline nav-btn" style={{ padding: '0.5rem 1rem' }}>
              <LogIn size={18} />
              <span>Sign In / Sign Up</span>
            </Link>
          ) : (
            <Link to="/" onClick={onLogout} className="btn btn-outline nav-btn" style={{ padding: '0.5rem 1rem' }}>
              <LogOut size={18} />
              <span>Logout</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
