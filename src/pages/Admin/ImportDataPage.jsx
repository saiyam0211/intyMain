import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';

const ImportDataPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Individual import states
    const [companyFile, setCompanyFile] = useState(null);
    const [designerFile, setDesignerFile] = useState(null);
    const [craftsmenFile, setCraftsmenFile] = useState(null);
    
    const [companyImportStatus, setCompanyImportStatus] = useState({
        importing: false,
        success: false,
        error: null,
        message: ''
    });
    
    const [designerImportStatus, setDesignerImportStatus] = useState({
        importing: false,
        success: false,
        error: null,
        message: ''
    });
    
    const [craftsmenImportStatus, setCraftsmenImportStatus] = useState({
        importing: false,
        success: false,
        error: null,
        message: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
    }, [navigate]);

    const handleFileChange = (e, setFileFunction) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                setFileFunction(file);
                console.log('File selected:', file.name);
            } else {
                setError('Please select a CSV file for import');
                e.target.value = null; // Reset the input
            }
        }
    };

    const handleImport = async (collectionType, file, setStatusFunction) => {
        if (!file) {
            setStatusFunction({
                importing: false,
                success: false,
                error: true,
                message: 'Please select a file to import'
            });
            return;
        }

        try {
            setStatusFunction({
                importing: true,
                success: false,
                error: false,
                message: `Importing ${collectionType} data...`
            });

            // Create form data for file upload
            const formData = new FormData();
            formData.append('file', file);

            // Determine the correct endpoint based on collection type
            let endpoint;
            switch (collectionType) {
                case 'companies':
                    endpoint = 'http://localhost:3000/api/import/companies';
                    break;
                case 'designers':
                    endpoint = 'http://localhost:3000/api/import/designers';
                    break;
                case 'craftsmen':
                    endpoint = 'http://localhost:3000/api/import/craftsmen';
                    break;
                default:
                    throw new Error('Unknown collection type');
            }

            // Send import request
            const response = await axios.post(
                endpoint,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            console.log(`Import ${collectionType} response:`, response.data);
            
            setStatusFunction({
                importing: false,
                success: true,
                error: false,
                message: `Successfully imported ${response.data.importedCount || 0} ${collectionType}`
            });
            
            // Reset after 5 seconds
            setTimeout(() => {
                setStatusFunction({
                    importing: false,
                    success: false,
                    error: false,
                    message: ''
                });
            }, 5000);
            
        } catch (err) {
            console.error(`Error importing ${collectionType}:`, err);
            setStatusFunction({
                importing: false,
                success: false,
                error: true,
                message: err.response?.data?.message || `Failed to import ${collectionType} data`
            });
        }
    };

    return (
        <div className='bg-gray-50 min-h-screen'>
            <div className="absolute top-0 left-0 w-full bg-transparent z-50">
                <Navbar isResidentialPage={false} />
            </div>
            
            <div className='pt-24 pb-12 px-4 max-w-6xl mx-auto'>
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Import Database Data</h1>
                    <button 
                        onClick={() => navigate('/admin/home')}
                        className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>

                {/* Import Instructions */}
                <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Data Import Instructions</h2>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                        <p className="text-blue-700">
                            <span className="font-bold">Note:</span> Import functionality is specifically available for Companies, Interior Designers, and Craftsmen data. The imported CSV must match the expected format.
                        </p>
                    </div>
                    <p className="text-gray-600 mb-3">
                        Follow these steps to import data:
                    </p>
                    <ol className="list-decimal list-inside text-gray-600 mb-4 space-y-2">
                        <li>Select the CSV file for the specific collection you want to import.</li>
                        <li>Ensure your CSV has headers matching the database fields.</li>
                        <li>Click the "Import" button to start the import process.</li>
                    </ol>
                    <p className="text-gray-600">
                        For best results, first export a sample from the <a href="/admin/export-data" className="text-blue-600 hover:underline">Export Data page</a> to see the correct format.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline"> {error}</span>
                        <button 
                            className="absolute top-0 bottom-0 right-0 px-4 py-3"
                            onClick={() => setError(null)}
                        >
                            <span className="text-red-500">×</span>
                        </button>
                    </div>
                )}
                
                <div className="grid grid-cols-1 gap-8">
                    {/* Companies Import Card */}
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <div className="flex items-center mb-4">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">Import Companies</h3>
                        </div>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleImport('companies', companyFile, setCompanyImportStatus);
                        }}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Select Companies CSV File
                                </label>
                                <input 
                                    type="file" 
                                    accept=".csv"
                                    onChange={(e) => handleFileChange(e, setCompanyFile)}
                                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-red-50 file:text-red-700
                                        hover:file:bg-red-100"
                                />
                                {companyFile && (
                                    <p className="mt-2 text-sm text-gray-500">
                                        Selected file: {companyFile.name}
                                    </p>
                                )}
                            </div>
                            
                            {companyImportStatus.message && (
                                <div className={`p-3 mb-4 rounded text-sm ${
                                    companyImportStatus.error 
                                        ? 'bg-red-100 text-red-700 border border-red-400' 
                                        : companyImportStatus.success 
                                            ? 'bg-green-100 text-green-700 border border-green-400'
                                            : 'bg-blue-100 text-blue-700 border border-blue-400'
                                }`}>
                                    {companyImportStatus.message}
                                </div>
                            )}
                            
                            <button
                                type="submit"
                                disabled={!companyFile || companyImportStatus.importing}
                                className={`w-full py-2 px-4 rounded-md transition-colors ${
                                    !companyFile || companyImportStatus.importing
                                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                            >
                                {companyImportStatus.importing 
                                    ? 'Importing...' 
                                    : 'Import Companies Data'}
                            </button>
                        </form>
                    </div>
                    
                    {/* Designers Import Card */}
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <div className="flex items-center mb-4">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">Import Interior Designers</h3>
                        </div>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleImport('designers', designerFile, setDesignerImportStatus);
                        }}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Select Interior Designers CSV File
                                </label>
                                <input 
                                    type="file" 
                                    accept=".csv"
                                    onChange={(e) => handleFileChange(e, setDesignerFile)}
                                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-green-50 file:text-green-700
                                        hover:file:bg-green-100"
                                />
                                {designerFile && (
                                    <p className="mt-2 text-sm text-gray-500">
                                        Selected file: {designerFile.name}
                                    </p>
                                )}
                            </div>
                            
                            {designerImportStatus.message && (
                                <div className={`p-3 mb-4 rounded text-sm ${
                                    designerImportStatus.error 
                                        ? 'bg-red-100 text-red-700 border border-red-400' 
                                        : designerImportStatus.success 
                                            ? 'bg-green-100 text-green-700 border border-green-400'
                                            : 'bg-blue-100 text-blue-700 border border-blue-400'
                                }`}>
                                    {designerImportStatus.message}
                                </div>
                            )}
                            
                            <button
                                type="submit"
                                disabled={!designerFile || designerImportStatus.importing}
                                className={`w-full py-2 px-4 rounded-md transition-colors ${
                                    !designerFile || designerImportStatus.importing
                                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                            >
                                {designerImportStatus.importing 
                                    ? 'Importing...' 
                                    : 'Import Designers Data'}
                            </button>
                        </form>
                    </div>
                    
                    {/* Craftsmen Import Card */}
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <div className="flex items-center mb-4">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">Import Craftsmen</h3>
                        </div>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleImport('craftsmen', craftsmenFile, setCraftsmenImportStatus);
                        }}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Select Craftsmen CSV File
                                </label>
                                <input 
                                    type="file" 
                                    accept=".csv"
                                    onChange={(e) => handleFileChange(e, setCraftsmenFile)}
                                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100"
                                />
                                {craftsmenFile && (
                                    <p className="mt-2 text-sm text-gray-500">
                                        Selected file: {craftsmenFile.name}
                                    </p>
                                )}
                            </div>
                            
                            {craftsmenImportStatus.message && (
                                <div className={`p-3 mb-4 rounded text-sm ${
                                    craftsmenImportStatus.error 
                                        ? 'bg-red-100 text-red-700 border border-red-400' 
                                        : craftsmenImportStatus.success 
                                            ? 'bg-green-100 text-green-700 border border-green-400'
                                            : 'bg-blue-100 text-blue-700 border border-blue-400'
                                }`}>
                                    {craftsmenImportStatus.message}
                                </div>
                            )}
                            
                            <button
                                type="submit"
                                disabled={!craftsmenFile || craftsmenImportStatus.importing}
                                className={`w-full py-2 px-4 rounded-md transition-colors ${
                                    !craftsmenFile || craftsmenImportStatus.importing
                                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                            >
                                {craftsmenImportStatus.importing 
                                    ? 'Importing...' 
                                    : 'Import Craftsmen Data'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportDataPage;