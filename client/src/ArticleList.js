// src/ArticleList.js
import React, { useState, useEffect } from 'react';

// The ArticleList component fetches and displays a list of articles.
function ArticleList() {
  // State hooks to manage data, loading state, and error messages.
  const [data, setData] = useState([]); // Holds the fetched article data.
  const [loading, setLoading] = useState(true); // Indicates if the data is still being fetched.
  const [error, setError] = useState(null); // Holds any error messages encountered during fetch.

  // useEffect hook to fetch data when the component mounts.
  useEffect(() => {
    // Asynchronous function to fetch data from the API.
    async function fetchData() {
      try {
        // Fetch data from the server.
        const response = await fetch('http://localhost:5000');
        
        // Check if the response is ok (status in the range 200-299).
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        // Parse the JSON data from the response.
        const jsonData = await response.json();
        
        // Update state with the fetched data.
        setData(jsonData);
      } catch (error) {
        // Set the error state if an exception occurs.
        setError(error.message);
      } finally {
        // Set loading to false once the fetch attempt is complete.
        setLoading(false);
      }
    }

    // Call the fetchData function to initiate data fetching.
    fetchData();
  }, []); // Empty dependency array means this effect runs once on component mount.

  // Conditional rendering based on loading and error states.
  if (loading) return <div>Loading...</div>; // Show a loading message while data is being fetched.
  if (error) return <div>Error: {error}</div>; // Show an error message if there is an error.

  // Render the list of articles once data is successfully fetched.
  return (
    <div>
      <h1>Article Information</h1>
      <ul>
        {/* Map through the data array and render each article item */}
        {data.map((item, index) => (
          <li key={index}>
            <strong>Title:</strong> {item.title} <br />
            <strong>Date:</strong> {item.date}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Export the component for use in other parts of the application.
export default ArticleList;