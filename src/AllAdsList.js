import React, { useState, useEffect, useCallback } from 'react';
import Car from './Car';
import api from './api';
import { fetchAllPaginatedResults } from './apiHelpers';
import './CarList.css';

const CarSkeleton = () => (
    <div className="car-card skeleton">
        <div className="skeleton-image" />
        <div className="car-details">
            <div className="skeleton-text" style={{ width: '70%', height: '1.5rem' }} />
            <div className="skeleton-text" style={{ width: '40%' }} />
            <div className="car-specs">
                <div className="skeleton-text" style={{ width: '20%' }} />
                <div className="skeleton-text" style={{ width: '30%' }} />
                <div className="skeleton-text" style={{ width: '25%' }} />
            </div>
            <div className="skeleton-button" />
        </div>
    </div>
);

const AllAdsList = ({ title }) => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllAds = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const newCarsPromise = fetchAllPaginatedResults('/listings/new-cars/');
            const usedCarsPromise = fetchAllPaginatedResults('/listings/used-cars/');
            const havalehsPromise = fetchAllPaginatedResults('/listings/havalehs/');

            const [newCars, usedCars, havalehs] = await Promise.all([
                newCarsPromise,
                usedCarsPromise,
                havalehsPromise,
            ]);

            const allAds = [
                ...newCars.map(ad => ({ ...ad, carType: 'new-cars', adTypeName: 'خودروی صفر' })),
                ...usedCars.map(ad => ({ ...ad, carType: 'used-cars', adTypeName: 'خودروی کارکرده' })),
                ...havalehs.map(ad => ({ ...ad, carType: 'havalehs', adTypeName: 'حواله' })),
            ];

            allAds.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setAds(allAds);
        } catch (e) {
            setError(`خطا در دریافت لیست آگهی‌ها: ${e.message}`);
            setAds([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllAds();
    }, [fetchAllAds]);

    const renderContent = () => {
        if (loading) return [...Array(6)].map((_, i) => <CarSkeleton key={i} />);
        if (error) return <p className="status-message error">{error}</p>;
        if (!ads || ads.length === 0) return <p className="status-message">در حال حاضر آگهی برای نمایش وجود ندارد.</p>;

        return ads.map(ad => (
            <Car key={`${ad.carType}-${ad.id}`} car={ad} carType={ad.carType} />
        ));
    };

    return (
        <div>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>{title}</h2>
            <div className="car-list-container">
                {renderContent()}
            </div>
        </div>
    );
};

export default AllAdsList;