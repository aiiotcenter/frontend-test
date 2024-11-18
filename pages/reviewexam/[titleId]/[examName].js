import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../../styles/reviewexam.module.css';
import Header from '../../../components/header';


export default function ReviewExams() {
  const router = useRouter();
  const { titleId, examName } = router.query;

  const [exam, setExam] = useState(null);
  const [editedExamContent, setEditedExamContent] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await fetch(`/api/exams/${titleId}`);
        if (response.ok) {
          const data = await response.json();
          if (data && typeof data === 'object') {
            setExam(data);
            if (data.examdata) {
              const examContentResponse = await fetch(`/data/${encodeURIComponent(data.examdata)}`);
              if (examContentResponse.ok) {
                const examContent = await examContentResponse.json();
                if (examContent) {
                  setEditedExamContent(examContent);
                }
              } else {
                console.error(`Failed to fetch exam content for path: ${data.examdata}`);
              }
            }
          }
        } else {
          console.error(`Failed to fetch exam for titleId: ${titleId}`);
        }
      } catch (error) {
        console.error('Error fetching exam:', error);
      }
    };

    if (titleId) {
      fetchExam();
    }
  }, [titleId]);

  const handleInputChange = (e, key) => {
    const updatedQuestions = [...editedExamContent.questions];
    updatedQuestions[currentQuestionIndex][key] = e.target.value;
    setEditedExamContent({ ...editedExamContent, questions: updatedQuestions });
  };

  const handleOptionChange = (e, optionIndex) => {
    const updatedQuestions = [...editedExamContent.questions];
    updatedQuestions[currentQuestionIndex].options[optionIndex] = e.target.value;
    setEditedExamContent({ ...editedExamContent, questions: updatedQuestions });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < editedExamContent.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/exams/edit/${exam.examid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newContent: {
            questions: editedExamContent.questions.map((question) => ({
              question: question.question,
              answer: question.answer,
              options: question.options, // Include options if they exist
            })),
          },
        }),
      });
  
      if (response.ok) {
        alert('Exam successfully updated!');
      } else {
        alert('Failed to update the exam.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      alert('An error occurred while updating the exam.');
    }
  };
  

  const handleDeleteExam = async () => {
    try {
      const response = await fetch(`/api/exams/${exam.examid}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Exam deleted successfully!');
        router.push('/titles');
      } else {
        alert('Failed to delete the exam.');
      }
    } catch (error) {
      console.error('An error occurred while deleting the exam:', error);
      alert('An error occurred while deleting the exam.');
    }
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        {/* Back Arrow */}
        <div className={styles.backArrow} onClick={() => router.push('/titles')}>
  &#8592;
</div>

        <h2>Review and Edit Exam for: {examName}</h2>

        {exam && editedExamContent.questions ? (
          <div className={styles.examEditor}>
            <div className={styles.navigationButtons}>
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={styles.navButton}
              >
                Previous Question
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === editedExamContent.questions.length - 1}
                className={styles.navButton}
              >
                Next Question
              </button>
            </div>

            <h3>Editing Question {currentQuestionIndex + 1} of {editedExamContent.questions.length}</h3>

            <div className={styles.questionBlock}>
              <label>Question {currentQuestionIndex + 1}:</label>
              <input
                type="text"
                value={editedExamContent.questions[currentQuestionIndex]?.question}
                onChange={(e) => handleInputChange(e, 'question')}
                className={styles.inputField}
              />

              {editedExamContent.questions[currentQuestionIndex]?.options && (
                <div>
                  <label>Options:</label>
                  {editedExamContent.questions[currentQuestionIndex].options.map(
                    (option, optionIndex) => (
                      <input
                        key={optionIndex}
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(e, optionIndex)}
                        className={styles.inputField}
                      />
                    )
                  )}
                </div>
              )}

              <label>Answer:</label>
              <input
                type="text"
                value={editedExamContent.questions[currentQuestionIndex]?.answer}
                onChange={(e) => handleInputChange(e, 'answer')}
                className={styles.inputField}
              />
{editedExamContent.questions[currentQuestionIndex]?.imagePath && (
  <div>
    <label>Image:</label>
    <img
      src={`http://127.0.0.1:5501/examgenerator-backend/PythonFlask/images/${editedExamContent.questions[currentQuestionIndex].imagePath.split('/').pop()}`}
      alt="Question Illustration"
      className={styles.image}
    />
  </div>
)}
</div>


            <button onClick={handleSave} className={styles.saveButton}>
              Save Exam
            </button>

            <button onClick={handleDeleteExam} className={styles.deleteButton}>
              Delete Exam
            </button>
          </div>
        ) : (
          <p>No exam available for this title.</p>
        )}
      </div>
    </>
  );
}
