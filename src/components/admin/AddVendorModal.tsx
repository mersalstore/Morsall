"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingVendor?: any;
}

export default function AddVendorModal({ isOpen, onClose, onSuccess, editingVendor }: AddVendorModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    storeName: "",
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    phone: "",
    location: "الخرطوم",
  });

  useEffect(() => {
    if (editingVendor && isOpen) {
      setFormData({
        storeName: editingVendor.storeName || "",
        ownerName: editingVendor.user?.name || editingVendor.ownerName || "",
        ownerEmail: editingVendor.user?.email || editingVendor.ownerEmail || "",
        ownerPassword: "",
        phone: editingVendor.phone || "",
        location: editingVendor.location || "الخرطوم",
      });
    } else if (isOpen) {
      setFormData({
        storeName: "",
        ownerName: "",
        ownerEmail: "",
        ownerPassword: "",
        phone: "",
        location: "الخرطوم",
      });
    }
  }, [editingVendor, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingVendor ? "PUT" : "POST";
      const bodyData = editingVendor ? { ...formData, id: editingVendor.id } : formData;

      const res = await fetch("/api/admin/vendors", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        onSuccess();
        onClose();
        setFormData({
          storeName: "",
          ownerName: "",
          ownerEmail: "",
          ownerPassword: "",
          phone: "",
          location: "الخرطوم",
        });
      } else {
        const err = await res.json();
        alert(err.error || (editingVendor ? "فشل تعديل المورد" : "فشل إضافة المورد"));
      }
    } catch (err) {
      alert("حدث خطأ أثناء الاتصال بالخادم");
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6" dir="rtl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#021D24]/40 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#021D24]">{editingVendor ? "تعديل بيانات المورد" : "إضافة مورد جديد"}</h2>
            <button type="button" onClick={onClose} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
              <span className="material-symbols-rounded">close</span>
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">اسم المتجر</label>
                  <input required value={formData.storeName} onChange={(e) => setFormData({...formData, storeName: e.target.value})} type="text" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#1089A4] transition-all" placeholder="مثال: متجر الإلكترونيات الحديثة" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">اسم المالك</label>
                  <input required value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} type="text" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#1089A4] transition-all" placeholder="مثال: أحمد محمد" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">البريد الإلكتروني (لتسجيل الدخول)</label>
                  <input required value={formData.ownerEmail} onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})} type="email" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#1089A4] transition-all" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">كلمة المرور {editingVendor ? "(اتركه فارغاً لعدم التغيير)" : "المؤقتة"}</label>
                  <input required={!editingVendor} value={formData.ownerPassword} onChange={(e) => setFormData({...formData, ownerPassword: e.target.value})} type="password" minLength={6} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#1089A4] transition-all" placeholder={editingVendor ? "اتركه فارغاً لعدم التغيير" : "******"} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">رقم الهاتف</label>
                    <input required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} type="tel" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#1089A4] transition-all" placeholder="09xxxxxxx" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">المدينة / المنطقة</label>
                    <input required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} type="text" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#1089A4] transition-all" placeholder="الخرطوم" />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8 bg-gray-50 flex items-center gap-4">
              <button type="button" onClick={onClose} className="flex-1 bg-white border border-gray-200 text-gray-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">
                إلغاء
              </button>
              <button type="submit" disabled={loading} className="flex-1 bg-[#1089A4] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#1089A4]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                {loading ? (editingVendor ? "جاري التعديل..." : "جاري الإضافة...") : (editingVendor ? "حفظ التعديلات" : "حفظ المورد")}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
