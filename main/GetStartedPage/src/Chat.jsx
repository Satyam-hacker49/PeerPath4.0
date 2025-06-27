import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import './Chat.css';
import Modal from 'react-modal';

const socket = io('http://localhost:5000');

const Chat = ({ currentUser, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const params = useParams ? useParams() : {};
  const [roomId, setRoomId] = useState(null);
  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem('pp_groups');
    return saved ? JSON.parse(saved) : [];
  });
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Filter out the current user from the list
        setUsers(response.data.filter(user => user._id !== currentUser._id));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    socket.on('receive-message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
      scrollToBottom();
    });

    return () => {
      socket.off('receive-message');
    };
  }, []);

  useEffect(() => {
    if (location.state && location.state.userId && users.length > 0) {
      const userToSelect = users.find(u => u._id === location.state.userId);
      if (userToSelect) setSelectedUser(userToSelect);
    }
  }, [location.state, users]);

  useEffect(() => {
    if (selectedUser && currentUser) {
      const generateRoomId = (id1, id2) => [id1, id2].sort().join('_');
      const newRoomId = generateRoomId(currentUser._id, selectedUser._id);
      setRoomId(newRoomId);
      socket.emit('join-room', newRoomId);
      setMessages([]); // Clear previous messages
      // Fetch historical messages for the room
      const fetchMessages = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://localhost:5000/api/users/chat/${newRoomId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMessages(response.data);
        } catch (error) {
          console.error('Error fetching chat history:', error);
        }
      };
      fetchMessages();
    }
  }, [selectedUser, currentUser]);

  // Detect group chat room from URL
  useEffect(() => {
    const path = location.pathname;
    const match = path.match(/\/chat\/doubt_(.+)$/);
    if (match) {
      const doubtId = match[1];
      setRoomId(`doubt_${doubtId}`);
      socket.emit('join-room', `doubt_${doubtId}`);
      setSelectedUser(null); // Not a one-on-one chat
      setMessages([]);
      // Fetch group messages
      const fetchMessages = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://localhost:5000/api/users/chat/doubt_${doubtId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMessages(response.data);
        } catch (error) {
          console.error('Error fetching group chat history:', error);
        }
      };
      fetchMessages();
    }
  }, [location.pathname]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const isGroupChat = roomId && roomId.startsWith('doubt_');

  const handleSendMessage = async () => {
    if (message.trim() && (selectedUser || isGroupChat) && roomId) {
      const messageData = {
        roomId,
        content: message.trim(),
        sender: { _id: currentUser._id, username: currentUser.username, profilePhoto: currentUser.profilePhoto },
        receiver: selectedUser ? selectedUser._id : null,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      socket.emit('send-message', messageData);
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setMessage('');
      // Save to backend
      try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:5000/api/users/chat', {
          roomId: messageData.roomId,
          content: messageData.content,
          receiver: messageData.receiver,
          time: messageData.time
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Error saving chat message:', error);
      }
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Sort users: matching users first, then the rest
  const matchingUsers = users.filter(
    user => (user.name || user.username)?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const nonMatchingUsers = users.filter(
    user => !(user.name || user.username)?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const sortedUsers = [...matchingUsers, ...nonMatchingUsers];

  // Save groups to localStorage when changed
  useEffect(() => {
    localStorage.setItem('pp_groups', JSON.stringify(groups));
  }, [groups]);

  // Helper: all chats for sidebar
  const allChats = [
    ...groups.map(g => ({ type: 'group', ...g })),
    ...users.map(u => ({ type: 'user', ...u }))
  ];

  // Helper: select chat
  const handleSelectChat = (chat) => {
    if (chat.type === 'user') {
      setSelectedUser(chat);
      setRoomId([currentUser._id, chat._id].sort().join('_'));
    } else if (chat.type === 'group') {
      setSelectedUser(null);
      setRoomId(chat.roomId);
    }
  };

  // Add new group
  const handleCreateGroup = () => {
    if (!groupName.trim() || groupMembers.length < 2) return;
    const roomId = 'group_' + Date.now();
    setGroups(prev => [...prev, {
      groupName: groupName.trim(),
      members: [currentUser, ...users.filter(u => groupMembers.includes(u._id))],
      roomId
    }]);
    setShowGroupModal(false);
    setGroupName('');
    setGroupMembers([]);
  };

  return (
    <div className="chat-container">
      <nav className="collaboration-nav">
        <div className="nav-logo">
          <img src="/peerpath.png" alt="PeerPath" />
          <h1>PeerPath</h1>
        </div>
        <div className="nav-links">
          <Link to="/doubts">Doubts</Link>
          <Link to="/collaboration">Collaboration</Link>
          <Link to="/resources">Resources</Link>
          <Link to="/chat" className="active">Chat</Link>
          <Link to="/location">Campus Connect</Link>
          <Link to="/profile">Profile</Link>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="chat-content">
        <div className="chat-sidebar">
          <div className="chat-header">
            <h2>💬 Chats</h2>
            <button className="new-group-btn" onClick={() => setShowGroupModal(true)}>+ New Group</button>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>

          <div className="users-list">
            {/* List user-created groups */}
            {groups.filter(g => g.groupName.toLowerCase().includes(searchTerm.toLowerCase())).map(group => (
              <div
                key={group.roomId}
                className={`user-item ${roomId === group.roomId ? 'active' : ''}`}
                onClick={() => handleSelectChat({ type: 'group', ...group })}
              >
                <div className="user-avatar group-avatar">👥</div>
                <div className="user-info">
                  <span className="user-name">{group.groupName}</span>
                  <span className="user-status">Group</span>
                </div>
              </div>
            ))}
            {/* List one-on-one users */}
            {sortedUsers.filter(user => (user.name || user.username)?.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
              <div
                key={user._id}
                className={`user-item ${selectedUser?._id === user._id && !roomId?.startsWith('group_') ? 'active' : ''}`}
                onClick={() => handleSelectChat({ type: 'user', ...user })}
              >
                <div className="user-avatar">
                  <img src={user.profilePhoto || '/peerpath.png'} alt={user.name || user.username} />
                </div>
                <div className="user-info">
                  <span className="user-name">{user.name || user.username}</span>
                  <span className="user-status">Online</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-main">
          {roomId ? (
            <>
              <div className="chat-header-main">
                <div className="chat-user-info">
                  {roomId.startsWith('group_') ? (
                    <>
                      <div>
                        <h3>{groups.find(g => g.roomId === roomId)?.groupName || 'Group Chat'}</h3>
                        <span className="status-text online">👥 Group Members: {groups.find(g => g.roomId === roomId)?.members.map(m => m.username || m.name).join(', ')}</span>
                      </div>
                    </>
                  ) : roomId.startsWith('doubt_') ? (
                    <>
                      <div>
                        <h3>Group Chat for Doubt #{roomId.replace('doubt_', '')}</h3>
                        <span className="status-text online">🟢 Group Chat</span>
                      </div>
                    </>
                  ) : selectedUser ? (
                    <>
                      <img src={selectedUser.profilePhoto || '/peerpath.png'} alt={selectedUser.name} className="user-avatar-main" />
                      <div>
                        <h3>{selectedUser.name || selectedUser.username}</h3>
                        <span className="status-text online">Online</span>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="messages-container">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${msg.sender._id === currentUser._id ? 'own' : 'other'}`}
                  >
                    <div className="message-sender-info">
                      <img
                        src={msg.sender.profilePhoto || '/peerpath.png'}
                        alt={msg.sender.username}
                        className="chat-message-avatar"
                      />
                      <span className="chat-message-username">{msg.sender.username}</span>
                    </div>
                    <div className="message-content">
                      <p>{msg.content}</p>
                      <span className="message-time">{msg.time}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="message-input-container">
                <div className="message-input-wrapper">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message...`}
                    rows="1"
                    className="message-input"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="send-btn"
                  >
                    📤
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-content">
                <h2>💬 Welcome to PeerPath Chat</h2>
                <p>Select a chat or create a group to start messaging</p>
                <div className="chat-features">
                  <div className="feature">
                    <span>🔒</span>
                    <p>Secure messaging</p>
                  </div>
                  <div className="feature">
                    <span>⚡</span>
                    <p>Real-time updates</p>
                  </div>
                  <div className="feature">
                    <span>👥</span>
                    <p>Group & one-on-one chats</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Group Modal */}
      <Modal
        isOpen={showGroupModal}
        onRequestClose={() => setShowGroupModal(false)}
        contentLabel="Create Group"
        className="group-modal"
        overlayClassName="group-modal-overlay"
        ariaHideApp={false}
      >
        <h2>Create New Group</h2>
        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
        />
        <div className="group-members-list">
          {users.map(user => (
            <label key={user._id} className="group-member-item">
              <input
                type="checkbox"
                checked={groupMembers.includes(user._id)}
                onChange={e => {
                  if (e.target.checked) {
                    setGroupMembers(prev => [...prev, user._id]);
                  } else {
                    setGroupMembers(prev => prev.filter(id => id !== user._id));
                  }
                }}
              />
              <span>{user.name || user.username}</span>
            </label>
          ))}
        </div>
        <button
          className="create-group-btn"
          onClick={handleCreateGroup}
          disabled={!groupName.trim() || groupMembers.length < 2}
        >
          Create Group
        </button>
        <button className="close-modal-btn" onClick={() => setShowGroupModal(false)}>Cancel</button>
      </Modal>
    </div>
  );
};

export default Chat; 