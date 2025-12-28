"use client";
import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';

export default function AdminPage() {
  const { config, updateConfig, isLoaded } = useAdmin();
  const [formData, setFormData] = useState(config);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setFormData(config);
    }
  }, [isLoaded, config]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateConfig(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isLoaded) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          PixelYourSite PRO Simulation Dashboard
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Settings */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2 text-gray-700">General Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Product Price (BDT)</label>
                <input
                  type="number"
                  name="productPrice"
                  value={formData.productPrice}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Currency</label>
                <input
                  type="text"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            </div>
          </section>

          {/* Facebook Pixel Settings */}
          <section className="space-y-4 pt-4">
            <h2 className="text-xl font-semibold border-b pb-2 text-gray-700">Facebook Pixel & CAPI</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Facebook Pixel ID</label>
              <input
                type="text"
                name="pixelId"
                value={formData.pixelId}
                onChange={handleChange}
                placeholder="Ex: 1234567890"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Conversion API Access Token</label>
              <textarea
                name="accessToken"
                value={formData.accessToken}
                onChange={handleChange}
                placeholder="EAAG..."
                rows="3"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Test Event Code (Optional)</label>
              <input
                type="text"
                name="testCode"
                value={formData.testCode}
                onChange={handleChange}
                placeholder="TEST12345"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Use this to test server events in Facebook Events Manager.</p>
            </div>
          </section>

          <div className="pt-6 flex items-center justify-between">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Save Configuration
            </button>
            
            {saved && (
              <span className="text-green-600 font-medium flex items-center animate-fade-in">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Settings Saved!
              </span>
            )}
          </div>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100">
           <a href="/" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
             <span>&larr; Go to Landing Page</span>
           </a>
        </div>
      </div>
    </div>
  );
}
