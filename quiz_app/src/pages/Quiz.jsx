import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { shuffleArray } from '../utils/shuffle';
import { getQuizQuestions, saveQuiz } from '../services/quizAPI';
import jsPDF from 'jspdf';
import { v4 as uuidv4 } from 'uuid';
import LOADER from '../components/Loader';
import { FaExclamationTriangle } from 'react-icons/fa';
import '../style/quiz.css';

const QuizPreview = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const topic = state?.topic || '';
  const [quizUUID] = useState(state?.uuid || uuidv4());
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareModal, setShareModal] = useState({ visible: false, link: '' });

  useEffect(() => {
    const fetchAndSaveQuiz = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get questions from Gemini AI
        const response = await getQuizQuestions(topic);
        let rawQuestions = Array.isArray(response) ? response : response?.data?.questions || [];

        const preparedQuestions = rawQuestions.map((q) => ({
          question: q.question || 'No question available',
          correct_answer: q.correct_answer || 'No correct answer',
          options: shuffleArray(q.options?.length ? q.options : ['No options available']),
        }));

        setQuestions(preparedQuestions);

        // Save quiz to backend using our service
        await saveQuiz({
          uuid: quizUUID,
          topic,
          questions: preparedQuestions,
        });

        console.log('Quiz saved successfully with UUID:', quizUUID);
      } catch (error) {
        console.error('Error saving quiz:', error);
        setError(error.message || 'Failed to save quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (topic) {
      fetchAndSaveQuiz();
    } else {
      setLoading(false);
      setError('No topic provided. Please go back and select a topic.');
    }
  }, [topic, quizUUID]);

  const generatePDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 15;
    const maxLineWidth = doc.internal.pageSize.getWidth() - 2 * margin;
    let y = 20;

    doc.setFontSize(16).setFont('helvetica', 'bold').text('Quiz Preview', margin, y);
    y += 10;
    doc.setFontSize(12).setFont('helvetica', 'normal');

    questions.forEach((q, i) => {
      const lines = doc.splitTextToSize(`Q${i + 1}: ${q.question}`, maxLineWidth);
      doc.text(lines, margin, y);
      y += lines.length * 6;

      q.options.forEach((opt) => {
        doc.rect(margin + 5, y - 3, 4, 4);
        if (opt === q.correct_answer) doc.setFont('helvetica', 'bold');
        doc.text(opt, margin + 12, y);
        if (opt === q.correct_answer) doc.setFont('helvetica', 'normal');
        y += 6;
      });

      y += 8;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save('quiz-preview.pdf');
  };

  const generateShareableLink = () => {
    const link = `${window.location.origin}/quiz/shared/${quizUUID}`;
    setShareModal({ visible: true, link });
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => alert("Link copied to clipboard!"))
        .catch((err) => {
          console.error("Clipboard API failed:", err);
          fallbackCopy(text);
        });
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = 0;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      alert("Link copied to clipboard!");
    } catch {
      alert("Failed to copy. Please copy manually.");
    }
    document.body.removeChild(textarea);
  };

  const startQuiz = () => {
    navigate(`/quiz/test/${topic}`, { state: { uuid: quizUUID } });
  };

  if (loading) return <div className="quiz-page"><LOADER /></div>;
  
  if (error) {
    return (
      <div className="quiz-page error-container">
        <FaExclamationTriangle className="error-icon" />
        <h2>Error</h2>
        <p>{error}</p>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }

  if (!topic || questions.length === 0) {
    return (
      <div className="quiz-page error-container">
        <h2>No Quiz Data</h2>
        <p>No quiz data found. Please go back and select a topic.</p>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <h2 className="quiz-title">Preview for Quiz on {topic}</h2>

      {questions.map((q, idx) => (
        <div key={idx} className="quiz-question-block">
          <h3 className="quiz-question">Q{idx + 1}. {q.question}</h3>
          <div className="quiz-options">
            {q.options.map((opt, i) => (
              <Button key={i} className="option-btn">{opt}</Button>
            ))}
          </div>
        </div>
      ))}

      <div className="quiz-actions">
        <Button onClick={generatePDF}>Download Quiz as PDF</Button>
        <Button onClick={generateShareableLink}>Share Quiz Link</Button>
        <Button onClick={startQuiz}>Start Quiz</Button>
      </div>

      {shareModal.visible && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3>Shareable Quiz Link</h3>
            <input className="modal-link-input" type="text" value={shareModal.link} readOnly />
            <div className="modal-buttons">
              <button onClick={() => copyToClipboard(shareModal.link)}>Copy Link</button>
              <Button onClick={() => setShareModal({ visible: false, link: '' })}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPreview;
