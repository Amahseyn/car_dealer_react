import React from 'react';
import { Link } from 'react-router-dom';
import api from './api';
import './Car.css';

function toPersianNumber(num) {
  if (num === null || num === undefined) return '';
  return num.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

const Car = ({ car, carType, isOwnerView, onAdDeleted }) => {
    if (!car) return null;

    const handleDelete = async (e) => {
        e.preventDefault(); // Prevent link navigation if the button is inside a link
        e.stopPropagation(); // Stop event bubbling

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

    const imageUrl = car.images && car.images.length > 0
        ? car.images[0].image
        : 'https://via.placeholder.com/300x200?text=No+Image';

    const getBadgeText = (type) => {
        if (type === 'used-cars') return 'کارکرده';
        if (type === 'havalehs') return 'حواله';
        return 'صفر';
    };

    return (
        <div className="car-card" title={car.title}>
            <span className="car-badge">{getBadgeText(carType)}</span>
            <img
                src={imageUrl}
                alt={car.title || 'تصویر خودرو'}
                className="car-image"
            />
            <div className="car-details">
                <h2 className="car-title">{car.title || 'بدون عنوان'}</h2>
                <p className="car-price">
                    {car.price != null ? `${toPersianNumber(car.price.toLocaleString('fa-IR'))} تومان` : 'قیمت نامشخص'}
                </p>
                {carType === 'havalehs' ? (
                    <div className="car-specs">
                        <span title="موقعیت مکانی">
                            <i className="fa fa-map-marker-alt" style={{ color: '#e91e63' }} /> {car.location || 'نامشخص'}
                        </span>
                        <span title="نوع تحویل">
                            <i className="fa fa-truck" style={{ color: '#007bff' }} /> {car.delivery_type || 'نامشخص'}
                        </span>
                    </div>
                ) : (
                    <div className="car-specs">
                        <span title="سال ساخت">
                            <i className="fa fa-calendar" style={{ color: '#007bff' }} /> {car.model_year || 'نامشخص'}
                        </span>
                        <span title="کارکرد">
                            <i className="fa fa-tachometer" style={{ color: '#388e3c' }} /> {car.mileage != null ? `${toPersianNumber(car.mileage.toLocaleString('fa-IR'))} کیلومتر` : 'نامشخص'}
                        </span>
                        <span title="رنگ">
                            <span className="color-dot" style={{ background: car.color || '#ccc' }} /> {car.color || 'نامشخص'}
                        </span>
                    </div>
                )}
                {isOwnerView ? (
                    <div className="owner-actions-card">
                        <Link to={`/edit-ad/${carType}/${car.id}`} className="action-button-card edit">
                            ویرایش
                        </Link>
                        <button onClick={handleDelete} className="action-button-card delete">
                            حذف
                        </button>
                    </div>
                ) : (
                    <Link to={`/${carType}/${car.id}`} className="details-button">
                        مشاهده جزئیات
                    </Link>
                )}
            </div>

        </div>
    );
};

export default Car;
