import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from './api';
import './Car.css';

// Helper to format numbers to Persian
function toPersianNumber(num) {
    if (num === null || num === undefined) return '';
    return num.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

const Car = ({ car, carType, isOwnerView = false, onAdDeleted }) => {
    const navigate = useNavigate();

    const handleDelete = async (e) => {
        e.stopPropagation(); // Prevent navigation
        if (window.confirm('آیا از حذف این آگهی اطمینان دارید؟')) {
            try {
                await api.delete(`/listings/${carType}/${car.id}/`);
                alert('آگهی با موفقیت حذف شد.');
                if (onAdDeleted) {
                    onAdDeleted();
                }
            } catch (err) {
                alert('خطا در حذف آگهی.');
                console.error('Delete error:', err);
            }
        }
    };

    const handleEdit = (e) => {
        e.stopPropagation(); // Prevent navigation
        navigate(`/edit-ad/${carType}/${car.id}`);
    };

    const handleContactClick = (e) => {
        e.stopPropagation();
        alert('برای هماهنگی و اطلاعات بیشتر با شماره 09361400384 تماس بگیرید.');
    };

    return (
        <div className="car-card">
            {car.adTypeName && <div className="car-badge">{car.adTypeName}</div>}
            <img src={car.images && car.images.length > 0 ? car.images[0].image : 'https://via.placeholder.com/400x225?text=No+Image'} alt={car.title} className="car-image" />
            <div className="car-details">
                <h2 className="car-title">{car.title}</h2>
                <p className="car-price">{car.price ? `${toPersianNumber(car.price.toLocaleString('fa-IR'))} تومان` : 'تماس بگیرید'}</p>
                <div className="car-specs">
                    {car.model_year && <span><i className="fa fa-calendar-alt"></i> {toPersianNumber(car.model_year)}</span>}
                    {car.mileage != null && <span><i className="fa fa-tachometer-alt"></i> {toPersianNumber(car.mileage.toLocaleString('fa-IR'))}</span>}
                    {car.location && <span><i className="fa fa-map-marker-alt"></i> {car.location}</span>}
                </div>
                <div className="card-actions">
                    <Link to={`/${carType}/${car.id}`} className="card-btn details-button">مشاهده جزئیات</Link>
                    <button onClick={handleContactClick} className="card-btn contact-button">تماس</button>
                </div>
                {isOwnerView && <div className="owner-actions-card"><button onClick={handleEdit} className="card-btn edit">ویرایش</button><button onClick={handleDelete} className="card-btn delete">حذف</button></div>}
            </div>
        </div>
    );
};

export default Car;