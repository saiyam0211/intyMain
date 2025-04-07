import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowUp, FaArrowDown, FaEdit, FaTrash, FaEye, FaEyeSlash, FaStar, FaRegStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ResponsiveAdminContainer from '../../components/Admin/ResponsiveAdminContainer';
import ResponsiveAdminTable from '../../components/Admin/ResponsiveAdminTable';

const API_URL = "https://inty-backend.onrender.com/api/companies";

const AdminShowAllCompanies = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('Loading companies...');
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [topRatedCount, setTopRatedCount] = useState(0);

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem("adminToken");
        if (!token) {
            navigate("/admin/login");
            return;
        }

        fetchCompanies();
    }, [navigate]);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            setLoadingMessage('Loading companies...');
            setError(null);
            
            // First fetch to get total pages info
            const initialResponse = await axios.get(`${API_URL}?isAdmin=true`);
            console.log("Initial response:", initialResponse.data);
            
            if (!initialResponse.data || !initialResponse.data.totalPages) {
                throw new Error('Invalid response format');
            }
            
            const totalPages = initialResponse.data.totalPages;
            let allCompanies = [];
            
            // If there's only one page, use the companies we already fetched
            if (totalPages === 1) {
                allCompanies = initialResponse.data.companies;
            } else {
                // Update loading message for pagination
                setLoadingMessage(`Fetching all companies (1/${totalPages} pages)...`);
                
                // Fetch all pages of companies
                const promises = [];
                for (let page = 1; page <= totalPages; page++) {
                    promises.push(axios.get(`${API_URL}?isAdmin=true&page=${page}`).then(response => {
                        // Update loading message for each page fetch
                        setLoadingMessage(`Fetching all companies (${page}/${totalPages} pages)...`);
                        return response;
                    }));
                }
                
                const responses = await Promise.all(promises);
                // Combine all companies from all pages
                allCompanies = responses.flatMap(response => response.data.companies || []);
            }
            
            console.log("All companies fetched:", allCompanies.length);
            
            // Sort companies by topRated (true first) and then by order
            const sortedCompanies = [...allCompanies].sort((a, b) => {
                // First sort by topRated status
                if (a.topRated && !b.topRated) return -1;
                if (!a.topRated && b.topRated) return 1;

                // Then sort by order field (add default order if not present)
                const orderA = a.order !== undefined ? a.order : 999;
                const orderB = b.order !== undefined ? b.order : 999;
                return orderA - orderB;
            });

            // Count how many companies are marked as top rated
            const topRated = sortedCompanies.filter(company => company.topRated).length;
            setTopRatedCount(topRated);

            // Set companies in state
            setCompanies(sortedCompanies);
        } catch (err) {
            console.error('Error fetching companies:', err);
            setError(
                err.response?.data?.message ||
                err.message ||
                'Failed to load companies. Please try again later.'
            );
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id) => {
        navigate(`/admin/editCompany/${id}`);
    };

    const handleAdd = () => {
        navigate('/add-company');
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete the company "${name}"?`)) {
            return;
        }

        try {
            setActionLoading(`delete-${id}`);
            const token = localStorage.getItem("adminToken");

            await axios.delete(`${API_URL}/delete/${id}`, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : '',
                },
            });

            setSuccessMessage(`Company "${name}" deleted successfully`);
            setTimeout(() => setSuccessMessage(''), 3000);

            // Refresh the list
            fetchCompanies();
        } catch (err) {
            console.error('Error deleting company:', err);
            setError(
                err.response?.data?.message ||
                err.message ||
                'Failed to delete company. Please try again.'
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleListingToggle = async (id, name, currentStatus) => {
        try {
            setActionLoading(`status-${id}`);
            const token = localStorage.getItem("adminToken");

            const newStatus = !currentStatus;
            // Fix the API endpoint - use /edit/ instead of /update/
            await axios.put(`${API_URL}/edit/${id}`, 
                { show: newStatus },
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : '',
                        "Content-Type": "application/json",
                    },
                }
            );

            setSuccessMessage(`Company "${name}" is now ${newStatus ? 'listed' : 'unlisted'}`);
            setTimeout(() => setSuccessMessage(''), 3000);

            // Refresh the list
            fetchCompanies();
        } catch (err) {
            console.error('Error updating company status:', err);
            setError(
                err.response?.data?.message ||
                err.message ||
                'Failed to update company status. Please try again.'
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleTopRatedToggle = async (id, name, currentStatus) => {
        // Check if we're trying to add a new top rated company but already have 3
        if (!currentStatus && topRatedCount >= 3) {
            setError('You can only have up to 3 top rated companies.');
            setTimeout(() => setError(null), 3000);
            return;
        }

        try {
            setActionLoading(`toprated-${id}`);
            const token = localStorage.getItem("adminToken");

            const newStatus = !currentStatus;
            // Fix the API endpoint - use /edit/ instead of /update/
            await axios.put(`${API_URL}/edit/${id}`,
                { 
                    topRated: newStatus,
                    // If becoming top rated, set order to the smallest value to put it at the top
                    order: !currentStatus ? 1 : undefined
                },
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : '',
                        "Content-Type": "application/json",
                    },
                }
            );

            setSuccessMessage(`Company "${name}" is now ${newStatus ? 'top rated' : 'regular'}`);
            setTimeout(() => setSuccessMessage(''), 3000);

            // Refresh the list
            fetchCompanies();
        } catch (err) {
            console.error('Error updating company top rated status:', err);
            setError(
                err.response?.data?.message ||
                err.message ||
                'Failed to update company top rated status. Please try again.'
            );
        } finally {
            setActionLoading(null);
        }
    };

    const updateOrder = async (id, newOrder) => {
        try {
            const token = localStorage.getItem("adminToken");
            // Fix the API endpoint - use /edit/ instead of /update/
            await axios.put(`${API_URL}/edit/${id}`,
                { order: newOrder },
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : '',
                        "Content-Type": "application/json",
                    },
                }
            );
            return true;
        } catch (err) {
            console.error('Error updating company order:', err);
            setError(
                err.response?.data?.message ||
                err.message ||
                'Failed to update company order. Please try again.'
            );
            return false;
        }
    };

    const handleMoveUp = async (index) => {
        if (!canMoveUp(index)) return;

        const nonTopRatedCompanies = companies.filter(c => !c.topRated);
        const currentCompany = nonTopRatedCompanies[index];
        const prevCompany = nonTopRatedCompanies[index - 1];

        // Swap orders
        const currentOrder = currentCompany.order || index + 1;
        const prevOrder = prevCompany.order || index;

        setActionLoading(`move-${currentCompany._id}`);

        try {
            const success1 = await updateOrder(currentCompany._id, prevOrder);
            const success2 = await updateOrder(prevCompany._id, currentOrder);

            if (success1 && success2) {
                fetchCompanies();
            }
        } finally {
            setActionLoading(null);
        }
    };

    const handleMoveDown = async (index) => {
        if (!canMoveDown(index)) return;

        const nonTopRatedCompanies = companies.filter(c => !c.topRated);
        const currentCompany = nonTopRatedCompanies[index];
        const nextCompany = nonTopRatedCompanies[index + 1];

        // Swap orders
        const currentOrder = currentCompany.order || index + 1;
        const nextOrder = nextCompany.order || index + 2;

        setActionLoading(`move-${currentCompany._id}`);

        try {
            const success1 = await updateOrder(currentCompany._id, nextOrder);
            const success2 = await updateOrder(nextCompany._id, currentOrder);

            if (success1 && success2) {
                fetchCompanies();
            }
        } finally {
            setActionLoading(null);
        }
    };

    const canMoveUp = (index) => {
        if (index <= 0) return false;

        const nonTopRatedCompanies = companies.filter(c => !c.topRated);
        const currentCompany = nonTopRatedCompanies[index];
        
        // Can't move if it's already being processed
        if (actionLoading === `move-${currentCompany._id}`) return false;

        return true;
    };

    const canMoveDown = (index) => {
        const nonTopRatedCompanies = companies.filter(c => !c.topRated);
        if (index >= nonTopRatedCompanies.length - 1) return false;

        const currentCompany = nonTopRatedCompanies[index];
        
        // Can't move if it's already being processed
        if (actionLoading === `move-${currentCompany._id}`) return false;

        return true;
    };

    // Define table columns
    const columns = [
        { key: 'position', label: 'Position', visible: { desktop: true, mobile: false } },
        { key: 'logo', label: 'Logo', visible: true },
        { key: 'name', label: 'Name', visible: true },
        { key: 'category', label: 'Category', visible: { desktop: true, mobile: false } },
        { key: 'status', label: 'Status', visible: { desktop: true, mobile: false } },
        { key: 'topRated', label: 'Top Rated', visible: { desktop: true, mobile: false } },
        { key: 'actions', label: 'Actions', visible: true, className: 'text-right' }
    ];

    // Render cell content
    const renderCell = (company, column, rowIndex, colIndex) => {
        const index = companies.filter(c => !c.topRated).findIndex(c => c._id === company._id);
        
        switch (column.key) {
            case 'position':
                return (
                    <div className="flex items-center">
                        {!company.topRated && (
                            <>
                                <span className="text-gray-900 mr-3">{company.order || index + 1}</span>
                                <div className="flex flex-col">
                                    <button
                                        onClick={() => handleMoveUp(index)}
                                        disabled={!canMoveUp(index)}
                                        className={`text-gray-500 ${!canMoveUp(index) ? 'opacity-30 cursor-not-allowed' : 'hover:text-gray-700'}`}
                                    >
                                        <FaArrowUp />
                                    </button>
                                    <button
                                        onClick={() => handleMoveDown(index)}
                                        disabled={!canMoveDown(index)}
                                        className={`text-gray-500 ${!canMoveDown(index) ? 'opacity-30 cursor-not-allowed' : 'hover:text-gray-700'}`}
                                    >
                                        <FaArrowDown />
                                    </button>
                                </div>
                            </>
                        )}
                        {company.topRated && (
                            <span className="text-xs text-blue-600">(Auto-positioned)</span>
                        )}
                    </div>
                );
            case 'logo':
                return (
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {company.logo ? (
                            <img
                                src={company.logo}
                                alt={`${company.name} logo`}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/images/company-placeholder.png';
                                }}
                            />
                        ) : (
                            <div className="text-sm text-gray-500 font-bold">
                                {company.name.slice(0, 2).toUpperCase()}
                            </div>
                        )}
                    </div>
                );
            case 'name':
                return (
                    <div>
                        <div className="text-sm sm:text-base font-medium text-gray-900">{company.name}</div>
                        <div className="sm:hidden text-xs text-gray-500 mt-1">{company.category}</div>
                        <div className="sm:hidden flex mt-2 space-x-2">
                            <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                company.show !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {company.show !== false ? 'Listed' : 'Unlisted'}
                            </span>
                            <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                company.topRated ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                                {company.topRated ? 'Top Rated' : 'Regular'}
                            </span>
                        </div>
                    </div>
                );
            case 'category':
                return <div className="text-sm sm:text-base text-gray-500">{company.category}</div>;
            case 'status':
                return (
                    <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                        company.show !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {company.show !== false ? 'Listed' : 'Unlisted'}
                    </span>
                );
            case 'topRated':
                return (
                    <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                        company.topRated ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                        {company.topRated ? 'Top Rated' : 'Regular'}
                    </span>
                );
            case 'actions':
                return (
                    <div className="flex justify-end space-x-2 sm:space-x-3">
                        <button
                            onClick={() => handleEdit(company._id)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                        >
                            <FaEdit className="hidden sm:block" />
                            <span className="sm:hidden">Edit</span>
                        </button>
                        <button
                            onClick={() => handleListingToggle(company._id, company.name, company.show !== false)}
                            className={`${company.show !== false ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}
                            disabled={actionLoading === `status-${company._id}`}
                            title={company.show !== false ? 'Unlist' : 'List'}
                        >
                            {actionLoading === `status-${company._id}` ? '...' : 
                                company.show !== false ? <FaEyeSlash className="hidden sm:block" /> : <FaEye className="hidden sm:block" />
                            }
                            <span className="sm:hidden">{company.show !== false ? 'Unlist' : 'List'}</span>
                        </button>
                        <button
                            onClick={() => handleTopRatedToggle(company._id, company.name, company.topRated)}
                            className={`${company.topRated ? 'text-orange-600 hover:text-orange-800' : 'text-blue-600 hover:text-blue-800'}`}
                            disabled={actionLoading === `toprated-${company._id}` || (!company.topRated && topRatedCount >= 3)}
                            title={company.topRated ? 'Remove Top' : 'Make Top'}
                        >
                            {actionLoading === `toprated-${company._id}` ? '...' : 
                                company.topRated ? <FaRegStar className="hidden sm:block" /> : <FaStar className="hidden sm:block" />
                            }
                            <span className="sm:hidden">{company.topRated ? 'Remove Top' : 'Make Top'}</span>
                        </button>
                        <button
                            onClick={() => handleDelete(company._id, company.name)}
                            className="text-red-600 hover:text-red-900"
                            disabled={actionLoading === `delete-${company._id}`}
                            title="Delete"
                        >
                            {actionLoading === `delete-${company._id}` ? '...' : <FaTrash className="hidden sm:block" />}
                            <span className="sm:hidden">Delete</span>
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    // Render mobile view for each row
    const renderMobileRow = (company) => {
        const index = companies.filter(c => !c.topRated).findIndex(c => c._id === company._id);
        
        return (
            <div className="space-y-3">
                <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {company.logo ? (
                            <img
                                src={company.logo}
                                alt={`${company.name} logo`}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/images/company-placeholder.png';
                                }}
                            />
                        ) : (
                            <div className="text-sm text-gray-500 font-bold">
                                {company.name.slice(0, 2).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="text-base font-medium text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-500">{company.category}</div>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                        company.show !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {company.show !== false ? 'Listed' : 'Unlisted'}
                    </span>
                    <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                        company.topRated ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                        {company.topRated ? 'Top Rated' : 'Regular'}
                    </span>
                </div>
                
                {!company.topRated && (
                    <div className="flex items-center">
                        <span className="text-sm text-gray-700 mr-2">Position: {company.order || index + 1}</span>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleMoveUp(index)}
                                disabled={!canMoveUp(index)}
                                className={`p-1 rounded bg-gray-100 ${!canMoveUp(index) ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                            >
                                <FaArrowUp className="text-gray-600" />
                            </button>
                            <button
                                onClick={() => handleMoveDown(index)}
                                disabled={!canMoveDown(index)}
                                className={`p-1 rounded bg-gray-100 ${!canMoveDown(index) ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                            >
                                <FaArrowDown className="text-gray-600" />
                            </button>
                        </div>
                    </div>
                )}
                
                <div className="flex justify-between pt-2 border-t border-gray-100">
                    <button
                        onClick={() => handleEdit(company._id)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                    >
                        <FaEdit className="mr-1" /> Edit
                    </button>
                    <button
                        onClick={() => handleListingToggle(company._id, company.name, company.show !== false)}
                        className={`flex items-center ${company.show !== false ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}
                        disabled={actionLoading === `status-${company._id}`}
                    >
                        {company.show !== false ? <FaEyeSlash className="mr-1" /> : <FaEye className="mr-1" />}
                        {actionLoading === `status-${company._id}` ? 'Processing...' : (company.show !== false ? 'Unlist' : 'List')}
                    </button>
                    <button
                        onClick={() => handleTopRatedToggle(company._id, company.name, company.topRated)}
                        className={`flex items-center ${company.topRated ? 'text-orange-600 hover:text-orange-800' : 'text-blue-600 hover:text-blue-800'}`}
                        disabled={actionLoading === `toprated-${company._id}` || (!company.topRated && topRatedCount >= 3)}
                    >
                        {company.topRated ? <FaRegStar className="mr-1" /> : <FaStar className="mr-1" />}
                        {actionLoading === `toprated-${company._id}` ? 'Processing...' : (company.topRated ? 'Remove Top' : 'Make Top')}
                    </button>
                    <button
                        onClick={() => handleDelete(company._id, company.name)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                        disabled={actionLoading === `delete-${company._id}`}
                    >
                        <FaTrash className="mr-1" />
                        {actionLoading === `delete-${company._id}` ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <ResponsiveAdminContainer 
            title="Manage Companies" 
            showBackButton={true}
            backTo="/admin/home"
        >
            <div className="mb-6 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                    Top Rated Companies: <span className="font-semibold">{topRatedCount}/3</span>
                </p>
                <button
                    onClick={handleAdd}
                    className="admin-btn bg-[#006452] text-white hover:bg-[#004d3b]"
                >
                    Add New Company
                </button>
            </div>

            {/* Success message */}
            {successMessage && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg shadow">
                    {successMessage}
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow">
                    {error}
                </div>
            )}
            
            {loading && (
                <div className="text-center py-8">
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mr-3"></div>
                        <p>{loadingMessage}</p>
                    </div>
                </div>
            )}
            
            <h2 className="text-xl font-semibold mb-4">Listed Companies</h2>
            <ResponsiveAdminTable
                columns={columns}
                data={companies}
                renderCell={renderCell}
                renderMobileRow={renderMobileRow}
                loading={loading}
                loadingText={loadingMessage}
                emptyText="No companies found. Click 'Add New Company' to create one."
                onRowClick={null}
            />
        </ResponsiveAdminContainer>
    );
}

export default AdminShowAllCompanies;