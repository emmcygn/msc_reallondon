# Real London Property Explorer

## Introduction

The Real London Property Explorer is a comprehensive web application designed to facilitate the exploration and analysis of property listings in London. This project integrates web scraping techniques, data storage solutions, and data visualization to provide users with valuable insights into the London property market. Developed as part of a Software Engineering course, this application demonstrates proficiency in full-stack development, data processing, and user interface design.

## Project Objectives

1. To create a user-friendly interface for accessing and analyzing London property data.
2. To implement efficient web scraping techniques for real-time data collection.
3. To design a robust backend system for data processing and storage.
4. To develop insightful data visualizations for market trend analysis.

## Features

- **Automated Data Collection**: Implements web scraping to extract property listings from Rightmove.
- **Data Persistence**: Utilizes MongoDB for efficient storage and retrieval of property data.
- **Data Analytics**: Provides statistical insights such as average prices and square footage distributions.
- **Interactive User Interface**: Offers a responsive frontend built with React for seamless user experience.
- **RESTful API**: Employs a Flask-based backend to serve data to the frontend efficiently.

## Technical Architecture

### Frontend
- React.js
- JavaScript (ES6+)
- HTML5/CSS3
- Recharts for data visualization

### Backend
- Python 3.8+
- Flask web framework
- Selenium for web scraping
- BeautifulSoup for HTML parsing
- PyMongo for database interactions
- Flask-CORS for handling Cross-Origin Resource Sharing

### Database
- MongoDB

## Project Structure

```
real-london/
├── backend/
│   ├── app.py
│   ├── scraper.py
│   ├── requirements.txt
│   ├── .env
│   └── [additional backend files]
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── FrontPage.js
│   │   ├── ResultsPage.js
│   │   └── [additional frontend files]
│   ├── public/
│   ├── package.json
│   └── .env
├── README.md
└── .gitignore
```

## Installation and Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm (included with Node.js)
- Python (version 3.8 or higher)
- pip (Python package installer)
- MongoDB (local instance or cloud service)
- Google Chrome (required for Selenium WebDriver)

### Backend Configuration

1. Clone the repository:
   ```bash
   git clone https://github.com/[your_username]/real-london.git
   cd real-london/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Create a `.env` file in the `backend/` directory with the following content:
   ```
   MONGO_CONNECTION_STRING=[your_mongodb_connection_string]
   SECRET_KEY=[your_secret_key]
   ```
   Replace placeholders with actual values.

5. Set up Selenium WebDriver:
   - Download the ChromeDriver compatible with your Google Chrome version from the official site.
   - Place the ChromeDriver executable in the `backend/` directory or ensure it's in your system's PATH.

### Frontend Configuration

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the `frontend/` directory with the following content:
   ```
   REACT_APP_API_BASE_URL=http://localhost:5000
   ```

## Usage Instructions

### Starting the Backend Server
1. Activate the virtual environment (if not already active):
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Launch the Flask server:
   ```bash
   flask run
   ```
   The backend server will be accessible at `http://localhost:5000`.

### Launching the Frontend Application
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Start the React development server:
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000`.

### Application Workflow
1. Access the application through a web browser at `http://localhost:3000`.
2. Input a valid Rightmove search URL on the homepage.
3. The application will scrape the data, process it, and display analytical insights on the results page.

## Version Issues 
1. RightMove's page logic may have shifted since testing, making it difficult for the scraper to scrape past the first page of results. In testing, this was met and the scraper was previously able to scrape multiple results pages. 

## Future Enhancements

- Implement user authentication and personalized property recommendations.
- Expand data sources to include other property listing websites.
- Develop advanced filtering and sorting options for property listings.
- Integrate machine learning algorithms for predictive analytics on property prices.

## Conclusion

The Real London Property Explorer demonstrates the practical application of web development technologies and data analysis techniques in solving real-world problems. This project showcases proficiency in full-stack development, data manipulation, and user interface design, providing a solid foundation for future enhancements and scalability.
