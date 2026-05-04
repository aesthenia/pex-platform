const express = require('express');
const auth = require('../middleware/auth');
const Stock = require('../models/Stock');
const User = require('../models/User');

const router = express.Router();

router.post('/create', auth, async (req, res) => {
  try {
    const { ticker, initialPrice } = req.body;

    const user = await User.findById(req.user.id);
    if (user.ticker) {
      return res.status(400).json({ error: 'You already have a stock ticker' });
    }

    const existingStock = await Stock.findOne({ ticker: ticker.toUpperCase() });
    if (existingStock) {
      return res.status(400).json({ error: 'Ticker already exists' });
    }

    const newStock = new Stock({
      ticker: ticker.toUpperCase(),
      price: initialPrice,
      owner: req.user.id
    });

    await newStock.save();

    user.ticker = newStock.ticker;
    await user.save();

    res.status(201).json(newStock);
  } catch (err) {
    res.status(500).json({ error: 'Server error during stock creation' });
  }
});

router.patch('/update-price', auth, async (req, res) => {
  const { ticker, newPrice } = req.body;
  const stock = await Stock.findOne({ ticker: ticker.toUpperCase() });

  if (!stock) return res.status(404).json({ error: 'Stock not found' });

  if (stock.owner.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: You are NOT the owner of this stock' });
  }

  stock.price = Number(newPrice);
  await stock.save();

  const updateMessage = JSON.stringify({
    type: "TICKER_UPDATE",
    payload: { ticker: stock.ticker, price: stock.price }
  });
  req.wss.clients.forEach(c => c.readyState === 1 && c.send(updateMessage));
  res.json(stock);
});

router.get('/market', async (req, res) => {
  try {
    const stocks = await Stock.find().populate('owner', 'username');
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;