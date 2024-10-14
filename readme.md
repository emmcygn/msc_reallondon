Real London Property Explorer
A web application that allows users to explore property listings in London. The project includes a React frontend and a Flask backend that scrapes property data from Rightmove and displays analytical insights.

Table of Contents
Introduction
Features
Technologies Used
Project Structure
Installation
Prerequisites
Backend Setup
Frontend Setup
Usage
Contributing
License
Acknowledgments
Introduction
The Real London Property Explorer is a full-stack web application designed to help users find and analyze property listings in London. Users can input a Rightmove search URL, and the application will scrape the data, store it in a MongoDB database, and display various analytics like average prices, square footage distributions, and more.

Features
Property Data Scraping: Scrapes property listings from Rightmove based on user-provided URLs.
Data Storage: Stores scraped data in a MongoDB database for quick retrieval.
Data Visualization: Displays analytical insights using charts and graphs.
Interactive Frontend: User-friendly interface built with React.
RESTful API: Backend API built with Flask to serve data to the frontend.
Technologies Used
Frontend
React
JavaScript
HTML/CSS
Recharts (for data visualization)
Backend
Python
Flask
Selenium (for web scraping)
BeautifulSoup (for HTML parsing)
PyMongo (for MongoDB interaction)
Flask-CORS (to handle Cross-Origin Resource Sharing)
Database
MongoDB
Project Structure
scss
Copy code
real-london/
├── backend/
│   ├── app.py
│   ├── scraper.py
│   ├── requirements.txt
│   ├── .env
│   └── (other backend files)
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── FrontPage.js
│   │   ├── ResultsPage.js
│   │   └── (other frontend files)
│   ├── public/
│   ├── package.json
│   └── .env
├── README.md
└── .gitignore
Installation
Prerequisites
Node.js (version 14 or higher)
npm (comes with Node.js)
Python (version 3.8 or higher)
pip (Python package installer)
MongoDB (local or cloud instance)
Google Chrome (for Selenium WebDriver)
Backend Setup
Clone the Repository

bash
Copy code
git clone https://github.com/your_username/real-london.git
cd real-london/backend
Create a Virtual Environment

bash
Copy code
python3 -m venv venv
Activate the Virtual Environment

On macOS/Linux:

bash
Copy code
source venv/bin/activate
On Windows:

bash
Copy code
venv\Scripts\activate
Install Dependencies

bash
Copy code
pip install -r requirements.txt
Set Up Environment Variables

Create a .env file in the backend/ directory with the following content:

env
Copy code
MONGO_CONNECTION_STRING=your_mongodb_connection_string
SECRET_KEY=your_secret_key
Replace your_mongodb_connection_string with your actual MongoDB connection string.
Replace your_secret_key with a random string for Flask's secret key.
Set Up Selenium WebDriver

Download the ChromeDriver that matches your Google Chrome version from here.
Place the chromedriver executable in the backend/ directory or ensure it's in your system's PATH.
Frontend Setup
Navigate to the Frontend Directory

bash
Copy code
cd ../frontend
Install Dependencies

bash
Copy code
npm install
Set Up Environment Variables

Create a .env file in the frontend/ directory with the following content:

env
Copy code
REACT_APP_API_BASE_URL=http://localhost:5000
Usage
Running the Backend Server
Activate the Virtual Environment

If not already activated:

bash
Copy code
cd backend
source venv/bin/activate  # On macOS/Linux
Start the Flask Server

bash
Copy code
flask run
The backend server should now be running on http://localhost:5000.

Running the Frontend Application
Navigate to the Frontend Directory

bash
Copy code
cd frontend
Start the React App

bash
Copy code
npm start
The frontend application should open in your default web browser at http://localhost:3000.

Using the Application
Open the Application

Go to http://localhost:3000 in your web browser.

Input a Rightmove URL

On the front page, enter a Rightmove search URL (e.g., a link to property listings in a specific area).
View Results

After submitting the URL, the application will scrape the data and display analytical insights on the results page.
Contributing
Contributions are welcome! Please follow these steps:

Fork the Repository

Click on the 'Fork' button at the top right of the repository page.

Clone Your Fork

bash
Copy code
git clone https://github.com/your_username/real-london.git
Create a New Branch

bash
Copy code
git checkout -b feature/your-feature-name
Make Changes and Commit

bash
Copy code
git add .
git commit -m "Add your message here"
Push to Your Fork

bash
Copy code
git push origin feature/your-feature-name
Submit a Pull Request

Go to the original repository and click on 'Pull Requests' to submit your changes for review.

License
This project is licensed under the MIT License.

Acknowledgments
Rightmove: For providing the data used in this application.
Open Source Libraries: Thank you to all the developers of the open-source libraries used in this project.
Contributors: Thanks to everyone who has contributed to this project.