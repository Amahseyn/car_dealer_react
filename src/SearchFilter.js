import React, { useState } from 'react';
import { useChoices } from './ChoicesContext';
import './SearchFilter.css';

const SearchFilter = ({ carType, onFilter }) => {
    const { choices } = useChoices();
    const [isExpanded, setIsExpanded] = useState(false);

    const getInitialState = () => ({
        title: '',
        car_model_name: '',
        location: '',
        min_price: '',
        max_price: '',
        sale_condition: '',
        fuel_type: '',
        settlement_status: '',
        production_type: '',
        usage_type: '',
        model_year__gte: '',
        model_year__lte: '',
        mileage__gte: '',
        mileage__lte: '',
        document_type: '',
        can_exchange: '',
        delivery_type: '',
        sales_plan: '',
        seller_gender: '',
    });

    const [filters, setFilters] = useState(getInitialState());

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFilters({ ...filters, [name]: checked ? 'true' : '' });
        } else {
            setFilters({ ...filters, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const activeFilters = Object.fromEntries(
            Object.entries(filters).filter(([, v]) => v !== '' && v !== null)
        );
        onFilter(activeFilters);
    };

    const handleReset = () => {
        setFilters(getInitialState());
        onFilter({});
    };

    return (
        <div className="search-filter-container">
            <button onClick={() => setIsExpanded(!isExpanded)} className={`filter-toggle-button ${isExpanded ? 'expanded' : ''}`}>
                <span><i className="fa fa-search" style={{ marginLeft: '8px' }}></i>جستجو و فیلتر پیشرفته</span>
                <span className="toggle-icon">
                    <i className="fa fa-chevron-down"></i>
                </span>
            </button>
            {isExpanded && (
                <form onSubmit={handleSubmit} className="filter-form">
                    <div className="filter-grid">
                        {/* Common Fields */}
                        <div className="filter-input-group">
                            <i className="fa fa-pencil-alt input-icon"></i>
                            <input type="text" name="title" value={filters.title} onChange={handleChange} placeholder="عنوان آگهی (مثلا فروش ویژه)" />
                        </div>
                        <div className="filter-input-group">
                            <i className="fa fa-car input-icon"></i>
                            <input type="text" name="car_model_name" value={filters.car_model_name} onChange={handleChange} placeholder="نام خودرو (مثلا پژو 207)" />
                        </div>
                        <div className="filter-input-group">
                            <i className="fa fa-map-marker-alt input-icon"></i>
                            <input type="text" name="location" value={filters.location} onChange={handleChange} placeholder="موقعیت (مثلا تهران)" />
                        </div>
                        <div className="filter-input-group">
                            <i className="fa fa-money-bill-wave input-icon"></i>
                            <input type="number" name="min_price" value={filters.min_price} onChange={handleChange} placeholder="حداقل قیمت (تومان)" />
                        </div>
                        <div className="filter-input-group">
                            <i className="fa fa-money-bill-wave input-icon"></i>
                            <input type="number" name="max_price" value={filters.max_price} onChange={handleChange} placeholder="حداکثر قیمت (تومان)" />
                        </div>
                        <select name="sale_condition" value={filters.sale_condition} onChange={handleChange}>
                            <option value="">همه شرایط فروش</option>
                            {choices?.sale_condition?.map(c => <option key={c.value} value={c.value}>{c.display}</option>)}
                        </select>

                        {/* New/Used Car Fields */}
                        {carType !== 'havalehs' && (
                            <>
                                <select name="fuel_type" value={filters.fuel_type} onChange={handleChange}>
                                    <option value="">همه انواع سوخت</option>
                                    {choices?.fuel_type?.map(c => <option key={c.value} value={c.value}>{c.display}</option>)}
                                </select>
                                <select name="settlement_status" value={filters.settlement_status} onChange={handleChange}>
                                    <option value="">همه وضعیت‌های تسویه</option>
                                    {choices?.settlement_status?.map(c => <option key={c.value} value={c.value}>{c.display}</option>)}
                                </select>
                                <select name="production_type" value={filters.production_type} onChange={handleChange}>
                                    <option value="">همه انواع تولید</option>
                                    {choices?.production_type?.map(c => <option key={c.value} value={c.value}>{c.display}</option>)}
                                </select>
                                <select name="usage_type" value={filters.usage_type} onChange={handleChange}>
                                    <option value="">همه انواع کاربری</option>
                                    {choices?.usage_type?.map(c => <option key={c.value} value={c.value}>{c.display}</option>)}
                                </select>
                                <div className="filter-input-group">
                                    <i className="fa fa-calendar-alt input-icon"></i>
                                    <input type="number" name="model_year__gte" value={filters.model_year__gte} onChange={handleChange} placeholder="از سال ساخت" />
                                </div>
                                <div className="filter-input-group">
                                    <i className="fa fa-calendar-alt input-icon"></i>
                                    <input type="number" name="model_year__lte" value={filters.model_year__lte} onChange={handleChange} placeholder="تا سال ساخت" />
                                </div>
                            </>
                        )}

                        {/* Used Car Fields */}
                        {carType === 'used-cars' && (
                            <>
                                <div className="filter-input-group">
                                    <i className="fa fa-tachometer-alt input-icon"></i>
                                    <input type="number" name="mileage__gte" value={filters.mileage__gte} onChange={handleChange} placeholder="حداقل کارکرد (کیلومتر)" />
                                </div>
                                <div className="filter-input-group">
                                    <i className="fa fa-tachometer-alt input-icon"></i>
                                    <input type="number" name="mileage__lte" value={filters.mileage__lte} onChange={handleChange} placeholder="حداکثر کارکرد (کیلومتر)" />
                                </div>
                                <select name="document_type" value={filters.document_type} onChange={handleChange}>
                                    <option value="">همه انواع سند</option>
                                    {choices?.document_type?.map(c => <option key={c.value} value={c.value}>{c.display}</option>)}
                                </select>
                                <div className="checkbox-container-filter">
                                    <input type="checkbox" id="can_exchange_filter" name="can_exchange" checked={filters.can_exchange === 'true'} onChange={handleChange} />
                                    <label htmlFor="can_exchange_filter">فقط آگهی‌های قابل معاوضه</label>
                                </div>
                            </>
                        )}

                        {/* Havaleh Fields */}
                        {carType === 'havalehs' && (
                            <>
                                <select name="delivery_type" value={filters.delivery_type} onChange={handleChange}>
                                    <option value="">همه انواع تحویل</option>
                                    {choices?.delivery_type?.map(c => <option key={c.value} value={c.value}>{c.display}</option>)}
                                </select>
                                <select name="sales_plan" value={filters.sales_plan} onChange={handleChange}>
                                    <option value="">همه طرح‌های فروش</option>
                                    {choices?.sales_plan?.map(c => <option key={c.value} value={c.value}>{c.display}</option>)}
                                </select>
                                <select name="seller_gender" value={filters.seller_gender} onChange={handleChange}>
                                    <option value="">همه فروشندگان</option>
                                    {choices?.seller_gender?.map(c => <option key={c.value} value={c.value}>{c.display}</option>)}
                                </select>
                            </>
                        )}
                    </div>
                    <div className="filter-actions">
                        <button type="submit" className="form-button primary">اعمال فیلتر</button>
                        <button type="button" onClick={handleReset} className="form-button secondary">پاک کردن فیلترها</button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default SearchFilter;