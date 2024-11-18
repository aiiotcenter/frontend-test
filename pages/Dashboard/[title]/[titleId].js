import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../../styles/Dashboard.module.css';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import Header from '../../../components/header';

// Set the worker source to the local file in the public folder
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export default function Dashboard() {
  const router = useRouter();
  const { title, titleId } = router.query;

  const [examName, setExamName] = useState('');
  const [multipleChoice, setMultipleChoice] = useState(2);
  const [fillBlanks, setFillBlanks] = useState(2);
  const [trueFalse, setTrueFalse] = useState(2);
  const [classicQuestions, setClassicQuestions] = useState(2);
  const [hardnessLevel] = useState('automatic');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [visualQuestions, setVisualQuestions] = useState(2);
  const [fileContent, setFileContent] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [language, setLanguage] = useState('English');
  const [hasCalledApi, setHasCalledApi] = useState(false);

  useEffect(() => {
    if (router.isReady && title) {
      setExamName(title);
      setIsReadOnly(true);
    }

    if (router.isReady && titleId === '1' && !hasCalledApi) {
      setHasCalledApi(true);
      handleDirectYKSExamGeneration();
    }
  }, [router.isReady, title, titleId, hasCalledApi]);
  const handleDirectYKSExamGeneration = async () => {
    setLoading(true);
    setProgress('Starting YKS exam generation...');
    console.log('Starting YKS exam generation...');
  
    const payload = {
      titleid: 1,
      examDuration: 2,
      examName: 'YÜKSEKÖĞRETİME GEÇİŞ SINAVI',
    };
  
    try {
      const response = await fetch('/api/exams/generateYKS', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      if (!response.body) {
        throw new Error('ReadableStream not supported in this environment.');
      }
      console.log('ReadableStream received:', response.body);
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
  
      let examId = null;
  
      // Start reading the stream
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log('Stream reading completed.');
          break;
        }
  
        buffer += decoder.decode(value, { stream: true });
        console.log('Received buffer chunk:', buffer);
  
        // Use a regular expression to extract all complete JSON objects
        const jsonRegex = /(\{.*?\})(?=\{|\n|$)/g;
        let match;
  
        while ((match = jsonRegex.exec(buffer)) !== null) {
          const jsonChunk = match[1];
          try {
            const parsedChunk = JSON.parse(jsonChunk);
            console.log('Parsed chunk:', parsedChunk);
  
            if (parsedChunk.status) {
              console.log(`Step received: ${parsedChunk.status}`);
              setProgress(parsedChunk.status); // Update progress
            }
  
            if (parsedChunk.exam?.examid) {
              examId = parsedChunk.exam.examid; // Extract the exam ID
              console.log('Exam ID extracted:', examId);
            }
          } catch (error) {
            console.error('Error parsing chunk:', error, jsonChunk);
          }
        }
  
        // Remove processed chunks from the buffer
        buffer = buffer.slice(jsonRegex.lastIndex);
        jsonRegex.lastIndex = 0; // Reset regex index for the next iteration
      }
  
      // Navigate to the review page if exam ID is found
      if (examId) {
        console.log(`Navigating to review page for exam ID: ${examId}`);
        await router.push(`/reviewexam/${examId}/${payload.examName}`);
      } else {
        console.error('No exam ID found in the response.');
        alert('Failed to review exam. No exam ID returned from the server.');
      }
  
      setProgress('YKS exam created successfully!');
    } catch (error) {
      console.error('Error during YKS exam creation:', error.message);
      setProgress('An error occurred during YKS exam creation. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  const handleUniversitySelect = (university) => {
    setSelectedUniversity(university === selectedUniversity ? '' : university);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let textContent = '';

        for (let i = 0; i < pdf.numPages; i++) {
          const page = await pdf.getPage(i + 1);
          const text = await page.getTextContent();
          const pageText = text.items.map((item) => item.str).join(' ');
          textContent += pageText + '\n';
        }

        setFileContent(textContent);
      } catch (error) {
        console.error('Error extracting text from PDF:', error);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setProgress('Starting exam creation...');
    console.log('Starting exam creation...');
  
    const payload = {
      titleid: titleId,
      examDuration: 2,
      examName: examName,
      language: language,
      fileContent: fileContent,
      hardnessLevel: hardnessLevel,
      numFillInTheBlanks: Number(fillBlanks),
      numMultipleChoice: Number(multipleChoice),
      numTrueFalse: Number(trueFalse),
      numofclasicquestion: Number(classicQuestions),
      numofvisual: Number(visualQuestions),
      university: selectedUniversity || null,
    };
  
    try {
      const response = await fetch('/api/exams/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      if (!response.body) {
        throw new Error('ReadableStream not supported in this environment.');
      }
      console.log('ReadableStream received:', response.body);
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
  
      let examId = null;
  
      // Start reading the stream
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log('Stream reading completed.');
          break;
        }
  
        buffer += decoder.decode(value, { stream: true });
        console.log('Received buffer chunk:', buffer);
  
        // Use a regular expression to extract all complete JSON objects
        const jsonRegex = /(\{.*?\})(?=\{|\n|$)/g;
        let match;
  
        while ((match = jsonRegex.exec(buffer)) !== null) {
          const jsonChunk = match[1];
          try {
            const parsedChunk = JSON.parse(jsonChunk);
            console.log('Parsed chunk:', parsedChunk);
  
            if (parsedChunk.status) {
              console.log(`Step received: ${parsedChunk.status}`);
              setProgress(parsedChunk.status); // Update progress
            }
  
            if (parsedChunk.exam?.examid) {
              examId = parsedChunk.exam.examid; // Extract the exam ID
              console.log('Exam ID extracted:', examId);
            }
          } catch (error) {
            console.error('Error parsing chunk:', error, jsonChunk);
          }
        }
  
        // Remove processed chunks from the buffer
        buffer = buffer.slice(jsonRegex.lastIndex);
        jsonRegex.lastIndex = 0; // Reset regex index for the next iteration
      }
  
      // Navigate to the review page if exam ID is found
      if (examId) {
        console.log(`Navigating to review page for exam ID: ${examId}`);
        await router.push(`/reviewexam/${examId}/${examName}`);
      } else {
        console.error('No exam ID found in the response.');
        alert('Failed to review exam. No exam ID returned from the server.');
      }
  
      setProgress('Exam created successfully!');
    } catch (error) {
      console.error('Error during exam creation:', error.message);
      setProgress('An error occurred during exam creation. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  
  return (
    <>
      <Header />
      <div className={styles.container}>
        {loading ? (
          <div className={styles.spinnerContainer}>
            <div className={styles.spinner}></div>
            <p>{progress}</p>
          </div>
        ) : (
          <>
            <h2>Create A New Exam for {title}</h2>
            {titleId === '1' ? null : (
              <>
                <p>Select University To Have Same Level of Questions:</p>
                <div className={styles.universityList}>
                  {['Oxford University', 'Harvard University', 'Stanford University', 'MIT', 'Cambridge University'].map((university) => (
                    <button
                      key={university}
                      type="button"
                      className={`${styles.universityBox} ${selectedUniversity === university ? styles.selected : ''}`}
                      onClick={() => handleUniversitySelect(university)}
                    >
                      {university}
                    </button>
                  ))}
                </div>
                <form className={styles.examForm} onSubmit={handleSubmit}>
                  <div className={styles.formGroup}>
                    <label htmlFor="exam-name">Exam Subject</label>
                    <input
                      type="text"
                      id="exam-name"
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
                      required
                      readOnly={isReadOnly}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="language">Select Language</label>
                    <select
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      required
                    >
                      <option value="English">English</option>
                      <option value="Turkish">Turkish</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="multiple-choice">Number of Multiple Choice Questions</label>
                    <input
                      type="number"
                      id="multiple-choice"
                      min="0"
                      value={multipleChoice}
                      onChange={(e) => setMultipleChoice(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="fill-blanks">Number of Fill in the Blanks</label>
                    <input
                      type="number"
                      id="fill-blanks"
                      min="0"
                      value={fillBlanks}
                      onChange={(e) => setFillBlanks(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="true-false">Number of True and False</label>
                    <input
                      type="number"
                      id="true-false"
                      min="0"
                      value={trueFalse}
                      onChange={(e) => setTrueFalse(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="classic-questions">Number Of Classic Questions</label>
                    <input
                      type="number"
                      id="classic-questions"
                      min="0"
                      value={classicQuestions}
                      onChange={(e) => setClassicQuestions(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="visual-questions">Number of Visual Questions</label>
                    <input
                      type="number"
                      id="visual-questions"
                      min="0"
                      value={visualQuestions}
                      onChange={(e) => setVisualQuestions(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className={`${styles.formGroup} ${styles.fileUploadGroup}`}>
                    <label htmlFor="file-upload" className={styles.fileInputWrapper}>
                      <span className={styles.uploadText}>Upload Supporting Document</span>
                      <input type="file" id="file-upload" onChange={handleFileUpload} />
                    </label>
                  </div>

                  <button type="submit" className={styles.submitButton}>
                    Create Exam
                  </button>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
