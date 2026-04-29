import { createContext, useState, useContext, useMemo } from 'react';

const MarketContext = createContext();

export const MarketProvider = ({ children }) => {
  const [prices, setPrices] = useState({});
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const netWorth = useMemo(() => {
    if (!user) return 0;
    const assetsValue = portfolio.reduce((sum, item) => {
      const currentPrice = prices[item.ticker] || item.lastKnownPrice || 0;
      return sum + (item.sharesHeld * currentPrice);
    }, 0);
    return user.walletBalance + assetsValue;
  }, [user, portfolio, prices]);

  return (
    <MarketContext.Provider value={{ 
      prices, setPrices, 
      user, setUser, 
      portfolio, setPortfolio, 
      netWorth 
    }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => useContext(MarketContext);