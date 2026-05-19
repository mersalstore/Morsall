"use client"

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function VendorCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderAmount: "",
    expiryDate: ""
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/vendor/coupons");
      if (res.ok) setCoupons(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newCoupon.code || !newCoupon.discountValue) return alert("يرجى ملء كافة البيانات المطلوبة");
    
    try {
      const res = await fetch("/api/vendor/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCoupon)
      });
      if (res.ok) {
        fetchCoupons();
        setIsAdding(false);
        setNewCoupon({ code: "", discountType: "PERCENTAGE", discountValue: "", minOrderAmount: "", expiryDate: "" });
      }
    } catch (err) {
      alert("فشل إنشاء الكوبون");
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/vendor/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus })
      });
      if (res.ok) fetchCoupons();
    } catch (err) {
      alert("فشل تحديث حالة الكوبون");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الكوبون؟")) return;
    try {
      const res = await fetch(`/api/vendor/coupons?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) fetchCoupons();
    } catch (err) {
      alert("فشل حذف الكوبون");
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-[#0F172A]">إدارة الكوبونات</h2>
          <p className="text-gray-400 font-bold">قم بإنشاء رموز خصم لزيادة مبيعاتك.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#C5A021] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-[#C5A021]/20 hover:scale-105 transition-all"
        >
          <span className="material-symbols-rounded text-base">add_circle</span> إنشاء كوبون
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl border shadow-lg space-y-8 animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">رمز الكوبون</label>
              <input 
                type="text" 
                value={newCoupon.code}
                onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                placeholder="مثلاً: SAVE10"
                className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:border-[#C5A021] focus:bg-white outline-none transition-all font-black"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">نوع الخصم</label>
              <select 
                value={newCoupon.discountType}
                onChange={e => setNewCoupon({...newCoupon, discountType: e.target.value})}
                className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:border-[#C5A021] focus:bg-white outline-none transition-all font-bold"
              >
                <option value="PERCENTAGE">نسبة مئوية (%)</option>
                <option value="FIXED">مبلغ ثابت (ج.س)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">القيمة</label>
              <input 
                type="number" 
                value={newCoupon.discountValue}
                onChange={e => setNewCoupon({...newCoupon, discountValue: e.target.value})}
                className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:border-[#C5A021] focus:bg-white outline-none transition-all font-black"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setIsAdding(false)} className="px-6 py-2.5 rounded-xl font-bold text-gray-400 hover:bg-gray-100 transition-all text-sm">إلغاء</button>
            <button onClick={handleCreate} className="bg-[#0F172A] text-white px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#C5A021] transition-all">تفعيل الكوبون</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map(coupon => (
          <div key={coupon.id} className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col gap-4 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-[#C5A021]/10 text-[#C5A021] rounded-xl flex items-center justify-center">
                <span className="material-symbols-rounded text-2xl">confirmation_number</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleToggle(coupon.id, coupon.isActive)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105",
                    coupon.isActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                  )}
                >
                  {coupon.isActive ? "نشط" : "متوقف"}
                </button>
                <button 
                  onClick={() => handleDelete(coupon.id)}
                  className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <span className="material-symbols-rounded text-lg">delete</span>
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black text-[#0F172A]">{coupon.code}</h3>
              <p className="text-xs font-bold text-gray-400 mt-1">
                خصم {coupon.discountValue}{coupon.discountType === 'PERCENTAGE' ? '%' : ' ج.س'}
              </p>
            </div>
            <div className="pt-4 border-t flex items-center justify-between text-[10px] font-black text-gray-300 uppercase tracking-widest">
              <span>{new Date(coupon.createdAt).toLocaleDateString("ar-EG")}</span>
              <span className="material-symbols-rounded text-lg text-[#C5A021]">sell</span>
            </div>
          </div>
        ))}

        {!loading && coupons.length === 0 && !isAdding && (
          <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-3xl border border-dashed">
            <span className="material-symbols-rounded text-5xl text-gray-200 mb-3 block">sell</span>
            <p className="text-gray-400 font-black text-sm uppercase tracking-widest">لا توجد كوبونات متاحة</p>
          </div>
        )}
      </div>
    </div>
  );
}
