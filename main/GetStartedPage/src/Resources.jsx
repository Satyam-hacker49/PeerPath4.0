import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ClickSpark from './ClickSpark.jsx';
import AnimatedNavLink from './AnimatedNavLink.jsx';
import './Resources.css';

const Resources = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('study-materials');

  const studyMaterials = [
    {
      id: 1,
      title: "NITB Freshers Portal",
      description: "Complete collection of 1st year notes, assignments, and study materials",
      link: "https://nitbfreshers.42web.io/?i=1",
      type: "Website",
      icon: "🌐"
    },
    {
      id: 3,
      title: "MANIT Study Portal App",
      description: "Android app for downloading class notes, assignments, and previous year papers",
      link: "https://manitfirst.web.app/download",
      type: "Android App",
      icon: "📱"
    }
  ];

  const societies = {
    technical: [
      {
        id: 'sae',
        title: 'SAE MANIT',
        description: 'The Society of Automotive Engineers\' student chapter focused on mobility engineering, vehicle fabrication (e.g., Baja, Supra), and hosting auto-tech events.',
        link: 'https://www.manit.ac.in/content/sae-collegiate-club',
        type: 'Technical',
        logo: '/sae-logo.svg'
      },
      {
        id: 'ecell',
        title: 'E-Cell MANIT',
        description: 'Encourages entrepreneurship via mentorship programs, startup support, pitch events, and ideation workshops.',
        link: 'https://www.ecellnitb.in/?view=about',
        type: 'Technical',
        logo: '/ecell-logo.svg'
      },
      {
        id: 'robotics',
        title: 'Robotics Club',
        description: 'Builds technical expertise through hands-on robotics projects, competitions, and learning sessions.',
        link: 'https://www.instagram.com/roboticsclubmanit/',
        type: 'Technical',
        logo: '/robotics-logo.svg'
      },
      {
        id: 'iste',
        title: 'ISTE MANIT',
        description: 'Enhances technical knowledge with seminars, workshops, and collaborations with industry professionals.',
        link: 'https://www.istemanit.in/',
        type: 'Technical',
        logo: '/iste-logo.svg'
      },
      {
        id: 'ieee',
        title: 'IEEE MANIT',
        description: 'Promotes learning in electronics, computing, and emerging tech, conducting technical events and hackathons.',
        link: 'https://ieeenitb.com/',
        type: 'Technical',
        logo: '/ieee-logo.svg'
      },
      {
        id: 'zenith',
        title: 'Zenith (Programming Club)',
        description: 'Conducts DSA classes, contests, and placement prep, aiming to improve coding proficiency and problem-solving skills.',
        link: 'https://www.facebook.com/zenith.manit',
        type: 'Technical',
        logo: '/zenith-logo.svg'
      },
      {
        id: 'evolve',
        title: 'Evolve',
        description: 'Interdisciplinary technical club conducting EV design workshops, power electronics and ML projects, and practical prototyping across domains.',
        link: 'https://www.instagram.com/evolve_nitb/',
        type: 'Technical',
        logo: '/evolve-logo.svg'
      }
    ],
    cultural: [
      {
        id: 'roobaroo',
        title: 'Roobaroo',
        description: 'Celebrates artistic expression via music, dance, drama, and anchoring — a creative platform for all talents.',
        link: 'https://www.manit.ac.in/content/roobaroo',
        type: 'Cultural',
        logo: '/roobaroo-logo.svg'
      },
      {
        id: 'aeseanek',
        title: 'AE SE ANEK',
        description: 'Promotes diversity and inclusion through culturally rich fests, inter-branch performances, and theme-based creative showcases.',
        link: 'https://www.manit.ac.in/content/%E0%A4%90-%E0%A4%B8%E0%A5%87-%E0%A4%90%E0%A4%A8%E0%A4%95',
        type: 'Cultural',
        logo: '/aeseanek-logo.svg'
      },
      {
        id: 'spicmacay',
        title: 'SPIC MACAY',
        description: 'Aims to preserve Indian heritage through classical music concerts, cultural awareness events, and arts appreciation.',
        link: 'https://www.manit.ac.in/content/spic-macay',
        type: 'Cultural',
        logo: '/spicmacay-logo.svg'
      }
    ],
    educational: [
      {
        id: 'avantikulam',
        title: 'Avantikulam',
        description: 'A social initiative providing free education and mentoring to underprivileged students preparing for JEE, NEET, NTSE, etc.',
        link: 'https://www.instagram.com/_nitb_avantikulam_/',
        type: 'Educational Outreach',
        logo: '/avantikulam-logo.svg'
      },
      {
        id: 'quizzers',
        title: 'Quizzer\'s Club',
        description: 'Hosts quizzes on diverse topics, encouraging learning through competition and curiosity.',
        link: 'https://www.quizzersclub.in/',
        type: 'Educational',
        logo: '/quizzers-logo.svg'
      }
    ],
    sportsAndHobby: [
        {
            id: 'purge',
            title: 'Purge',
            description: 'Drives eco-awareness campaigns, cleanups, and sustainability initiatives on campus.',
            link: 'https://www.instagram.com/purge_manit/',
            type: 'Environmental',
            logo: '/purge-logo.svg'
        },
        {
            id: 'pixel',
            title: 'Pixel',
            description: 'For enthusiasts of visual media, photography, and video editing — covers both technical and creative angles.',
            link: 'https://www.instagram.com/pixel.manit/',
            type: 'Hobby',
            logo: '/pixel-logo.svg'
        }
    ]
  };

  const results = [
    {
      id: 1,
      title: "Semester Results",
      description: "Check your semester examination results, grades, and academic performance",
      link: "https://students.manit.ac.in/result",
      type: "Academic Results",
      icon: "📋"
    },
    {
      id: 2,
      title: "Marks & Grades",
      description: "View detailed marks, grade points, and cumulative performance analysis",
      link: "https://manit.ac.in/marks",
      type: "Marks",
      icon: "📊"
    },
    {
      id: 3,
      title: "Latest News & Updates",
      description: "Stay updated with the latest academic announcements, events, and important notices",
      link: "https://manit.ac.in/news",
      type: "News",
      icon: "📰"
    }
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleResourceClick = (resource) => {
    if (resource.link && resource.link !== '#') {
      window.open(resource.link, '_blank');
    }
  };

  const renderContent = () => {
    if (activeTab === 'study-materials') {
      return (
        <div className="resources-grid">
          {studyMaterials.map((resource) => (
            <div key={resource.id} className="resource-card" onClick={() => handleResourceClick(resource)}>
              <div className="resource-icon">{resource.icon}</div>
              <h3 className="resource-title">{resource.title}</h3>
              <p className="resource-type">{resource.type}</p>
              <p className="resource-description">{resource.description}</p>
              <div className="resource-action">
                <ClickSpark
                  sparkColor='#00aaff'
                  sparkSize={12}
                  sparkRadius={30}
                  sparkCount={10}
                  duration={350}
                >
                  <button className="access-btn">Access</button>
                </ClickSpark>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'society-recruitment') {
      return (
        <>
          <div className="society-category">
            <h2 className="society-category-title">🛠 Technical Societies</h2>
            <div className="resources-grid">
              {societies.technical.map((society) => (
                <div key={society.id} className="resource-card">
                  <div className="resource-logo">
                    <img 
                      src={society.logo} 
                      alt={`${society.title} logo`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <span className="fallback-icon" style={{display: 'none'}}>
                      {society.title === 'SAE MANIT' ? '🏎️' :
                       society.title === 'E-Cell MANIT' ? '💡' :
                       society.title === 'Robotics Club' ? '🤖' :
                       society.title === 'ISTE MANIT' ? '🎓' :
                       society.title === 'IEEE MANIT' ? '💡' :
                       society.title === 'Zenith (Programming Club)' ? '💻' :
                       society.title === 'Evolve' ? '⚡' : '🏛️'}
                    </span>
                  </div>
                  <h3 className="resource-title">{society.title}</h3>
                  <p className="resource-description">{society.description}</p>
                  <div className="resource-action">
                    <a href={society.link} target="_blank" rel="noopener noreferrer">
                      <ClickSpark
                        sparkColor='#ffaa00'
                        sparkSize={12}
                        sparkRadius={30}
                        sparkCount={10}
                        duration={350}
                      >
                        <button className="access-btn">Visit Page</button>
                      </ClickSpark>
                    </a>
                    <button className="recruitment-btn">Recruitment Coming Soon</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="society-category">
            <h2 className="society-category-title">🎭 Cultural & Literary Societies</h2>
            <div className="resources-grid">
              {societies.cultural.map((society) => (
                <div key={society.id} className="resource-card">
                  <div className="resource-logo">
                    <img 
                      src={society.logo} 
                      alt={`${society.title} logo`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <span className="fallback-icon" style={{display: 'none'}}>
                      {society.title === 'Roobaroo' ? '🎨' :
                       society.title === 'AE SE ANEK' ? '🏛️' :
                       society.title === 'SPIC MACAY' ? '🎶' : '🎨'}
                    </span>
                  </div>
                  <h3 className="resource-title">{society.title}</h3>
                  <p className="resource-description">{society.description}</p>
                  <div className="resource-action">
                    <a href={society.link} target="_blank" rel="noopener noreferrer">
                      <ClickSpark
                        sparkColor='#ff00aa'
                        sparkSize={12}
                        sparkRadius={30}
                        sparkCount={10}
                        duration={350}
                      >
                        <button className="access-btn">Visit Page</button>
                      </ClickSpark>
                    </a>
                    <button className="recruitment-btn">Recruitment Coming Soon</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="society-category">
            <h2 className="society-category-title">📚 Educational Outreach</h2>
            <div className="resources-grid">
              {societies.educational.map((society) => (
                <div key={society.id} className="resource-card">
                  <div className="resource-logo">
                    <img 
                      src={society.logo} 
                      alt={`${society.title} logo`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <span className="fallback-icon" style={{display: 'none'}}>
                      {society.title === 'Avantikulam' ? '📚' :
                       society.title === 'Quizzer\'s Club' ? '❓' : '📚'}
                    </span>
                  </div>
                  <h3 className="resource-title">{society.title}</h3>
                  <p className="resource-description">{society.description}</p>
                  <div className="resource-action">
                    <a href={society.link} target="_blank" rel="noopener noreferrer">
                      <ClickSpark
                        sparkColor='#ffaa00'
                        sparkSize={12}
                        sparkRadius={30}
                        sparkCount={10}
                        duration={350}
                      >
                        <button className="access-btn">Visit Page</button>
                      </ClickSpark>
                    </a>
                    <button className="recruitment-btn">Recruitment Coming Soon</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="society-category">
            <h2 className="society-category-title">🌱 Environment, Sports & Hobby Clubs</h2>
            <div className="resources-grid">
              {societies.sportsAndHobby.map((society) => (
                <div key={society.id} className="resource-card">
                  <div className="resource-logo">
                    <img 
                      src={society.logo} 
                      alt={`${society.title} logo`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <span className="fallback-icon" style={{display: 'none'}}>
                      {society.title === 'Purge' ? '🌿' :
                       society.title === 'Pixel' ? '📷' : '🏆'}
                    </span>
                  </div>
                  <h3 className="resource-title">{society.title}</h3>
                  <p className="resource-description">{society.description}</p>
                  <div className="resource-action">
                    <a href={society.link} target="_blank" rel="noopener noreferrer">
                      <ClickSpark
                        sparkColor='#00ffff'
                        sparkSize={12}
                        sparkRadius={30}
                        sparkCount={10}
                        duration={350}
                      >
                        <button className="access-btn">Visit Page</button>
                      </ClickSpark>
                    </a>
                    <button className="recruitment-btn">Recruitment Coming Soon</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      );
    }

    if (activeTab === 'results') {
      return (
        <div className="resources-grid">
          {results.map((resource) => (
            <div key={resource.id} className="resource-card">
              <div className="resource-icon">{resource.icon}</div>
              <h3 className="resource-title">{resource.title}</h3>
              <p className="resource-description">{resource.description}</p>
              <div className="resource-action single-button">
                {resource.id === 2 ? (
                  <button className="recruitment-btn">Coming Soon</button>
                ) : (
                  <a href={resource.link} target="_blank" rel="noopener noreferrer">
                    <ClickSpark
                      sparkColor='#00ff88'
                      sparkSize={12}
                      sparkRadius={30}
                      sparkCount={10}
                      duration={350}
                    >
                      <button className="access-btn">Access Portal</button>
                    </ClickSpark>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="resources-container">
      <nav className="collaboration-nav">
        <div className="nav-logo">
          <img src="/peerpath.png" alt="PeerPath" />
          <h1>PeerPath</h1>
        </div>
        <div className="nav-links">
          <AnimatedNavLink to="/doubts" isActive={false}>Doubts</AnimatedNavLink>
          <AnimatedNavLink to="/collaboration" isActive={false}>Collaboration</AnimatedNavLink>
          <AnimatedNavLink to="/resources" isActive={true}>Resources</AnimatedNavLink>
          <AnimatedNavLink to="/chat" isActive={false}>Chat</AnimatedNavLink>
          <AnimatedNavLink to="/location" isActive={false}>Campus Connect</AnimatedNavLink>
          <AnimatedNavLink to="/profile" isActive={false}>Profile</AnimatedNavLink>
        </div>
        <div className="logout-container">
          <ClickSpark
            sparkColor='#ff4444'
            sparkSize={12}
            sparkRadius={25}
            sparkCount={8}
            duration={300}
          >
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </ClickSpark>
        </div>
      </nav>

      <main className="resources-main">
        <header className="resources-header">
          <h1>University Resources</h1>
          <p>Your central hub for academic materials, society information, and official updates.</p>
        </header>

        <div className="category-tabs">
          <button onClick={() => handleTabClick('study-materials')} className={`category-tab ${activeTab === 'study-materials' ? 'active' : ''}`}>
            📚 Study Materials
          </button>
          <button onClick={() => handleTabClick('society-recruitment')} className={`category-tab ${activeTab === 'society-recruitment' ? 'active' : ''}`}>
            🏛️ Society Recruitment
          </button>
          <button onClick={() => handleTabClick('results')} className={`category-tab ${activeTab === 'results' ? 'active' : ''}`}>
            📊 Results & Updates
          </button>
        </div>

        <div className="resources-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Resources;