const mongoose = require('mongoose');
const Company = require('./models/Company');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inty', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function migrateReviews() {
  try {
    console.log('Starting review field migration...');
    
    // Find all companies that have googleReviewCount but no googleReviews
    const companiesToUpdate = await Company.find({
      $or: [
        { googleReviewCount: { $exists: true, $ne: null, $ne: '' } },
        { googleReviews: { $exists: false } }
      ]
    });

    console.log(`Found ${companiesToUpdate.length} companies to update`);

    for (const company of companiesToUpdate) {
      const updates = {};
      
      // If company has googleReviewCount but no googleReviews, copy it over
      if (company.googleReviewCount && !company.googleReviews) {
        updates.googleReviews = company.googleReviewCount.toString();
        console.log(`Migrating ${company.name}: ${company.googleReviewCount} -> googleReviews`);
      }
      
      // If company has googleReviews but it's empty and googleReviewCount exists
      if ((!company.googleReviews || company.googleReviews === '') && company.googleReviewCount) {
        updates.googleReviews = company.googleReviewCount.toString();
        console.log(`Filling empty googleReviews for ${company.name}: ${company.googleReviewCount}`);
      }

      if (Object.keys(updates).length > 0) {
        await Company.findByIdAndUpdate(company._id, updates);
        console.log(`Updated ${company.name}`);
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateReviews();
