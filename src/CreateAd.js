import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from './api';
import { useChoices } from './ChoicesContext';
import { useAuth } from './AuthContext';
import { fetchAllPaginatedResults } from './apiHelpers';
import ImageManager from './ImageManager';
import './CreateAd.css';
import './forms.css';

const CreateAd = () => {
    const { carType, id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;
    const { choices } = useChoices();
    const { user } = useAuth();

    const [adType, setAdType] = useState('new-cars');
    const [ad, setAd] = useState({
        title: '',
        price: '',
        description: '',
        location: '',
        car_model: '',
        model_year: new Date().getFullYear(),
        color: '',
        features: '',
        sale_condition: 'نقدی',
        fuel_type: 'بنزینی',
        production_type: 'داخلی',
        usage_type: 'سواری',
        settlement_status: 'رزرو نشده',
        // Used car specific
        mileage: '',
        document_type: 'تک برگ',
        insurance_months_left: '',
        can_exchange: false,
        // Havaleh specific
        delivery_type: 'فوری',
        sales_plan: 'طرح عادی',
        seller_gender: 'مرد',
    });
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState('');
    const [error, setError] = useState('');
    const [currentImages, setCurrentImages] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const brandsPromise = fetchAllPaginatedResults('/listings/brands/');

                if (isEditing) {
                    setAdType(carType);
                    const adPromise = api.get(`/listings/${carType}/${id}/`).then(async (res) => {
                        const adData = res.data;
                        const flattenedData = Object.entries(adData).reduce((acc, [key, value]) => {
                            if (value && typeof value === 'object' && value.display) {
                                acc[key] = value.display;
                            } else {
                                acc[key] = value;
                            }
                            return acc;
                        }, {});

                        setAd(prev => ({ ...prev, ...flattenedData }));
                        setCurrentImages(adData.images || []);

                        if (adData.car_model) {
                            const modelRes = await api.get(`/listings/models/${adData.car_model}/`);
                            if (modelRes) {
                                setSelectedBrand(modelRes.data.brand);
                            }
                        }
                    });
                    const [allBrands] = await Promise.all([brandsPromise, adPromise]);
                    setBrands(allBrands);
                } else {
                    const allBrands = await brandsPromise;
                    setBrands(allBrands);
                }
            } catch (err) {
                setError('خطا در بارگذاری اطلاعات فرم.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadInitialData();
    }, [isEditing, id, carType]);

    useEffect(() => {
        const fetchModels = async () => {
            if (selectedBrand) {
                try {
                    const allModels = await fetchAllPaginatedResults(`/listings/models/?brand__id=${selectedBrand}`);
                    setModels(allModels);
                } catch (error) {
                    console.error('Failed to fetch models', error);
                    setModels([]);
                }
            } else {
                setModels([]);
            }
        }
        fetchModels();
    }, [selectedBrand]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAd({ ...ad, [name]: type === 'checkbox' ? checked : value });
    };

    const handleBrandChange = (e) => {
        setSelectedBrand(e.target.value);
        setAd({ ...ad, car_model: '' });
    };

    const handleAdTypeChange = (e) => {
        if (!isEditing) {
            setAdType(e.target.value);
        }
    };

    const handleImageChange = (e) => {
        setImageFiles([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const endpoint = isEditing ? `/listings/${carType}/${id}/` : `/listings/${adType}/`;
        const method = isEditing ? 'patch' : 'post';

        // Filter out fields that are not relevant for the current ad type
        const payload = { ...ad };

        // When a regular user edits an ad, it should be re-validated.
        if (isEditing && user && !user.is_staff) {
            payload.is_validated = false;
        }
        if (adType !== 'used-cars') {
            delete payload.mileage;
            delete payload.document_type;
            delete payload.insurance_months_left;
            delete payload.can_exchange;
        }
        if (adType !== 'havalehs') {
            delete payload.delivery_type;
            delete payload.sales_plan;
            delete payload.seller_gender;
        }
        // These fields are common but not for havalehs
        if (adType === 'havalehs') {
            delete payload.color;
            delete payload.fuel_type;
            delete payload.mileage;
            delete payload.production_type;
            delete payload.usage_type;
        }

        try {
            const { data: newAd } = await api[method](endpoint, payload);
            const adId = newAd.id;

            if (imageFiles.length > 0 && !isEditing) {
                const formData = new FormData();
                const contentTypeMap = {
                    'new-cars': 'new_car',
                    'used-cars': 'used_car',
                    'havalehs': 'havaleh'
                };
                const adTypeForContentType = contentTypeMap[adType];
                const contentTypeId = choices?.advertisement_types?.[adTypeForContentType];

                if (!contentTypeId) {
                    throw new Error('نوع محتوای آگهی برای آپلود تصویر یافت نشد.');
                }

                imageFiles.forEach(file => {
                    formData.append('image', file);
                });
                formData.append('object_id', adId);
                formData.append('content_type', contentTypeId);

                await api.post('/listings/images/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            alert(isEditing ? 'آگهی با موفقیت ویرایش شد!' : 'آگهی با موفقیت ثبت شد!');
            navigate(`/${isEditing ? carType : adType}/${adId}`);
        } catch (err) {
            const errorData = err.response?.data;
            const errorMessages = errorData ? Object.values(errorData).flat().join('\n') : 'لطفا همه فیلدها را بررسی کنید.';
            setError(`خطا در ثبت آگهی: \n${errorMessages}`);
        }
    };

    if (loading) {
        return <div className="loading-spinner"></div>;
    }

    return (
        <div className="form-container">
            <h2>{isEditing ? 'ویرایش آگهی' : 'ثبت آگهی جدید'}</h2>

            {!isEditing && (
                <div className="ad-type-selector">
                    <label>
                        <input type="radio" value="new-cars" checked={adType === 'new-cars'} onChange={handleAdTypeChange} />
                        خودروی صفر
                    </label>
                    <label>
                        <input type="radio" value="used-cars" checked={adType === 'used-cars'} onChange={handleAdTypeChange} />
                        خودروی کارکرده
                    </label>
                    <label>
                        <input type="radio" value="havalehs" checked={adType === 'havalehs'} onChange={handleAdTypeChange} />
                        حواله
                    </label>
                </div>
            )}

            {error && <div className="form-error">{error}</div>}
            <form onSubmit={handleSubmit}>
                <h3>مشخصات اصلی</h3>
                <input type="text" name="title" value={ad.title} onChange={handleChange} placeholder="عنوان آگهی" required />
                
                <select onChange={handleBrandChange} value={selectedBrand} required>
                    <option value="">برند را انتخاب کنید</option>
                    {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>

                <select name="car_model" value={ad.car_model} onChange={handleChange} required disabled={!selectedBrand}>
                    <option value="">مدل را انتخاب کنید</option>
                    {models.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
                </select>

                <input type="number" name="model_year" value={ad.model_year} onChange={handleChange} placeholder="سال ساخت" required />
                <input type="number" name="price" value={ad.price} onChange={handleChange} placeholder="قیمت (تومان)" required />
                <input type="text" name="location" value={ad.location} onChange={handleChange} placeholder="موقعیت" required />
                <textarea name="description" value={ad.description} onChange={handleChange} placeholder="توضیحات" />

                {adType !== 'havalehs' && (
                    <>
                        <h3>مشخصات فنی</h3>
                        <input type="text" name="color" value={ad.color} onChange={handleChange} placeholder="رنگ" required />
                        <select name="fuel_type" value={ad.fuel_type} onChange={handleChange}>
                            {choices?.fuel_type?.map(choice => (
                                <option key={choice.value} value={choice.display}>{choice.display}</option>
                            ))}
                        </select>
                        <select name="production_type" value={ad.production_type} onChange={handleChange}>
                            {choices?.production_type?.map(choice => (
                                <option key={choice.value} value={choice.display}>{choice.display}</option>
                            ))}
                        </select>
                        <select name="usage_type" value={ad.usage_type} onChange={handleChange}>
                            {choices?.usage_type?.map(choice => (
                                <option key={choice.value} value={choice.display}>{choice.display}</option>
                            ))}
                        </select>
                        <textarea name="features" value={ad.features} onChange={handleChange} placeholder="ویژگی‌ها و آپشن‌ها" />
                    </>
                )}

                {adType === 'used-cars' && (
                    <>
                        <h3>مشخصات خودروی کارکرده</h3>
                        <input type="number" name="mileage" value={ad.mileage} onChange={handleChange} placeholder="کارکرد (کیلومتر)" required />
                        <input type="number" name="insurance_months_left" value={ad.insurance_months_left} onChange={handleChange} placeholder="ماه‌های باقی‌مانده بیمه" required />
                        <select name="document_type" value={ad.document_type} onChange={handleChange}>
                            {choices?.document_type?.map(choice => (
                                <option key={choice.value} value={choice.display}>{choice.display}</option>
                            ))}
                        </select>
                        <div className="checkbox-container">
                            <input type="checkbox" id="can_exchange" name="can_exchange" checked={ad.can_exchange} onChange={handleChange} />
                            <label htmlFor="can_exchange">امکان معاوضه وجود دارد</label>
                        </div>
                    </>
                )}

                {adType === 'havalehs' && (
                    <>
                        <h3>مشخصات حواله</h3>
                        <select name="delivery_type" value={ad.delivery_type} onChange={handleChange}>
                            {choices?.delivery_type?.map(choice => (
                                <option key={choice.value} value={choice.display}>{choice.display}</option>
                            ))}
                        </select>
                        <select name="sales_plan" value={ad.sales_plan} onChange={handleChange}>
                            {choices?.sales_plan?.map(choice => (
                                <option key={choice.value} value={choice.display}>{choice.display}</option>
                            ))}
                        </select>
                        <select name="seller_gender" value={ad.seller_gender} onChange={handleChange}>
                            {choices?.seller_gender?.map(choice => (
                                <option key={choice.value} value={choice.display}>{choice.display}</option>
                            ))}
                        </select>
                    </>
                )}

                <h3>شرایط فروش</h3>
                <select name="sale_condition" value={ad.sale_condition} onChange={handleChange}>
                    {choices?.sale_condition?.map(choice => (
                        <option key={choice.value} value={choice.display}>{choice.display}</option>
                    ))}
                </select>
                <select name="settlement_status" value={ad.settlement_status} onChange={handleChange}>
                    {choices?.settlement_status?.map(choice => (
                        <option key={choice.value} value={choice.display}>{choice.display}</option>
                    ))}
                </select>

                {!isEditing && (
                    <>
                        <h3>تصاویر آگهی</h3>
                        <input type="file" multiple onChange={handleImageChange} accept="image/*" />
                    </>
                )}

                <div className="form-actions">
                    <button type="submit" className="form-button">
                        {isEditing ? 'ذخیره تغییرات' : 'ثبت آگهی'}
                    </button>
                    <button type="button" className="form-button secondary" onClick={() => navigate(-1)}>انصراف</button>
                </div>
            </form>

            {isEditing && id && (
                <ImageManager
                    adId={id}
                    adCarType={carType}
                    images={currentImages}
                    onUpdate={setCurrentImages}
                />
            )}
        </div>
    );
};

export default CreateAd;