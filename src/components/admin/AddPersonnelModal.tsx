"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, UserPlus, Mail, Phone, Shield, Truck, BadgeCheck } from "lucide-react";

interface AddPersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: "employees" | "drivers";
}

export default function AddPersonnelModal({ isOpen, onClose, onSuccess, type }: AddPersonnelModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: type === "employees" ? "PACKING" : "DRIVER",
    vehicleType: "موتور (دباب)"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/admin/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      onSuccess();
      onClose();
      setFormData({ name: "", email: "", phone: "", role: type === "employees" ? "PACKING" : "DRIVER", vehicleType: "موتور (دباب)" });
    } else {
      const err = await res.json();
      alert(err.error || "فشل الإضافة");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[#021D24]/90 backdrop-blur-md" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white w-full max-w-2xl rounded-[3.5rem] shadow-3xl p-12 overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-8 left-8 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-all"><X size={24} /></button>
        
        <div className="flex items-center gap-6 mb-12">
           <div className="w-16 h-16 rounded-[2rem] bg-[#1089A4]/10 text-[#1089A4] flex items-center justify-center">
              {type === "employees" ? <UserPlus size={32} /> : <Truck size={32} />}
           </div>
           <div>
              <h2 className="text-3xl font-black text-[#021D24]">إضافة {type === "employees" ? "موظف" : "مندوب"} جديد</h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Register new {type.slice(0, -1)}</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الاسم الكامل</label>
                 <div className="relative">
                    <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-transparent focus:border-[#1089A4] rounded-2xl px-6 py-4 outline-none font-bold pr-14" required />
                    <BadgeCheck className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                 </div>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">البريد الإلكتروني</label>
                 <div className="relative">
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border border-transparent focus:border-[#1089A4] rounded-2xl px-6 py-4 outline-none font-bold pr-14" required />
                    <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">رقم الهاتف</label>
                 <div className="relative">
                    <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 border border-transparent focus:border-[#1089A4] rounded-2xl px-6 py-4 outline-none font-bold pr-14" required />
                    <Phone className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                 </div>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{type === "employees" ? "الدور الوظيفي" : "نوع المركبة"}</label>
                 <div className="relative">
                    {type === "employees" ? (
                       <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-gray-50 border border-transparent focus:border-[#1089A4] rounded-2xl px-6 py-4 outline-none font-bold pr-14 appearance-none" required>
                          <option value="PACKING">مسؤول تغليف</option>
                          <option value="SHIPPING">مسؤول شحن</option>
                          <option value="CUSTOMER_SERVICE">خدمة عملاء</option>
                          <option value="INVENTORY">أمين مخزن</option>
                       </select>
                    ) : (
                       <select value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className="w-full bg-gray-50 border border-transparent focus:border-[#1089A4] rounded-2xl px-6 py-4 outline-none font-bold pr-14 appearance-none" required>
                          <option value="موتور (دباب)">موتور (دباب)</option>
                          <option value="سيارة صالون">سيارة صالون</option>
                          <option value="بوكس / نقل">بوكس / نقل</option>
                       </select>
                    )}
                    <Shield className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                 </div>
              </div>
           </div>

           <button type="submit" disabled={loading} className="w-full bg-[#1089A4] text-white py-6 rounded-2xl font-black shadow-xl hover:bg-[#021D24] transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50">
              {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : <UserPlus size={24} />}
              تأكيد إضافة {type === "employees" ? "الموظف" : "المندوب"}
           </button>
        </form>

        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gray-50 rounded-full blur-[100px] pointer-events-none" />
      </motion.div>
    </div>
  );
}
