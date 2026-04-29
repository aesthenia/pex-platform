import { useEffect, useState } from 'react';
import api from '../api';
import { useMarket } from '../context/MarketContext';

export const Dashboard = () => {
  const { user, prices, portfolio, setPortfolio, netWorth, setPrices } = useMarket();
  const [marketStocks, setMarketStocks] = useState([]);

  const fetchData = async () => {
    try {
      const [marketRes, portfolioRes] = await Promise.all([
        api.get('/api/stocks/market'),
        api.get('/api/trade/my-portfolio')
      ]);
      setMarketStocks(marketRes.data);
      setPortfolio(portfolioRes.data);
      
      const initialPrices = {};
      marketRes.data.forEach(s => initialPrices[s.ticker] = s.price);
      setPrices(initialPrices);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleBuy = async (ticker) => {
    const qty = prompt("How many shares?");
    if (!qty) return;
    try {
      await api.post('/api/trade/buy', { ticker, quantity: qty });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Trade failed");
    }
  };

  const handlePriceUpdate = async (ticker) => {
    const newPrice = prompt("Set new price:");
    if (!newPrice) return;
    try {
      await api.patch('/api/stocks/update-price', { ticker, newPrice });

    } catch (err) {
      alert(err.response?.data?.error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div>
          <p style={{ color: '#858796', margin: 0 }}>Wallet Balance</p>
          <h2 style={{ color: '#1cc88a' }}>${user.walletBalance.toLocaleString()}</h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: '#858796', margin: 0 }}>Total Net Worth (Live)</p>
          <h2 style={{ color: '#4e73df' }}>${netWorth.toLocaleString()}</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
          <h3>Public Market</h3>
          {marketStocks.map(stock => (
            <div key={stock.ticker} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <div>
                <strong>${stock.ticker}</strong>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Owner: {stock.owner.username}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold', color: '#4e73df' }}>
                  ${(prices[stock.ticker] || stock.price).toFixed(2)}
                </div>
                <button onClick={() => handleBuy(stock.ticker)} style={{ fontSize: '12px', cursor: 'pointer' }}>Buy</button>
                {user.id === stock.owner._id && (
                  <button onClick={() => handlePriceUpdate(stock.ticker)} style={{ fontSize: '12px', marginLeft: '5px', background: '#f6c23e', border: 'none', cursor: 'pointer' }}>Price</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
          <h3>Your Assets</h3>
          {portfolio.map(item => (
            <div key={item.ticker} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <span>{item.ticker} ({item.sharesHeld} shares)</span>
              <span>${((prices[item.ticker] || item.lastKnownPrice) * item.sharesHeld).toLocaleString()}</span>
            </div>
          ))}
          {portfolio.length === 0 && <p>You don't own any stocks yet.</p>}
        </div>
      </div>
    </div>
  );
};