'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useAllProducts } from '@/hooks/products/useGetAllProducts';

interface MarketListing {
  id: string;
  cropName: string;
  quantity: number;
  unit: string;
  price: number;
  location: string;
  userId: string;
  description: string;
  isAvailable: boolean;
}


const UNITS = ['kg', 'lbs', 'bags', 'bundles', 'pieces'];

const Market: React.FC = () => {
  const { data, isPending } = useAllProducts();
  const AllProducts = data?.data || [];
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [token, setToken] = useState<string | null>(null);

  const [newListing, setNewListing] = useState({
    cropName: '',
    quantity: '',
    unit: 'kg',
    price: '',
    location: '',
    description: '',
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

    setSuccess('Market listing created successfully!');
    setNewListing({
      cropName: '',
      quantity: '',
      unit: 'kg',
      price: '',
      location: '',
      description: '',
    });
    setShowCreateForm(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  const filteredListings = AllProducts.filter((listing: MarketListing) => {
    const matchesSearch = listing.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch && listing.isAvailable;
  });

  return (
    <div className="min-h-screen py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-yellow-600 mb-4">
            🛒 Agricultural Marketplace
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect directly with farmers and buyers. Find fresh produce at fair prices 
            or list your harvest to reach more customers.
          </p>
        </div>

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
            </div>

            {token && (
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {showCreateForm ? 'Cancel' : '📦 List Product'}
              </button>
            )}
          </div>
        </div>

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
                    value={newListing.cropName}
                    onChange={(e) => setNewListing({ ...newListing, cropName: e.target.value })}
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
                    value={newListing.price}
                    onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Describe your product quality, farming methods, or any special details..."
                  value={newListing.description}
                  onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                  required
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

        {/* Loading State */}
        {isPending && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <Skeleton width={150} height={24} />
                  <div className="text-right ml-4">
                    <Skeleton width={60} height={32} />
                    <Skeleton width={50} height={16} className="mt-1" />
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <Skeleton width="100%" height={20} />
                  <Skeleton width="80%" height={20} />
                </div>

                <Skeleton count={3} height={16} className="mb-4" />

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <Skeleton width={80} height={24} />
                  <Skeleton width={120} height={32} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Market Listings */}
        {!isPending && filteredListings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {AllProducts.length === 0 ? 'No Products Available' : 'No Matching Products'}
            </h3>
            <p className="text-gray-600">
              {AllProducts.length === 0 
                ? 'Be the first to list a product in the marketplace!' 
                : 'Try adjusting your search to find products.'}
            </p>
          </div>
        ) : !isPending && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing: MarketListing) => (
              <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 flex-1">
                      {listing.cropName}
                    </h3>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-green-600">
                        ${listing.price}
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
                  </div>

                  {listing.description && (
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      {listing.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        listing.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {listing.isAvailable ? 'Available' : 'Sold Out'}
                      </span>
                    </div>
                    
                    <button 
                      className="px-4 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!listing.isAvailable}
                    >
                      Contact Seller
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Market;