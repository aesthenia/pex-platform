const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  stock: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Stock', 
    required: true 
  },
  sharesHeld: { 
    type: Number, 
    required: true, 
    default: 0,
    min: 0 
  }
});

portfolioSchema.index({ user: 1, stock: 1 }, { unique: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);