import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';

const ExportDataPage = () => {
    const navigate = useNavigate();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exportStatus, setExportStatus] = useState({});
    const [fullExportStatus, setFullExportStatus] = useState({ 
        exporting: false, 
        success: false, 
        error: null 
    });
    const [jsonExportStatus, setJsonExportStatus] = useState({ 
        exporting: false, 
        success: false, 
        error: null 
    });
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [useDateFilter, setUseDateFilter] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchCollections();
    }, [navigate]);

    const validateDateRange = () => {
        if (!useDateFilter) return true;
        if (!dateRange.startDate || !dateRange.endDate) {
            throw new Error('Both start and end dates are required');
        }
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        if (end < start) {
            throw new Error('End date must be after start date');
        }
        return true;
    };

    const buildExportUrl = (baseUrl) => {
        if (useDateFilter && dateRange.startDate && dateRange.endDate) {
            const startDateTime = new Date(dateRange.startDate);
            startDateTime.setHours(0, 0, 0, 0);
            
            const endDateTime = new Date(dateRange.endDate);
            endDateTime.setHours(23, 59, 59, 999);
            
            return `${baseUrl}?startDate=${startDateTime.toISOString()}&endDate=${endDateTime.toISOString()}`;
        }
        return baseUrl;
    };

    const fetchCollections = async () => {
        try {
            setLoading(true);
            console.log('Fetching collections...');
            
            const response = await axios.get('http://localhost:3000/api/export/collections');
            console.log('Collections response:', response.data);
            setCollections(response.data);
            
            const initialStatus = {};
            response.data.forEach(collection => {
                initialStatus[collection.id] = { exporting: false, success: false, error: null };
            });
            setExportStatus(initialStatus);
        } catch (err) {
            console.error('Error fetching collections:', err);
            setError(
                `Failed to fetch collections: ${err.message}. 
                Status: ${err.response?.status}. 
                Details: ${JSON.stringify(err.response?.data || {})}. 
                Check that the export routes are properly set up on the server.`
            );
            
            const mockCollections = [
                { id: 'companies', name: 'Companies' },
                { id: 'designers', name: 'Interior Designers' },
                { id: 'craftsmen', name: 'Craftsmen' },
                { id: 'blogs', name: 'Blog Posts' },
                { id: 'testimonials', name: 'Testimonials' },
                { id: 'contacts', name: 'Contact Messages' },
                { id: 'enquiries', name: 'Enquiries' },
            ];
            
            setCollections(mockCollections);
            const initialStatus = {};
            mockCollections.forEach(collection => {
                initialStatus[collection.id] = { exporting: false, success: false, error: null };
            });
            setExportStatus(initialStatus);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleExport = async (collectionId, collectionName) => {
        try {
            validateDateRange();

            setExportStatus(prev => ({
                ...prev,
                [collectionId]: { exporting: true, success: false, error: null }
            }));

            const exportUrl = buildExportUrl(`http://localhost:3000/api/export/${collectionId}`);
            console.log('Exporting with URL:', exportUrl);

            const response = await axios.get(exportUrl, {
                responseType: 'blob'
            });

            if (response.data.size === 0) {
                throw new Error('No data found for the selected date range');
            }

            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            
            let filename = `${collectionId}`;
            if (useDateFilter) {
                filename += `_${dateRange.startDate}_to_${dateRange.endDate}`;
            }
            filename += `_${new Date().toISOString().split('T')[0]}.csv`;
            
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setExportStatus(prev => ({
                ...prev,
                [collectionId]: { exporting: false, success: true, error: null }
            }));

            setTimeout(() => {
                setExportStatus(prev => ({
                    ...prev,
                    [collectionId]: { exporting: false, success: false, error: null }
                }));
            }, 3000);

        } catch (err) {
            console.error(`Error exporting ${collectionId}:`, {
                error: err,
                message: err.message,
                dateRange: useDateFilter ? dateRange : 'No date filter'
            });
            
            let errorMessage = `Failed to export ${collectionName}. `;
            if (err.response?.data?.message) {
                errorMessage += err.response.data.message;
            } else if (err.message) {
                errorMessage += err.message;
            } else {
                errorMessage += 'Please try again or contact support.';
            }

            setExportStatus(prev => ({
                ...prev,
                [collectionId]: { 
                    exporting: false, 
                    success: false, 
                    error: errorMessage
                }
            }));
        }
    };

    const handleFullExport = async () => {
        try {
            validateDateRange();
            setFullExportStatus({ exporting: true, success: false, error: null });
            
            const exportUrl = buildExportUrl('http://localhost:3000/api/export/full/database');
            console.log('Full export URL:', exportUrl);

            const response = await axios.get(exportUrl, {
                responseType: 'blob'
            });

            if (response.data.size === 0) {
                throw new Error('No data found for the selected date range');
            }

            const blob = new Blob([response.data], { type: 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            
            let filename = 'full_database_export';
            if (useDateFilter) {
                filename += `_${dateRange.startDate}_to_${dateRange.endDate}`;
            }
            filename += `_${new Date().toISOString().split('T')[0]}.zip`;
            
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setFullExportStatus({ exporting: false, success: true, error: null });

            setTimeout(() => {
                setFullExportStatus({ exporting: false, success: false, error: null });
            }, 3000);

        } catch (err) {
            console.error('Error exporting full database:', err);
            let errorMessage = 'Failed to export full database. ';
            if (err.response?.data?.message) {
                errorMessage += err.response.data.message;
            } else if (err.message) {
                errorMessage += err.message;
            } else {
                errorMessage += 'Please try again or contact support.';
            }
            
            setFullExportStatus({ 
                exporting: false, 
                success: false, 
                error: errorMessage
            });
        }
    };

    const handleJsonExport = async () => {
        try {
            validateDateRange();
            setJsonExportStatus({ exporting: true, success: false, error: null });
            
            const exportUrl = buildExportUrl('http://localhost:3000/api/export/full/json');
            console.log('JSON export URL:', exportUrl);

            const response = await axios.get(exportUrl, {
                responseType: 'blob'
            });

            if (response.data.size === 0) {
                throw new Error('No data found for the selected date range');
            }

            const blob = new Blob([response.data], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            
            let filename = 'full_database_export';
            if (useDateFilter) {
                filename += `_${dateRange.startDate}_to_${dateRange.endDate}`;
            }
            filename += `_${new Date().toISOString().split('T')[0]}.json`;
            
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setJsonExportStatus({ exporting: false, success: true, error: null });

            setTimeout(() => {
                setJsonExportStatus({ exporting: false, success: false, error: null });
            }, 3000);

        } catch (err) {
            console.error('Error exporting as JSON:', err);
            let errorMessage = 'Failed to export as JSON. ';
            if (err.response?.data?.message) {
                errorMessage += err.response.data.message;
            } else if (err.message) {
                errorMessage += err.message;
            } else {
                errorMessage += 'Please try again or contact support.';
            }
            
            setJsonExportStatus({ 
                exporting: false, 
                success: false, 
                error: errorMessage
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Export Database Data</h1>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Date Range Filter */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Date Range Filter</h2>
                    <div className="flex items-center mb-4">
                        <input
                            type="checkbox"
                            id="useDateFilter"
                            checked={useDateFilter}
                            onChange={(e) => setUseDateFilter(e.target.checked)}
                            className="mr-2"
                        />
                        <label htmlFor="useDateFilter">Filter by date range</label>
                    </div>
                    
                    {useDateFilter && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={dateRange.startDate}
                                    onChange={handleDateChange}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={dateRange.endDate}
                                    onChange={handleDateChange}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Full Database Export Options */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Full Database Export</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            {fullExportStatus.error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm mb-4">
                                    {fullExportStatus.error}
                                </div>
                            )}
                            
                            <button
                                onClick={handleFullExport}
                                disabled={fullExportStatus.exporting || (useDateFilter && (!dateRange.startDate || !dateRange.endDate))}
                                className={`w-full py-3 px-4 rounded-md transition-colors ${
                                    fullExportStatus.exporting || (useDateFilter && (!dateRange.startDate || !dateRange.endDate))
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : fullExportStatus.success
                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                            >
                                {fullExportStatus.exporting 
                                    ? 'Exporting (this may take time)...' 
                                    : fullExportStatus.success
                                    ? 'Downloaded Successfully!'
                                    : 'Export All Collections as ZIP'}
                            </button>
                        </div>
                        
                        <div>
                            {jsonExportStatus.error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm mb-4">
                                    {jsonExportStatus.error}
                                </div>
                            )}
                            
                            <button
                                onClick={handleJsonExport}
                                disabled={jsonExportStatus.exporting || (useDateFilter && (!dateRange.startDate || !dateRange.endDate))}
                                className={`w-full py-3 px-4 rounded-md transition-colors ${
                                    jsonExportStatus.exporting || (useDateFilter && (!dateRange.startDate || !dateRange.endDate))
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : jsonExportStatus.success
                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                }`}
                            >
                                {jsonExportStatus.exporting 
                                    ? 'Exporting (this may take time)...' 
                                    : jsonExportStatus.success
                                    ? 'Downloaded Successfully!'
                                    : 'Export All Collections as JSON'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Individual Collection Export */}
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading collections...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {collections.map(collection => (
                            <div key={collection.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2">{collection.name}</h3>
                                    <p className="text-gray-600 mb-4">Export all {collection.name.toLowerCase()} data as CSV</p>
                                    
                                    {exportStatus[collection.id]?.error && (
                                        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm mb-4">
                                            {exportStatus[collection.id].error}
                                        </div>
                                    )}
                                    
                                    <button
                                        onClick={() => handleExport(collection.id, collection.name)}
                                        disabled={exportStatus[collection.id]?.exporting || (useDateFilter && (!dateRange.startDate || !dateRange.endDate))}
                                        className={`w-full py-2 px-4 rounded-md transition-colors ${
                                            exportStatus[collection.id]?.exporting || (useDateFilter && (!dateRange.startDate || !dateRange.endDate))
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : exportStatus[collection.id]?.success
                                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                        }`}
                                    >
                                        {exportStatus[collection.id]?.exporting 
                                            ? 'Exporting...' 
                                            : exportStatus[collection.id]?.success
                                                ? 'Downloaded Successfully!'
                                                : `Export ${collection.name}`}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExportDataPage;