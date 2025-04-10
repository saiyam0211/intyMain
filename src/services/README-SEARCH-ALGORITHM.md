# Inty Search Algorithm Documentation

This document explains the search and filtering algorithm implemented in the Inty website for matching companies with user search criteria.

## Overview

The algorithm implements a multi-step approach to filter and rank companies based on user inputs. The main implementation can be found in `src/services/SearchAlgorithm.js`.

## Algorithm Steps

### Case 0: User doesn't provide any input
- Skip filtering
- Go directly to Step 4 (sort by Inty Assured and Paid partners)
- Prompt user to provide inputs for more relevant results

### Case 1: User provides inputs

#### Step 1: Filter on Residential/Commercial companies
- Filter companies by space type (Residential or Commercial)
- Companies can support multiple space types

#### Step 2: Specialization filtering
- If user selects any BHK, proceed to Step 3
- If user selects office, kitchen, bathroom, etc. but no BHK, filter on specialization first:
  - Match against company's `serviceCategories` field
  - Then proceed to Step 3

#### Step 3: Price and Area comparison
- Use price and area inputs from user to compare with company pricing
- For each company, calculate estimated price range based on:
  - User's area input (e.g., 800-1000 sq ft)
  - Company's per sq ft price for different tiers (Basic, Standard, Premium, Luxe)
- Example calculation:
  - User selects area of 800-1000 sq ft with price range of 2-3 Lakhs
  - Company pricing:
    - Basic: ₹400 per sq ft → ₹320,000 - ₹400,000
    - Standard: ₹600 per sq ft → ₹480,000 - ₹600,000
  - If price matches or is closest to user's range, company is selected
- If no companies match user's price (unreasonable pricing):
  - Show alert "Sorry, there are no companies operating in the price range; however if you are willing to increase the budget, you may consider below options"
  - Include companies with closest price ranges
  - This happens when: upper limit of user's price - minimum price of any company > 1 lakh

#### Step 4: Sort by Inty Assured and Paid partners
- Sort companies by priority:
  1. Inty Assured partners first
  2. Paid partners second
  3. Regular companies last

#### Step 5: Company Score calculation and sorting
- Within each group, sort companies by their calculated score (0-3 scale)
- Score components:
  - Rating and Review: 0 to 1 (Wilson Score)
  - Age of the company: 0 to 0.5 (Weighted ranking)
  - Number of projects completed: 0 to 0.5 (Weighted ranking)
  - Ongoing offer: 0.5
  - Award: 0 (if none), 0.25 (if past awards), 0.5 (within past 12 months)

## Algorithm Implementation

The search algorithm is implemented in the following files:

1. `src/services/SearchAlgorithm.js` - Main algorithm implementation
2. `src/pages/ResidentialSpace/Residentialspace.jsx` - Integration into the UI
3. `src/components/UnreasonablePriceAlert/UnreasonablePriceAlert.jsx` - Alert for unreasonable pricing

## UI Flow

1. User enters search criteria (search terms, filters, etc.)
2. Backend API fetches initial company data
3. Frontend applies the search algorithm to filter and sort companies
4. Results are displayed to the user
5. If user's pricing is unreasonable, a popup appears explaining the situation

## Notes for Developers

- The algorithm is designed to be flexible and can be modified to adjust the importance of different factors
- Company score calculation parameters can be adjusted to change ranking behavior
- If you need to modify the algorithm, focus on the `searchAlgorithm` function in the SearchAlgorithm.js file 