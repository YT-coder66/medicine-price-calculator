import React, { useState, useEffect } from "react";
import "./App.css";

const medicines = [
  {
    id: 1,
    name: "سیتاگلیپتین/متفورمین 50/500 (زیپمت)",
    basePrice: 38200,         // A
    insurancePrice: 32900,    // B
    priceDifference: 5300,    // C
    ceiling: 100,             // E سقف تجویزی
    insurancePercent: 0.2494, // G
  },
  {
    id: 2,
    name: "متفورمین 500 میلی‌گرم",
    basePrice: 15000,
    insurancePrice: 13000,
    priceDifference: 2000,
    ceiling: 90,
    insurancePercent: 0.20,
  },
  {
    id: 3,
    name: "آتورواستاتین 20 میلی‌گرم",
    basePrice: 45000,
    insurancePrice: 40000,
    priceDifference: 5000,
    ceiling: 80,
    insurancePercent: 0.25,
  },
  {
    id: 4,
    name: "لوواستاتین 40 میلی‌گرم",
    basePrice: 35000,
    insurancePrice: 30000,
    priceDifference: 5000,
    ceiling: 70,
    insurancePercent: 0.22,
  }
  // می‌تونی اینجا داروهای بیشتر اضافه کنی
];

// ثابت حق فنی
const TECH_FEE = 336000;

function App() {
  const [selectedMedicineId, setSelectedMedicineId] = useState("");
  const [deliveredCount, setDeliveredCount] = useState("");
  const [extraCount, setExtraCount] = useState("");
  const [versionItems, setVersionItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  // بارگذاری نسخه‌ها از localStorage
  useEffect(() => {
    const saved = localStorage.getItem("versionItems");
    if (saved) {
      setVersionItems(JSON.parse(saved));
    }
  }, []);

  // ذخیره نسخه‌ها در localStorage
  useEffect(() => {
    localStorage.setItem("versionItems", JSON.stringify(versionItems));
  }, [versionItems]);

  // اضافه کردن دارو به نسخه
  const addMedicine = () => {
    setErrorMsg(""); // پاک کردن پیام خطا

    if (!selectedMedicineId) {
      setErrorMsg("لطفا دارو را انتخاب کنید.");
      return;
    }

    const D = parseInt(deliveredCount);
    const F = parseInt(extraCount);

    if (isNaN(D) || D <= 0) {
      setErrorMsg("تعداد تحویلی باید عددی مثبت باشد.");
      return;
    }

    if (isNaN(F) || F < 0) {
      setErrorMsg("اضافه بر سقف تجویزی نمی‌تواند منفی باشد.");
      return;
    }

    const med = medicines.find(m => m.id === parseInt(selectedMedicineId));
    if (!med) return;

    setVersionItems(prev => {
      const existing = prev.find(item => item.id === med.id);
      if (existing) {
        return prev.map(item =>
          item.id === med.id
            ? {
                ...item,
                deliveredCount: item.deliveredCount + D,
                extraCount: item.extraCount + F,
              }
            : item
        );
      } else {
        return [...prev, { ...med, deliveredCount: D, extraCount: F }];
      }
    });

    // ریست ورودی‌ها
    setSelectedMedicineId("");
    setDeliveredCount("");
    setExtraCount("");
  };

  // حذف دارو از نسخه
  const removeMedicine = (id) => {
    setVersionItems(prev => prev.filter(item => item.id !== id));
  };

  // ویرایش تعداد دارو در جدول
  const updateItemCount = (id, field, value) => {
    const num = parseInt(value);
    if (isNaN(num) || num < 0) return;

    setVersionItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, [field]: num }
          : item
      )
    );
  };

  // محاسبه قیمت نهایی هر دارو طبق فرمول
  const calcFinalPrice = (item) => {
    const D = item.deliveredCount;
    const F = item.extraCount;
    const B = item.insurancePrice;
    const G = item.insurancePercent;
    const C = item.priceDifference;
    const A = item.basePrice;

    const part1 = (D - F) * B * (1 - G);
    const part2 = (D - F) * C;
    const part3 = F * A;

    return part1 + part2 + part3;
  };

  // جمع کل قیمت نسخه به علاوه حق فنی
  const totalPrice = versionItems.reduce((sum, item) => sum + calcFinalPrice(item), 0) + TECH_FEE;

  return (
    <div className="container">
      <h1>محاسبه قیمت نسخه دارویی</h1>

      <div className="form-section">
        <select
          value={selectedMedicineId}
          onChange={e => setSelectedMedicineId(e.target.value)}
        >
          <option value="">انتخاب دارو</option>
          {medicines.map(med => (
            <option key={med.id} value={med.id}>
              {med.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="0"
          placeholder="تعداد تحویلی"
          value={deliveredCount}
          onChange={e => setDeliveredCount(e.target.value)}
        />

        <input
          type="number"
          min="0"
          placeholder="اضافه بر سقف تجویزی"
          value={extraCount}
          onChange={e => setExtraCount(e.target.value)}
        />

        <button onClick={addMedicine}>افزودن به نسخه</button>
      </div>

      {errorMsg && <div className="error-msg">{errorMsg}</div>}

      {versionItems.length > 0 && (
        <>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ردیف</th>
                <th>نام دارو</th>
                <th>تعداد تحویلی (D)</th>
                <th>اضافه بر سقف تجویزی (F)</th>
                <th>قیمت پایه (A)</th>
                <th>قیمت بیمه (B)</th>
                <th>اختلاف قیمت (C)</th>
                <th>درصد بیمه (G)</th>
                <th>قیمت نهایی</th>
                <th>حذف</th>
              </tr>
            </thead>
            <tbody>
              {versionItems.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={item.deliveredCount}
                      onChange={e => updateItemCount(item.id, "deliveredCount", e.target.value)}
                      style={{width: "70px", textAlign: "center"}}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={item.extraCount}
                      onChange={e => updateItemCount(item.id, "extraCount", e.target.value)}
                      style={{width: "70px", textAlign: "center"}}
                    />
                  </td>
                  <td>{item.basePrice.toLocaleString()}</td>
                  <td>{item.insurancePrice.toLocaleString()}</td>
                  <td>{item.priceDifference.toLocaleString()}</td>
                  <td>{(item.insurancePercent * 100).toFixed(2)}%</td>
                  <td>{calcFinalPrice(item).toLocaleString()}</td>
                  <td>
                    <button className="btn-delete" onClick={() => removeMedicine(item.id)}>❌</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          <div className="summary">
            <p>حق فنی: {TECH_FEE.toLocaleString()} تومان</p>
            <p>جمع پرداختی کل: {totalPrice.toLocaleString()} تومان</p>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
