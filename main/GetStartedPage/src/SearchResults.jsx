import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import './SearchResults.css';

const SearchResults = ({ onLogout }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  const query = new URLSearchParams(location.search).get('query');

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`http://localhost:5000/api/doubts?search=${query}`);
        setResults(response.data.doubts);
      } catch (err) {
        setError('Failed to fetch search results. Please try again.');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="search-results-page">
      <nav className="collaboration-nav">
        <div className="nav-logo">
          <img src="/peerpath.png" alt="PeerPath" />
          <h1>PeerPath</h1>
        </div>
        <div className="nav-links">
          <Link to="/doubts">Doubts</Link>
          <Link to="/collaboration">Collaboration</Link>
          <Link to="/resources">Resources</Link>
          <Link to="/chat">Chat</Link>
          <Link to="/location">Campus Connect</Link>
          <Link to="/profile">Profile</Link>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <main className="search-results-content">
        <h1>Search Results for "{query}"</h1>

        {loading && <p className="loading-message">Loading results...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <div className="results-list">
            {results.length > 0 ? (
              results.map(doubt => (
                <div key={doubt._id} className="result-card">
                  <div className="result-card-header">
                    <img src={doubt.user.profilePhoto || '/peerpath.png'} alt={doubt.user.name} />
                    <span>{doubt.user.name}</span>
                  </div>
                  <h3 className="result-title">
                    <Link to={`/doubts/${doubt._id}`}>{doubt.title}</Link>
                  </h3>
                  <p className="result-content">{doubt.content.substring(0, 150)}...</p>
                  <div className="result-tags">
                    {doubt.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results-message">No doubts found matching your search.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchResults; 