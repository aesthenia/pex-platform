import { useEffect, useState } from 'react';
import api from '../api';
import { useMarket } from '../context/MarketContext';
import { TrendingUp, Wallet, PlusCircle, Settings, Briefcase } from 'lucide-react';

export const Dashboard = () => {
  const { user, prices, portfolio, setPortfolio, netWorth, setPrices, setUser } = useMarket();
  const [marketStocks, setMarketStocks] = useState([]);
  const [newStock, setNewStock] = useState({ ticker: '', price: '' });

  const fetchData = async () => {
    try {
      const [mRes, pRes] = await Promise.all([api.get('/api/stocks/market'), api.get('/api/trade/my-portfolio')]);
      setMarketStocks(mRes.data);
      setPortfolio(pRes.data);
      const initialPrices = {};
      mRes.data.forEach(s => initialPrices[s.ticker] = s.price);
      setPrices(initialPrices);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateStock = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/stocks/create', { ticker: newStock.ticker, initialPrice: newStock.price });
      setUser(prev => ({ ...prev, ticker: res.data.ticker }));
      fetchData();
      alert("Stock Issued!");
    } catch (err) { alert(err.response?.data?.error); }
  };

  const handleBuy = async (ticker) => {
    const qty = prompt(`How many shares of $${ticker} do you want to buy?`);
    if (!qty) return;
    try {
      await api.post('/api/trade/buy', { ticker, quantity: qty });
      fetchData();
    } catch (err) { alert(err.response?.data?.error); }
  };

  const updateMyPrice = async (ticker) => {
    const p = prompt("Enter new market price:");
    if (!p) return;
    try {
      await api.patch('/api/stocks/update-price', { ticker, newPrice: p });
    } catch (err) { alert(err.response?.data?.error); }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666' }}>
            <Wallet size={20} /> <span>Available Cash</span>
          </div>
          <h1 style={{ color: '#10b981', margin: '10px 0' }}>${user.walletBalance.toLocaleString()}</h1>
        </div>
        <div style={{ ...cardStyle, borderLeft: '5px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666' }}>
            <TrendingUp size={20} /> <span>Total Net Worth (Live)</span>
          </div>
          <h1 style={{ color: '#3b82f6', margin: '10px 0' }}>${netWorth.toLocaleString()}</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>

        <div>
          <div style={cardStyle}>
            <h3 style={{ marginBottom: '20px' }}>Public Exchange</h3>

            {marketStocks.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center' }}>Рынок пуст. Создайте первую акцию!</p>
            ) : (
              marketStocks.map(stock => (
                <div key={stock.ticker} style={rowStyle}>
                  <div>
                    <span style={tickerBadge}>${stock.ticker}</span>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                      Owner: {stock.owner?.username || 'System'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                      ${(prices[stock.ticker] || stock.price).toFixed(2)}
                    </div>
                    {user.id !== stock.owner?._id ? (
                      <button onClick={() => handleBuy(stock.ticker)} style={btnBuy}>Buy Shares</button>
                    ) : (
                      <button onClick={() => updateMyPrice(stock.ticker)} style={btnManage}>Update Price</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {!user.ticker ? (
            <div style={cardStyle}>
              <h4 style={{ margin: '0 0 15px 0' }}><PlusCircle size={18} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Issue Stock</h4>
              <form onSubmit={handleCreateStock} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input style={inputStyle} placeholder="Ticker (e.g. BTC)" onChange={e => setNewStock({ ...newStock, ticker: e.target.value })} required />
                <input style={inputStyle} type="number" placeholder="Price" onChange={e => setNewStock({ ...newStock, price: e.target.value })} required />
                <button type="submit" style={btnPrimary}>Launch IPO</button>
              </form>
            </div>
          ) : (
            <div style={{ ...cardStyle, backgroundColor: '#eff6ff' }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#1e40af' }}><Settings size={18} /> Company Manager</h4>
              <p style={{ fontSize: '13px', color: '#3b82f6' }}>You are the CEO of <strong>${user.ticker}</strong></p>
            </div>
          )}

          <div style={cardStyle}>
            <h4 style={{ margin: '0 0 15px 0' }}><Briefcase size={18} /> Your Portfolio</h4>
            {portfolio.map(item => (
              <div key={item.ticker} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                <span>{item.ticker} ({item.sharesHeld})</span>
                <span style={{ fontWeight: '600' }}>${((prices[item.ticker] || item.lastKnownPrice) * item.sharesHeld).toLocaleString()}</span>
              </div>
            ))}
            {portfolio.length === 0 && <p style={{ fontSize: '12px', color: '#999' }}>No assets owned.</p>}
          </div>

        </div>
      </div>
    </div>
  );
};

const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #eee' };
const rowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #f9f9f9' };
const tickerBadge = { backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', color: '#475569' };
const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' };
const btnPrimary = { padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const btnBuy = { marginTop: '5px', padding: '4px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };
const btnManage = { marginTop: '5px', padding: '4px 12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };