import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import Modal from 'react-modal';
import AnimatedNavLink from './AnimatedNavLink.jsx';
import "./Doubts.css";
import { TrendingDoubts } from './TrendingDoubts.jsx';
import { TopHelpers } from './TopHelpers.jsx';
import { AskDoubt } from './AskDoubt.jsx';

// DoubtCard styled like Top Helpers
function DoubtCard({ doubt, onSolve, onCall, onVideoCall, onChat, onLike, likedByCurrentUser, showMarkSolved, onMarkSolved, isAsker, onImageSolution, onImageClick, onWriteSolution }) {
  const fileInputRef = useRef();
  const [openSolutionModal, setOpenSolutionModal] = React.useState(false);
  const [modalType, setModalType] = React.useState('written');
  const [selectedSolution, setSelectedSolution] = React.useState(null);
  const writtenSolutions = doubt.solutions.filter(sol => sol.content && !sol.image);
  const imageSolutions = doubt.solutions.filter(sol => sol.image);

  const handleTabClick = (type) => {
    setModalType(type);
    setOpenSolutionModal(true);
  };

  return (
    <div className={`doubt-card${Array.isArray(doubt.solutions) && doubt.solutions.length > 0 ? ' has-solutions' : ''}${doubt.isResolved ? ' resolved' : ''}`}>
      <div className="helper-header">
        <div className="helper-avatar">
          <span className="avatar-emoji">❓</span>
        </div>
        <div className="helper-info">
          <h3 className="helper-name">{doubt.question}</h3>
          <div className="helper-rating">
            <span className="stars">Asked by: {typeof doubt.user === 'object' ? doubt.user.username : doubt.user}</span>
            {doubt.isResolved && <span className="resolved-badge" style={{ marginLeft: 8 }}>✅ Solved</span>}
          </div>
        </div>
      </div>
      <div className="helper-bio">
        <p>{doubt.details}</p>
      </div>
      {/* Solution tab icons open modal */}
      {Array.isArray(doubt.solutions) && doubt.solutions.length > 0 && (
        <div className="solutions-bar" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1.2rem',
          margin: '1.2rem 0 0.5rem 0',
          padding: '0.5rem 0',
          borderTop: '1px solid rgba(139,92,246,0.12)',
        }}>
          {writtenSolutions.length > 0 && (
            <button
              className="solution-tab-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(139,92,246,0.10)',
                color: '#dabfff',
                border: 'none',
                borderRadius: 8,
                padding: '0.4rem 1.1rem',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s, box-shadow 0.2s',
                boxShadow: '0 1px 4px rgba(139,92,246,0.08)',
              }}
              onClick={() => handleTabClick('written')}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(139,92,246,0.18)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(139,92,246,0.10)'}
            >
              <span style={{ fontSize: '1.2em', marginRight: 4 }}>📝</span>
              <span style={{ fontWeight: 700 }}>{writtenSolutions.length}</span>
            </button>
          )}
          {imageSolutions.length > 0 && (
            <button
              className="solution-tab-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(16,185,129,0.10)',
                color: '#6ee7b7',
                border: 'none',
                borderRadius: 8,
                padding: '0.4rem 1.1rem',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s, box-shadow 0.2s',
                boxShadow: '0 1px 4px rgba(16,185,129,0.08)',
              }}
              onClick={() => handleTabClick('image')}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(16,185,129,0.18)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(16,185,129,0.10)'}
            >
              <span style={{ fontSize: '1.2em', marginRight: 4 }}>🖼️</span>
              <span style={{ fontWeight: 700 }}>{imageSolutions.length}</span>
            </button>
          )}
        </div>
      )}
      {/* Modal for solution list by type */}
      {openSolutionModal && (
        <div className="modal-overlay" style={{
          zIndex: 9999,
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(20, 20, 40, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }} onClick={() => setOpenSolutionModal(false)}>
          <div className="modal-content" style={{
            position: 'relative',
            width: '100%',
            maxWidth: 700,
            maxHeight: '90vh',
            borderRadius: 16,
            background: '#fff',
            color: '#232046',
            boxShadow: '0 8px 32px rgba(40,40,80,0.18)',
            overflowY: 'auto',
            padding: '2.5rem 2rem 2rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }} onClick={e => e.stopPropagation()}>
            <button className="close-btn" style={{ position: 'absolute', top: 18, right: 24, fontSize: 32, background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontWeight: 700 }} onClick={() => setOpenSolutionModal(false)}>&times;</button>
            <h2 style={{marginBottom: '1.2rem', color: '#7c3aed', fontSize: '2rem', textAlign: 'center', fontWeight: 700}}>
              {modalType === 'written' ? 'Written Solutions' : 'Image Solutions'}
            </h2>
            {(modalType === 'written' ? writtenSolutions : imageSolutions).length === 0 ? (
              <div style={{ color: '#a78bfa', textAlign: 'center', margin: '1.5rem 0', fontSize: 20 }}>No solutions yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
                {(modalType === 'written' ? writtenSolutions : imageSolutions).map((sol) => (
                  <div
                    key={sol._id}
                    className="solution-item"
                    style={{ background: '#f3f0ff', borderRadius: 10, padding: 24, border: '1px solid #e0e7ff', fontSize: 18, wordBreak: 'break-word', boxShadow: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                      {sol.user?.profilePhoto && (
                        <img 
                          src={`http://localhost:5000${sol.user.profilePhoto}`} 
                          alt={sol.user?.username} 
                          className="solution-avatar"
                          style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #c4b5fd' }}
                        />
                      )}
                      <div style={{ fontWeight: 700, color: '#7c3aed', fontSize: '1.2rem' }}>{sol.user?.username || 'Unknown'}</div>
                    </div>
                    {sol.image && (
                      <img 
                        src={`http://localhost:5000${sol.image}`} 
                        alt="solution" 
                        className="solution-image"
                        style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 10, marginBottom: 12, display: 'block', boxShadow: 'none' }}
                      />
                    )}
                    {sol.content && (
                      <div style={{ color: '#232046', fontSize: 18, marginBottom: 10, lineHeight: 1.7 }}>{sol.content}</div>
                    )}
                    <div style={{ color: '#7c3aed', fontSize: '1rem', textAlign: 'right' }}>
                      {sol.createdAt ? new Date(sol.createdAt).toLocaleString() : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Modal for individual solution details */}
      {selectedSolution && (
        <div className="modal-overlay" onClick={() => setSelectedSolution(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedSolution(null)}>&times;</button>
            <h2>Solution by {selectedSolution.user?.username || 'Unknown'}</h2>
            {selectedSolution.user?.profilePhoto && (
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <img 
                  src={`http://localhost:5000${selectedSolution.user.profilePhoto}`} 
                  alt={selectedSolution.user?.username} 
                  style={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: '2px solid rgba(139, 92, 246, 0.3)'
                  }} 
                />
              </div>
            )}
            {selectedSolution.image && (
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <img 
                  src={`http://localhost:5000${selectedSolution.image}`} 
                  alt="solution" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '400px', 
                    borderRadius: 12, 
                    border: '2px solid rgba(139, 92, 246, 0.2)'
                  }} 
                />
              </div>
            )}
            {selectedSolution.content && (
              <div style={{ 
                color: '#a78bfa', 
                fontSize: '1rem', 
                lineHeight: '1.6',
                marginBottom: '1rem',
                padding: '1rem',
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: 8,
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                {selectedSolution.content}
              </div>
            )}
            <div style={{ 
              color: '#7c3aed', 
              fontSize: '0.9rem', 
              textAlign: 'center',
              padding: '0.5rem',
              background: 'rgba(124, 58, 237, 0.1)',
              borderRadius: 6,
              border: '1px solid rgba(124, 58, 237, 0.2)'
            }}>
              Posted on {selectedSolution.createdAt ? new Date(selectedSolution.createdAt).toLocaleString() : 'Unknown date'}
            </div>
          </div>
        </div>
      )}
      <div className="doubt-actions-carousel action-btn-row">
        <button className="call-btn small-action-btn" onClick={() => onCall(doubt)}>📞</button>
        <button
          className="gallery-btn small-action-btn"
          title="Post Image Solution"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          <span role="img" aria-label="gallery">🖼️</span>
        </button>
        <button
          className="like-btn small-action-btn"
          style={{ fontSize: '1.2rem', color: likedByCurrentUser ? '#fbbf24' : '#a78bfa' }}
          onClick={() => onLike(doubt)}
          title={likedByCurrentUser ? 'Unlike' : 'Like'}
        >
          👍 {Array.isArray(doubt.likes) ? doubt.likes.length : 0}
        </button>
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={e => {
            if (e.target.files && e.target.files[0]) {
              onImageSolution(doubt, e.target.files[0]);
              e.target.value = '';
            }
          }}
        />
        <button className="write-solution-btn" onClick={() => onWriteSolution(doubt)}>
          ✍️ Write Solution
        </button>
        {showMarkSolved && !doubt.isResolved && (
          <button className="solve-btn" onClick={() => onMarkSolved(doubt)}>
            ✔️ Mark as Solved
          </button>
        )}
      </div>
    </div>
  );
}

export default function Doubts({ currentUser, onLogout }){
    const [doubts, setDoubts] = useState([]);
    const [topHelpers, setTopHelpers] = useState([]);
    const [showAskDoubt, setShowAskDoubt] = useState(false);
    const [error, setError] = useState('');
    const [showSolutionModal, setShowSolutionModal] = useState(false);
    const [selectedDoubt, setSelectedDoubt] = useState(null);
    const [solutions, setSolutions] = useState([]);
    const [accepting, setAccepting] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '' });
    const [imageModal, setImageModal] = useState({ open: false, image: '', solver: '', profilePhoto: '' });
    const [showWriteSolutionModal, setShowWriteSolutionModal] = useState(false);
    const [writeSolutionText, setWriteSolutionText] = useState('');
    const [writeSolutionDoubt, setWriteSolutionDoubt] = useState(null);

    // Carousel for doubts
    const [carouselIndex, setCarouselIndex] = useState(0);
    const scrollDoubtsLeft = () => setCarouselIndex(i => Math.max(i - 1, 0));
    const scrollDoubtsRight = () => setCarouselIndex(i => Math.min(i + 1, Math.max(0, mappedDoubts.length - 3)));

    // Call/Video Call handlers
    const handleCall = (doubt) => {
      alert(`Initiating call to the asker of: ${doubt.question}`);
    };
    const handleVideoCall = (doubt) => {
      alert(`Starting video call for: ${doubt.question}`);
    };
    const navigate = useNavigate();
    const handleChat = (doubt) => {
      // Open group chat for all users who liked the doubt
      navigate(`/chat/doubt_${doubt.id || doubt._id}`);
    };
    const handleSolve = async (doubt) => {
      try {
        // Mark the doubt as solved in the backend
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:5000/api/doubts/${doubt.id}/solve`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Remove the solved doubt from the list
        setDoubts(prev => prev.filter(d => (d._id || d.id) !== doubt.id));
        // Optionally, increment the solver's count (fetch profile or update state)
      } catch (error) {
        alert('Failed to mark as solved.');
      }
    };
    const handleLike = async (doubt) => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`http://localhost:5000/api/doubts/${doubt.id}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Update the local state with the new like count
        setDoubts(prev => prev.map(d => (d._id || d.id) === doubt.id ? { ...d, likes: response.data.doubt.likes } : d));
      } catch (error) {
        alert('Failed to like/unlike doubt.');
      }
    };

    useEffect(() => {
        fetchDoubts();
        fetchTopHelpers();
    }, []);

    const fetchDoubts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/doubts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoubts(response.data.doubts);
        } catch (error) {
            console.error('Error fetching doubts:', error);
            setError('Failed to load doubts');
        }
    };

    const fetchTopHelpers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/users/top-helpers');
            setTopHelpers(response.data);
        } catch (error) {
            console.error('Error fetching top helpers:', error);
        }
    };

    const handleDoubtSubmit = async (newDoubt) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/doubts', newDoubt, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Doubt posted:', response.data);
            setDoubts(prevDoubts => [response.data.doubt, ...prevDoubts]);
            setShowAskDoubt(false);
        } catch (error) {
            console.error('Error creating doubt:', error, error.response?.data);
            setError('Failed to create doubt');
        }
    };

    const handleDoubtUpdate = (updatedDoubts) => {
        setDoubts(updatedDoubts);
    };

    // Map backend doubts to TrendingDoubts structure
    const mappedDoubts = (doubts || [])
      .filter(doubt => doubt && typeof doubt === 'object')
      .map(doubt => ({
        id: doubt._id || doubt.id,
        question: doubt.title || doubt.question || '',
        user: doubt.user,
        details: doubt.content || doubt.details || '',
        time: doubt.time || doubt.createdAt || '',
        replies: doubt.replies || (doubt.answers ? doubt.answers.length : 0) || 0,
        likes: doubt.likes || 0,
        category: doubt.category || 'general',
        tags: Array.isArray(doubt.tags) ? doubt.tags.map(t => String(t)) : [],
        isResolved: typeof doubt.isResolved === 'boolean' ? doubt.isResolved : false,
        solutions: Array.isArray(doubt.solutions) ? doubt.solutions.map(sol => ({ ...sol })) : []
      }))
      .filter(d => d.question && typeof d.question === 'string');
    console.log('mappedDoubts:', mappedDoubts);

    // Sort mappedDoubts by like count descending
    const sortedDoubts = [...mappedDoubts].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));

    // Fetch solutions for a doubt
    const fetchSolutions = async (doubtId) => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/doubts/${doubtId}`);
        setSolutions(response.data.solutions || []);
      } catch (error) {
        setSolutions([]);
      }
    };

    // Open modal to select solution
    const handleOpenSolutionModal = async (doubt) => {
      setSelectedDoubt(doubt);
      await fetchSolutions(doubt.id);
      setShowSolutionModal(true);
    };

    // Toast helper
    const showToast = (message, type = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast({ message: '', type: '' }), 2500);
    };

    // Accept a solution
    const handleAcceptSolution = async (solutionId) => {
      if (!selectedDoubt) return;
      setAccepting(true);
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:5000/api/doubts/${selectedDoubt.id}/solutions/${solutionId}/accept`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setShowSolutionModal(false);
        setAccepting(false);
        setDoubts(prev => prev.filter(d => (d._id || d.id) !== selectedDoubt.id));
        showToast('Doubt marked as solved! Solver credited.', 'success');
        // Download the solution image if present
        const acceptedSolution = (selectedDoubt.solutions || []).find(sol => (sol._id === solutionId || sol.id === solutionId) && sol.image);
        if (acceptedSolution && acceptedSolution.image) {
          const link = document.createElement('a');
          link.href = `http://localhost:5000${acceptedSolution.image}`;
          link.download = 'solution-image.jpg';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (error) {
        setAccepting(false);
        showToast('Failed to accept solution.', 'error');
      }
    };

    // Image solution upload handler
    const handleImageSolution = async (doubt, file) => {
      if (!file) return;
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('image', file);
        await axios.post(`http://localhost:5000/api/doubts/${doubt.id}/solutions`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        await fetchDoubts();
        showToast('Image solution posted!', 'success');
        // If current user is the asker, open the solution modal for this doubt
        if (currentUser && ((typeof doubt.user === 'object' ? doubt.user._id : doubt.user) === currentUser._id)) {
          await handleOpenSolutionModal(doubt);
        }
      } catch (error) {
        showToast('Failed to upload image solution.', 'error');
      }
    };

    const handleWriteSolution = (doubt) => {
      setWriteSolutionDoubt(doubt);
      setWriteSolutionText('');
      setShowWriteSolutionModal(true);
    };

    const handleSubmitWriteSolution = async () => {
      if (!writeSolutionDoubt || !writeSolutionText.trim()) return;
      try {
        const token = localStorage.getItem('token');
        await axios.post(`http://localhost:5000/api/doubts/${writeSolutionDoubt.id}/solutions`, { content: writeSolutionText }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setShowWriteSolutionModal(false);
        setWriteSolutionText('');
        setWriteSolutionDoubt(null);
        await fetchDoubts();
        showToast('Solution posted!', 'success');
      } catch (error) {
        showToast('Failed to post solution.', 'error');
      }
    };

    return(
        <div className="doubts-page-container">
            <nav className="collaboration-nav">
                <div className="nav-logo">
                    <img src="/peerpath.png" alt="PeerPath" />
                    <h1>PeerPath</h1>
                </div>
                <div className="nav-links">
                    <AnimatedNavLink to="/doubts" isActive={true}>Doubts</AnimatedNavLink>
                    <AnimatedNavLink to="/collaboration">Collaboration</AnimatedNavLink>
                    <AnimatedNavLink to="/resources">Resources</AnimatedNavLink>
                    <AnimatedNavLink to="/chat">Chat</AnimatedNavLink>
                    <AnimatedNavLink to="/location">Campus Connect</AnimatedNavLink>
                    <AnimatedNavLink to="/profile">Profile</AnimatedNavLink>
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
                </div>
            </nav>
            
            <main className="doubts-main-content">
                <div className="doubts-hero-section">
                    <h1>
                        Together We Learn.<span className="center-grow">Together We Build.</span>
                    </h1>
                    <p style={{fontSize:30}}>A space for all your doubts.</p>
                    <button 
                        className="ask-doubt-hero-btn"
                        onClick={() => setShowAskDoubt(!showAskDoubt)}
                    >
                        {showAskDoubt ? 'Close Form' : '🤔 Ask Your Doubt'}
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="doubts-body-content">
                    {showAskDoubt && (
                        <div className="ask-doubt-modal">
                             <AskDoubt 
                                currentUser={currentUser} 
                                onDoubtSubmit={handleDoubtSubmit}
                                onCancel={() => setShowAskDoubt(false)}
                            />
                        </div>
                    )}

                    {/* Doubts Carousel - now above Top Helpers */}
                    <div className="carousel-wrapper">
                      {carouselIndex > 0 && (
                        <button className="scroll-btn scroll-left" onClick={scrollDoubtsLeft}>‹</button>
                      )}
                      <div className="carousel-container">
                        <div className="carousel-track" style={{ transform: `translateX(-${carouselIndex * 350}px)` }}>
                          {sortedDoubts.map((doubt, idx) => {
                            // Debug logs
                            console.log('Doubt:', doubt);
                            console.log('Current user:', currentUser);
                            const doubtUserId = typeof doubt.user === 'object' ? doubt.user._id : doubt.user;
                            const currentUserId = currentUser && currentUser._id;
                            console.log('doubt.user:', doubt.user, 'typeof:', typeof doubt.user);
                            console.log('doubtUserId:', doubtUserId, 'currentUserId:', currentUserId);
                            console.log('doubtUserId == currentUserId:', doubtUserId == currentUserId);
                            console.log('doubtUserId === currentUserId:', doubtUserId === currentUserId);
                            console.log('isAsker:', doubtUserId === currentUserId);
                            console.log('showMarkSolved:', doubtUserId === currentUserId && !doubt.isResolved && (doubt.solutions && doubt.solutions.length > 0));
                            return (
                              <DoubtCard
                                key={doubt.id || idx}
                                doubt={doubt}
                                onSolve={handleSolve}
                                onCall={handleCall}
                                onVideoCall={handleVideoCall}
                                onChat={handleChat}
                                onLike={handleLike}
                                likedByCurrentUser={Array.isArray(doubt.likes) && currentUser && doubt.likes.some(id => id === currentUser._id)}
                                showMarkSolved={doubtUserId === currentUserId && !doubt.isResolved && (doubt.solutions && doubt.solutions.length > 0)}
                                onMarkSolved={() => handleOpenSolutionModal(doubt)}
                                isAsker={doubtUserId === currentUserId}
                                onImageSolution={handleImageSolution}
                                onImageClick={(sol) => {
                                  console.log('Image clicked:', sol);
                                  console.log('Setting imageModal to:', { 
                                    open: true, 
                                    image: sol.image || sol.solutionImage || sol.imageUrl, 
                                    solver: sol.user?.username || 'Unknown', 
                                    profilePhoto: sol.user?.profilePhoto 
                                  });
                                  setImageModal({ 
                                    open: true, 
                                    image: sol.image || sol.solutionImage || sol.imageUrl, 
                                    solver: sol.user?.username || 'Unknown', 
                                    profilePhoto: sol.user?.profilePhoto 
                                  });
                                }}
                                onWriteSolution={handleWriteSolution}
                              />
                            );
                          })}
                        </div>
                      </div>
                      {carouselIndex < Math.max(0, mappedDoubts.length - 3) && (
                        <button className="scroll-btn scroll-right" onClick={scrollDoubtsRight}>›</button>
                      )}
                    </div>

                    {/* Top Helpers section below doubts */}
                    <TopHelpers />
                </div>

                <section className="about-creators-section">
                    <div className="about-creators-content">
                        <h3>About the Creators</h3>
                        <div className="creator-cards">
                            <div className="creator-card">
                                <div className="creator-image-placeholder" />
                                <h4>Satyam Sharma</h4>
                                <p>2nd Year CSE Student, MANIT</p>
                                <div className="creator-socials">
                                    <a href="#" aria-label="LinkedIn">L</a>
                                    <a href="#" aria-label="GitHub">G</a>
                                </div>
                            </div>
                            <div className="creator-card">
                                <div className="creator-image-placeholder" />
                                <h4>Naitik Verma</h4>
                                <p>2nd Year CSE Student, MANIT</p>
                                <div className="creator-socials">
                                    <a href="#" aria-label="LinkedIn">L</a>
                                    <a href="#" aria-label="GitHub">G</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            
            <footer className="doubts-footer">
                <div className="footer-content">
                    <div className="footer-bottom">
                        <p>© 2025 PeerPath. All rights reserved.</p>
                        <p>Made with ❤️ by the PeerPath Team</p>
                    </div>
                </div>
            </footer>

            {/* Solution Accept Modal */}
            <Modal
              isOpen={showSolutionModal}
              onRequestClose={() => setShowSolutionModal(false)}
              contentLabel="Select Solution to Accept"
              className="group-modal"
              overlayClassName="group-modal-overlay"
              ariaHideApp={false}
            >
              <h2>Select Solution to Accept</h2>
              {solutions.length === 0 ? (
                <div style={{ color: '#a78bfa', textAlign: 'center', margin: '1.5rem 0' }}>No solutions yet.</div>
              ) : (
                <div className="group-members-list" style={{ flexDirection: 'column', gap: '1.2rem' }}>
                  {solutions.map((sol) => (
                    <div key={sol._id} style={{ background: '#1a0a52', borderRadius: 12, padding: '1rem', border: '1.5px solid #a78bfa', marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, color: '#c4b5fd', marginBottom: 6 }}>By: {sol.user?.username || 'Unknown'}</div>
                      {sol.image && (
                        <img src={`http://localhost:5000${sol.image}`} alt="solution" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, marginBottom: 8 }} />
                      )}
                      <div style={{ color: '#a78bfa', marginBottom: 8 }}>{sol.content}</div>
                      <button
                        className="create-group-btn"
                        style={{ margin: 0, minWidth: 120 }}
                        disabled={accepting}
                        onClick={() => handleAcceptSolution(sol._id)}
                      >
                        {accepting ? 'Accepting...' : 'Accept This Solution'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button className="close-modal-btn" onClick={() => setShowSolutionModal(false)}>Cancel</button>
            </Modal>

            {/* Toast notification */}
            {toast.message && (
              <div style={{
                position: 'fixed',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                background: toast.type === 'success' ? 'linear-gradient(90deg,#10b981,#059669)' : 'linear-gradient(90deg,#ef4444,#dc2626)',
                color: '#fff',
                padding: '1rem 2rem',
                borderRadius: 12,
                fontWeight: 600,
                zIndex: 9999,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                fontSize: '1.1rem',
                letterSpacing: 0.5
              }}>
                {toast.message}
              </div>
            )}

            {/* Image Solution Modal */}
            {imageModal.open && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.7)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }} onClick={() => {
                console.log('Modal background clicked, closing modal');
                setImageModal({ open: false, image: '', solver: '', profilePhoto: '' });
              }}>
                <div style={{ background: '#1a0a52', borderRadius: 16, padding: 24, position: 'relative', minWidth: 320, maxWidth: '90vw', maxHeight: '90vh', boxShadow: '0 8px 32px rgba(139,92,246,0.25)' }} onClick={e => e.stopPropagation()}>
                  <button style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }} onClick={() => {
                    console.log('Close button clicked');
                    setImageModal({ open: false, image: '', solver: '', profilePhoto: '' });
                  }}>&times;</button>
                  {imageModal.profilePhoto && (
                    <img src={`http://localhost:5000${imageModal.profilePhoto}`} alt={imageModal.solver} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', marginBottom: 8 }} />
                  )}
                  <div style={{ color: '#c4b5fd', fontWeight: 600, fontSize: '1.1rem', marginBottom: 12 }}>{imageModal.solver}</div>
                  <img src={`http://localhost:5000${imageModal.image}`} alt="solution" style={{ maxWidth: '70vw', maxHeight: '60vh', borderRadius: 10, display: 'block', margin: '0 auto' }} />
                </div>
              </div>
            )}
            
            {/* Debug info */}
            {imageModal.open && (
              <div style={{
                position: 'fixed',
                top: 10,
                right: 10,
                background: 'red',
                color: 'white',
                padding: '10px',
                zIndex: 10000,
                fontSize: '12px'
              }}>
                Modal is open! Image: {imageModal.image}
              </div>
            )}

            {/* Write Solution Modal */}
            {showWriteSolutionModal && (
              <Modal
                isOpen={showWriteSolutionModal}
                onRequestClose={() => setShowWriteSolutionModal(false)}
                contentLabel="Write Solution"
                className="group-modal"
                overlayClassName="group-modal-overlay"
                ariaHideApp={false}
              >
                <h2>Write Your Solution</h2>
                <textarea
                  value={writeSolutionText}
                  onChange={e => setWriteSolutionText(e.target.value)}
                  rows={6}
                  style={{ width: '100%', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 }}
                  placeholder="Type your solution here..."
                />
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button className="close-modal-btn" onClick={() => setShowWriteSolutionModal(false)}>Cancel</button>
                  <button className="create-group-btn" onClick={handleSubmitWriteSolution} disabled={!writeSolutionText.trim()}>
                    Submit Solution
                  </button>
                </div>
              </Modal>
            )}
        </div>
    );
}