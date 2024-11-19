import React, { useState, useEffect, useCallback } from 'react';
//import { useRouter } from 'next/router';
import styles from '../styles/user.module.css';
import Header from '../components/header';
import Footer from '../components/footer';

export default function Titles() {
  const [titles, setTitles] = useState([]);
  const [exams, setExams] = useState([]);
  const [examContent, setExamContent] = useState({ questions: [] });
  const [userAnswers, setUserAnswers] = useState({});
  const [loadingTitles, setLoadingTitles] = useState(true);
  const [loadingExams, setLoadingExams] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  //const [selectedTitle, setSelectedTitle] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [resultModal, setResultModal] = useState({ show: false, result: null });
  const [showExamsModal, setShowExamsModal] = useState(false);
  const [showExamContentModal, setShowExamContentModal] = useState(false);
  //const router = useRouter();

  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const response = await fetch('/api/titles', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          setTitles(data || []);
        } else {
          setError('Failed to fetch titles.');
        }
      } catch (error) {
        setError('An error occurred while fetching titles.');
        console.error(error);
      } finally {
        setLoadingTitles(false);
      }
    };

    fetchTitles();
  }, []);

  const handleTitleClick = useCallback(async (titleId) => {
    //setSelectedTitle(titleId);
    setLoadingExams(true);
    setExams([]);
    setError('');

    try {
      const response = await fetch(`/api/exams/title/${titleId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setExams(data || []);
        setShowExamsModal(true);
      } else {
        setError('Failed to fetch exams.');
      }
    } catch (error) {
      setError('An error occurred while fetching exams.');
      console.error(error);
    } finally {
      setLoadingExams(false);
    }
  }, []);

  const handleExamClick = useCallback(async (examId, examDataPath) => {
    setSelectedExam(examId);
    setError('');
    setShowExamsModal(false);

    try {
      const examContentResponse = await fetch(`/api/getFile?filename=${encodeURIComponent(examDataPath)}`
      );
      if (examContentResponse.ok) {
        const examContent = await examContentResponse.json();
        setExamContent(examContent);

        const initialAnswers = {};
        examContent.questions.forEach((_, index) => {
          initialAnswers[index] = null;
        });
        setUserAnswers(initialAnswers);
        setShowExamContentModal(true);
      } else {
        setError(`Failed to fetch exam content for path: ${examDataPath}`);
      }
    } catch (error) {
      setError('An error occurred while fetching exam content.');
      console.error(error);
    }
  }, []);

  const handleAnswerChange = (index, answer) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [index]: answer,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    const requestData = {
      examId: selectedExam,
      userId: 1, // Replace with the actual user ID if available
      studentAnswers: userAnswers,
    };

    try {
      const response = await fetch('/api/exams/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_API_KEY',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        setResultModal({ show: true, result });
      } else {
        setError('Failed to submit the exam.');
      }
    } catch (error) {
      setError('An error occurred while submitting the exam.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < examContent.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <h2 className={styles.header}>Select a Title to View Exams</h2>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.titleList}>
          {loadingTitles ? (
            <p>Loading titles...</p>
          ) : titles.length > 0 ? (
            titles.map((title) => (
              <div
                key={title.titleid}
                className={styles.titleBox}
                onClick={() => handleTitleClick(title.titleid)}
              >
                <h3>{title.examtitle}</h3>
              </div>
            ))
          ) : (
            <p>No titles available.</p>
          )}
        </div>

        {/* Exams Modal */}
        {showExamsModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <button
                className={styles.closeButton}
                onClick={() => setShowExamsModal(false)}
              >
                X
              </button>
              <h3>Exams</h3>
              {loadingExams ? (
                <p>Loading exams...</p>
              ) : exams.length > 0 ? (
                exams.map((exam) => (
                  <div
                    key={exam.examid}
                    className={styles.examBox}
                    onClick={() => handleExamClick(exam.examid, exam.examdata)}
                  >
                    <h4>{exam.examname || `Exam ${exam.examid}`}</h4>
                  </div>
                ))
              ) : (
                <p>No exams available.</p>
              )}
            </div>
          </div>
        )}

        {/* Exam Content Modal */}
        {showExamContentModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <button
                className={styles.closeButton}
                onClick={() => setShowExamContentModal(false)}
              >
                X
              </button>
              <h3>Question {currentQuestionIndex + 1} of {examContent.questions.length}</h3>
              <div className={styles.questionBlock}>
                <p>{examContent.questions[currentQuestionIndex]?.question}</p>
                {examContent.questions[currentQuestionIndex]?.imagePath && (
                  <div className={styles.imageContainer}>
                    <img
                      src={`/api/getImage?filename=${examContent.questions[currentQuestionIndex].imagePath.split('/').pop()}`}
                      alt="Question"
                      className={styles.questionImage}
                    />
                  </div>
                )}
                {examContent.questions[currentQuestionIndex]?.options &&
                examContent.questions[currentQuestionIndex].options.length > 0 ? (
                  <div className={styles.optionsContainer}>
                    {examContent.questions[currentQuestionIndex].options.map((option, index) => (
                      <div className={styles.radioOption} key={index}>
                        <input
                          type="radio"
                          name={`question-${currentQuestionIndex}`}
                          value={option}
                          checked={userAnswers[currentQuestionIndex] === option}
                          onChange={() => handleAnswerChange(currentQuestionIndex, option)}
                        />
                        <label>{option}</label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    className={styles.inputField}
                    placeholder="Type your answer here"
                    value={userAnswers[currentQuestionIndex] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                  />
                )}
              </div>
              <div className={styles.navigationButtons}>
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={styles.navButton}
                >
                  Previous
                </button>
                {currentQuestionIndex < examContent.questions.length - 1 ? (
                  <button onClick={handleNextQuestion} className={styles.navButton}>
                    Next
                  </button>
                ) : (
                  <button onClick={handleSubmit} className={styles.navButton}>
                    {submitting ? (
                      <div className={styles.spinner}></div>
                    ) : (
                      'Submit'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {resultModal.show && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3>Exam Result</h3>
              <p>Score: {resultModal.result.score}</p>
              <button
                onClick={() => setResultModal({ show: false, result: null })}
                className={styles.closeButton}
              >
                X
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
