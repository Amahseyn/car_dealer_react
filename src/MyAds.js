import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';
import Car from './Car';
import { fetchAllPaginatedResults } from './apiHelpers';
import './CarList.css'; // Reusing the same styles

const MyAds = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const fetchMyAds = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        setError(null);
        try {
            const newCarsPromise = fetchAllPaginatedResults(`/listings/new-cars/?user=${user.id}`);
            const usedCarsPromise = fetchAllPaginatedResults(`/listings/used-cars/?user=${user.id}`);
            const havalehsPromise = fetchAllPaginatedResults(`/listings/havalehs/?user=${user.id}`);

            const [newCars, usedCars, havalehs] = await Promise.all([newCarsPromise, usedCarsPromise, havalehsPromise]);

            const allAds = [
                ...newCars.map(ad => ({ ...ad, carType: 'new-cars' })),
                ...usedCars.map(ad => ({ ...ad, carType: 'used-cars' })),
                ...havalehs.map(ad => ({ ...ad, carType: 'havalehs' })),
            ];

            allAds.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setAds(allAds);
        } catch (err) {
            setError('خطا در دریافت آگهی‌ها. لطفا دوباره تلاش کنید.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchMyAds();
    }, [fetchMyAds]);

    if (loading) {
        return <p className="status-message">در حال بارگذاری آگهی‌های شما...</p>;
    }

    if (error) {
        return <p className="status-message error">{error}</p>;
    }

    return (
        <div>
            <Link to="/" className="back-link">← بازگشت به صفحه اصلی</Link>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>آگهی‌های من</h2>
            <div className="car-list-container">
                {ads.length > 0 ? ads.map(ad => (
                    <Car key={`${ad.carType}-${ad.id}`} car={ad} carType={ad.carType} isOwnerView={true} onAdDeleted={fetchMyAds} />
                )) : <p className="status-message">شما هنوز هیچ آگهی ثبت نکرده‌اید.</p>}
            </div>
        </div>
    );
};

export default MyAds;