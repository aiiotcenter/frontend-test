import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/titles.module.css';
import Header from '../components/header';

export default function Titles() {
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCreateTitlePopup, setShowCreateTitlePopup] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const router = useRouter();

  /**
   * Fetch titles when the component mounts
   */
  useEffect(() => {
    const fetchTitles = async () => {
      try {
        console.log('Fetching titles...');
        const response = await fetch('/api/titles', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          setTitles(data || []);
          console.log('Titles fetched successfully');
        } else {
          console.error('Failed to fetch titles:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching titles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTitles();
  }, []); // Dependency array ensures it runs only once

  /**
   * Fetch exams for a specific title
   */
  const handleShowExams = useCallback(async (title) => {
    setLoadingExams(true);
    setShowModal(true);
    try {
      console.log(`Fetching exams for title ID: ${title.titleid}`);
      const response = await fetch(`/api/exams/title/${title.titleid}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setExams(data || []);
        console.log('Exams fetched successfully');
      } else {
        console.error('Failed to fetch exams:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoadingExams(false);
    }
  }, []);

  /**
   * Navigate to create an exam for the selected title
   */
  const handleCreateExam = useCallback((title) => {
    const encodedExamTitle = encodeURIComponent(title.examtitle);
    router.push(`/Dashboard/${encodedExamTitle}/${title.titleid}`);
  }, [router]);

  /**
   * Navigate to review a specific exam
   */
  const handleViewExam = useCallback((exam) => {
    router.push(`/reviewexam/${exam.examid}/${exam.examtitle}`);
  }, [router]);

  /**
   * Create a new title
   */
  const handleSubmitNewTitle = async () => {
    if (!newTitle.trim()) {
      alert('Please enter a title');
      return;
    }

    const userId = localStorage.getItem('userId');
    const accessToken = localStorage.getItem('access_token');

    if (!userId || !accessToken) {
      alert('User ID or access token is missing. Please log in again.');
      return;
    }

    try {
      console.log('Creating new title:', newTitle);
      const response = await fetch('/api/titles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examtitle: newTitle,
          createdby: userId,
        }),
      });

      if (response.ok) {
        const createdTitle = await response.json();
        setTitles((prevTitles) => [...prevTitles, createdTitle]);
        setShowCreateTitlePopup(false);
        setNewTitle('');
        console.log('Title created successfully');
      } else {
        const errorData = await response.json();
        alert(`Failed to create title: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating title:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  /**
   * Delete a title
   */
  const handleDeleteTitle = async (titleid) => {
    try {
      console.log(`Deleting title ID: ${titleid}`);
      const response = await fetch(`/api/titles/${titleid}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTitles((prevTitles) => prevTitles.filter((title) => title.titleid !== titleid));
        alert('Title deleted successfully');
      } else {
        alert('Failed to delete title');
      }
    } catch (error) {
      console.error('Error deleting title:', error);
      alert('An error occurred while deleting the title.');
    }
  };

  /**
   * Close modal handlers
   */
  const closeModal = () => {
    setShowModal(false);
    setExams([]);
  };

  const closeCreateTitlePopup = () => {
    setShowCreateTitlePopup(false);
    setNewTitle('');
  };

  /**
   * Component JSX
   */
  return (
    <>
      <Header />
      <div className={styles.container}>
        <h2 className={styles.header}>Create a new exam with an existing title or create a new title</h2>
        <div className={styles.titleList}>
          {loading ? (
            <p>Loading titles...</p>
          ) : (
            <>
              {titles.map((title) => (
                <div key={title.titleid} className={styles.titleBox}>
                  <h3>{title.examtitle}</h3>
                  <span className={styles.deleteIcon} onClick={() => handleDeleteTitle(title.titleid)}>🗑</span>
                  <button
                    className={styles.createExamButton}
                    onClick={() => handleCreateExam(title)}
                  >
                    Create Exam
                  </button>
                  <button
                    className={styles.showExamsButton}
                    onClick={() => handleShowExams(title)}
                  >
                    Show Existing Exams
                  </button>
                </div>
              ))}

              <div className={styles.titleBox}>
                <button className={styles.createTitleButton} onClick={() => setShowCreateTitlePopup(true)}>
                  Create New Title
                </button>
              </div>
            </>
          )}
        </div>

        {showModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <span className={styles.closeButton} onClick={closeModal}>&times;</span>
              <h3>Existing Exams</h3>
              {loadingExams ? (
                <p>Loading exams...</p>
              ) : exams.length > 0 ? (
                <div className={styles.examsGrid}>
                  {exams.map((exam) => (
                    <div key={exam.examid} className={styles.examBox} onClick={() => handleViewExam(exam)}>
                      <p>Exam {exam.examid}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No exams found for this title.</p>
              )}
            </div>
          </div>
        )}

        {showCreateTitlePopup && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <span className={styles.closeButton} onClick={closeCreateTitlePopup}>&times;</span>
              <h3>Create New Title</h3>
              <textarea
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter the new title"
                className={styles.textArea}
              />
              <button onClick={handleSubmitNewTitle} className={styles.submitButton}>
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
