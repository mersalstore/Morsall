"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DeliveryZonesTab() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ fromCity: "الخرطوم", toCity: "", fee: "", deliveryDays: "1" });

  useEffect(() => { fetchZones(); }, []);

  const fetchZones = async () => {
    const res = await fetch("/api/admin/delivery-zones");
    if (res.ok) setZones(await res.json());
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.toCity || !formData.fee) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/delivery-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromCity: formData.fromCity,
          toCity: formData.toCity,
          fee: parseFloat(formData.fee),
          deliveryDays: parseInt(formData.deliveryDays) || 1
        })
      });
      if (res.ok) {
        await fetchZones();
        setFormData({ fromCity: "الخرطوم", toCity: "", fee: "", deliveryDays: "1" });
      } else {
        const err = await res.json();
        alert(err.error || "فشل الإضافة");
      }
    } catch (err) {
      alert("حدث خطأ في الاتصال");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف منطقة التوصيل؟")) return;
    await fetch("/api/admin/delivery-zones", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    fetchZones();
  };

  const CITIES = ["الخرطوم", "بحري", "أمدرمان", "كلها", "الخرطوم بحري", "شندي", "الجيلي", "الحلفايا"];

  if (loading) return <div className="p-20 text-center font-black text-gray-400">جاري تحميل مناطق التوصيل...</div>;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0F172A]">مناطق التوصيل</h2>
          <p className="text-gray-400 text-sm font-medium mt-1">إدارة رسوم ومدة التوصيل لمختلف المناطق والمدن</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-lg">
          <span className="text-xs font-black text-gray-400">{zones.length} منطقة مضافة</span>
        </div>
      </div>

      {/* Add Form */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40">
        <h3 className="text-lg font-black text-[#0F172A] mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C5A021]/10 text-[#C5A021] flex items-center justify-center">
            <Plus size={20} />
          </div>
          إضافة منطقة توصيل جديدة
        </h3>
        <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">من مدينة</label>
            <select
              value={formData.fromCity}
              onChange={e => setFormData({...formData, fromCity: e.target.value})}
              className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-4 py-3 text-sm font-bold outline-none transition-all"
            >
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">إلى مدينة</label>
            <input
              placeholder="مثل: الخرطوم"
              value={formData.toCity}
              onChange={e => setFormData({...formData, toCity: e.target.value})}
              className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-4 py-3 text-sm font-bold outline-none transition-all"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">رسوم التوصيل (ج.س)</label>
            <input
              type="number"
              placeholder="0"
              value={formData.fee}
              onChange={e => setFormData({...formData, fee: e.target.value})}
              className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-4 py-3 text-sm font-bold outline-none transition-all"
              required
              min="0"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">مدة التوصيل (أيام)</label>
            <input
              type="number"
              placeholder="1"
              value={formData.deliveryDays}
              onChange={e => setFormData({...formData, deliveryDays: e.target.value})}
              className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-4 py-3 text-sm font-bold outline-none transition-all"
              min="1"
              max="30"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-0">إضافة</label>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#C5A021] text-white py-3 rounded-2xl font-black text-sm hover:bg-[#0F172A] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={16} />}
              إضافة
            </button>
          </div>
        </form>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.map((zone: any) => (
          <div key={zone.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl group hover:shadow-2xl hover:border-[#C5A021]/20 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#F29124]/10 text-[#F29124] flex items-center justify-center">
                <MapPin size={24} />
              </div>
              <button
                onClick={() => handleDelete(zone.id)}
                className="w-9 h-9 rounded-xl bg-gray-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <h4 className="font-black text-[#0F172A] text-lg">{zone.fromCity} ← {zone.toCity}</h4>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 bg-[#C5A021]/5 px-3 py-1.5 rounded-xl">
                <span className="text-[10px] font-black text-[#C5A021]">رسوم التوصيل</span>
                <span className="text-sm font-black text-[#0F172A]">{zone.fee?.toLocaleString()} ج.س</span>
              </div>
              <div className="flex items-center gap-2 bg-[#F29124]/5 px-3 py-1.5 rounded-xl">
                <Clock size={12} className="text-[#F29124]" />
                <span className="text-sm font-black text-[#0F172A]">{zone.deliveryDays || 1} يوم</span>
              </div>
            </div>
          </div>
        ))}
        {zones.length === 0 && (
          <div className="col-span-3 py-20 flex flex-col items-center justify-center text-gray-200">
            <MapPin size={60} className="opacity-20 mb-4" />
            <p className="font-black uppercase tracking-widest">لا توجد مناطق توصيل بعد</p>
          </div>
        )}
      </div>
    </div>
  );
}
