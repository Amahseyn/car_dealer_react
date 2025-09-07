import React, { useState } from 'react';
import api from './api';
import { useChoices } from './ChoicesContext';
import './ImageManager.css';

const ImageManager = ({ adId, adCarType, images = [], onUpdate }) => {
    const [newFiles, setNewFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const { choices } = useChoices();

    const handleFileChange = (e) => {
        setNewFiles([...e.target.files]);
    };

    const handleDelete = async (imageId) => {
        if (window.confirm('آیا از حذف این تصویر اطمینان دارید؟')) {
            try {
                await api.delete(`/listings/images/${imageId}/`);
                const updatedImages = images.filter(img => img.id !== imageId);
                onUpdate(updatedImages); // Notify parent
            } catch (err) {
                setError('خطا در حذف تصویر.');
            }
        }
    };

    const handleUpload = async () => {
        if (newFiles.length === 0) return;

        setIsUploading(true);
        setError('');

        const formData = new FormData();
        const contentTypeMap = {
            'new-cars': 'new_car',
            'used-cars': 'used_car',
            'havalehs': 'havaleh'
        };
        const contentTypeKey = contentTypeMap[adCarType];
        const contentTypeId = choices?.advertisement_types?.[contentTypeKey];

        if (!contentTypeId) {
            setError('خطا: نوع محتوای آگهی برای آپلود تصویر یافت نشد.');
            setIsUploading(false);
            return;
        }

        newFiles.forEach(file => {
            formData.append('image', file);
        });
        formData.append('object_id', adId);
        formData.append('content_type', contentTypeId);

        try {
            const { data: uploadedImages } = await api.post('/listings/images/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const updatedImages = [...images, ...uploadedImages];
            setNewFiles([]);
            onUpdate(updatedImages); // Notify parent
        } catch (err) {
            setError('آپلود ناموفق بود. لطفا دوباره تلاش کنید.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="image-manager">
            <h4>مدیریت تصاویر</h4>
            {error && <p className="error-message">{error}</p>}
            <div className="image-grid">
                {images.map(img => (
                    <div key={img.id} className="image-thumbnail">
                        <img src={img.image} alt="تصویر آگهی" />
                        <button onClick={() => handleDelete(img.id)} className="delete-btn">&times;</button>
                    </div>
                ))}
            </div>
            <div className="upload-section">
                <input type="file" multiple onChange={handleFileChange} accept="image/*" />
                <button onClick={handleUpload} disabled={isUploading || newFiles.length === 0} className="action-button-card upload">
                    {isUploading ? 'در حال آپلود...' : 'آپلود تصاویر جدید'}
                </button>
            </div>
        </div>
    );
};

export default ImageManager;