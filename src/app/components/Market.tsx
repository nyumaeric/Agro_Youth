'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Types
interface MarketListing {
  id: number;
  crop_name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  location: string;
  farmer?: string;
  description?: string;
  is_available: boolean;
  created_at: string;
}

// Constants
const UNITS = ['kg', 'lbs', 'bags', 'bundles', 'pieces'];

const MOCK_LISTINGS: MarketListing[] = [
  {
    id: 1,
    crop_name: "Organic Brown Rice",
    quantity: 50,
    unit: "bags",
    price_per_unit: 25.00,
    location: "Bong County",
    farmer: "Joseph Kpan",
    description: "High-quality organic brown rice grown using traditional methods. No chemicals used. Perfect for healthy eating.",
    is_available: true,
    created_at: "2024-07-15T08:00:00Z"
  },
  {
    id: 2,
    crop_name: "Fresh Cassava",
    quantity: 100,
    unit: "kg",
    price_per_unit: 1.50,
    location: "Nimba County",
    farmer: "Sarah Togba",
    description: "Fresh cassava harvested this week. Sweet variety, perfect for fufu or cassava bread.",
    is_available: true,
    created_at: "2024-07-18T10:30:00Z"
  },
  {
    id: 3,
    crop_name: "Premium Palm Oil",
    quantity: 20,
    unit: "lbs",
    price_per_unit: 8.00,
    location: "Grand Bassa County",
    farmer: "John Pewee",
    description: "Pure red palm oil extracted using traditional methods. Rich in vitamins and perfect for cooking.",
    is_available: true,
    created_at: "2024-07-16T14:20:00Z"
  },
  {
    id: 4,
    crop_name: "Cocoa Beans",
    quantity: 15,
    unit: "bags",
    price_per_unit: 45.00,
    location: "Maryland County",
    farmer: "Mary Kollie",
    description: "Premium quality cocoa beans, properly dried and fermented. Ready for export or local processing.",
    is_available: true,
    created_at: "2024-07-19T09:15:00Z"
  },
  {
    id: 5,
    crop_name: "Mixed Vegetables",
    quantity: 30,
    unit: "bundles",
    price_per_unit: 3.50,
    location: "Montserrado County",
    farmer: "Moses Gaye",
    description: "Fresh mixed vegetables including cabbage, lettuce, tomatoes, and peppers. Harvested daily.",
    is_available: true,
    created_at: "2024-07-20T06:45:00Z"
  },
  {
    id: 6,
    crop_name: "Sweet Potatoes",
    quantity: 75,
    unit: "kg",
    price_per_unit: 2.00,
    location: "Lofa County",
    farmer: "Grace Williams",
    description: "Sweet and nutritious sweet potatoes. Great for roasting, boiling, or making chips.",
    is_available: true,
    created_at: "2024-07-17T12:30:00Z"
  },
  {
    id: 7,
    crop_name: "Plantains",
    quantity: 200,
    unit: "pieces",
    price_per_unit: 0.75,
    location: "Grand Gedeh County",
    farmer: "Thomas Cooper",
    description: "Green plantains perfect for frying or boiling. Fresh from the farm, various sizes available.",
    is_available: true,
    created_at: "2024-07-19T15:20:00Z"
  },
  {
    id: 8,
    crop_name: "Pepper",
    quantity: 10,
    unit: "kg",
    price_per_unit: 12.00,
    location: "Sinoe County",
    farmer: "Elizabeth Johnson",
    description: "Hot pepper variety grown locally. Perfect for traditional Liberian dishes and sauces.",
    is_available: true,
    created_at: "2024-07-18T11:10:00Z"
  }
];

const Market: React.FC = () => {
  const [listings, setListings] = useState<MarketListing[]>(MOCK_LISTINGS);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [token, setToken] = useState<string | null>(null);

  const [newListing, setNewListing] = useState({
    crop_name: '',
    quantity: '',
    unit: 'kg',
    price_per_unit: '',
    location: '',
    description: '',
    farmer: '',
  });

  useEffect(() => {
    setToken(localStorage.getItem('access_token'));
  }, []);

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Please login to create a market listing');
      return;
    }

    const listing: MarketListing = {
      id: listings.length + 1,
      crop_name: newListing.crop_name,
      quantity: parseFloat(newListing.quantity),
      unit: newListing.unit,
      price_per_unit: parseFloat(newListing.price_per_unit),
      location: newListing.location,
      farmer: newListing.farmer || 'Community Farmer',
      description: newListing.description,
      is_available: true,
      created_at: new Date().toISOString()
    };

    setListings([listing, ...listings]);
    setSuccess('Market listing created successfully!');
    setNewListing({
      crop_name: '',
      quantity: '',
      unit: 'kg',
      price_per_unit: '',
      location: '',
      description: '',
      farmer: '',
    });
    setShowCreateForm(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  // Filter listings based on search and filters
  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.crop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (listing.description && listing.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCrop = selectedCrop === 'all' || listing.crop_name.toLowerCase().includes(selectedCrop.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || listing.location.toLowerCase().includes(selectedLocation.toLowerCase());
    
    return matchesSearch && matchesCrop && matchesLocation;
  });

  const uniqueCrops = Array.from(new Set(listings.map(listing => listing.crop_name).filter(Boolean)));
  const uniqueLocations = Array.from(new Set(listings.map(listing => listing.location).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🛒 Agricultural Marketplace
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect directly with farmers and buyers. Find fresh produce at fair prices 
            or list your harvest to reach more customers.
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800">{success}</span>
            </div>
            <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Action Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search products, locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <svg className="w-5 h-5 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Products</option>
                  {uniqueCrops.map(crop => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>

                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Locations</option>
                  {uniqueLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Create Listing Button */}
            {token && (
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {showCreateForm ? 'Cancel' : '📦 List Product'}
              </button>
            )}
            
            {!token && (
              <p className="text-sm text-gray-500 text-center">
                <Link href="/login" className="text-green-600 hover:text-green-700">Login</Link> to list products
              </p>
            )}
          </div>
        </div>

        {/* Create Listing Form */}
        {showCreateForm && token && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">List Your Product</h3>
              <p className="text-sm text-gray-600">Share your harvest with the community and reach more buyers</p>
            </div>
            <form onSubmit={handleCreateListing} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Organic Rice, Fresh Cassava"
                    value={newListing.crop_name}
                    onChange={(e) => setNewListing({ ...newListing, crop_name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="e.g., Monrovia, Nimba County"
                    value={newListing.location}
                    onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    placeholder="e.g., 50"
                    value={newListing.quantity}
                    onChange={(e) => setNewListing({ ...newListing, quantity: e.target.value })}
                    required
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <select
                    value={newListing.unit}
                    onChange={(e) => setNewListing({ ...newListing, unit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {UNITS.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price per Unit ($)</label>
                  <input
                    type="number"
                    placeholder="e.g., 2.50"
                    value={newListing.price_per_unit}
                    onChange={(e) => setNewListing({ ...newListing, price_per_unit: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Farmer Name (Optional)</label>
                <input
                  type="text"
                  placeholder="Your name or farm name"
                  value={newListing.farmer}
                  onChange={(e) => setNewListing({ ...newListing, farmer: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  placeholder="Describe your product quality, farming methods, or any special details..."
                  value={newListing.description}
                  onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-4">
                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  List Product
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Market Listings */}
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Matching Products
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters to find products.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 flex-1">
                      {listing.crop_name}
                    </h3>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-green-600">
                        ${listing.price_per_unit}
                      </div>
                      <div className="text-sm text-gray-500">per {listing.unit}</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="font-medium">{listing.quantity} {listing.unit}</span>
                      <span className="ml-1">available</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span>{listing.location}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{listing.farmer || 'Community Farmer'}</span>
                    </div>
                  </div>

                  {listing.description && (
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      {listing.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <button className="px-4 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      Contact Seller
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {listings.length > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-6 bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{listings.length}</div>
                <div className="text-sm text-gray-600">Products Listed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{uniqueCrops.length}</div>
                <div className="text-sm text-gray-600">Product Types</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{uniqueLocations.length}</div>
                <div className="text-sm text-gray-600">Locations</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Market;