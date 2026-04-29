import { useState } from 'react';
import axios from 'axios';
import { useMarket } from '../context/MarketContext';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', password: '' });
  const { setUser } = useMarket();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const path = isLogin ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}${path}`, form);
      if (isLogin) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
      } else {
        alert('Registered! Now login.');
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Auth failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
      <h2>{isLogin ? 'Login to PEX' : 'Create Account'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input placeholder="Username" onChange={e => setForm({...form, username: e.target.value})} required />
        <input type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} required />
        <button type="submit" style={{ padding: '10px', background: '#4e73df', color: 'white', border: 'none', borderRadius: '5px' }}>
          {isLogin ? 'Enter Market' : 'Register'}
        </button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#4e73df', marginTop: '10px', cursor: 'pointer' }}>
        {isLogin ? 'Need an account?' : 'Already have one?'}
      </button>
    </div>
  );
};