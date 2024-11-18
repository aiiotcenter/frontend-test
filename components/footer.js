import React from 'react';
import styles from '../styles/footer.module.css'; // Assuming you have a dedicated CSS file for footer styles

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <h3>AI and IoT Research Center</h3>
        <p>Near East University</p>
        <small>All rights reserved &copy; 2024</small>
      </div>
    </footer>
  );
} 
