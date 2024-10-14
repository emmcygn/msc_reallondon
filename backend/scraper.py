# scraper.py

from selenium import webdriver
from bs4 import BeautifulSoup
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pymongo import MongoClient
from concurrent.futures import ThreadPoolExecutor
import re
from datetime import datetime  # For Timestamps
from dotenv import load_dotenv
import os

# Load variables from the .env file
load_dotenv()

# Get MongoDB connection string from environment variables
MONGO_CONNECTION_STRING = os.getenv("MONGO_CONNECTION_STRING")

class RightmoveScraperSelenium:
    def __init__(self, link=None):
        self.link = link
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_argument("--headless")  # # Run Chrome in headless mode for faster scraping
        self.driver = webdriver.Chrome(options=chrome_options)
        
        # Set up MongoDB client using the connection string
        self.client = MongoClient(MONGO_CONNECTION_STRING)
        self.db = self.client['RightmoveData']
        self.collection = self.db['PropertyListings']
        self.search_url_origin = link  # Store the original search URL


    def fetch(self, url):
        print(f'Fetching {url}')
        self.driver.get(url)

        try:
            # Wait for the cookie consent button and click it
            cookie_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Accept all')]"))
            )
            cookie_button.click()
            print("Cookie consent accepted.")
        except Exception as e:
            print(f"No cookie consent pop-up found or error in handling it: {e}")

        return self.driver.page_source

    def extract_square_footage(self, url):
        try:
            self.driver.get(url)
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, 'body'))
            )
            html = self.driver.page_source
            soup = BeautifulSoup(html, 'lxml')
            text = soup.get_text()

            # Use regex to find square footage in the text
            pattern = re.compile(r'(\d{1,3}(?:,\d{3})*)\s*sq ft')
            match = pattern.search(text)

            if match:
                return int(match.group(1).replace(',', ''))  # Clean square footage as integer
            else:
                return None
        except Exception as e:
            print(f"Error extracting square footage: {e}")
            return None

    def clean_price(self, price_text):
        try:
            # Remove currency symbols and commas, then convert to integer
            return int(price_text.replace('£', '').replace(',', '').strip())
        except:
            return None

    def parse(self, html):
        soup = BeautifulSoup(html, 'lxml')
        properties = soup.select('div.propertyCard')
        if not properties:
            return

        results = []
        futures = []
        with ThreadPoolExecutor(max_workers=5) as executor:
            for property_card in properties:
                # Extract various details from the property card
                address_element = property_card.select_one('meta[itemprop="streetAddress"]')
                address_text = address_element['content'] if address_element else 'N/A'
                bedrooms_element = property_card.select_one('span.no-svg-bed-icon + span')
                bathrooms_element = property_card.select_one('span.no-svg-bathroom-icon + span')
                bedrooms_text = bedrooms_element.text.strip() if bedrooms_element else 'N/A'
                bathrooms_text = bathrooms_element.text.strip() if bathrooms_element else 'N/A'
                price_element = property_card.select_one('div.propertyCard-priceValue')
                price_text = price_element.text.strip() if price_element else 'N/A'
                cleaned_price = self.clean_price(price_text)
                date_element = property_card.select_one('span.propertyCard-branchSummary-addedOrReduced')
                date_text = date_element.text.strip() if date_element else 'N/A'
                property_url_element = property_card.select_one('a.propertyCard-link')
                property_url = property_url_element['href'] if property_url_element else 'N/A'
                full_url = f"https://www.rightmove.co.uk{property_url}"

                # Schedule extraction of square footage in a separate thread
                futures.append(executor.submit(self.extract_square_footage, full_url))

                # Collect all extracted data into a dictionary
                results.append({
                    'title': f"{address_text}, {bedrooms_text} bedrooms, {bathrooms_text} bathrooms",
                    'address': address_text,
                    'price': cleaned_price,
                    'bedrooms': int(bedrooms_text) if bedrooms_text.isdigit() else None,
                    'bathrooms': int(bathrooms_text) if bathrooms_text.isdigit() else None,
                    'square_footage': None,  # Will be updated later
                    'date': date_text,
                    'property_url': full_url,
                    'search_url_origin': self.search_url_origin,
                    'timestamp': datetime.utcnow(),  # Timestamp added here
                })

            # Update the 'square_footage' in results after futures complete
            for i, future in enumerate(futures):
                size_text = future.result()
                results[i]['square_footage'] = size_text

            self.collection.insert_many(results)
            print(f"Parsed {len(properties)} properties and saved to MongoDB.")

            # Manage database size after insertion
            self.manage_database_size()

    def manage_database_size(self):
        # Count total entries in the collection
        total_entries = self.collection.count_documents({})
        print(f"Total property entries in the database: {total_entries}")

        # If we have more than 1000 entries, remove the oldest ones
        if total_entries > 1000:
            print("Database size exceeds 1000 entries. Initiating cleanup...")

            # Find the oldest 'search_url_origin' entries timestamp-wise
            pipeline = [
                {
                    '$group': {
                        '_id': '$search_url_origin',
                        'earliest_timestamp': {'$min': '$timestamp'}
                    }
                },
                {
                    '$sort': {'earliest_timestamp': 1}
                },
                {
                    '$limit': 2
                }
            ]
            oldest_search_urls = list(self.collection.aggregate(pipeline))

            # Delete properties associated with the oldest search URLs
            for entry in oldest_search_urls:
                search_url = entry['_id']
                print(f"Deleting data for search_url_origin: {search_url}")
                self.collection.delete_many({'search_url_origin': search_url})

            print("Cleanup completed.")
        else:
            print("Database size is within the limit. No cleanup needed.")

    def run(self):
        first_page_url = f"{self.link}&index=0"
        html = self.fetch(first_page_url)
        self.parse(html)
