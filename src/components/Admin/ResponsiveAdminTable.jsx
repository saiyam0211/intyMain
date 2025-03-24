import React from 'react';
import './AdminResponsive.css';

/**
 * A responsive table component for admin pages
 * @param {Object} props
 * @param {Array} props.columns - Array of column objects with { key, label, visible, className }
 * @param {Array} props.data - Array of data objects
 * @param {Function} props.renderCell - Function to render a cell (row, column) => ReactNode
 * @param {Function} props.renderMobileRow - Optional function to render mobile view for a row
 * @param {boolean} props.loading - Whether the table is loading
 * @param {string} props.loadingText - Text to display when loading
 * @param {string} props.emptyText - Text to display when data is empty
 */
const ResponsiveAdminTable = ({
  columns,
  data,
  renderCell,
  renderMobileRow,
  loading = false,
  loadingText = 'Loading data...',
  emptyText = 'No data available.'
}) => {
  // Filter visible columns based on screen size
  const getVisibleColumns = (screenSize) => {
    return columns.filter(col => {
      if (typeof col.visible === 'object') {
        return col.visible[screenSize];
      }
      return col.visible !== false;
    });
  };

  const desktopColumns = getVisibleColumns('desktop');
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">{loadingText}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-600">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Mobile view (custom rendering for small screens) */}
      {renderMobileRow && (
        <div className="sm:hidden">
          {data.map((row, rowIndex) => (
            <div key={rowIndex} className="border-b border-gray-200 p-4">
              {renderMobileRow(row, rowIndex)}
            </div>
          ))}
        </div>
      )}

      {/* Desktop view (traditional table) */}
      <div className={`${renderMobileRow ? 'hidden sm:block' : ''} admin-table-responsive`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {desktopColumns.map((column, index) => (
                <th 
                  key={index} 
                  scope="col" 
                  className={`px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {desktopColumns.map((column, colIndex) => (
                  <td 
                    key={colIndex} 
                    className={`px-4 py-3 ${column.className || ''}`}
                  >
                    {renderCell(row, column, rowIndex, colIndex)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResponsiveAdminTable; 