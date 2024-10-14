// ResultsPage.js

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ProgressBar } from 'react-bootstrap';
import './ResultsPage.css';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const ResultsPage = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [averagePrice, setAveragePrice] = useState(0);
  const [sqFtDistribution, setSqFtDistribution] = useState('N/A');
  const [avgSquareFootage, setAvgSquareFootage] = useState(0);
  const [pricePerSqFt, setPricePerSqFt] = useState(0);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [progress, setProgress] = useState(0); // Progress for loading

  const [priceRange, setPriceRange] = useState([0, 100000000]); // Adjusted ranges
  const [bedroomsRange, setBedroomsRange] = useState([0, 100]);
  const [bathroomsRange, setBathroomsRange] = useState([0, 100]);
  const [sqFtRange, setSqFtRange] = useState([0, 100000]);

  const [sortOption, setSortOption] = useState('price_asc');

  const [topPropertiesByPricePerSqFt, setTopPropertiesByPricePerSqFt] = useState([]);
  const [topPropertiesByPricePerBedroom, setTopPropertiesByPricePerBedroom] = useState([]);

  const [totalProperties, setTotalProperties] = useState(0);

  const [averagePricesByBedrooms, setAveragePricesByBedrooms] = useState({});

  const location = useLocation();

  // Extract search_url_origin from query params
  const query = new URLSearchParams(location.search);
  const search_url_origin = query.get('search_url_origin');

  useEffect(() => {
    if (!search_url_origin) {
      setError('Invalid search URL');
      setLoading(false);
      return;
    }

    console.log('Received search_url_origin:', search_url_origin);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
    console.log('API Base URL:', API_BASE_URL);

    try {
      const apiUrl = new URL(`${API_BASE_URL}/api/properties`);
      apiUrl.searchParams.append('search_url_origin', search_url_origin);

      console.log('Fetching from API URL:', apiUrl.toString());

      fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
        // credentials: 'include', // Uncomment if needed
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to fetch properties');
          }
          return res.json();
        })
        .then((data) => {
          console.log('Fetched data:', data);
          // Process properties to add price per sq ft and price per bedroom
          const processedProperties = (data.properties || []).map((property) => {
            const { price, sqFt, bedrooms } = property;
            const pricePerSqFt = price && sqFt ? price / sqFt : null;
            const pricePerBedroom = price && bedrooms ? price / bedrooms : null;
            return { ...property, pricePerSqFt, pricePerBedroom };
          });
          setProperties(processedProperties);
          setTotalProperties(processedProperties.length);
          setAveragePrice(data.averagePrice || 0);
          setSqFtDistribution(data.sqFtDistribution || 'N/A');
          setAvgSquareFootage(data.avgSquareFootage || 0);
          setPricePerSqFt(data.pricePerSqFt || 0);

          // Calculate average prices by bedrooms
          const bedroomCounts = [0, 1, 2, 3];
          const averages = {};

          bedroomCounts.forEach((bedroomCount) => {
            const propertiesWithBedrooms = processedProperties.filter(
              (property) =>
                property.bedrooms === bedroomCount &&
                property.price != null
            );

            if (propertiesWithBedrooms.length > 0) {
              const totalPrice = propertiesWithBedrooms.reduce(
                (sum, property) => sum + property.price,
                0
              );
              const avgPrice = totalPrice / propertiesWithBedrooms.length;
              averages[bedroomCount] = avgPrice;
            } else {
              averages[bedroomCount] = null;
            }
          });

          setAveragePricesByBedrooms(averages);

          setLoading(false);
          setProgress(100); // Set progress to 100% when loading is complete
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
          setError(error.message);
          setLoading(false);
          setProgress(100); // Ensure progress bar completes even on error
        });
    } catch (err) {
      console.error('Error constructing API URL:', err);
      setError('Invalid API URL');
      setLoading(false);
      setProgress(100);
    }
  }, [search_url_origin]);

  // Simulate progress bar
  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress < 90) {
            return prevProgress + 10;
          } else {
            return prevProgress;
          }
        });
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [loading]);

  useEffect(() => {
    // Apply filters to properties
    const filtered = properties.filter((property) => {
      const price = property.price || 0;
      const bedrooms = property.bedrooms || 0;
      const bathrooms = property.bathrooms || 0;
      const sqFt = property.sqFt || 0;

      return (
        price >= priceRange[0] &&
        price <= priceRange[1] &&
        bedrooms >= bedroomsRange[0] &&
        bedrooms <= bedroomsRange[1] &&
        bathrooms >= bathroomsRange[0] &&
        bathrooms <= bathroomsRange[1] &&
        sqFt >= sqFtRange[0] &&
        sqFt <= sqFtRange[1]
      );
    });

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'sqft_asc':
          return a.sqFt - b.sqFt;
        case 'sqft_desc':
          return b.sqFt - a.sqFt;
        case 'bedrooms_asc':
          return a.bedrooms - b.bedrooms;
        case 'bedrooms_desc':
          return b.bedrooms - a.bedrooms;
        default:
          return 0;
      }
    });

    setFilteredProperties(sorted);
  }, [properties, priceRange, bedroomsRange, bathroomsRange, sqFtRange, sortOption]);

  // Compute top properties based on price per sq ft and price per bedroom
  useEffect(() => {
    if (properties.length > 0) {
      const validPropertiesForSqFt = properties.filter(
        (prop) => prop.pricePerSqFt != null
      );
      const sortedByPricePerSqFt = validPropertiesForSqFt.sort(
        (a, b) => a.pricePerSqFt - b.pricePerSqFt
      );
      setTopPropertiesByPricePerSqFt(sortedByPricePerSqFt.slice(0, 5));

      const validPropertiesForBedroom = properties.filter(
        (prop) => prop.pricePerBedroom != null
      );
      const sortedByPricePerBedroom = validPropertiesForBedroom.sort(
        (a, b) => a.pricePerBedroom - b.pricePerBedroom
      );
      setTopPropertiesByPricePerBedroom(sortedByPricePerBedroom.slice(0, 5));
    }
  }, [properties]);

  // Function to create histogram data
  const createHistogramData = (data, key, binSize) => {
    const bins = {};

    data.forEach((item) => {
      const value = item[key];
      if (value != null) {
        const bin = Math.floor(value / binSize) * binSize;
        bins[bin] = (bins[bin] || 0) + 1;
      }
    });

    return Object.keys(bins)
      .map((bin) => ({
        bin: Number(bin),
        count: bins[bin],
      }))
      .sort((a, b) => a.bin - b.bin);
  };

  if (loading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ height: '100vh', backgroundColor: '#f0f4f8' }}
      >
        <h3>Gathering results, please wait...</h3>
        <p>Please do not leave or refresh this tab while we gather the data.</p>
        <div style={{ width: '50%', marginTop: '20px' }}>
          <ProgressBar animated now={progress} label={`${progress}%`} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <h2>Error: {error}</h2>
        <p>Please try a different search or check the URL.</p>
      </div>
    );
  }

  // Add a check to ensure properties is defined and is an array
  const propertiesAvailable = Array.isArray(filteredProperties) && filteredProperties.length > 0;

  // Prepare histogram data
  const priceHistogramData = createHistogramData(filteredProperties, 'price', 500000);
  const sqFtHistogramData = createHistogramData(filteredProperties, 'sqFt', 500);

  return (
    <div className="container py-5" style={{ backgroundColor: '#f8f9fa' }}>
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h1 style={{ color: '#1a3e59' }}>RealLondon</h1>
        <a href="/" className="btn btn-primary">
          New Search
        </a>
      </header>

      <div className="mb-4">
        <h5>
          Displaying {filteredProperties.length} out of {totalProperties} properties from the search
        </h5>
      </div>

      {/* Charts */}
      <div className="row mb-4">
        <div className="col-lg-6 col-md-12">
          <div className="card p-3 shadow-sm mb-4" style={{ backgroundColor: '#ffffff' }}>
            <h5>Price Distribution</h5>
            {propertiesAvailable ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priceHistogramData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="bin"
                    tickFormatter={(value) => `£${(value / 1000).toLocaleString()}k`}
                    label={{ value: 'Price (£)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    label={{ value: 'Count', angle: -90, position: 'insideLeft', offset: 10 }}
                  />
                  <Tooltip
                    formatter={(value, name, props) => [`${value}`, 'Count']}
                    labelFormatter={(label) => `£${label.toLocaleString()}`}
                  />
                  <Bar dataKey="count" fill="#007bff" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>No data available for the chart.</p>
            )}
          </div>
        </div>

        <div className="col-lg-6 col-md-12">
          <div className="card p-3 shadow-sm mb-4" style={{ backgroundColor: '#ffffff' }}>
            <h5>Square Footage Distribution</h5>
            {propertiesAvailable ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sqFtHistogramData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="bin"
                    label={{ value: 'Square Footage', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    label={{ value: 'Count', angle: -90, position: 'insideLeft', offset: 10 }}
                  />
                  <Tooltip
                    formatter={(value, name, props) => [`${value}`, 'Count']}
                    labelFormatter={(label) => `${label.toLocaleString()} sq ft`}
                  />
                  <Bar dataKey="count" fill="#0056b3" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>No data available for the chart.</p>
            )}
          </div>
        </div>

        <div className="col-lg-6 col-md-12">
          <div className="card p-3 shadow-sm mb-4" style={{ backgroundColor: '#ffffff' }}>
            <h5>Price vs Bedrooms</h5>
            {propertiesAvailable ? (
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="bedrooms" name="Bedrooms" />
                  <YAxis type="number" dataKey="price" name="Price" />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value) => `£${value.toLocaleString()}`}
                  />
                  <Scatter
                    data={filteredProperties.map((property) => ({
                      bedrooms: property.bedrooms,
                      price: property.price,
                    }))}
                    fill="#8884d8"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <p>No data available for the chart.</p>
            )}
          </div>
        </div>

        <div className="col-lg-6 col-md-12">
          <div className="card p-3 shadow-sm mb-4" style={{ backgroundColor: '#ffffff' }}>
            <h5>Price per Sq Ft vs Square Footage</h5>
            {propertiesAvailable ? (
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="sqFt" name="Square Footage" />
                  <YAxis type="number" dataKey="pricePerSqFt" name="Price per Sq Ft" />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value) => `£${value.toLocaleString()}`}
                  />
                  <Scatter
                    data={filteredProperties.map((property) => {
                      const pricePerSqFt =
                        property.sqFt && property.price ? property.price / property.sqFt : 0;
                      return {
                        sqFt: property.sqFt,
                        pricePerSqFt,
                      };
                    })}
                    fill="#82ca9d"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <p>No data available for the chart.</p>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-lg-2 col-md-4">
          <div className="card mb-3 p-3 shadow-sm" style={{ backgroundColor: '#cce5ff' }}>
            <h6>Average Price</h6>
            <h4>£{averagePrice.toLocaleString()}</h4>
          </div>
        </div>

        <div className="col-lg-2 col-md-4">
          <div className="card mb-3 p-3 shadow-sm" style={{ backgroundColor: '#cce5ff' }}>
            <h6>Avg £ per Sq. Ft.</h6>
            <h4>£{pricePerSqFt.toLocaleString()}</h4>
          </div>
        </div>

        {/* New tiles for average price per studio, 1 bed, 2 bed, 3 bed */}
        <div className="col-lg-2 col-md-4">
          <div className="card mb-3 p-3 shadow-sm" style={{ backgroundColor: '#cce5ff' }}>
            <h6>Avg Price - Studio</h6>
            <h4>
              {averagePricesByBedrooms[0] != null
                ? `£${averagePricesByBedrooms[0].toLocaleString()}`
                : 'N/A'}
            </h4>
          </div>
        </div>

        <div className="col-lg-2 col-md-4">
          <div className="card mb-3 p-3 shadow-sm" style={{ backgroundColor: '#cce5ff' }}>
            <h6>Avg Price - 1 Bed</h6>
            <h4>
              {averagePricesByBedrooms[1] != null
                ? `£${averagePricesByBedrooms[1].toLocaleString()}`
                : 'N/A'}
            </h4>
          </div>
        </div>

        <div className="col-lg-2 col-md-4">
          <div className="card mb-3 p-3 shadow-sm" style={{ backgroundColor: '#cce5ff' }}>
            <h6>Avg Price - 2 Bed</h6>
            <h4>
              {averagePricesByBedrooms[2] != null
                ? `£${averagePricesByBedrooms[2].toLocaleString()}`
                : 'N/A'}
            </h4>
          </div>
        </div>

        <div className="col-lg-2 col-md-4">
          <div className="card mb-3 p-3 shadow-sm" style={{ backgroundColor: '#cce5ff' }}>
            <h6>Avg Price - 3 Bed</h6>
            <h4>
              {averagePricesByBedrooms[3] != null
                ? `£${averagePricesByBedrooms[3].toLocaleString()}`
                : 'N/A'}
            </h4>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-3 mb-4" style={{ backgroundColor: '#e9ecef' }}>
        <h5>Filters</h5>
        <div className="row">
          {/* Price Range Filter */}
          <div className="col-md-3">
            <label>Price Range (£):</label>
            <input
              type="number"
              className="form-control mb-2"
              placeholder="Min"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
            />
            <input
              type="number"
              className="form-control"
              placeholder="Max"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            />
          </div>

          {/* Bedrooms Range Filter */}
          <div className="col-md-3">
            <label>Bedrooms:</label>
            <input
              type="number"
              className="form-control mb-2"
              placeholder="Min"
              value={bedroomsRange[0]}
              onChange={(e) => setBedroomsRange([Number(e.target.value), bedroomsRange[1]])}
            />
            <input
              type="number"
              className="form-control"
              placeholder="Max"
              value={bedroomsRange[1]}
              onChange={(e) => setBedroomsRange([bedroomsRange[0], Number(e.target.value)])}
            />
          </div>

          {/* Bathrooms Range Filter */}
          <div className="col-md-3">
            <label>Bathrooms:</label>
            <input
              type="number"
              className="form-control mb-2"
              placeholder="Min"
              value={bathroomsRange[0]}
              onChange={(e) => setBathroomsRange([Number(e.target.value), bathroomsRange[1]])}
            />
            <input
              type="number"
              className="form-control"
              placeholder="Max"
              value={bathroomsRange[1]}
              onChange={(e) => setBathroomsRange([bathroomsRange[0], Number(e.target.value)])}
            />
          </div>

          {/* Square Footage Range Filter */}
          <div className="col-md-3">
            <label>Square Footage:</label>
            <input
              type="number"
              className="form-control mb-2"
              placeholder="Min"
              value={sqFtRange[0]}
              onChange={(e) => setSqFtRange([Number(e.target.value), sqFtRange[1]])}
            />
            <input
              type="number"
              className="form-control"
              placeholder="Max"
              value={sqFtRange[1]}
              onChange={(e) => setSqFtRange([sqFtRange[0], Number(e.target.value)])}
            />
          </div>
        </div>
      </div>

      {/* Sorting Options */}
      <div className="card p-3 mb-4" style={{ backgroundColor: '#e9ecef' }}>
        <h5>Sort By</h5>
        <select
          className="form-select"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="sqft_asc">Square Footage: Low to High</option>
          <option value="sqft_desc">Square Footage: High to Low</option>
          <option value="bedrooms_asc">Bedrooms: Low to High</option>
          <option value="bedrooms_desc">Bedrooms: High to Low</option>
        </select>
      </div>

      {/* Top Properties Section */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card p-3 shadow-sm mb-4" style={{ backgroundColor: '#ffffff' }}>
            <h5>Top 5 Properties by Price per Sq Ft</h5>
            <div className="row">
              {topPropertiesByPricePerSqFt.map((property, index) => (
                <div className="col-md-12 mb-3" key={index}>
                  <div className="card p-3 shadow-sm" style={{ backgroundColor: '#e2e6ea' }}>
                    <h6>{property.title}</h6>
                    <p>£ {property.price.toLocaleString()}</p>
                    <p>{property.bedrooms} Bedrooms</p>
                    <p>{property.bathrooms} Bathrooms</p>
                    <p>
                      {property.sqFt
                        ? `${property.sqFt.toLocaleString()} sq ft`
                        : 'Size not available'}
                    </p>
                    <p>
                      Price per Sq Ft: £{property.pricePerSqFt.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <a href={property.property_url} target="_blank" rel="noopener noreferrer">
                      View Property
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3 shadow-sm mb-4" style={{ backgroundColor: '#ffffff' }}>
            <h5>Top 5 Properties by Price per Bedroom</h5>
            <div className="row">
              {topPropertiesByPricePerBedroom.map((property, index) => (
                <div className="col-md-12 mb-3" key={index}>
                  <div className="card p-3 shadow-sm" style={{ backgroundColor: '#e2e6ea' }}>
                    <h6>{property.title}</h6>
                    <p>£ {property.price.toLocaleString()}</p>
                    <p>{property.bedrooms} Bedrooms</p>
                    <p>{property.bathrooms} Bathrooms</p>
                    <p>
                      {property.sqFt
                        ? `${property.sqFt.toLocaleString()} sq ft`
                        : 'Size not available'}
                    </p>
                    <p>
                      Price per Bedroom: £{property.pricePerBedroom.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <a href={property.property_url} target="_blank" rel="noopener noreferrer">
                      View Property
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Property Listings */}
      <div className="card p-4 shadow-sm" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Properties</h5>
          <span>{filteredProperties.length} Homes Available</span>
        </div>

        <div className="row">
          {propertiesAvailable ? (
            filteredProperties.map((property, index) => (
              <div className="col-lg-6 mb-3" key={index}>
                <div className="card p-3 shadow-sm" style={{ backgroundColor: '#e2e6ea' }}>
                  <h6>{property.title}</h6>
                  <p>£ {property.price.toLocaleString()}</p>
                  <p>{property.bedrooms} Bedrooms</p>
                  <p>{property.bathrooms} Bathrooms</p>
                  <p>
                    {property.sqFt
                      ? `${property.sqFt.toLocaleString()} sq ft`
                      : 'Size not available'}
                  </p>
                  <a href={property.property_url} target="_blank" rel="noopener noreferrer">
                    View Property
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p>No properties available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
