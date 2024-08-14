// src/ArticleList.js
import React, { useEffect, useState } from 'react';

function ArticleList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('http://localhost:5000');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Article Ages</h1>
      <ul>
        {data.map((item, index) => (
          <li key={index}>Age: {item.age}</li>
        ))}
      </ul>
    </div>
  );
}

export default ArticleList;