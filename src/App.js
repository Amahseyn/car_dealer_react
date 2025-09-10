import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import CarList from './CarList';
import CarDetail from './CarDetail';
import Login from './Login';
import { useAuth } from './AuthContext';
import CreateAd from './CreateAd';
import ProtectedRoute from './ProtectedRoute';
import './CreateAd.css';
import AllAdsList from './AllAdsList';
import './ImageManager.css';
import AdminPanel from './AdminPanel';
import MyAds from './MyAds';
import './forms.css';

const AppLayout = () => {
  const { user, isLoggedIn, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const textButtonRef = useRef(null);

  // بستن منو وقتی مسیر تغییر می‌کنه
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // بستن منو با کلیک بیرون از آن
  useEffect(() => {
    const handleClickOutside = (event) => {
      // اگر منو باز باشد و کلیک خارج از منو و دکمه‌های آن باشد، منو را ببند
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target) &&
        textButtonRef.current &&
        !textButtonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]); // این افکت به isMenuOpen وابسته است

  const toggleMenu = () => {
    console.log('Menu toggled, isMenuOpen:', !isMenuOpen); // برای دیباگ
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    handleLinkClick();
  };

  return (
    <div className="App" dir="rtl">
      <header className="app-header">
        <div className="header-main">
          <Link to="/" className="header-branding-link" onClick={handleLinkClick}>
            <div className="header-branding">
              <div className="header-title">سامانه مدیریت خودرو</div>
              <div className="header-subtitle">نمایشگاه خودرو</div>
            </div>
          </Link>
          <nav ref={menuRef} className={`header-nav ${isMenuOpen ? 'open' : ''}`}>
            <Link to="/new-cars" className="header-link" onClick={handleLinkClick}>خودروهای صفر</Link>
            <Link to="/used-cars" className="header-link" onClick={handleLinkClick}>خودروهای کارکرده</Link>
            <Link to="/havalehs" className="header-link" onClick={handleLinkClick}>حواله‌ها</Link>

            {isLoggedIn && user ? (
              <>
                {user.is_staff && (
                  <Link to="/admin-panel" className="header-link" onClick={handleLinkClick}>
                    پنل مدیریت
                  </Link>
                )}
                <Link to="/my-ads" className="header-link" onClick={handleLinkClick}>آگهی‌های من</Link>
                <Link to="/create-ad" className="header-link" onClick={handleLinkClick}>ثبت آگهی جدید</Link>
                <span className="header-user">خوش آمدید، {user.full_name}</span>
                <Link to="/" onClick={handleLogout} className="header-link">خروج</Link>
              </>
            ) : (
              <Link to="/login" className="header-link" onClick={handleLinkClick}>ورود</Link>
            )}
          </nav>

          {/* دکمه همبرگری */}
          <button ref={hamburgerRef} className="hamburger-menu" onClick={toggleMenu} aria-label="Toggle menu">
            <i className={isMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
          </button>
          {/* دکمه متنی اضافی برای باز کردن منو (اختیاری) */}
          <button ref={textButtonRef} className="toggle-menu-btn" onClick={toggleMenu}>
            {isMenuOpen ? 'بستن منو' : 'باز کردن منو'}
          </button>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<AllAdsList title="آخرین آگهی‌ها" />} />
          <Route path="/new-cars" element={<CarList title="خودروهای صفر" carType="new-cars" />} />
          <Route path="/used-cars" element={<CarList title="خودروهای کارکرده" carType="used-cars" />} />
          <Route path="/havalehs" element={<CarList title="حواله‌ها" carType="havalehs" />} />
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
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;