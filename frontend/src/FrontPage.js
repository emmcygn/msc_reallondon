// FrontPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FrontPage.css';

function FrontPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();

    // Encode the search term once
    const encodedSearchURL = encodeURIComponent(searchTerm.trim());

    // Navigate to the results page with the encoded search URL
    navigate(`/results?search_url_origin=${encodedSearchURL}`);
  };

  return (
    <div className="front-page">
      <div className="overlay">
        <h1 className="title">RealLondon</h1>
        <p className="subtitle">Searchable Insights, Simply.</p>

        <form onSubmit={handleSearch} className="search-form">
          <button type="submit" className="search-button">
            {/* SVG icon */}
          </button>
          <input
            type="text"
            placeholder="Enter RightMove Search URL"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </form>
      </div>
    </div>
  );
}

export default FrontPage;
