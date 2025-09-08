const UserFilter = require('../models/UserFilter');
const fs = require('fs');
const path = require('path');

// Store user filter data
const storeUserFilter = async (req, res) => {
  try {
    const {
      userId,
      userEmail,
      searchTerm,
      filters,
      pageType
    } = req.body;

    // Get client IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');

    const userFilter = new UserFilter({
      userId: userId || 'anonymous',
      userEmail,
      searchTerm: searchTerm || '',
      filters: filters || {},
      pageType,
      ipAddress,
      userAgent
    });

    await userFilter.save();

    res.status(201).json({
      success: true,
      message: 'Filter data stored successfully',
      data: userFilter
    });
  } catch (error) {
    console.error('Error storing user filter:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store filter data',
      error: error.message
    });
  }
};

// Get all user filters (admin only)
const getAllUserFilters = async (req, res) => {
  try {
    const { page = 1, limit = 50, pageType, startDate, endDate } = req.query;
    
    // Build query
    const query = {};
    
    if (pageType) {
      query.pageType = pageType;
    }
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    const filters = await UserFilter.find(query)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await UserFilter.countDocuments(query);

    res.status(200).json({
      success: true,
      data: filters,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user filters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filter data',
      error: error.message
    });
  }
};

// Download filters as CSV and delete them
const downloadFiltersAsCSV = async (req, res) => {
  try {
    // Get all filters
    const filters = await UserFilter.find({}).sort({ timestamp: -1 }).lean();

    if (filters.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No filter data found to download'
      });
    }

    // Create CSV content
    const csvHeaders = [
      'Timestamp',
      'User ID',
      'User Email',
      'Page Type',
      'Search Term',
      'Location',
      'Type',
      'Room Type',
      'BHK Size',
      'Budget',
      'Assured Only',
      'IP Address',
      'User Agent'
    ];

    const csvRows = filters.map(filter => [
      filter.timestamp.toISOString(),
      filter.userId || '',
      filter.userEmail || '',
      filter.pageType || '',
      filter.searchTerm || '',
      filter.filters?.location || '',
      filter.filters?.type || '',
      filter.filters?.roomType || '',
      filter.filters?.bhkSize || '',
      filter.filters?.budget || '',
      filter.filters?.assuredOnly ? 'Yes' : 'No',
      filter.ipAddress || '',
      (filter.userAgent || '').replace(/,/g, ';') // Replace commas to avoid CSV issues
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    // Set response headers for CSV download
    const filename = `user-filters-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send CSV content
    res.send(csvContent);

    // Delete all filters after successful download
    await UserFilter.deleteMany({});
    
    console.log(`Downloaded ${filters.length} filter records and deleted them from database`);

  } catch (error) {
    console.error('Error downloading filters as CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download filter data',
      error: error.message
    });
  }
};

// Get filter statistics
const getFilterStatistics = async (req, res) => {
  try {
    const totalFilters = await UserFilter.countDocuments();
    
    const pageTypeStats = await UserFilter.aggregate([
      {
        $group: {
          _id: '$pageType',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentFilters = await UserFilter.countDocuments({
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    const topSearchTerms = await UserFilter.aggregate([
      {
        $match: {
          searchTerm: { $exists: true, $ne: '', $ne: null }
        }
      },
      {
        $group: {
          _id: '$searchTerm',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalFilters,
        pageTypeStats,
        recentFilters,
        topSearchTerms
      }
    });
  } catch (error) {
    console.error('Error fetching filter statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filter statistics',
      error: error.message
    });
  }
};

module.exports = {
  storeUserFilter,
  getAllUserFilters,
  downloadFiltersAsCSV,
  getFilterStatistics
};
