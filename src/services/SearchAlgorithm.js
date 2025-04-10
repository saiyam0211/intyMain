/**
 * Search Algorithm Service
 * 
 * This service implements the Inty search algorithm for filtering and ranking companies.
 */

/**
 * Calculate a company's score for ranking
 * @param {Object} company - Company object
 * @returns {Number} Score between 0-3
 */
export const calculateCompanyScore = (company) => {
  let score = 0;
  
  // Rating and Review : 0 to 1 (Wilson Score)
  const rating = parseFloat(company.googleRating) || 0;
  const reviews = parseInt(company.googleReviews) || 0;
  
  // Use a modified Wilson score calculation
  if (reviews > 0) {
    // Simple approximation of Wilson score (based on rating and number of reviews)
    const confidence = Math.min(reviews / 100, 1); // Scale with max at 100 reviews
    score += (rating / 5) * confidence; // Convert to 0-1 scale
  }
  
  // Age of the company : 0 to 0.5 (Weighted ranking)
  const ageYears = parseInt(company.experience) || 0;
  if (ageYears > 0) {
    // Scale: 0.1 for 1yr, 0.2 for 2yrs, max 0.5 for 5+ years
    score += Math.min(ageYears * 0.1, 0.5);
  }
  
  // Number of projects completed: 0 to 0.5 (Weighted ranking)
  const projectsCompleted = parseInt(company.projects) || 0;
  if (projectsCompleted > 0) {
    // Scale: 0.1 for 10 projects, 0.3 for 30, max 0.5 for 50+ projects
    score += Math.min(projectsCompleted * 0.01, 0.5);
  }
  
  // Ongoing offer : 0.5
  if (company.discountsOfferTimeline && company.discountsOfferTimeline.length > 0) {
    score += 0.5;
  }
  
  // Award : 0 (if none) , 0.25 (if past awards) , 0.5 (within past 12 months)
  if (company.anyAwardWon && company.anyAwardWon.length > 0) {
    // Check if any award is within the past 12 months
    // Note: This implementation assumes there's some way to determine recent awards
    // Since the exact data structure is not visible, this is a placeholder
    const hasRecentAward = company.anyAwardWon.includes("recent"); // This logic would need to be adjusted
    
    score += hasRecentAward ? 0.5 : 0.25;
  }
  
  return score;
};

/**
 * Calculate price for a company based on area range
 * @param {Object} company - Company object
 * @param {Object} filters - Search filters
 * @returns {Object} - Price calculations for different tiers
 */
export const calculateCompanyPrices = (company, filters) => {
  // Extract area range from size filter (e.g., "800-1000")
  let minArea = 0;
  let maxArea = 0;
  
  if (filters.size && filters.size !== "Size (sq ft)") {
    const sizeParts = filters.size.split("-");
    if (sizeParts.length === 2) {
      minArea = parseInt(sizeParts[0]) || 0;
      maxArea = parseInt(sizeParts[1]) || 0;
    }
  }
  
  // Return early if no valid area
  if (minArea <= 0 || maxArea <= 0) {
    return null;
  }
  
  // Calculate price ranges for each tier
  const result = {
    basic: null,
    standard: null,
    premium: null,
    luxe: null
  };
  
  // Basic tier (using basicPriceRange from company)
  if (company.basicPriceRange) {
    const pricePerSqft = parseFloat(company.basicPriceRange) || 0;
    if (pricePerSqft > 0) {
      result.basic = {
        min: pricePerSqft * minArea,
        max: pricePerSqft * maxArea,
        pricePerSqft
      };
    }
  }
  
  // Premium tier (using premiumPriceRange from company)
  if (company.premiumPriceRange) {
    const pricePerSqft = parseFloat(company.premiumPriceRange) || 0;
    if (pricePerSqft > 0) {
      result.premium = {
        min: pricePerSqft * minArea,
        max: pricePerSqft * maxArea,
        pricePerSqft
      };
    }
  }
  
  // Luxe tier (using luxuryPriceRange from company)
  if (company.luxuryPriceRange) {
    const pricePerSqft = parseFloat(company.luxuryPriceRange) || 0;
    if (pricePerSqft > 0) {
      result.luxe = {
        min: pricePerSqft * minArea,
        max: pricePerSqft * maxArea,
        pricePerSqft
      };
    }
  }
  
  return result;
};

/**
 * Check if a company's price is within user's budget
 * @param {Object} companyPrices - Calculated price ranges
 * @param {Object} filters - Search filters
 * @returns {Object} - Match details
 */
export const isPriceInRange = (companyPrices, filters) => {
  if (!companyPrices || !filters.priceRange || filters.priceRange === "Price Range") {
    return { matches: false, tier: null };
  }
  
  // Extract user's price range (e.g., "2-3 Lakhs")
  let userMinPrice = 0;
  let userMaxPrice = 0;
  
  const priceRangeParts = filters.priceRange.split(" to ");
  if (priceRangeParts.length === 2) {
    // Handle "1Lakh to 3Lakh" format
    userMinPrice = parseFloat(priceRangeParts[0].replace("Lakh", "")) * 100000;
    userMaxPrice = parseFloat(priceRangeParts[1].replace("Lakh", "")) * 100000;
  }
  
  // Return early if no valid price range
  if (userMinPrice <= 0 || userMaxPrice <= 0) {
    return { matches: false, tier: null };
  }
  
  // Check each tier for a match
  const tiers = ["basic", "standard", "premium", "luxe"];
  
  for (const tier of tiers) {
    if (companyPrices[tier]) {
      const { min, max } = companyPrices[tier];
      
      // Check if there's an overlap between company's price range and user's price range
      if (
        (min >= userMinPrice && min <= userMaxPrice) || 
        (max >= userMinPrice && max <= userMaxPrice) ||
        (min <= userMinPrice && max >= userMaxPrice)
      ) {
        return { 
          matches: true, 
          tier,
          min,
          max,
          overlap: true
        };
      }
    }
  }
  
  // If no exact match, find closest tier
  let closestTier = null;
  let smallestDiff = Number.MAX_VALUE;
  
  for (const tier of tiers) {
    if (companyPrices[tier]) {
      const { min } = companyPrices[tier];
      const diff = Math.abs(min - userMinPrice);
      
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestTier = tier;
      }
    }
  }
  
  // For unreasonable user price expectations (under 1 lakh difference)
  const isUnreasonable = closestTier && 
                         companyPrices[closestTier] && 
                         (companyPrices[closestTier].min - userMaxPrice > 100000);
  
  return {
    matches: false,
    tier: closestTier,
    isUnreasonable,
    smallestDiff,
    min: closestTier ? companyPrices[closestTier].min : null,
    max: closestTier ? companyPrices[closestTier].max : null
  };
};

/**
 * Main search algorithm implementation
 * @param {Array} companies - List of all companies
 * @param {Object} filters - Search filters
 * @returns {Object} - Filtered and sorted companies with metadata
 */
export const searchAlgorithm = (companies, filters) => {
  if (!companies || !Array.isArray(companies) || companies.length === 0) {
    return {
      companies: [],
      unreasonablePricing: false,
      noMatchingCompanies: true
    };
  }
  
  // Case 0: User doesn't give any input, just return all companies sorted by Inty Assured and Paid partners
  if (
    (!filters.search || filters.search.trim() === "") &&
    (!filters.projectType || filters.projectType === "Project Type") &&
    (!filters.size || filters.size === "Size (sq ft)") &&
    (!filters.priceRange || filters.priceRange === "Price Range")
  ) {
    // Skip filtering - go directly to Step 4 (sort Inty Assured and Paid partners on top)
    const sortedCompanies = sortCompaniesByAssuredAndScore(companies);
    
    return {
      companies: sortedCompanies,
      message: "Please provide search criteria for more relevant results."
    };
  }
  
  // Case 1: User provides inputs
  
  // Step 1: Filter on residential/commercial companies
  let filteredCompanies = companies;
  if (filters.spaceType) {
    filteredCompanies = filteredCompanies.filter(company => 
      company.type && company.type.includes(filters.spaceType)
    );
  }
  
  // Step 2: Filter on specialization if needed
  // If user selects office, kitchen, bathroom etc. but no BHK, filter on specialization first
  const hasRoomTypeSpecialization = filters.projectType && 
    ["Office", "Kitchen", "Bathroom", "Living Room"].includes(filters.projectType);
  
  const hasBHKSpecialization = filters.projectType && 
    ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"].includes(filters.projectType);
  
  // Apply specialization filter before price comparison if user selected room type but no BHK
  if (hasRoomTypeSpecialization && !hasBHKSpecialization) {
    filteredCompanies = filteredCompanies.filter(company => 
      company.serviceCategories && 
      company.serviceCategories.some(category => 
        category.includes(filters.projectType)
      )
    );
  }
  
  // Step 3: Use price and area to compare
  const companiesWithPrice = [];
  let unreasonablePricing = false;
  
  for (const company of filteredCompanies) {
    // Calculate price ranges based on area
    const priceCalculations = calculateCompanyPrices(company, filters);
    
    if (priceCalculations) {
      // Check if company's price is in user's range
      const priceMatch = isPriceInRange(priceCalculations, filters);
      
      if (priceMatch.isUnreasonable) {
        unreasonablePricing = true;
      }
      
      companiesWithPrice.push({
        ...company,
        priceCalculations,
        priceMatch
      });
    } else {
      // Include companies without price calculation but mark them
      companiesWithPrice.push({
        ...company,
        priceCalculations: null,
        priceMatch: { matches: false, tier: null }
      });
    }
  }
  
  // Filter companies that match price range (if price range was provided)
  let priceFilteredCompanies = companiesWithPrice;
  if (filters.priceRange && filters.priceRange !== "Price Range") {
    const exactMatches = companiesWithPrice.filter(company => 
      company.priceMatch && company.priceMatch.matches
    );
    
    // If we have exact price matches, use only those
    if (exactMatches.length > 0) {
      priceFilteredCompanies = exactMatches;
    }
    // Otherwise keep all companies if unreasonable pricing is detected
    else if (unreasonablePricing) {
      // Keep all companies but flag the unreasonable pricing
    }
  }
  
  // Apply BHK filter after price filtering if needed
  if (hasBHKSpecialization) {
    priceFilteredCompanies = priceFilteredCompanies.filter(company => 
      company.projectType && company.projectType.includes(filters.projectType)
    );
  }
  
  // Step 4: Sort Inty Assured and Paid partners on top
  const sortedCompanies = sortCompaniesByAssuredAndScore(priceFilteredCompanies);
  
  return {
    companies: sortedCompanies,
    unreasonablePricing,
    noMatchingCompanies: sortedCompanies.length === 0
  };
};

/**
 * Sort companies with Inty Assured and Paid partners on top, then by score
 * @param {Array} companies - List of companies to sort
 * @returns {Array} - Sorted companies
 */
export const sortCompaniesByAssuredAndScore = (companies) => {
  // Calculate scores for all companies
  const companiesWithScores = companies.map(company => ({
    ...company,
    score: calculateCompanyScore(company)
  }));
  
  // First sort by Inty Assured status, then by paid partner status, then by score
  return companiesWithScores.sort((a, b) => {
    // First sort by Inty Assured (assured="true" at top)
    if (a.assured === "true" && b.assured !== "true") return -1;
    if (a.assured !== "true" && b.assured === "true") return 1;
    
    // Then sort by paid partner (topRated=true at top)
    if (a.topRated && !b.topRated) return -1;
    if (!a.topRated && b.topRated) return 1;
    
    // Finally sort by calculated score (higher scores first)
    return b.score - a.score;
  });
}; 