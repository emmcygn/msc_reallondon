# app.py

from flask import Flask, jsonify, request
from pymongo import MongoClient
from flask_cors import CORS
from scraper import RightmoveScraperSelenium  # Import the scraper class
from dotenv import load_dotenv
import os

# Load variables from the .env file
load_dotenv()

# Get MongoDB connection string and secret key from environment variables
MONGO_CONNECTION_STRING = os.getenv("MONGO_CONNECTION_STRING")

app = Flask(__name__)

# Configure CORS
CORS(app)

# Set up MongoDB client
client = MongoClient(
    "mongodb+srv://real_london_proj:1Test@cluster0testheh.ajsvoul.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0Testheh"
)
db = client["RightmoveData"]
collection = db["PropertyListings"]

# Helper function to clean data for API response
def clean_property_data(property_data):
    return {
        "title": property_data.get("title", "N/A"),
        "price": property_data.get("price", "N/A"),
        "bedrooms": property_data.get("bedrooms", "N/A"),
        "bathrooms": property_data.get("bathrooms", "N/A"),
        "sqFt": property_data.get("square_footage", "N/A"),
        "date": property_data.get("date", "N/A"),
        "property_url": property_data.get("property_url", "N/A"),
    }

# API endpoint to fetch property listings based on 'search_url_origin'
@app.route("/api/properties", methods=["GET"])
def get_properties():
    # Get the 'search_url_origin' from query parameters
    search_url_origin = request.args.get("search_url_origin")
    print(f"Received search_url_origin: {search_url_origin}")  # Debugging

    if not search_url_origin:
        return jsonify({"error": "search_url_origin parameter is required"}), 400

    # Proceed with MongoDB query
    # Ensure that 'search_url_origin' matches the format stored in your database
    properties = list(
        collection.find({"search_url_origin": search_url_origin}).limit(37)
    )

    # After fetching data, check if any properties were found
    if not properties:
        print(f"No properties found for search_url_origin: {search_url_origin}")
        # Run the scraper to fetch data
        print("Running scraper for the given search_url_origin...")
        scraper = RightmoveScraperSelenium(link=search_url_origin)
        scraper.run()

        # After scraping, query the database again to get the properties
        properties = list(
            collection.find({"search_url_origin": search_url_origin}).limit(37)
        )

        if not properties:
            # If still no properties found, return error response
            return jsonify({"error": "No properties found for the given URL"}), 404

    # Clean and return properties data
    cleaned_properties = [clean_property_data(prop) for prop in properties]
    print(f"Cleaned properties: {cleaned_properties}")  # Debugging

    # Calculate additional stats for the response
    prices = [
        prop.get("price", 0)
        for prop in cleaned_properties
        if isinstance(prop.get("price"), int)
    ]
    sq_fts = [
        prop.get("sqFt", 0)
        for prop in cleaned_properties
        if isinstance(prop.get("sqFt"), int)
    ]

    avg_price = sum(prices) // len(prices) if prices else 0
    avg_sq_ft = sum(sq_fts) // len(sq_fts) if sq_fts else 0
    sq_ft_distribution = (
        f"{min(sq_fts)}-{max(sq_fts)}" if sq_fts else "N/A"
    )
    avg_price_per_sq_ft = avg_price // avg_sq_ft if avg_sq_ft else 0

    # serve JSON response with property data and additional stats
    return jsonify(
        {
            "properties": cleaned_properties,
            "averagePrice": avg_price,
            "avgSquareFootage": avg_sq_ft,
            "pricePerSqFt": avg_price_per_sq_ft,
            "sqFtDistribution": sq_ft_distribution,
        }
    )

if __name__ == "__main__":
    app.run(debug=True)
