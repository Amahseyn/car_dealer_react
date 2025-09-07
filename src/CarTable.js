import React from 'react';

const CarTable = ({ cars }) => (
  <div style={{ overflowX: 'auto', margin: '2rem 0' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', direction: 'rtl', fontFamily: 'Vazirmatn, Tahoma, Arial, sans-serif' }}>
      <thead style={{ background: '#007bff', color: '#fff' }}>
        <tr>
          <th>شناسه</th>
          <th>کاربر</th>
          <th>عنوان خودرو</th>
          <th>قیمت</th>
          <th>شرایط فروش</th>
          <th>نام مدل خودرو</th>
          <th>ویژگی‌ها</th>
          <th>رنگ</th>
          <th>موقعیت</th>
          <th>نوع سوخت</th>
          <th>وضعیت تأیید</th>
          <th>تاریخ ثبت</th>
          <th>نوع تحویل</th>
          <th>شغل فروشنده</th>
          <th>طرح فروش</th>
          <th>جنسیت فروشنده</th>
          <th>کارکرد</th>
          <th>نوع کاربری</th>
          <th>وضعیت تسویه</th>
          <th>نوع تولید</th>
          <th>سال ساخت</th>
          <th>نوع سند</th>
          <th>وضعیت شاسی</th>
          <th>امکان معاوضه</th>
          <th>ماه‌های باقی‌مانده بیمه</th>
          <th>تصاویر</th>
        </tr>
      </thead>
      <tbody>
        {cars && cars.length > 0 ? cars.map(car => (
          <tr key={car.id}>
            <td>{car.id}</td>
            <td>{car.user}</td>
            <td>{car.title}</td>
            <td>{car.price != null ? `${car.price.toLocaleString('fa-IR')} تومان` : ''}</td>
            <td>{car.sale_condition}</td>
            <td>{car.car_model_name}</td>
            <td>{car.features}</td>
            <td>{car.color}</td>
            <td>{car.location}</td>
            <td>{car.fuel_type}</td>
            <td>{car.is_validated ? 'تأیید شده' : 'در انتظار'}</td>
            <td>{car.created_at}</td>
            <td>{car.delivery_type}</td>
            <td>{car.seller_occupation}</td>
            <td>{car.sales_plan}</td>
            <td>{car.seller_gender}</td>
            <td>{car.mileage}</td>
            <td>{car.usage_type}</td>
            <td>{car.settlement_status}</td>
            <td>{car.production_type}</td>
            <td>{car.model_year}</td>
            <td>{car.document_type}</td>
            <td>{car.chassis_status}</td>
            <td>{car.can_exchange ? 'بله' : 'خیر'}</td>
            <td>{car.insurance_months_left != null ? car.insurance_months_left : ''}</td>
            <td>
              {car.images && car.images.length > 0
                ? car.images.map((img, i) => <img key={i} src={img} alt="خودرو" style={{ width: 40, height: 30, marginLeft: 4, borderRadius: 4 }} />)
                : 'ندارد'}
            </td>
          </tr>
        )) : (
          <tr>
            <td colSpan="26" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
              هیچ داده‌ای موجود نیست.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default CarTable;

// Usage example:
// <CarTable cars={yourCarsArray} />