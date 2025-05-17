// models/Subscriber.js
const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  
  email: {
    type: String,
    site: String,
    required: [true, 'Subscriber email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address']
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model('Subscriber', subscriberSchema);
