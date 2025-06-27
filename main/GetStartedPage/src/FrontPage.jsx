import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ClickSpark from './ClickSpark.jsx';
import AnimatedNavLink from './AnimatedNavLink.jsx';
import './FrontPage.css';
import { Link } from 'react-router-dom';

const FrontPage = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleFeatureClick = (feature) => {
    switch (feature) {
      case 'mentorship':
        navigate('/doubts');
        break;
      case 'collaboration':
        navigate('/collaboration');
        break;
      case 'resources':
        navigate('/resources');
        break;
      case 'location':
        navigate('/location');
        break;
      default:
        navigate('/dashboard');
    }
  };

  return (
    <div className="front-page">
      <div className="front-background"></div>
      
      {/* Navigation Header, now outside the background div */}
      <nav className="collaboration-nav">
        <div className="nav-logo">
          <img src="/peerpath.png" alt="PeerPath" />
          <h1>PeerPath</h1>
        </div>
        <div className="nav-links">
          <AnimatedNavLink to="/doubts">Doubts</AnimatedNavLink>
          <AnimatedNavLink to="/collaboration">Collaboration</AnimatedNavLink>
          <AnimatedNavLink to="/resources">Resources</AnimatedNavLink>
          <AnimatedNavLink to="/chat">Chat</AnimatedNavLink>
          <AnimatedNavLink to="/location">Campus Connect</AnimatedNavLink>
          <AnimatedNavLink to="/profile">Profile</AnimatedNavLink>
          <ClickSpark
            sparkColor='#ff4444'
            sparkSize={12}
            sparkRadius={25}
            sparkCount={8}
            duration={300}
          >
            <motion.button 
              onClick={onLogout} 
              className="logout-btn"
              whileHover={{ 
                scale: 1.05,
                y: -2,
                boxShadow: "0 8px 25px rgba(239, 68, 68, 0.4)",
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          </ClickSpark>
        </div>
      </nav>

      {/* Main Content, now outside the background div */}
      <div className="front-content">
        <div className="hero-section">
          <div className="hero-text">
            <h1 className="hero-title">
              Welcome to <span className="highlight">PeerPath</span>
            </h1>
            <p className="hero-subtitle">
              Connect, Collaborate, and Grow Together
            </p>
            <p className="hero-description">
              Join a community of learners and mentors. Share knowledge, 
              solve problems, and build amazing projects together.
            </p>
            <ClickSpark
              sparkColor='#00ff88'
              sparkSize={18}
              sparkRadius={40}
              sparkCount={14}
              duration={450}
            >
              <button className="get-started-btn" onClick={handleGetStarted}>
                Get Started
              </button>
            </ClickSpark>
          </div>
          <div className="hero-visual">
            <div className="floating-cards">
              <ClickSpark
                sparkColor='#ffaa00'
                sparkSize={12}
                sparkRadius={30}
                sparkCount={10}
                duration={350}
              >
                <div className="card card-1" onClick={() => handleFeatureClick('mentorship')}>
                  <span className="card-icon">🧑‍🏫</span>
                  <span className="card-text">Mentorship</span>
                </div>
              </ClickSpark>
              <ClickSpark
                sparkColor='#00aaff'
                sparkSize={12}
                sparkRadius={30}
                sparkCount={10}
                duration={350}
              >
                <div className="card card-2" onClick={() => handleFeatureClick('collaboration')}>
                  <span className="card-icon">🤝</span>
                  <span className="card-text">Collaboration</span>
                </div>
              </ClickSpark>
              <ClickSpark
                sparkColor='#ff00aa'
                sparkSize={12}
                sparkRadius={30}
                sparkCount={10}
                duration={350}
              >
                <div className="card card-3" onClick={() => handleFeatureClick('resources')}>
                  <span className="card-icon">📚</span>
                  <span className="card-text">Resources</span>
                </div>
              </ClickSpark>
              <ClickSpark
                sparkColor='#00ffff'
                sparkSize={12}
                sparkRadius={30}
                sparkCount={10}
                duration={350}
              >
                <div className="card card-4" onClick={() => handleFeatureClick('location')}>
                  <span className="card-icon">📍</span>
                  <span className="card-text">Campus Connect</span>
                </div>
              </ClickSpark>
            </div>
          </div>
        </div>

        <div className="features-section">
          <h2>What You Can Do</h2>
          <div className="features-grid">
            <ClickSpark
              sparkColor='#ffaa00'
              sparkSize={10}
              sparkRadius={25}
              sparkCount={8}
              duration={300}
            >
              <div className="feature" onClick={() => handleFeatureClick('mentorship')}>
                <div className="feature-icon">🎯</div>
                <h3>Ask Questions</h3>
                <p>Get help from peers and experts on any topic</p>
              </div>
            </ClickSpark>
            <ClickSpark
              sparkColor='#00aaff'
              sparkSize={10}
              sparkRadius={25}
              sparkCount={8}
              duration={300}
            >
              <div className="feature" onClick={() => handleFeatureClick('collaboration')}>
                <div className="feature-icon">🚀</div>
                <h3>Build Projects</h3>
                <p>Collaborate on exciting projects with like-minded people</p>
              </div>
            </ClickSpark>
            <ClickSpark
              sparkColor='#ff00aa'
              sparkSize={10}
              sparkRadius={25}
              sparkCount={8}
              duration={300}
            >
              <div className="feature" onClick={() => handleFeatureClick('resources')}>
                <div className="feature-icon">📖</div>
                <h3>Share Knowledge</h3>
                <p>Contribute to the community by sharing your expertise</p>
              </div>
            </ClickSpark>
            <ClickSpark
              sparkColor='#00ffff'
              sparkSize={10}
              sparkRadius={25}
              sparkCount={8}
              duration={300}
            >
              <div className="feature" onClick={() => handleFeatureClick('location')}>
                <div className="feature-icon">🗺️</div>
                <h3>Find Partners</h3>
                <p>Connect with people going to the same places</p>
              </div>
            </ClickSpark>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrontPage; 