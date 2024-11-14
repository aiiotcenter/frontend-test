// frontend/pages/index.js
"use client";
import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const apiURL = 'http://localhost:5000/api/data';
    
    fetch(apiURL)
      .then(response => response.json())
      .then(setData)
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      <h1>Data from Node API:</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
