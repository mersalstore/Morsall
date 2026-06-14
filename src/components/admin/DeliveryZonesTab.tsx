"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, MapPin, Check, X, ShieldAlert, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DeliveryZonesTab({ showToast }: { showToast?: (message: string, type?: "info" | "error" | "success") => void } = {}) {
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ state: "الخرطوم", city: "", shippingRate: "", isActive: true });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState("");

  useEffect(() => { fetchRegions(); }, []);

  const fetchRegions = async () => {
    const res = await fetch("/api/admin/shipping-regions");
    if (res.ok) setRegions(await res.json());
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.city || !formData.shippingRate) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/shipping-regions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: formData.state,
          city: formData.city,
          shippingRate: parseFloat(formData.shippingRate),
          isActive: formData.isActive
        })
      });
      if (res.ok) {
        await fetchRegions();
        setFormData({ state: "الخرطوم", city: "", shippingRate: "", isActive: true });
        if (showToast) showToast("تم إضافة منطقة الشحن بنجاح", "success");
      } else {
        const err = await res.json();
        alert(err.error || "فشل الإضافة");
      }
    } catch (err) {
      alert("حدث خطأ في الاتصال");
    }
    setSubmitting(false);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/shipping-regions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus })
      });
      if (res.ok) {
        setRegions(prev => prev.map(r => r.id === id ? { ...r, isActive: !currentStatus } : r));
        if (showToast) showToast(`تم ${!currentStatus ? "تفعيل" : "إلغاء تفعيل"} الشحن للمنطقة`, "success");
      }
    } catch (err) {
      alert("فشل تحديث حالة التفعيل");
    }
  };

  const handleSaveRate = async (id: string) => {
    if (!editRate) return;
    try {
      const res = await fetch("/api/admin/shipping-regions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, shippingRate: parseFloat(editRate) })
      });
      if (res.ok) {
        setRegions(prev => prev.map(r => r.id === id ? { ...r, shippingRate: parseFloat(editRate) } : r));
        setEditingId(null);
        if (showToast) showToast("تم تحديث رسوم الشحن", "success");
      }
    } catch (err) {
      alert("فشل حفظ رسوم الشحن");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المنطقة؟")) return;
    try {
      const res = await fetch("/api/admin/shipping-regions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchRegions();
        if (showToast) showToast("تم حذف منطقة الشحن", "success");
      }
    } catch (err) {
      alert("حدث خطأ في الاتصال");
    }
  };

  const STATES = ["الخرطوم", "البحر الأحمر", "نهر النيل", "الجزيرة", "شمال كردفان", "كسلا", "القضارف", "سنار", "النيل الأزرق", "النيل الأبيض"];

  if (loading) return <div className="p-20 text-center font-black text-gray-400">جاري تحميل مناطق وولايات السودان...</div>;

  return (
    <div className="space-y-10" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-right">
        <div>
          <h2 className="text-3xl font-black text-[#0F172A]">إدارة أسعار الشحن وولايات السودان</h2>
          <p className="text-gray-400 text-sm font-medium mt-1">تحديد رسوم الشحن وتفعيل أو إيقاف المدن بناءً على الأوضاع الأمنية والتشغيلية</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-lg">
          <span className="text-xs font-black text-gray-400">{regions.length} مدينة مضافة</span>
        </div>
      </div>

      {/* Add Form */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 text-right">
        <h3 className="text-lg font-black text-[#0F172A] mb-6 flex items-center gap-3 justify-start">
          <div className="w-10 h-10 rounded-xl bg-[#C5A021]/10 text-[#C5A021] flex items-center justify-center">
            <Plus size={20} />
          </div>
          إضافة ولاية/مدينة شحن جديدة
        </h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">الولاية السودانية</label>
            <select
              value={formData.state}
              onChange={e => setFormData({...formData, state: e.target.value})}
              className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-4 py-3 text-sm font-bold outline-none transition-all"
            >
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">اسم المدينة / المنطقة</label>
            <input
              placeholder="مثال: بورتسودان"
              value={formData.city}
              onChange={e => setFormData({...formData, city: e.target.value})}
              className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-4 py-3 text-sm font-bold outline-none transition-all text-right"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">رسوم الشحن (ج.س)</label>
            <input
              type="number"
              placeholder="0"
              value={formData.shippingRate}
              onChange={e => setFormData({...formData, shippingRate: e.target.value})}
              className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-4 py-3 text-sm font-bold outline-none transition-all text-right"
              required
              min="0"
            />
          </div>
          <div className="space-y-1 flex flex-col justify-center">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">حالة الشحن المباشر</label>
            <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-[#0F172A]">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={e => setFormData({...formData, isActive: e.target.checked})}
                className="rounded text-[#C5A021] focus:ring-[#C5A021] border-gray-300 w-4 h-4"
              />
              تفعيل الشحن للمدينة
            </label>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block opacity-0 mb-1">إضافة</label>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#C5A021] text-white py-3 rounded-2xl font-black text-sm hover:bg-[#0F172A] transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-md"
            >
              {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={16} />}
              إضافة المنطقة
            </button>
          </div>
        </form>
      </div>

      {/* Regions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-right">
        {regions.map((region: any) => (
          <div 
            key={region.id} 
            className={cn(
              "bg-white p-6 rounded-[2.5rem] border transition-all group relative overflow-hidden",
              region.isActive ? "border-gray-100 shadow-xl hover:shadow-2xl hover:border-[#C5A021]/20" : "border-red-100 bg-red-50/20 opacity-90 shadow-sm"
            )}
          >
            {!region.isActive && (
              <div className="absolute top-0 right-0 left-0 bg-red-500 text-white text-[9px] font-black py-1 text-center flex items-center justify-center gap-1">
                <ShieldAlert size={10} />
                الشحن متوقف لهذه المنطقة مؤقتاً
              </div>
            )}
            
            <div className="flex items-start justify-between mb-4 mt-2">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", region.isActive ? "bg-[#C5A021]/10 text-[#C5A021]" : "bg-red-100 text-red-500")}>
                <MapPin size={24} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleActive(region.id, region.isActive)}
                  className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-all border border-gray-200/50"
                  title={region.isActive ? "إيقاف الشحن" : "تفعيل الشحن"}
                >
                  {region.isActive ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} className="text-gray-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(region.id)}
                  className="w-9 h-9 rounded-xl bg-gray-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-gray-200/50 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{region.state}</p>
              <h4 className="font-black text-[#0F172A] text-lg mt-0.5">{region.city}</h4>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100/50 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400">رسوم الشحن:</span>
              {editingId === region.id ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={editRate}
                    onChange={e => setEditRate(e.target.value)}
                    className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-left outline-none focus:border-[#C5A021]"
                    autoFocus
                  />
                  <button onClick={() => handleSaveRate(region.id)} className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600">
                    <Check size={12} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setEditingId(region.id); setEditRate(String(region.shippingRate)); }}
                  className="text-sm font-black text-[#C5A021] hover:underline"
                >
                  {region.shippingRate?.toLocaleString()} ج.س ✏️
                </button>
              )}
            </div>
          </div>
        ))}
        {regions.length === 0 && (
          <div className="col-span-3 py-20 flex flex-col items-center justify-center text-gray-200">
            <MapPin size={60} className="opacity-20 mb-4" />
            <p className="font-black uppercase tracking-widest">لا توجد مناطق توصيل بعد</p>
          </div>
        )}
      </div>
    </div>
  );
}
