import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shuffleArray } from '../utils/shuffle';
import { getQuizQuestions } from '../services/quizAPI';
import { Button } from '../components/Button';
import LOADER from '../components/Loader';

const QuizTestPage = () => {
  const { topic } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await getQuizQuestions(topic);
        const rawQuestions = Array.isArray(response)
          ? response
          : response?.data?.questions || [];

        const prepared = rawQuestions.map((q) => ({
          question: q.question || 'No question available',
          correct_answer: q.answer || 'No correct answer',
          options: shuffleArray(q.options || []),
        }));

        setQuestions(prepared);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load quiz questions.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [topic]);

  const handleAnswer = (index, answer) => {
    setUserAnswers((prev) => ({ ...prev, [index]: answer }));
  };

  const handleNext = () => {
    if (userAnswers[currentQuestionIndex] === undefined) {
      alert('Please select an answer before moving to the next question.');
      return;
    }
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    setCurrentQuestionIndex((prev) => prev - 1);
  };

  const handleSubmit = () => {
    if (Object.keys(userAnswers).length !== questions.length) {
      alert('Please answer all questions before submitting the quiz.');
      return;
    }

    let score = 0;
    questions.forEach((q, index) => {
      if (
        userAnswers[index]?.trim().toLowerCase() ===
        q.correct_answer?.trim().toLowerCase()
      ) {
        score++;
      }
    });

    navigate('/result', {
      state: {
        score,
        total: questions.length,
        topic,
      },
    });
  };

  if (loading) return <div className="quiz-page"><LOADER /></div>;
  if (error || !questions.length)
    return <div className="quiz-page"><p>{error || `No questions found for "${topic}".`}</p></div>;

  const current = questions[currentQuestionIndex];

  return (
    <div className="quiz-page">
      <h2 className="quiz-title">Quiz on {topic}</h2>
      <div className="quiz-question-block">
        <h3 className="quiz-question">
          Q{currentQuestionIndex + 1}. {current.question}
        </h3>
        <div className="quiz-options">
          {current.options.map((opt, i) => {
            const inputId = `q-${currentQuestionIndex}-opt-${i}`;
            const isSelected = userAnswers[currentQuestionIndex] === opt;

            return (
              <label
                key={i}
                htmlFor={inputId}
                className={`option-btn ${isSelected ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  id={inputId}
                  name={`question-${currentQuestionIndex}`}
                  value={opt}
                  checked={isSelected}
                  onChange={() => handleAnswer(currentQuestionIndex, opt)}
                />
                {opt}
              </label>
            );
          })}
        </div>
      </div>

      <div className="quiz-actions">
        {currentQuestionIndex > 0 && (
          <Button onClick={handlePrev}>Previous</Button>
        )}
        {currentQuestionIndex < questions.length - 1 ? (
          <Button onClick={handleNext}>Next</Button>
        ) : (
          <Button onClick={handleSubmit}>Submit Quiz</Button>
        )}
      </div>
    </div>
  );
};

export default QuizTestPage;
