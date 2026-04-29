import { useMarket } from './context/MarketContext';
import { useCryptoSocket } from './hooks/useCryptoSocket';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';

function AppContent() {
  const { user } = useMarket();
  const token = localStorage.getItem('token');

  useCryptoSocket(user ? token : null);

  return (
    <div className="app">
      {!user ? <Auth /> : <Dashboard />}
    </div>
  );
}

export default function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fc' }}>
      <AppContent />
    </div>
  );
}