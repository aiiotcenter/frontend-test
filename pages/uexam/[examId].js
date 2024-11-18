import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/uexam.module.css';
import Header from '../../components/header';
import Footer from '../../components/footer';



export default function ExamPage() {
  const router = useRouter();
  const { examId, examName = 'Exam' } = router.query;

  const [examContent, setExamContent] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExam = async () => {
      if (!examId) return;

      try {
        const response = await fetch(`/api/exams/${examId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          console.error('Failed to fetch exam data.');
          return;
        }

        const data = await response.json();
        console.log('Raw exam data from server:', data);

        if (data.examdata) {
          let parsedExamData;
          try {
            const firstParse = JSON.parse(data.examdata);
            parsedExamData = typeof firstParse === 'string' ? JSON.parse(firstParse) : firstParse;

            if (parsedExamData && Array.isArray(parsedExamData.questions)) {
              setExamContent(parsedExamData);
              setUserAnswers(Array(parsedExamData.questions.length).fill(''));
            } else {
              console.error('No questions found in exam data:', parsedExamData);
            }
          } catch (parseError) {
            console.error('Error parsing examdata:', parseError);
          }
        } else {
          console.error('No examdata field in the server response.');
        }
      } catch (error) {
        console.error('An error occurred while fetching the exam:', error);
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExam();
    }
  }, [examId]);

  const handleAnswerChange = (index, answer) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[index] = answer;
    setUserAnswers(updatedAnswers);
  };

  const calculateScore = () => {
    if (!examContent || !Array.isArray(examContent.questions)) return;

    let correctAnswers = 0;
    examContent.questions.forEach((question, index) => {
      const correctAnswer = question.answer ? question.answer.toLowerCase() : '';
      const userAnswer = userAnswers[index] ? userAnswers[index].toLowerCase() : '';

      if (correctAnswer === userAnswer) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateScore();
  };

  if (loading) {
    return <div className={styles.spinner}>Loading exam...</div>;
  }

  if (!examContent || !Array.isArray(examContent.questions)) {
    return <p>Invalid or missing exam content.</p>;
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        <h2 className={styles.header}>{examName}</h2>

        {score === null ? (
          <form onSubmit={handleSubmit} className={styles.examForm}>
            {examContent.questions.map((question, index) => (
              <div key={index} className={styles.questionBlock}>
                <p>{question.question}</p>

                {question.options?.length ? (
                  question.options.map((option, i) => (
                    <label key={i}>
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                      />
                      {option}
                    </label>
                  ))
                ) : (
                  <input
                    type="text"
                    placeholder="Type your answer"
                    value={userAnswers[index] || ''}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className={styles.textInput}
                  />
                )}
              </div>
            ))}

            <button type="submit" className={styles.submitButton}>
              Submit Exam
            </button>
          </form>
        ) : (
          <div className={styles.result}>
            <h3>Your Score: {score} / {examContent.questions.length}</h3>
          </div>
        )}
      </div>
      { <Footer /> }
    </>
  );
}
