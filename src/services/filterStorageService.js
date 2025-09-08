import { apiClient } from './apiService';

// Store user filter data
export const storeUserFilter = async (filterData) => {
  try {
    const response = await apiClient.post('/user-filters/store', {
      userId: filterData.userId || 'anonymous',
      userEmail: filterData.userEmail || '',
      searchTerm: filterData.searchTerm || '',
      filters: {
        location: filterData.filters?.location || '',
        type: filterData.filters?.type || '',
        roomType: filterData.filters?.roomType || '',
        bhkSize: filterData.filters?.bhkSize || '',
        budget: filterData.filters?.budget || '',
        assuredOnly: filterData.filters?.assuredOnly || false
      },
      pageType: filterData.pageType || 'residential'
    });

    console.log('Filter data stored successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error storing filter data:', error);
    // Don't throw error to avoid breaking the user experience
    return null;
  }
};

// Get user info from Clerk (if available)
export const getUserInfo = () => {
  try {
    // This will be called from components that have access to Clerk
    return {
      userId: null, // Will be set by the calling component
      userEmail: null // Will be set by the calling component
    };
  } catch (error) {
    console.error('Error getting user info:', error);
    return {
      userId: 'anonymous',
      userEmail: ''
    };
  }
};
