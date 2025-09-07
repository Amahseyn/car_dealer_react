import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import CarList from './CarList';
import CarDetail from './CarDetail';
import Login from './Login';
import { useAuth } from './AuthContext';
import api from './api';
import CreateAd from './CreateAd';
import ProtectedRoute from './ProtectedRoute';
import './CreateAd.css';
import './ImageManager.css';
import AdminPanel from './AdminPanel';
import MyAds from './MyAds';
import './forms.css';

function App() {
  const [newCars, setNewCars] = useState([]);
  const [usedCars, setUsedCars] = useState([]);
  const [havalehs, setHavalehs] = useState([]);
  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingUsed, setLoadingUsed] = useState(true);
  const [loadingHavaleh, setLoadingHavaleh] = useState(true);
  const [errorNew, setErrorNew] = useState(null);
  const [errorUsed, setErrorUsed] = useState(null);
  const [errorHavaleh, setErrorHavaleh] = useState(null);
  const { user, isLoggedIn, logout } = useAuth();

  useEffect(() => {
    const fetchAllCars = async () => {
      try {
        const { data } = await api.get('/listings/new-cars/');
        setNewCars(data.results || []);
      } catch (e) {
        setErrorNew(`خطا در دریافت خودروهای صفر: ${e.message}`);
      } finally {
        setLoadingNew(false);
      }

      try {
        const { data } = await api.get('/listings/used-cars/');
        setUsedCars(data.results || []);
      } catch (e) {
        setErrorUsed(`خطا در دریافت خودروهای کارکرده: ${e.message}`);
      } finally {
        setLoadingUsed(false);
      }

      try {
        const { data } = await api.get('/listings/havalehs/');
        setHavalehs(data.results || []);
      } catch (e) {
        setErrorHavaleh(`خطا در دریافت حواله‌ها: ${e.message}`);
      } finally {
        setLoadingHavaleh(false);
      }
    };
    fetchAllCars();
  }, []);

  return (
    <Router>
      <div className="App" dir="rtl">
        <header className="app-header">
          <div className="header-main">
            <div className="header-branding">
                <div className="header-title">سامانه مدیریت خودرو</div>
                <div className="header-subtitle">نمایشگاه خودرو</div>
            </div>
            <nav className="header-nav">
              <Link to="/new-cars" className="header-link">خودروهای صفر</Link>
              <Link to="/used-cars" className="header-link">خودروهای کارکرده</Link>
              <Link to="/havalehs" className="header-link">حواله‌ها</Link>
              {isLoggedIn && user ? (
                  <>
                    {user.is_staff && <Link to="/admin-panel" className="header-link">پنل مدیریت</Link>}
                    <Link to="/my-ads" className="header-link">آگهی‌های من</Link>
                    <Link to="/create-ad" className="header-link">ثبت آگهی جدید</Link>
                    <span className="header-user">خوش آمدید، {user.full_name}</span>
                    <Link to="/" onClick={logout} className="header-link">خروج</Link>
                  </>
                ) : (
                  <Link to="/login" className="header-link">ورود</Link>
              )}
            </nav>
          </div>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/new-cars" />} />
            <Route path="/new-cars" element={<CarList cars={newCars} loading={loadingNew} error={errorNew} title="خودروهای صفر" carType="new-cars" />} />
            <Route path="/used-cars" element={<CarList cars={usedCars} loading={loadingUsed} error={errorUsed} title="خودروهای کارکرده" carType="used-cars" />} />
            <Route path="/havalehs" element={<CarList cars={havalehs} loading={loadingHavaleh} error={errorHavaleh} title="حواله‌ها" carType="havalehs" />} />
            <Route path="/new-cars/:id" element={<CarDetail />} />
            <Route path="/used-cars/:id" element={<CarDetail />} />
            <Route path="/havalehs/:id" element={<CarDetail />} />
            <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login />} />
            <Route path="/create-ad" element={<ProtectedRoute><CreateAd /></ProtectedRoute>} />
            <Route path="/edit-ad/:carType/:id" element={<ProtectedRoute><CreateAd /></ProtectedRoute>} />
            <Route path="/admin-panel" element={<ProtectedRoute adminOnly={true}><AdminPanel /></ProtectedRoute>} />
            <Route path="/my-ads" element={<ProtectedRoute><MyAds /></ProtectedRoute>} />
          </Routes>
        </main>
        <footer className="app-footer">
            <p>&copy; {new Date().getFullYear()} نمایشگاه خودرو. تمام حقوق محفوظ است.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;