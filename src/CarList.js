import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Car from './Car';
import SearchFilter from './SearchFilter';
import api from './api';
import './CarList.css';
import './SearchFilter.css';

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

const CarList = ({ title, carType }) => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({});

    const fetchCars = useCallback(async (currentFilters) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams(currentFilters).toString();
            const endpoint = `/listings/${carType}/?${params}`;
            const { data } = await api.get(endpoint);
            setCars(data.results || []);
        } catch (e) {
            setError(`خطا در دریافت لیست خودروها: ${e.message}`);
            setCars([]);
        } finally {
            setLoading(false);
        }
    }, [carType]);

    useEffect(() => {
        fetchCars(filters);
    }, [filters, fetchCars]);

    const renderContent = () => {
        if (loading) {
            // Display skeleton loaders while content is loading
            return [...Array(6)].map((_, i) => <CarSkeleton key={i} />);
        }

        if (error) {
            return <p className="status-message error">{error}</p>;
        }

        if (!cars || cars.length === 0) {
            return <p className="status-message">در حال حاضر خودرویی برای نمایش وجود ندارد.</p>;
        }

        return cars.map(car => (
            <Car key={car.id} car={car} carType={carType} />
        ));
    };

    return (
        <div>
            <Link to="/" className="back-link">← بازگشت به صفحه اصلی</Link>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>{title}</h2>
            <SearchFilter carType={carType} onFilter={setFilters} />
            <div className="car-list-container">
                {renderContent()}
            </div>
        </div>
    );
};

export default CarList;