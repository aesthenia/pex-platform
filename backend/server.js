require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
const initWebSocket = require('./ws/wsHandler'); // <--- Импорт
const stockRoutes = require('./routes/stocks');
const tradeRoutes = require('./routes/trade');

const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

const server = http.createServer(app);

const wss = initWebSocket(server);

app.use((req, res, next) => {
  req.wss = wss;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/trade', tradeRoutes);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`[Server] PEX Backend running on port ${PORT}`);
});