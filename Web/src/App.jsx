import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import Signup from './Page/Signup';
import Login from './Page/Login';
import Dashboard from './Page/Dashboard';
import { UserData } from './Context/Context';
import api from './Api/api';
import './App.css';

function App() {
  const { userLoggedin, setUser, setUserLoggedin, user } = useContext(UserData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    try {
      const apiRes = await api.get('me');
      if (apiRes?.data?.user) {
        setUser(apiRes.data.user);
        setUserLoggedin(true);
      } else {
        setUser(null);
        setUserLoggedin(false);
      }
    } catch (e) {
      setUser(null);
      setUserLoggedin(false);
      console.error("Auth check failed:", e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#12110D] text-[#D4AF37]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#D4AF37] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Routes>
      {userLoggedin && user ? (
        <>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      ) : (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
}

export default App;