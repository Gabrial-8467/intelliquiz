import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getQuizByUUID } from '../services/quizAPI'; // You must implement this
import LOADER from '../components/Loader';
import '../style/quiz.css';

const SharedQuizPage = () => {
  const { uuid } = useParams();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await getQuizByUUID(uuid);
        setQuizData(data);
      } catch (err) {
        console.error('Failed to fetch shared quiz:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [uuid]);

  if (loading) return <div className="quiz-page"><LOADER /></div>;

  if (!quizData) {
    return <div className="quiz-page"><p>Quiz not found or expired.</p></div>;
  }

  return (
    <div className="quiz-page">
      <h2 className="quiz-title">Shared Quiz: {quizData.topic}</h2>
      {quizData.questions.map((q, idx) => (
        <div key={idx} className="quiz-question-block">
          <h3 className="quiz-question">Q{idx + 1}. {q.question}</h3>
          <div className="quiz-options">
            {q.options.map((opt, i) => (
              <div key={i} className="option-btn">{opt}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SharedQuizPage;
