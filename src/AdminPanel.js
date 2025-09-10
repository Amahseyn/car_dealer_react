import React, { useState, useEffect, useCallback } from 'react';
import api from './api';
import { fetchAllPaginatedResults } from './apiHelpers';
import './AdminPanel.css';

const AdminPanel = () => {
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [validatedAds, setValidatedAds] = useState([]);
    const [pendingAds, setPendingAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newBrandName, setNewBrandName] = useState('');
    const [newModel, setNewModel] = useState({ name: '', brand: '' });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const brandsPromise = fetchAllPaginatedResults('/listings/brands/');
            const modelsPromise = fetchAllPaginatedResults('/listings/models/');
            const newCarsPromise = fetchAllPaginatedResults('/listings/new-cars/');
            const usedCarsPromise = fetchAllPaginatedResults('/listings/used-cars/');
            const havalehsPromise = fetchAllPaginatedResults('/listings/havalehs/');

            const [brandsData, modelsData, newCars, usedCars, havalehs] = await Promise.all([
                brandsPromise,
                modelsPromise,
                newCarsPromise,
                usedCarsPromise,
                havalehsPromise,
            ]);

            setBrands(brandsData);
            setModels(modelsData);

            const allAds = [
                ...newCars.map(ad => ({ ...ad, carType: 'new-cars' })),
                ...usedCars.map(ad => ({ ...ad, carType: 'used-cars' })),
                ...havalehs.map(ad => ({ ...ad, carType: 'havalehs' })),
            ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            const pending = [];
            const validated = [];
            allAds.forEach(ad => {
                if (ad.is_validated) {
                    validated.push(ad);
                } else {
                    pending.push(ad);
                }
            });

            setPendingAds(pending);
            setValidatedAds(validated);
        } catch (err) {
            setError('خطا در بارگذاری اطلاعات پنل مدیریت.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddBrand = async (e) => {
        e.preventDefault();
        if (!newBrandName) return;
        try {
            await api.post('/listings/brands/', { name: newBrandName });
            setNewBrandName('');
            fetchData(); // Refresh data
        } catch (err) {
            alert('خطا در افزودن برند.');
        }
    };

    const handleAddModel = async (e) => {
        e.preventDefault();
        if (!newModel.name || !newModel.brand) return;
        try {
            await api.post('/listings/models/', newModel);
            setNewModel({ name: '', brand: '' });
            fetchData(); // Refresh data
        } catch (err) {
            alert('خطا در افزودن مدل.');
        }
    };

    const handleValidateAd = async (ad) => {
        if (window.confirm(`آیا آگهی "${ad.title}" را تایید می‌کنید؟`)) {
            try {
                await api.patch(`/listings/${ad.carType}/${ad.id}/validate/`, { is_validated: true });
                fetchData(); // Refresh data to move the ad to the validated list
            } catch (err) {
                alert('خطا در تایید آگهی.');
            }
        }
    };

    const handleDeleteAd = async (ad) => {
        if (window.confirm(`آیا از حذف آگهی "${ad.title}" اطمینان دارید؟ این عمل غیرقابل بازگشت است.`)) {
            try {
                await api.delete(`/listings/${ad.carType}/${ad.id}/`);
                fetchData(); // Refresh data after deletion
                alert('آگهی با موفقیت حذف شد.');
            } catch (err) {
                alert('خطا در حذف آگهی.');
            }
        }
    };

    if (loading) return <div className="loading-spinner"></div>;
    if (error) return <p className="status-message error">{error}</p>;

    return (
        <div className="admin-panel">
            <h1>پنل مدیریت</h1>

            <div className="admin-section">
                <h2>مدیریت برندها و مدل‌ها</h2>
                <div className="admin-forms-grid">
                    <form onSubmit={handleAddBrand} className="admin-form">
                        <h3>افزودن برند جدید</h3>
                        <input
                            type="text"
                            value={newBrandName}
                            onChange={(e) => setNewBrandName(e.target.value)}
                            placeholder="نام برند"
                            required
                        />
                        <button type="submit" className="form-button">افزودن برند</button>
                    </form>

                    <form onSubmit={handleAddModel} className="admin-form">
                        <h3>افزودن مدل جدید</h3>
                        <select value={newModel.brand} onChange={(e) => setNewModel({ ...newModel, brand: e.target.value })} required>
                            <option value="">انتخاب برند</option>
                            {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                        </select>
                        <input
                            type="text"
                            value={newModel.name}
                            onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                            placeholder="نام مدل"
                            required
                        />
                        <button type="submit" className="form-button">افزودن مدل</button>
                    </form>
                </div>
                <div className="admin-list-container">
                    <div className="admin-list">
                        <h4>برندهای موجود</h4>
                        <div className="tag-list">{brands.map(b => <span key={b.id} className="tag">{b.name}</span>)}</div>
                    </div>
                    <div className="admin-list">
                        <h4>مدل‌های موجود</h4>
                        <div className="tag-list">{models.map(m => <span key={m.id} className="tag">{m.name}</span>)}</div>
                    </div>
                </div>
            </div>

            <div className="admin-section">
                <h2>آگهی‌های در انتظار تایید ({pendingAds.length})</h2>
                <div className="ad-validation-list">
                    {pendingAds.length > 0 ? (
                        pendingAds.map(ad => (
                            <div key={`${ad.carType}-${ad.id}`} className="ad-item pending">
                                <div className="ad-info">
                                    <strong>{ad.title}</strong>
                                    <span>({ad.car_model_name || 'مدل نامشخص'})</span>
                                    <span className="ad-user">آگهی‌دهنده: {ad.user_full_name || `کاربر ${ad.user}`}</span>
                                </div>
                                <div className="ad-actions">
                                    <a href={`/${ad.carType}/${ad.id}`} target="_blank" rel="noopener noreferrer" className="admin-action-btn view"><i className="fas fa-eye"></i> مشاهده</a>
                                    <button onClick={() => handleValidateAd(ad)} className="admin-action-btn validate"><i className="fas fa-check"></i> تایید</button>
                                    <button onClick={() => handleDeleteAd(ad)} className="admin-action-btn delete"><i className="fas fa-trash"></i> حذف</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>هیچ آگهی در انتظار تاییدی وجود ندارد.</p>
                    )}
                </div>
            </div>

            <div className="admin-section">
                <h2>آگهی‌های تایید شده ({validatedAds.length})</h2>
                <div className="ad-validation-list">
                    {validatedAds.length > 0 ? (
                        validatedAds.map(ad => (
                            <div key={`${ad.carType}-${ad.id}`} className="ad-item validated">
                                <div className="ad-info">
                                    <strong>{ad.title}</strong>
                                    <span className="ad-user">آگهی‌دهنده: {ad.user_full_name || `کاربر ${ad.user}`}</span>
                                </div>
                                <div className="ad-actions">
                                    <a href={`/${ad.carType}/${ad.id}`} target="_blank" rel="noopener noreferrer" className="admin-action-btn view"><i className="fas fa-eye"></i> مشاهده</a>
                                    <button onClick={() => handleDeleteAd(ad)} className="admin-action-btn delete"><i className="fas fa-trash"></i> حذف</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>هیچ آگهی در انتظار تاییدی وجود ندارد.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;