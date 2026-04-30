const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Stock = require('../models/Stock');
const Portfolio = require('../models/Portfolio');

const router = express.Router();

router.post('/buy', auth, async (req, res) => {
  try {
    const { ticker, quantity } = req.body;
    const qty = parseInt(quantity);

    if (!qty || qty <= 0) return res.status(400).json({ error: 'Invalid quantity' });

    const stock = await Stock.findOne({ ticker: ticker.toUpperCase() });
    if (!stock) return res.status(404).json({ error: 'Stock not found' });

    if (stock.owner.toString() === req.user.id) {
      return res.status(400).json({ 
        error: 'Forbidden: You cannot buy your own stock. You are the issuer.' 
      });
    }

    const totalCost = stock.price * qty;

    const user = await User.findById(req.user.id);
    if (user.walletBalance < totalCost) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    user.walletBalance -= totalCost;
    await user.save();

    await Portfolio.findOneAndUpdate(
      { user: user._id, stock: stock._id },
      { $inc: { sharesHeld: qty } },
      { upsert: true, new: true }
    );

    res.json({ 
      message: `Successfully bought ${qty} shares of ${ticker}`,
      newBalance: user.walletBalance 
    });

  } catch (err) {
    res.status(500).json({ error: 'Trade failed: ' + err.message });
  }
});

router.get('/my-portfolio', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.find({ user: req.user.id })
      .populate('stock', 'ticker price');
    
    const formatted = portfolio.map(item => ({
      ticker: item.stock.ticker,
      sharesHeld: item.sharesHeld,
      lastKnownPrice: item.stock.price
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;