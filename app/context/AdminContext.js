"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [config, setConfig] = useState({
    pixelId: '',
    accessToken: '',
    productPrice: '490',
    testCode: '',
    currency: 'BDT'
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedConfig = localStorage.getItem('fb_pixel_config');
    if (storedConfig) {
      setConfig(JSON.parse(storedConfig));
    }
    setIsLoaded(true);
  }, []);

  const updateConfig = (newConfig) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig };
      localStorage.setItem('fb_pixel_config', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AdminContext.Provider value={{ config, updateConfig, isLoaded }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
