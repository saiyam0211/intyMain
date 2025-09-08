const express = require('express');
const router = express.Router();
const {
  storeUserFilter,
  getAllUserFilters,
  downloadFiltersAsCSV,
  getFilterStatistics
} = require('../controllers/userFilterController');
const { isAdmin } = require('../middleware/authMiddleware');

// Public route to store user filter data
router.post('/store', storeUserFilter);

// Admin-only routes
router.get('/all', isAdmin, getAllUserFilters);
router.get('/download-csv', isAdmin, downloadFiltersAsCSV);
router.get('/statistics', isAdmin, getFilterStatistics);

module.exports = router;
