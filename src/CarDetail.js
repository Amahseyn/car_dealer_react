import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from './api';
import './CarDetail.css';
import ImageManager from './ImageManager';

const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

function toPersianNumber(num) {
  if (num === null || num === undefined) return '';
  return num.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

function formatPersianDate(dateStr) {
  if (!dateStr) return '';
  const [date, time] = dateStr.split(' ');
  const [year, month, day] = date.split('-');
  const monthName = persianMonths[parseInt(month, 10) - 1] || '';
  return ` ${toPersianNumber(day)} ${monthName} ${toPersianNumber(year)} — ساعت ${toPersianNumber(time)}`;
}

// Helper to format choice fields like { value: '...', display: '...' }
const displayFormat = v => (v && v.display ? v.display : v);

const specFields = [
  { key: 'car_model_name', label: 'مدل' },
  { key: 'model_year', label: 'سال ساخت', format: toPersianNumber },
  { key: 'color', label: 'رنگ' },
  { key: 'location', label: 'موقعیت' },
  { key: 'settlement_status', label: 'وضعیت تسویه', format: displayFormat },
  { key: 'sale_condition', label: 'شرایط فروش', format: displayFormat },
  { key: 'fuel_type', label: 'نوع سوخت', format: displayFormat },
  { key: 'production_type', label: 'نوع تولید', format: displayFormat },
  { key: 'usage_type', label: 'نوع کاربری', format: displayFormat },
  { key: 'mileage', label: 'کارکرد', format: v => v != null ? `${toPersianNumber(v.toLocaleString('fa-IR'))} کیلومتر` : '' },
  { key: 'document_type', label: 'نوع سند' },
  { key: 'insurance_months_left', label: 'بیمه (ماه)', format: toPersianNumber },
  { key: 'can_exchange', label: 'امکان معاوضه', format: v => (v ? 'بله' : 'خیر') },
  { key: 'delivery_type', label: 'نوع تحویل' },
  { key: 'sales_plan', label: 'طرح فروش' },
  { key: 'seller_gender', label: 'جنسیت فروشنده' },
  { key: 'features', label: 'ویژگی‌ها' },
  { key: 'created_at', label: 'تاریخ ثبت', format: formatPersianDate },
];

const CarDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    // When the images array changes (e.g., after deletion),
    // ensure the selected index is not out of bounds.
    if (images.length > 0 && selectedImageIndex >= images.length) {
      setSelectedImageIndex(images.length - 1);
    }
  }, [images, selectedImageIndex]);

  const pathParts = location.pathname.split('/').filter(Boolean);
  const carType = pathParts.length > 1 ? pathParts[0] : null;
  const endpoint = carType ? `/listings/${carType}/${id}/` : null;

  useEffect(() => {
    const fetchCarDetails = async () => {
      if (!endpoint) {
        setError("خطا: نوع آگهی برای دریافت جزئیات مشخص نیست.");
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get(endpoint);
        setCar(data);
        setImages(data.images || []);
        setSelectedImageIndex(0); // Reset index when a new car is loaded
      } catch (e) {
        setError(`خطا در دریافت جزئیات خودرو: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchCarDetails();
  }, [id, endpoint]); // Dependency on endpoint ensures re-fetch if carType changes

  const handleDelete = async () => {
    if (window.confirm('آیا از حذف این آگهی اطمینان دارید؟')) {
      try {
        await api.delete(endpoint);
        alert('آگهی با موفقیت حذف شد.');
        navigate(`/${carType}`);
      } catch (e) {
        alert('خطا در حذف آگهی.');
        console.error('Delete error:', e);
      }
    }
  };

  const handleValidate = async () => {
    if (window.confirm('آیا این آگهی را تایید می‌کنید؟')) {
      try {
        const { data } = await api.patch(`/listings/${carType}/${id}/validate/`, { is_validated: true });
        setCar(data); // Update the car state with the validated data
        alert('آگهی با موفقیت تایید شد.');
      } catch (e) {
        alert('خطا در تایید آگهی.');
        console.error('Validation error:', e);
      }
    }
  };

  const handleNextImage = () => {
    if (images.length === 0) return;
    setSelectedImageIndex(prevIndex => (prevIndex + 1) % images.length);
  };

  const handlePrevImage = () => {
    if (images.length === 0) return;
    setSelectedImageIndex(prevIndex => (prevIndex - 1 + images.length) % images.length);
  };

  if (loading) return <p className="status-message">در حال بارگذاری...</p>;
  if (error) return <p className="status-message error">{error}</p>;
  if (!car) return <p className="status-message">خودرو پیدا نشد.</p>;

  const availableFields = specFields.filter(field => car[field.key] != null && car[field.key] !== '' && car[field.key] !== false);
  const isOwner = isLoggedIn && user && user.id === car.user;
  const selectedImageUrl = images[selectedImageIndex]?.image || 'https://via.placeholder.com/600x400?text=No+Image';

  return (
    <div className="car-detail-container">
      <Link to={carType ? `/${carType}` : "/"} className="back-link">← بازگشت به لیست</Link>
      <div className="car-detail-grid">
        <div className="car-detail-gallery">
            <div className="main-image-container">
                {images.length > 1 && (
                    <button onClick={handlePrevImage} className="gallery-nav-btn prev-btn" aria-label="Previous Image">‹</button>
                )}
                <img src={selectedImageUrl} alt={car.title} className="car-detail-main-image" />
                {images.length > 1 && (
                    <button onClick={handleNextImage} className="gallery-nav-btn next-btn" aria-label="Next Image">›</button>
                )}
            </div>
            {/* {images.length > 1 && (
                <div className="thumbnail-container">
                    {images.map((img, index) => (
                        <img key={img.id} src={img.image} alt="Thumbnail" className={`thumbnail-image ${selectedImageIndex === index ? 'active' : ''}`} onClick={() => setSelectedImageIndex(index)} />
                    ))}
                </div>
            )} */}
        </div>
        <div className="car-detail-main-info">
            <h1 className="car-detail-title">{car.title}</h1>
            {!car.is_validated && <span className="validation-badge pending">در انتظار تایید</span>}
            {car.is_validated && <span className="validation-badge validated">تایید شده</span>}
            <p className="car-detail-price">{car.price != null ? `${toPersianNumber(car.price.toLocaleString('fa-IR'))} تومان` : 'تماس بگیرید'}</p>
            {isOwner && (
                <div className="owner-actions">
                    <Link to={`/edit-ad/${carType}/${id}`} className="action-button edit">ویرایش</Link>
                    <button onClick={handleDelete} className="action-button delete">حذف</button>
                </div>
            )}
            {isLoggedIn && user?.is_staff && !car.is_validated && (
                <div className="owner-actions">
                    <button onClick={handleValidate} className="action-button validate">تایید آگهی</button>
                </div>
            )}
            <div className="car-detail-specs">
                {availableFields.map(field => (
                    <div key={field.key} className="spec-item">
                        <span className="spec-label">{field.label}:</span>
                        <span className="spec-value">
                            {field.format ? field.format(car[field.key]) : (car[field.key] ?? '')}
                        </span>
                    </div>
                ))}
            </div>
        </div>
      </div>
      {isOwner && (
        <ImageManager
            adId={car.id}
            adCarType={carType}
            images={images}
            onUpdate={setImages}
        />
      )}
    </div>
  );
};

export default CarDetail;