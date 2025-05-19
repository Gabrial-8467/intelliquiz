import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaCheck, FaTimes, FaLock, FaLockOpen, FaExclamationTriangle } from 'react-icons/fa';
import { getQuizQuestions } from '../services/quizAPI';
import LOADER from '../components/Loader';
import '../style/quizTestPage.css';

const QuizTestPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasPreviousAttempts, setHasPreviousAttempts] = useState(false);
  const [previousQuizzes, setPreviousQuizzes] = useState([]);
  const [showQuizOptions, setShowQuizOptions] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [topic, setTopic] = useState(null);

  // Initialize topic from location state or localStorage
  useEffect(() => {
    const savedTopic = localStorage.getItem('currentQuizTopic');
    if (location.state?.topic) {
      setTopic(location.state.topic);
      localStorage.setItem('currentQuizTopic', location.state.topic);
    } else if (savedTopic) {
      setTopic(savedTopic);
    } else {
      setError('No topic selected');
      setLoading(false);
    }
  }, [location.state]);

  // Prevent navigation away from quiz
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (quizStarted && !showExitWarning) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    const handlePopState = (e) => {
      if (quizStarted && !showExitWarning) {
        e.preventDefault();
        setShowExitWarning(true);
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    // Add initial history state
    window.history.pushState(null, '', window.location.pathname);

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [quizStarted, showExitWarning]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (quizStarted && !isSubmitting) {
      timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, isSubmitting]);

  // Format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Initialize quiz
  useEffect(() => {
    if (!topic) return;

    const initializeQuiz = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First check if user has previous attempts
        const token = localStorage.getItem('token');
        if (token) {
          const historyResponse = await fetch(`http://localhost:5000/api/user/quiz-history/${topic}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            setHasPreviousAttempts(historyData.hasPreviousAttempts);
            setPreviousQuizzes(historyData.previousQuizzes);
            setShowQuizOptions(historyData.hasPreviousAttempts);
          }
        }

        // Get questions from Gemini AI
        const questionsData = await getQuizQuestions(topic);
        if (!questionsData || !Array.isArray(questionsData)) {
          throw new Error('Failed to generate questions');
        }

        // Format questions for the quiz
        const formattedQuestions = questionsData.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.answer
        }));

        setQuestions(formattedQuestions);
        
        // If no previous attempts, start quiz immediately
        if (!token || !hasPreviousAttempts) {
          setQuizStarted(true);
        }
      } catch (err) {
        console.error('Error initializing quiz:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeQuiz();
  }, [topic]);

  const handleStartNewQuiz = () => {
    setShowQuizOptions(false);
    setQuizStarted(true);
    setTimeSpent(0);
  };

  const handleRetryPreviousQuiz = () => {
    setShowQuizOptions(false);
    setQuizStarted(true);
    setTimeSpent(0);
  };

  const handleAnswerSelect = (answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const score = Object.entries(userAnswers).reduce((total, [index, answer]) => {
        return total + (answer === questions[index].correctAnswer ? 1 : 0);
      }, 0);

      const token = localStorage.getItem('token');
      if (token) {
        await fetch('http://localhost:5000/api/quiz/results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            topic,
            score,
            totalQuestions: questions.length,
            timeSpent,
            answers: Object.entries(userAnswers).map(([index, answer]) => ({
              questionId: questions[index]._id,
              selectedAnswer: answer,
              isCorrect: answer === questions[index].correctAnswer
            }))
          })
        });
      }

      // Clear the topic from localStorage after successful submission
      localStorage.removeItem('currentQuizTopic');
      
      navigate('/result', {
        state: {
          score,
          total: questions.length,
          topic,
          userAnswers,
          timeSpent
        }
      });
    } catch (err) {
      setError('Failed to submit quiz');
      setIsSubmitting(false);
    }
  };

  const handleConfirmExit = () => {
    // Clear the topic from localStorage when exiting
    localStorage.removeItem('currentQuizTopic');
    setShowExitWarning(false);
    navigate('/');
  };

  const handleCancelExit = () => {
    setShowExitWarning(false);
    window.history.pushState(null, '', window.location.pathname);
  };

  if (error) {
    return (
      <div className="quiz-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (showQuizOptions) {
    return (
      <div className="quiz-page">
        <div className="quiz-options-container">
          <h2>Previous Attempts for {topic}</h2>
          <div className="previous-attempts">
            <h3>Your History:</h3>
            <div className="attempts-list">
              {previousQuizzes.map((quiz, index) => (
                <div key={index} className="attempt-item">
                  <div className="attempt-score">
                    <span className="score">{quiz.score}/{quiz.totalQuestions}</span>
                    <span className="percentage">
                      {Math.round((quiz.score / quiz.totalQuestions) * 100)}%
                    </span>
                  </div>
                  <div className="attempt-date">
                    {new Date(quiz.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="quiz-options">
            <button className="option-button retry" onClick={handleRetryPreviousQuiz}>
              <FaLockOpen /> Retry Previous Quiz
            </button>
            <button className="option-button new" onClick={handleStartNewQuiz}>
              <FaLock /> Start New Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quizStarted || !questions.length) {
    return (
      <div className="quiz-page">
        <div className="loading">
          <LOADER />
          <p>Preparing your quiz...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (Object.keys(userAnswers).length / questions.length) * 100;

  return (
    <div className="quiz-page">
      {showExitWarning && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="warning-icon">
              <FaExclamationTriangle />
            </div>
            <h3>Complete Your Quiz First!</h3>
            <p>You need to complete the quiz before leaving. Your progress will be lost if you exit now.</p>
            <div className="modal-actions">
              <button className="cancel-button" onClick={handleCancelExit}>
                Continue Quiz
              </button>
              <button className="confirm-button" onClick={handleConfirmExit}>
                Exit Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="quiz-container">
        <div className="quiz-header">
          <h2>{topic} Quiz</h2>
          <div className="quiz-stats">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="stats">
              <span className="question-count">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="timer">
                Time: {formatTime(timeSpent)}
              </span>
            </div>
          </div>
        </div>

        <div className="question-container">
          <h3>{currentQuestion.question}</h3>
          <div className="options">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`option ${userAnswers[currentQuestionIndex] === option ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(option)}
                type="button"
              >
                <span className="option-marker">{String.fromCharCode(65 + index)}</span>
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="navigation">
          <button
            className="nav-button"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            type="button"
          >
            <FaArrowLeft /> Previous
          </button>
          {currentQuestionIndex === questions.length - 1 ? (
            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={Object.keys(userAnswers).length !== questions.length || isSubmitting}
              type="button"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              className="nav-button"
              onClick={handleNext}
              disabled={currentQuestionIndex === questions.length - 1}
              type="button"
            >
              Next <FaArrowRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTestPage;
