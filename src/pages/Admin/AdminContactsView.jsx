import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ResponsiveAdminContainer from '../../components/Admin/ResponsiveAdminContainer';
import ResponsiveAdminTable from '../../components/Admin/ResponsiveAdminTable';
import { Download } from 'lucide-react'; // Assuming you're using lucide-react for icons

const AdminContactsView = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        // Check if admin token exists
        const token = localStorage.getItem('adminToken');
        if (!token) {
          navigate('/admin/login');
          return;
        }

        setLoading(true);
        const response = await axios.get('https://inty-backend.onrender.com/api/contact', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setContacts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setError('Failed to load contacts. Please try again later.');
        setLoading(false);
      }
    };

    fetchContacts();
  }, [navigate]);

  // Format date for better display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Download individual contact as CSV
  const downloadContact = (contact) => {
    // Create CSV content
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Subject', 'Message', 'Date'],
      [
        contact.name, 
        contact.email, 
        contact.phone, 
        contact.subject, 
        contact.message.replace(/,/g, ';'), // Replace commas to avoid CSV parsing issues
        formatDate(contact.createdAt)
      ]
    ].map(e => e.join(",")).join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `contact_${contact.name}_${new Date(contact.createdAt).toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Define table columns with download action
  const columns = [
    { key: 'name', label: 'Name', visible: true },
    { key: 'email', label: 'Email', visible: { desktop: true, mobile: false } },
    { key: 'phone', label: 'Phone', visible: { desktop: true, mobile: false } },
    { key: 'subject', label: 'Subject', visible: { desktop: true, mobile: false } },
    { key: 'message', label: 'Message', visible: true },
    { key: 'date', label: 'Date', visible: { desktop: true, mobile: false } },
    { key: 'download', label: 'Download', visible: true }
  ];

  // Render cell content
  const renderCell = (row, column) => {
    switch (column.key) {
      case 'name':
        return <div className="text-sm sm:text-base font-medium text-gray-900">{row.name}</div>;
      case 'email':
        return <div className="text-sm sm:text-base text-gray-900">{row.email}</div>;
      case 'phone':
        return <div className="text-sm sm:text-base text-gray-900">{row.phone}</div>;
      case 'subject':
        return <div className="text-sm sm:text-base text-gray-900">{row.subject}</div>;
      case 'message':
        return (
          <div className="text-sm sm:text-base text-gray-900 max-w-xs overflow-auto max-h-32 break-words">
            {row.message.length > 50 ? `${row.message.substring(0, 50)}...` : row.message}
          </div>
        );
      case 'date':
        return <div className="text-sm sm:text-base text-gray-900">{formatDate(row.createdAt)}</div>;
      case 'download':
        return (
          <button 
            onClick={() => downloadContact(row)}
            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
            title="Download Contact Details"
          >
            <Download size={20} />
          </button>
        );
      default:
        return null;
    }
  };

  // Render mobile view for each row
  const renderMobileRow = (row) => {
    return (
      <div className="space-y-2 relative">
        <div className="flex justify-between items-center">
          <div className="text-base font-medium text-gray-900">{row.name}</div>
          <button 
            onClick={() => downloadContact(row)}
            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
            title="Download Contact Details"
          >
            <Download size={20} />
          </button>
        </div>
        <div className="text-sm text-gray-500">{row.email}</div>
        <div className="text-sm text-gray-500">{row.phone}</div>
        <div className="text-sm font-medium text-gray-700 mt-2">{row.subject}</div>
        <div className="text-sm text-gray-700 mt-1 break-words">{row.message}</div>
        <div className="text-xs text-gray-500 mt-2">{formatDate(row.createdAt)}</div>
      </div>
    );
  };

  return (
    <ResponsiveAdminContainer title="Contact Form Submissions" showBackButton={true}>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow mb-6">
          {error}
        </div>
      )}
      
      <ResponsiveAdminTable
        columns={columns}
        data={contacts}
        renderCell={renderCell}
        renderMobileRow={renderMobileRow}
        loading={loading}
        loadingText="Loading contact submissions..."
        emptyText="No contact form submissions found."
      />
    </ResponsiveAdminContainer>
  );
};

export default AdminContactsView;