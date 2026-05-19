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
    commissionType: "PERCENTAGE", // PERCENTAGE | FIXED
    commissionRate: "10",
    fixedFee: "0",
    subscriptionFee: "0",
    trialDays: "30",
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
        commissionType: editingVendor.commissionType || "PERCENTAGE",
        commissionRate: editingVendor.commissionRate?.toString() || "10",
        fixedFee: editingVendor.fixedFee?.toString() || "0",
        subscriptionFee: editingVendor.subscriptionFee?.toString() || "0",
        trialDays: "0", // Not easily editable as days after creation, but we'll handle it in API
      });
    } else if (isOpen) {
      setFormData({
        storeName: "",
        ownerName: "",
        ownerEmail: "",
        ownerPassword: "",
        phone: "",
        location: "الخرطوم",
        commissionType: "PERCENTAGE",
        commissionRate: "10",
        fixedFee: "0",
        subscriptionFee: "0",
        trialDays: "30",
      });
    }
  }, [editingVendor, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingVendor ? "PUT" : "POST";
      const bodyData = {
        ...formData,
        id: editingVendor?.id,
        commissionRate: parseFloat(formData.commissionRate),
        fixedFee: parseFloat(formData.fixedFee),
        subscriptionFee: parseFloat(formData.subscriptionFee),
        trialDays: parseInt(formData.trialDays),
      };

      const res = await fetch("/api/admin/vendors", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        onSuccess();
        onClose();
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#0F172A]">{editingVendor ? "تعديل بيانات المورد" : "إضافة مورد جديد"}</h2>
            <button type="button" onClick={onClose} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
              <span className="material-symbols-rounded">close</span>
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Core Info Section */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-[#C5A021] uppercase tracking-widest border-b pb-2">البيانات الأساسية</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">اسم المتجر</label>
                    <input required value={formData.storeName} onChange={(e) => setFormData({...formData, storeName: e.target.value})} type="text" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#C5A021]" placeholder="متجر مرسال" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">اسم المالك</label>
                    <input required value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} type="text" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#C5A021]" placeholder="أحمد محمد" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">البريد الإلكتروني</label>
                    <input required value={formData.ownerEmail} onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})} type="email" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#C5A021]" placeholder="vendor@example.com" />
                  </div>
                </div>
              </div>

              {/* Monetization Section */}
              <div className="space-y-4 p-6 bg-orange-50/50 rounded-3xl border border-orange-100">
                <p className="text-[10px] font-black text-[#F29124] uppercase tracking-widest border-b border-orange-200 pb-2 mb-4">نموذج الربح والاشتراك</p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">نوع العمولة</label>
                    <select value={formData.commissionType} onChange={(e) => setFormData({...formData, commissionType: e.target.value})} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none">
                      <option value="PERCENTAGE">نسبة مئوية (%)</option>
                      <option value="FIXED">مبلغ ثابت لكل منتج</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">قيمة العمولة</label>
                    <input required value={formData.commissionRate} onChange={(e) => setFormData({...formData, commissionRate: e.target.value})} type="number" step="0.1" className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-black outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">رسوم اشتراك دورية</label>
                    <input required value={formData.subscriptionFee} onChange={(e) => setFormData({...formData, subscriptionFee: e.target.value})} type="number" className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-black outline-none" />
                  </div>
                  {!editingVendor && (
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">الفترة التجريبية (بالأيام)</label>
                      <input required value={formData.trialDays} onChange={(e) => setFormData({...formData, trialDays: e.target.value})} type="number" className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-black outline-none text-[#C5A021]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Login & Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">كلمة المرور {editingVendor ? "(اتركه فارغاً لعدم التغيير)" : ""}</label>
                  <input required={!editingVendor} value={formData.ownerPassword} onChange={(e) => setFormData({...formData, ownerPassword: e.target.value})} type="password" minLength={6} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#C5A021]" placeholder="******" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">رقم الهاتف</label>
                  <input required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} type="tel" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#C5A021]" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">المدينة</label>
                  <input required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} type="text" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#C5A021]" />
                </div>
              </div>
            </div>
            <div className="p-8 bg-gray-50 flex items-center gap-4">
              <button type="button" onClick={onClose} className="flex-1 bg-white border border-gray-200 text-gray-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">إلغاء</button>
              <button type="submit" disabled={loading} className="flex-1 bg-[#0F172A] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all disabled:opacity-50">
                {loading ? "جاري الحفظ..." : "حفظ المورد"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
