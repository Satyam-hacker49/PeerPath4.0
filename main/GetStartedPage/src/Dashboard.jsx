import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import BlurHeading from "./DashboardHeading.jsx";
import ClickSpark from "./ClickSpark.jsx";
import "./Dashboard.css";

const Card = ({ icon, title, description, onClick }) => (
  <ClickSpark
    sparkColor='#00ff88'
    sparkSize={15}
    sparkRadius={35}
    sparkCount={12}
    duration={400}
  >
    <div className="card" onClick={onClick}>
      <div className="fade-in">
        <div className="icon">{icon}</div>
        <h3>{title}</h3>
        <p>{description}</p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto' }}>
          <button className="get-started-btn">Get Started</button>
        </div>
      </div>
    </div>
  </ClickSpark>
);

export default function Dashboard({ currentUser, onLogout }) {
  const navigate = useNavigate();

  const handleMentorship = () => {
    navigate('/doubts');
  };

  const handleCollaboration = () => {
    navigate('/collaboration');
  };

  const handleResources = () => {
    navigate('/resources');
  };

  return (
    <div className="dashboard">
      <div className="background" />
      
      {/* Navigation Header */}
      <nav className="collaboration-nav">
        <div className="nav-logo">
          <img src="/peerpath.png" alt="PeerPath" />
          <h1>PeerPath</h1>
        </div>
        <div className="nav-links">
          <motion.div
            whileHover={{ 
              scale: 1.05,
              y: -2,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/dashboard" className="active nav-link-animated">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                Dashboard
              </motion.span>
            </Link>
          </motion.div>
        </div>
        <div className="logout-container">
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

      <div className="dashboard-content">
        <h1 className="heading">
          <BlurHeading
            text={`Welcome, ${currentUser?.username || 'User'}!`}
            delay={100}
            animateBy="words"
            direction="top"
            className="text-2xl mb-8"
          />
        </h1>
        
        <div className="card-container">
          <Card
            icon="🧑‍🏫"
            title="Start Mentorship"
            description="Get guidance from seniors on career, academics and more."
            onClick={handleMentorship}
          />
          <Card
            icon="🤝"
            title="Start Collaborating"
            description="Team up with peers to build exciting projects."
            onClick={handleCollaboration}
          />
          <Card
            icon="📚"
            title="Resources"
            description="Access past sessions, guides and peer content."
            onClick={handleResources}
          />
          <Card
            icon="📍"
            title="Campus Connect"
            description="Find and connect with people nearby."
            onClick={() => navigate('/location')}
          />
        </div>
      </div>
    </div>
  );
}
