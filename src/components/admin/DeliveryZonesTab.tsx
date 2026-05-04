"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, MapPin, Truck } from "lucide-react";

export default function DeliveryZonesTab() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ fromCity: "الخرطوم", toCity: "", fee: "" });

  useEffect(() => { fetchZones(); }, []);

  const fetchZones = async () => {
    const res = await fetch("/api/admin/delivery-zones");
    if (res.ok) setZones(await res.json());
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/delivery-zones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        fromCity: formData.fromCity, 
        toCity: formData.toCity, 
        fee: parseFloat(formData.fee) 
      })
    });
    if (res.ok) { fetchZones(); setFormData({ fromCity: "الخرطوم", toCity: "", fee: "" }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف المنطقة؟")) return;
    await fetch("/api/admin/delivery-zones", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    fetchZones();
  };

  if (loading) return <div className="p-20 text-center font-black text-gray-400">جاري تحميل مناطق التوصيل...</div>;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between gap-8">
         <div className="flex-1 space-y-4">
            <h2 className="text-3xl font-black text-[#021D24]">مناطق التوصيل</h2>
            <p className="text-gray-400 text-sm font-medium">إدارة رسوم التوصيل لمختلف المناطق والمدن.</p>
         </div>
         <form onSubmit={handleAdd} className="flex flex-wrap gap-3 bg-white p-3 rounded-[2rem] border border-gray-100 shadow-2xl shadow-gray-200/50">
            <input 
              placeholder="من مدينة" 
              value={formData.fromCity}
              onChange={e => setFormData({...formData, fromCity: e.target.value})}
              className="w-32 bg-gray-50 px-6 py-3 rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-[#1089A4]" 
              required 
            />
            <input 
              placeholder="إلى مدينة" 
              value={formData.toCity}
              onChange={e => setFormData({...formData, toCity: e.target.value})}
              className="w-32 bg-gray-50 px-6 py-3 rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-[#1089A4]" 
              required 
            />
            <input 
              type="number"
              placeholder="السعر" 
              value={formData.fee}
              onChange={e => setFormData({...formData, fee: e.target.value})}
              className="w-24 bg-gray-50 px-4 py-3 rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-[#1089A4]" 
              required 
            />
            <button className="bg-[#1089A4] text-white px-8 py-3 rounded-2xl font-black text-xs hover:bg-[#021D24] transition-all">إضافة</button>
         </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {zones.map((zone: any) => (
            <div key={zone.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl flex items-center justify-between group">
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#F29124]/10 text-[#F29124] flex items-center justify-center">
                     <MapPin size={24} />
                  </div>
                  <div>
                     <h4 className="font-black text-[#021D24]">{zone.fromCity} ➔ {zone.toCity}</h4>
                     <p className="text-[10px] font-black text-[#1089A4] uppercase tracking-widest mt-1">رسوم التوصيل: {zone.fee} ج.س</p>
                  </div>
               </div>
               <button onClick={() => handleDelete(zone.id)} className="w-10 h-10 rounded-xl bg-gray-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
            </div>
         ))}
      </div>
    </div>
  );
}
