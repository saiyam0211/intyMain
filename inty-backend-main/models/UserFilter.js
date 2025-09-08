const mongoose = require('mongoose');

const userFilterSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: false,
    index: true
  },
  searchTerm: {
    type: String,
    required: false,
    default: ''
  },
  filters: {
    location: {
      type: String,
      required: false
    },
    type: {
      type: String,
      required: false
    },
    roomType: {
      type: String,
      required: false
    },
    bhkSize: {
      type: String,
      required: false
    },
    budget: {
      type: String,
      required: false
    },
    assuredOnly: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  pageType: {
    type: String,
    required: true,
    enum: ['residential', 'commercial', 'designer', 'craftsman'],
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  userAgent: {
    type: String,
    required: false
  },
  ipAddress: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
userFilterSchema.index({ timestamp: -1 });
userFilterSchema.index({ pageType: 1, timestamp: -1 });

module.exports = mongoose.model('UserFilter', userFilterSchema);
