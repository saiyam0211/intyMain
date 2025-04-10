import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiService';

const CorsTest = () => {
  const [status, setStatus] = useState('Testing API connection...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await apiClient.get('/test');
        setStatus(`API Connection Successful! Response: ${JSON.stringify(response.data)}`);
      } catch (err) {
        console.error('API Connection Error:', err);
        setError(err.toString());
        setStatus('API Connection Failed. See console for details.');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-2">CORS Test</h2>
      <p className={error ? 'text-red-500' : 'text-green-500'}>{status}</p>
      {error && (
        <div className="mt-2 p-2 bg-red-100 text-xs overflow-auto max-h-40">
          <pre>{error}</pre>
        </div>
      )}
    </div>
  );
};

export default CorsTest; 