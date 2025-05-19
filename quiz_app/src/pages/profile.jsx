import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import '../style/profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/user/profile', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Unauthorized');
        }

        const data = await response.json();
        setUser(data.user || {});
        setQuizHistory(data.quizHistory || []);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        localStorage.removeItem('token');
        navigate('/signin');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  const goToHome = () => {
    navigate('/');
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="loading">
        <Loader />
      </div>
    );
  }

  return (
    <div className="profile-container">
      <nav className="navbar">
        <div className="navbar-logo">🧠 IntelliQuiz</div>
        <div className="navbar-buttons">
          <button className="nav-btn" onClick={goToHome}>Home</button>
          <button className="nav-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="profile-content">
        <div className="profile-card">
          <h2 className="welcome-text">
            Welcome{user?.name ? `, ${user.name}` : ''}!
          </h2>
          <p className="user-email">
            <strong>Email:</strong> {user?.email || 'N/A'}
          </p>

          <div className="quiz-history">
            <h3>📊 Quiz History</h3>
            {quizHistory.length > 0 ? (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Topic</th>
                    <th>Score</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {quizHistory.map((item, index) => (
                    <tr key={index}>
                      <td>{item.topic}</td>
                      <td>{item.score} / {item.total}</td>
                      <td>{item.createdAt ? formatDate(item.createdAt) : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-history">No quiz attempts yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
