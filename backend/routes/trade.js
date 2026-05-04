const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Stock = require('../models/Stock');
const Portfolio = require('../models/Portfolio');

const router = express.Router();

router.post('/buy', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { ticker, quantity } = req.body;
    const qty = parseInt(quantity);

    if (!qty || qty <= 0) {
      throw new Error('Invalid quantity');
    }

    const stock = await Stock.findOne({ ticker: ticker.toUpperCase() }).session(session);
    if (!stock) {
      throw new Error('Stock not found');
    }

    if (stock.owner.toString() === req.user.id) {
      throw new Error('Forbidden: You cannot buy your own stock. You are the issuer.');
    }

    const totalCost = stock.price * qty;

    const user = await User.findById(req.user.id).session(session);
    if (user.walletBalance < totalCost) {
      throw new Error('Insufficient funds: You need $' + totalCost);
    }

    user.walletBalance -= totalCost;
    await user.save({ session });

    await Portfolio.findOneAndUpdate(
      { user: user._id, stock: stock._id },
      { $inc: { sharesHeld: qty } },
      { upsert: true, new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    console.log(`[Trade] User ${user.username} bought ${qty} shares of ${ticker}`);

    res.json({ 
      message: `Successfully bought ${qty} shares of ${ticker}`,
      newBalance: user.walletBalance 
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error(`[Trade Error] ${err.message}`);
    
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;