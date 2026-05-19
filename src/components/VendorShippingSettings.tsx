"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Truck, MapPin, Plus, Trash2, Save, Info } from "lucide-react";
import { cn } from "../lib/utils";

export default function VendorShippingSettings() {
  const [loading, setLoading] = useState(false);
  const [shippingRates, setShippingRates] = useState([
    { city: "الخرطوم", price: 3000, days: "1-2" },
    { city: "أم درمان", price: 3500, days: "2-3" },
    { city: "بحري", price: 3000, days: "1-2" },
  ]);

  const addRate = () => {
    setShippingRates([...shippingRates, { city: "", price: 0, days: "" }]);
  };

  const removeRate = (index: number) => {
    setShippingRates(shippingRates.filter((_, i) => i !== index));
  };

  const updateRate = (index: number, field: string, value: any) => {
    const newRates = [...shippingRates];
    (newRates[index] as any)[field] = value;
    setShippingRates(newRates);
  };

  const handleSave = async () => {
    setLoading(true);
    // Simulating save
    setTimeout(() => {
      setLoading(false);
      alert("تم حفظ إعدادات الشحن بنجاح!");
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0F172A]">إعدادات الشحن</h2>
          <p className="text-gray-400 font-bold mt-1">حدد مناطق التوصيل وأسعار الشحن الخاصة بمتجرك</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#C5A021] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-[#C5A021]/20 hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={20} />}
          حفظ الإعدادات
        </button>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40">
        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl mb-8 border border-blue-100">
           <Info className="text-[#C5A021]" size={20} />
           <p className="text-xs text-[#C5A021] font-bold">هذه الأسعار ستظهر للعميل عند اختيار مدينته في صفحة إتمام الطلب.</p>
        </div>

        <div className="space-y-4">
           <div className="grid grid-cols-4 gap-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <div className="col-span-1">المدينة / المنطقة</div>
              <div className="col-span-1 text-center">سعر التوصيل (ج.س)</div>
              <div className="col-span-1 text-center">مدة التوصيل</div>
              <div className="col-span-1"></div>
           </div>

           {shippingRates.map((rate, index) => (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               key={index} 
               className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all items-center"
             >
                <div className="col-span-1">
                   <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-2">
                      <MapPin size={14} className="text-gray-300" />
                      <input 
                        type="text" 
                        value={rate.city} 
                        onChange={(e) => updateRate(index, "city", e.target.value)}
                        placeholder="المدينة..."
                        className="bg-transparent outline-none text-sm font-bold w-full"
                      />
                   </div>
                </div>
                <div className="col-span-1">
                   <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-2">
                      <input 
                        type="number" 
                        value={rate.price} 
                        onChange={(e) => updateRate(index, "price", parseInt(e.target.value))}
                        className="bg-transparent outline-none text-sm font-black text-[#C5A021] w-full text-center"
                      />
                   </div>
                </div>
                <div className="col-span-1">
                   <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-2">
                      <Truck size={14} className="text-gray-300" />
                      <input 
                        type="text" 
                        value={rate.days} 
                        onChange={(e) => updateRate(index, "days", e.target.value)}
                        placeholder="مثل: 1-2 أيام"
                        className="bg-transparent outline-none text-xs font-bold w-full text-center"
                      />
                   </div>
                </div>
                <div className="col-span-1 flex justify-end">
                   <button 
                     onClick={() => removeRate(index)}
                     className="w-10 h-10 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
                   >
                      <Trash2 size={18} />
                   </button>
                </div>
             </motion.div>
           ))}

           <button 
             onClick={addRate}
             className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-100 text-gray-400 font-black text-xs hover:border-[#C5A021] hover:text-[#C5A021] hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
           >
              <Plus size={16} />
              إضافة منطقة توصيل جديدة
           </button>
        </div>
      </div>
    </div>
  );
}
