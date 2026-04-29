const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  ticker: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true,
    trim: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0.01
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Stock', stockSchema);