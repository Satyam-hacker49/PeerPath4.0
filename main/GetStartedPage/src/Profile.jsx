import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ClickSpark from './ClickSpark.jsx';
import AnimatedNavLink from './AnimatedNavLink.jsx';
import './Profile.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { FaCamera } from 'react-icons/fa';

const Profile = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    year: '',
    expertise: [],
    skills: [],
    doubtsSolved: 0,
    doubtsAsked: 0,
    joinDate: '',
    profilePhoto: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newExpertise, setNewExpertise] = useState('');
  const [weeklyDoubts, setWeeklyDoubts] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
      navigate('/login');
      return;
    }

    setCurrentUser(user);
    fetchUserProfile(user._id);
    fetchWeeklyDoubts(user._id, token);
  }, [navigate]);

  const fetchUserProfile = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/users/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Fetched user profile data:', response.data);
      console.log('Profile photo from server:', response.data.profilePhoto);
      
      setProfileData({
        username: response.data.username || '',
        bio: response.data.bio || '',
        year: response.data.year || '',
        expertise: response.data.expertise || [],
        skills: response.data.skills || [],
        doubtsSolved: response.data.doubtsSolved || 0,
        doubtsAsked: response.data.doubtsAsked || 0,
        joinDate: response.data.joinDate || new Date().toISOString(),
        profilePhoto: response.data.profilePhoto || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchWeeklyDoubts = async (userId, token) => {
    try {
      console.log('Fetching weekly doubts for user:', userId);
      const response = await axios.get(`http://localhost:5000/api/doubts/weekly/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Weekly doubts response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setWeeklyDoubts(response.data);
        console.log('Weekly doubts set successfully:', response.data);
      } else {
        console.error('Invalid weekly doubts data format:', response.data);
        setWeeklyDoubts([]);
      }
    } catch (error) {
      console.error('Error fetching weekly doubts:', error);
      console.error('Error response:', error.response?.data);
      setWeeklyDoubts([]);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/auth/profile', 
        {
          bio: profileData.bio,
          year: profileData.year,
          expertise: profileData.expertise.join(','),
          skills: profileData.skills.join(',')
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const addExpertise = () => {
    if (newExpertise.trim() && !profileData.expertise.includes(newExpertise.trim())) {
      setProfileData({
        ...profileData,
        expertise: [...profileData.expertise, newExpertise.trim()]
      });
      setNewExpertise('');
    }
  };

  const removeExpertise = (expertiseToRemove) => {
    setProfileData({
      ...profileData,
      expertise: profileData.expertise.filter(item => item !== expertiseToRemove)
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login');
  };

  const stats = [
    { label: 'Doubts Solved', value: profileData.doubtsSolved || 0 },
    { label: 'Doubts Asked', value: profileData.doubtsAsked || 0 },
    { label: 'Days Active', value: (() => {
      try {
        const joinDate = new Date(profileData.joinDate);
        if (isNaN(joinDate.getTime())) return 0;
        const daysDiff = Math.ceil((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff > 0 ? daysDiff : 0;
      } catch (error) {
        return 0;
      }
    })() }
  ];

  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('profilePhoto', file);
      const response = await axios.post('http://localhost:5000/api/users/upload-profile-photo', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setProfileData((prev) => ({ ...prev, profilePhoto: response.data.profilePhoto }));
      // Update the user in localStorage as well
      const currentUserData = JSON.parse(localStorage.getItem('user'));
      const updatedUserData = { ...currentUserData, profilePhoto: response.data.profilePhoto };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      // Refresh the profile data to ensure everything is up to date
      if (currentUser) {
        fetchUserProfile(currentUser._id);
      }
      alert('Profile photo updated!');
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      alert('Failed to upload profile photo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-container">
      <nav className="collaboration-nav">
        <div className="nav-logo">
          <img src="/peerpath.png" alt="PeerPath" />
          <h1>PeerPath</h1>
        </div>
        <div className="nav-links">
          <AnimatedNavLink to="/doubts" isActive={false}>Doubts</AnimatedNavLink>
          <AnimatedNavLink to="/collaboration" isActive={false}>Collaboration</AnimatedNavLink>
          <AnimatedNavLink to="/resources" isActive={false}>Resources</AnimatedNavLink>
          <AnimatedNavLink to="/chat" isActive={false}>Chat</AnimatedNavLink>
          <AnimatedNavLink to="/location" isActive={false}>Campus Connect</AnimatedNavLink>
          <AnimatedNavLink to="/profile" isActive={true}>Profile</AnimatedNavLink>
        </div>
        <div className="logout-container">
          <ClickSpark
            sparkColor='#ff4444'
            sparkSize={12}
            sparkRadius={25}
            sparkCount={8}
            duration={300}
          >
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </ClickSpark>
        </div>
      </nav>

      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar">
            {profileData.profilePhoto ? (
              <>
                <img 
                  src={`http://localhost:5000${profileData.profilePhoto}`} 
                  alt="Profile" 
                  className="avatar-image" 
                />
                <label className="camera-icon-overlay">
                  <FaCamera size={22} />
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleProfilePhotoChange}
                    disabled={uploading}
                  />
                </label>
              </>
            ) : (
              <>
                <span className="avatar-text">{profileData.username.charAt(0)}</span>
                <label className="camera-icon-overlay">
                  <FaCamera size={22} />
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleProfilePhotoChange}
                    disabled={uploading}
                  />
                </label>
              </>
            )}
          </div>
          <div className="profile-info">
            <h1>{profileData.username}</h1>
            <p className="profile-level">{profileData.year || 'Student'}</p>
          </div>
          <button 
            className="edit-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="profile-stats">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="profile-sections">
          <div className="profile-section">
            <h2>About Me</h2>
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                className="bio-input"
                rows="4"
              />
            ) : (
              <p className="bio-text">{profileData.bio || 'No bio added yet.'}</p>
            )}
          </div>

          <div className="profile-section">
            <h2>Skills</h2>
            <div className="skills-container">
              {profileData.skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                  {isEditing && (
                    <button 
                      onClick={() => removeSkill(skill)}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="add-item">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  className="add-input"
                />
                <button onClick={addSkill} className="add-btn">Add</button>
              </div>
            )}
          </div>

          <div className="profile-section">
            <h2>Areas of Expertise</h2>
            <div className="interests-container">
              {profileData.expertise.map((item, index) => (
                <span key={index} className="interest-tag">
                  {item}
                  {isEditing && (
                    <button 
                      onClick={() => removeExpertise(item)}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="add-item">
                <input
                  type="text"
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  placeholder="Add an area of expertise"
                  className="add-input"
                />
                <button onClick={addExpertise} className="add-btn">Add</button>
              </div>
            )}
          </div>

          <div className="profile-section">
            <h2>Academic Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Year of Study</label>
                {isEditing ? (
                  <select
                    value={profileData.year}
                    onChange={(e) => setProfileData({...profileData, year: e.target.value})}
                    className="info-input"
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Post Graduate">Post Graduate</option>
                  </select>
                ) : (
                  <span>{profileData.year || 'Not specified'}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="save-section">
            <ClickSpark
              sparkColor='#00ff88'
              sparkSize={15}
              sparkRadius={35}
              sparkCount={12}
              duration={400}
            >
              <button onClick={handleSave} className="save-btn">
                Save Changes
              </button>
            </ClickSpark>
          </div>
        )}
      </div>

      {weeklyDoubts && weeklyDoubts.length > 0 ? (
        <div className="profile-graph-section" style={{ width: '100%', maxWidth: 900, margin: '2rem auto 0', background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '2rem 1rem' }}>
          <h2 style={{ textAlign: 'center' }}>Doubts Asked This Week</h2>
          <div style={{ textAlign: 'center', marginBottom: '1rem', color: '#a78bfa' }}>
            Total doubts this week: {weeklyDoubts.reduce((sum, day) => sum + (day.count || 0), 0)}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyDoubts} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={date => {
                  const d = new Date(date);
                  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }} 
              />
              <YAxis allowDecimals={false} />
              <Tooltip 
                labelFormatter={(date) => {
                  const d = new Date(date);
                  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                }}
                formatter={(value) => [value, 'Doubts']}
              />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="profile-graph-section" style={{ width: '100%', maxWidth: 900, margin: '2rem auto 0', background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '2rem 1rem', textAlign: 'center' }}>
          <h2 style={{ textAlign: 'center' }}>Doubts Asked This Week</h2>
          <p style={{ color: '#a78bfa', fontSize: '1.1rem' }}>
            No doubts asked this week. Start asking questions to see your activity here!
          </p>
        </div>
      )}
    </div>
  );
};

export default Profile; 