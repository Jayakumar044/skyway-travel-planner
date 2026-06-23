const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  estimatedCostUSD: { type: Number, default: 0 },
  timeOfDay: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening'],
    default: 'Afternoon'
  }
});

const HotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tier: { type: String, default: 'Mid-range' },
  estimatedCostNightUSD: { type: Number, default: 0 },
  rating: { type: String, default: '4/5' },
  amenities: [String]
});

const PackingItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  category: {
    type: String,
    enum: ['Documents', 'Clothing', 'Gear', 'Toiletries', 'Electronics', 'Other'],
    default: 'Other'
  },
  isPacked: { type: Boolean, default: false }
});

const TripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: { type: String, required: true },
  durationDays: { type: Number, required: true, min: 1, max: 30 },
  budgetTier: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  interests: [{ type: String }],
  itinerary: [{
    dayNumber: { type: Number, required: true },
    activities: [ActivitySchema]
  }],
  hotels: [HotelSchema],
  estimatedBudget: {
    transport: { type: Number, default: 0 },
    accommodation: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    activities: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  packingList: [PackingItemSchema],
  weatherInfo: {
    season: { type: String, default: '' },
    avgTemp: { type: String, default: '' },
    conditions: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Trip', TripSchema);
