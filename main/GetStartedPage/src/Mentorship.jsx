import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Collaboration.css';

const projects = [
  {
    id: 1,
    title: "E-Learning Platform",
    description: "Building a modern e-learning platform with React and Node.js",
    skills: ["React", "Node.js", "MongoDB", "Express"],
    members: [
      { user: { username: "Alice" } },
      { user: { username: "Bob" } },
      { user: { username: "Charlie" } }
    ],
    maxMembers: 5,
    difficulty: "Intermediate",
    duration: "3 months",
    mentor: "Satyam Sharma",
    status: "Active"
  },
  {
    id: 2,
    title: "AI Chat Assistant",
    description: "Creating an intelligent chatbot using Python and TensorFlow",
    skills: ["Python", "TensorFlow", "NLP", "Flask"],
    members: [
      { user: { username: "Ananya" } },
      { user: { username: "Rahul" } }
    ],
    maxMembers: 4,
    difficulty: "Advanced",
    duration: "4 months",
    mentor: "Ananya Jain",
    status: "Active"
  },
  {
    id: 3,
    title: "Mobile Fitness App",
    description: "Cross-platform fitness tracking app with React Native",
    skills: ["React Native", "Firebase", "Redux", "TypeScript"],
    members: [
      { user: { username: "Rohit" } },
      { user: { username: "Neha" } },
      { user: { username: "Vikram" } },
      { user: { username: "Priya" } }
    ],
    maxMembers: 6,
    difficulty: "Intermediate",
    duration: "5 months",
    mentor: "Rohit Yadav",
    status: "Active"
  },
  {
    id: 4,
    title: "Blockchain Voting System",
    description: "Secure voting system using blockchain technology",
    skills: ["Solidity", "Web3.js", "React", "Node.js"],
    members: [
      { user: { username: "Priya" } }
    ],
    maxMembers: 3,
    difficulty: "Advanced",
    duration: "6 months",
    mentor: "Priya Singh",
    status: "Active"
  }
];

const Collaboration = ({ currentUser, onLogout }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: '',
    maxMembers: 5,
    category: '',
    difficulty: 'Intermediate',
    duration: '3 months',
    mentor: currentUser?.name || 'You'
  });
  const [allProjects, setAllProjects] = useState([]);

  // Fetch all projects from backend
  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/collaboration', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllProjects(response.data.collaborations);
        // Only show projects where the creator is the current user
        const myProjects = response.data.collaborations.filter(
          (proj) => proj.creator && (proj.creator._id === currentUser?._id)
        );
        setUserProjects(myProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    if (currentUser?._id) fetchAllProjects();
  }, [currentUser]);

  // Join project logic
  const handleJoinProject = async (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const confirmJoin = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/collaboration/${selectedProject._id}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setSelectedProject(null);
      // Refetch all projects to update members
      const response = await axios.get('http://localhost:5000/api/collaboration', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllProjects(response.data.collaborations);
      const myProjects = response.data.collaborations.filter(
        (proj) => proj.creator && (proj.creator._id === currentUser?._id)
      );
      setUserProjects(myProjects);
      alert('Successfully joined the project!');
    } catch (error) {
      alert('Failed to join project.');
      setShowModal(false);
      setSelectedProject(null);
    }
  };

  const handleChatWithLeader = (project) => {
    // Navigate to chat with team leader
    alert(`Opening chat with ${project.mentor} for ${project.title}`);
  };

  const handleCreateProject = () => {
    setShowCreateForm(true);
  };

  // Persist project to backend
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category || 'General',
        skills: formData.skills,
        maxMembers: formData.maxMembers
      };
      const response = await axios.post('http://localhost:5000/api/collaboration', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.collaboration) {
        setUserProjects((prev) => [response.data.collaboration, ...prev]);
        setFormData({
          title: '',
          description: '',
          skills: '',
          maxMembers: 5,
          category: '',
          difficulty: 'Intermediate',
          duration: '3 months',
          mentor: currentUser?.name || 'You'
        });
        setShowCreateForm(false);
        alert('Project created successfully!');
      }
    } catch (error) {
      alert('Failed to create project.');
      console.error('Error creating project:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Combine backend and dummy projects, remove duplicates by title
  const combinedProjects = [...(allProjects || []), ...projects].filter((proj, idx, arr) =>
    arr.findIndex(p => (p.title || '').toLowerCase() === (proj.title || '').toLowerCase()) === idx
  );
  const availableProjects = combinedProjects.filter(
    (proj) => (proj.members?.length || 1) < (proj.maxMembers || 5)
  );
  const fullProjects = allProjects.filter(
    (proj) => (proj.members?.length || 1) >= (proj.maxMembers || 5)
  );

  // Dummy full projects
  const dummyFullProjects = [
    {
      id: 101,
      title: "Quantum Computing Research",
      description: "A research group exploring quantum algorithms and hardware.",
      skills: ["Quantum Mechanics", "Python", "Qiskit"],
      members: [
        { user: { username: "Dr. Qubit" } },
        { user: { username: "Alice" } },
        { user: { username: "Bob" } },
        { user: { username: "Charlie" } }
      ],
      maxMembers: 4,
      difficulty: "Advanced",
      duration: "6 months",
      mentor: "Dr. Qubit",
      status: "Active"
    },
    {
      id: 102,
      title: "Robotics Competition Team",
      description: "Building and programming robots for national competitions.",
      skills: ["Robotics", "C++", "Electronics"],
      members: [
        { user: { username: "RoboLead" } },
        { user: { username: "Neha" } },
        { user: { username: "Vikram" } },
        { user: { username: "Priya" } },
        { user: { username: "Rohit" } }
      ],
      maxMembers: 5,
      difficulty: "Intermediate",
      duration: "4 months",
      mentor: "RoboLead",
      status: "Active"
    }
  ];

  // Full projects: combine backend and dummy, remove duplicates
  const combinedFullProjects = [...(allProjects || []), ...dummyFullProjects].filter((proj, idx, arr) =>
    arr.findIndex(p => (p.title || '').toLowerCase() === (proj.title || '').toLowerCase()) === idx
  ).filter(
    (proj) => (proj.members?.length || 1) >= (proj.maxMembers || 5)
  );

  return (
    <div className="collaboration-container">
      <nav className="collaboration-nav">
        <div className="nav-logo">
          <img src="/peerpath.png" alt="PeerPath" />
          <h1>PeerPath</h1>
        </div>
        <div className="nav-links">
          <Link to="/doubts">Doubts</Link>
          <Link to="/collaboration" className="active">Collaboration</Link>
          <Link to="/resources">Resources</Link>
          <Link to="/chat">Chat</Link>
          <Link to="/location">Campus Connect</Link>
          <Link to="/profile">Profile</Link>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="collaboration-content">
        <div className="collaboration-header">
          <h1>🤝 Project Collaboration</h1>
          <p>Join exciting projects and build amazing things together</p>
        </div>

        {/* User's Projects Section */}
        {userProjects.length > 0 && (
          <div className="user-projects-section">
            <h2>🎯 Your Projects</h2>
            <div className="projects-grid">
              {userProjects.map((project) => (
                <div key={project._id || project.id} className="project-card user-project">
                  <div className="project-header">
                    <h3>{project.title}</h3>
                    <span className={`difficulty ${(project.difficulty || 'Intermediate').toLowerCase()}`}>
                      {project.difficulty || 'Intermediate'}
                    </span>
                  </div>
                  <p className="project-description">{project.description}</p>
                  <div className="project-skills">
                    {(project.skills || []).map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                  <div className="project-meta">
                    <div className="meta-item">
                      <span>👥 {project.members?.length || 1}/{project.maxMembers || 5} Members</span>
                    </div>
                    <div className="meta-item">
                      <span>⏱️ {project.duration || '3 months'}</span>
                    </div>
                    <div className="meta-item">
                      <span>👨‍🏫 {project.mentor || (project.creator?.username || 'N/A')}</span>
                    </div>
                  </div>
                  {/* Display all member names */}
                  <div className="project-members">
                    <strong>Members:</strong> {(project.members || []).map((m, idx) => m.user?.username || m.user?.name || 'Unknown').join(', ')}
                  </div>
                  <div className="project-actions">
                    <button className="manage-btn">Manage Project</button>
                    <button className="chat-btn" onClick={() => handleChatWithLeader(project)} title={`Chat with ${project.mentor || (project.creator?.username || 'N/A')}`}>
                      Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Projects Section */}
        <div className="available-projects-section">
          <h2>🚀 Available Projects</h2>
          <div className="projects-grid">
            {availableProjects.map((project) => (
              <div key={project._id || project.id} className="project-card">
                <div className="project-header">
                  <h3>{project.title}</h3>
                  <span className={`difficulty ${(project.difficulty || 'Intermediate').toLowerCase()}`}>
                    {project.difficulty || 'Intermediate'}
                  </span>
                </div>
                <p className="project-description">{project.description}</p>
                <div className="project-skills">
                  {(project.skills || []).map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
                <div className="project-meta">
                  <div className="meta-item">
                    <span>👥 {project.members?.length || 1}/{project.maxMembers || 5} Members</span>
                  </div>
                  <div className="meta-item">
                    <span>⏱️ {project.duration || '3 months'}</span>
                  </div>
                  <div className="meta-item">
                    <span>👨‍🏫 {project.mentor || (project.creator?.username || 'N/A')}</span>
                  </div>
                </div>
                {/* Display all member names */}
                <div className="project-members">
                  <strong>Members:</strong> {(project.members || []).map((m, idx) => m.user?.username || m.user?.name || 'Unknown').join(', ')}
                </div>
                <div className="project-actions">
                  {/* Only show join if not full and not already a member */}
                  {(!project.members || !project.members.some(m => m.user?._id === currentUser?._id)) &&
                    (project.members?.length || 1) < (project.maxMembers || 5) && (
                    <button className="join-btn" onClick={() => handleJoinProject(project)}>
                      Join Project
                    </button>
                  )}
                  <button className="chat-btn" onClick={() => handleChatWithLeader(project)} title={`Chat with ${project.mentor || (project.creator?.username || 'N/A')}`}>
                    Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full Projects Section */}
        {fullProjects.length > 0 && (
          <div className="full-projects-section">
            <h2>Projects Already Full</h2>
            <div className="projects-grid">
              {fullProjects.map((project) => (
                <div key={project._id || project.id} className="project-card full-project">
                  <div className="project-header">
                    <h3>{project.title}</h3>
                    <span className={`difficulty ${(project.difficulty || 'Intermediate').toLowerCase()}`}>
                      {project.difficulty || 'Intermediate'}
                    </span>
                  </div>
                  <p className="project-description">{project.description}</p>
                  <div className="project-skills">
                    {(project.skills || []).map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                  <div className="project-meta">
                    <div className="meta-item">
                      <span>👥 {project.members?.length || 1}/{project.maxMembers || 5} Members</span>
                    </div>
                    <div className="meta-item">
                      <span>⏱️ {project.duration || '3 months'}</span>
                    </div>
                    <div className="meta-item">
                      <span>👨‍🏫 {project.mentor || (project.creator?.username || 'N/A')}</span>
                    </div>
                  </div>
                  {/* Display all member names */}
                  <div className="project-members">
                    <strong>Members:</strong> {(project.members || []).map((m, idx) => m.user?.username || m.user?.name || 'Unknown').join(', ')}
                  </div>
                  <div className="project-actions">
                    {/* No join button for full projects */}
                    <button className="chat-btn" onClick={() => handleChatWithLeader(project)} title={`Chat with ${project.mentor || (project.creator?.username || 'N/A')}`}>
                      Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Project Section */}
        <div className="create-project-section">
          <h2>Have a project idea?</h2>
          <p>Create your own project and invite others to collaborate</p>
          <button className="create-btn" onClick={handleCreateProject}>Create New Project</button>
        </div>

        {/* Join Fast! The Projects Already Full Section */}
        <div className="full-projects-section">
          <h2 style={{
            color: '#c4b5fd',
            fontSize: '2rem',
            marginBottom: '2rem',
            textAlign: 'center',
            paddingTop: '2rem',
            paddingBottom: '1.5rem'
          }}>
            Join Fast! The Projects Already Full
          </h2>
          <div className="projects-grid">
            {combinedFullProjects.map((project) => (
              <div key={project._id || project.id} className="project-card full-project">
                <div className="project-header">
                  <h3>{project.title}</h3>
                  <span className={`difficulty ${(project.difficulty || 'Intermediate').toLowerCase()}`}>
                    {project.difficulty || 'Intermediate'}
                  </span>
                </div>
                <p className="project-description">{project.description}</p>
                <div className="project-skills">
                  {(project.skills || []).map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
                <div className="project-meta">
                  <div className="meta-item">
                    <span>👥 {project.members?.length || 1}/{project.maxMembers || 5} Members</span>
                  </div>
                  <div className="meta-item">
                    <span>⏱️ {project.duration || '3 months'}</span>
                  </div>
                  <div className="meta-item">
                    <span>👨‍🏫 {project.mentor || (project.creator?.username || 'N/A')}</span>
                  </div>
                </div>
                {/* Display all member names */}
                <div className="project-members">
                  <strong>Members:</strong> {(project.members || []).map((m, idx) => m.user?.username || m.user?.name || 'Unknown').join(', ')}
                </div>
                <div className="project-actions">
                  {/* No join button for full projects */}
                  <button className="chat-btn" onClick={() => handleChatWithLeader(project)} title={`Chat with ${project.mentor || (project.creator?.username || 'N/A')}`}>
                    Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Join Project Modal */}
      {showModal && selectedProject && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowModal(false)}>
              &times;
            </button>
            <h2>Join {selectedProject.title}</h2>
            <p><strong>Description:</strong> {selectedProject.description}</p>
            <p><strong>Skills Required:</strong> {(selectedProject.skills || []).join(', ')}</p>
            <p><strong>Duration:</strong> {selectedProject.duration || '3 months'}</p>
            <p><strong>Mentor:</strong> {selectedProject.mentor || (selectedProject.creator?.username || 'N/A')}</p>
            <p><strong>Team Size:</strong> {selectedProject.members?.length || 1}/{selectedProject.maxMembers || 5}</p>
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)} className="cancel-btn">
                Cancel
              </button>
              {/* Only show join if not full and not already a member */}
              {(!selectedProject.members || !selectedProject.members.some(m => m.user?._id === currentUser?._id)) &&
                (selectedProject.members?.length || 1) < (selectedProject.maxMembers || 5) && (
                <button onClick={confirmJoin} className="confirm-btn">
                  Join Project
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Project Form Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content create-form" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowCreateForm(false)}>
              &times;
            </button>
            <h2>Create New Project</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Project Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter project title"
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Describe your project"
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Skills Required (comma-separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  required
                  placeholder="React, Node.js, MongoDB"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Max Team Size</label>
                  <select
                    name="maxMembers"
                    value={formData.maxMembers}
                    onChange={handleInputChange}
                  >
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                    <option value={6}>6</option>
                    <option value={8}>8</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Difficulty Level</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Duration</label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                  >
                    <option value="1 month">1 month</option>
                    <option value="2 months">2 months</option>
                    <option value="3 months">3 months</option>
                    <option value="4 months">4 months</option>
                    <option value="5 months">5 months</option>
                    <option value="6 months">6 months</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="confirm-btn">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collaboration; 