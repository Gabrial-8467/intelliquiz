import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/Button';
import '../style/result.css';

const ResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { score, quizId, topic } = location.state || {};

  const [previousResults, setPreviousResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      alert('You must be logged in to view results.');
      navigate('/signin');
      return;
    }

    if (score !== undefined && quizId) {
      // Submit current quiz result
      axios.post(
        'http://localhost:5000/api/results/submit',
        { quizId, score },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ).catch(err => console.error('Error saving result:', err));

      // Fetch user's past quiz results
      axios.get('http://localhost:5000/api/results/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => setPreviousResults(res.data || []))
        .catch(err => console.error('Error fetching user results:', err))
        .finally(() => setLoadingResults(false));
    }
  }, [score, quizId, token, navigate]);

  if (score === undefined) {
    return <div className="result-error"><p>Invalid result. Please try again.</p></div>;
  }

  const percentage = ((score / 5) * 100).toFixed(1); // Assuming quiz is out of 5
  let message = '';
  let emoji = '';

  if (percentage >= 90) {
    message = '🏆 Excellent! You aced it!';
    emoji = '🌟';
  } else if (percentage >= 70) {
    message = '👏 Great job!';
    emoji = '💪';
  } else if (percentage >= 50) {
    message = '🙂 Good try! Keep practicing!';
    emoji = '📘';
  } else {
    message = '😅 Don’t worry! Try again!';
    emoji = '💡';
  }

  return (
    <div className="result-container">
      <h2 className="result-title">{emoji} Quiz Result</h2>
      <p className="result-topic">Topic: <strong>{topic}</strong></p>

      <div className="result-score-box">
        <p className="result-score">{score} / 5</p>
        <p className="result-percentage">{percentage}%</p>
        <p className="result-feedback">{message}</p>
      </div>

      <div className="result-buttons">
        <Button onClick={() => navigate('/')}>🏠 Home</Button>
        <Button onClick={() => navigate(`/quiz/test/${topic}`)}>🔁 Retry</Button>
      </div>

      {!loadingResults && previousResults.length > 0 && (
        <div className="result-history">
          <h3>Your Previous Scores</h3>
          <table>
            <thead>
              <tr>
                <th>Topic</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {previousResults.map((res, idx) => (
                <tr key={idx}>
                  <td>{res.quiz?.topic || 'Unknown'}</td>
                  <td>{res.score}</td>
                  <td>{new Date(res.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResultPage;
