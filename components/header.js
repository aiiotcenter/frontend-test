import React from 'react';
import styles from '../styles/header.module.css';

export default function Header() {
  return (
    <header className={styles.topSection}>
      <img 
        src="/RCAIoT_logo.png" 
        alt="RCA IoT Logo" 
        className={styles.logo} 
        loading="lazy" 
      />
      <div className={styles.headerContent}>
        <h1 className={styles.mainHeader}>Exam Protocol</h1>
        <p className={styles.mainDescription}>
          Welcome to the Exam Protocol System – your platform to practice, assess, and improve exam readiness.
        </p>
      </div>
    </header>
  );

}
