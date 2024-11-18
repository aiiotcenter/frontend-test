import React, { useState } from 'react';
import { useRouter } from 'next/router';
//import dynamic from 'next/dynamic'; // Dynamic import for Header and Footer
import styles from '../styles/Login.module.css';
import Header from '../components/header';
import Footer from '../components/footer';



export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    const payload = {
      userName: email,
      password: password,
    };
  
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
  
      const result = await response.json();
  
      // Log the full response and the user details for debugging
      console.log('Login response:', result);
      console.log('Access Token:', result.access_token);
      console.log('Refresh Token:', result.refresh_token);
      console.log('User details:', result.user);
  
      if (response.ok) {
        // Store tokens and user ID in localStorage
        localStorage.setItem('access_token', result.access_token);
        localStorage.setItem('refresh_token', result.refresh_token);
        localStorage.setItem('userId', result.user.userid); // Save userId, updated from result.user.id to result.user.userid
        localStorage.setItem('user', JSON.stringify(result.user));
  
        router.push('/titles'); // Redirect to titles page
      } else {
        // Handle error response
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
        <Header />
    <div className={styles.loginContainer}>
      <div className={styles.languageSwitcher}>
        {/* Add language switcher if needed */}
      </div>

      

      <div className={styles.formContainer}>
        <h2 className={styles.formHeader}>Exam Protocol Login</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
              autoComplete="new-password" // Prevent browser auto-fill
            />
          </div>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
   
    { <Footer /> }
    </>
  );
}
