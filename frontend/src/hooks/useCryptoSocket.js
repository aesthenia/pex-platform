import { useEffect } from 'react';
import { useMarket } from '../context/MarketContext';

export const useCryptoSocket = (token) => {
  const { setPrices } = useMarket();

  useEffect(() => {
    if (!token) return;

    const socket = new WebSocket(import.meta.env.VITE_WS_URL, [token]);

    socket.onopen = () => {
      console.log('[WS] Connected to PEX Market');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'TICKER_UPDATE') {
          const { ticker, price } = data.payload;
          
          setPrices((prev) => ({
            ...prev,
            [ticker]: price
          }));
        }
      } catch (err) {
        console.error('[WS] Error parsing message:', err);
      }
    };

    socket.onclose = () => console.log('[WS] Disconnected');
    socket.onerror = (err) => console.error('[WS] Socket error', err);

    return () => socket.close();
  }, [token, setPrices]);
};