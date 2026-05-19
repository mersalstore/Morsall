"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface EditPermissionsModalProps {
  isOpen: boolean;
  person: any;
  type: "employees" | "drivers";
  onClose: () => void;
  onSuccess: () => void;
}

const ALL_TABS = [
  { id: "overview", label: "لوحة القيادة", icon: "dashboard" },
  { id: "orders", label: "الطلبات", icon: "shopping_cart" },
  { id: "inventory", label: "المخزون", icon: "inventory_2" },
  { id: "categories", label: "الأقسام", icon: "category" },
  { id: "attributes", label: "المواصفات", icon: "list" },
  { id: "users", label: "العملاء", icon: "group" },
  { id: "vendors", label: "الموردين", icon: "store" },
  { id: "approvals", label: "الموافقات", icon: "verified" },
  { id: "logistics", label: "الخدمات اللوجستية", icon: "local_shipping" },
  { id: "drivers", label: "المناديب", icon: "directions_car" },
  { id: "finance", label: "المالية", icon: "account_balance_wallet" },
  { id: "delivery", label: "مناطق التوصيل", icon: "map" },
  { id: "shipping", label: "شركات الشحن", icon: "local_post_office" },
  { id: "appearance", label: "المظهر", icon: "palette" },
  { id: "globalSettings", label: "الإعدادات العامة", icon: "settings" },
  { id: "offersAds", label: "العروض والإعلانات", icon: "campaign" },
];

export default function EditPermissionsModal({ isOpen, person, type, onClose, onSuccess }: EditPermissionsModalProps) {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(person?.role || "USER");
  const [permissions, setPermissions] = useState<string[]>([]);

  // Sync role and permissions when person changes
  React.useEffect(() => {
    if (person) {
      setRole(person.role || "USER");
      setPermissions(person.permissions || []);
    }
  }, [person]);

  if (!isOpen || !person) return null;

  const togglePermission = (id: string) => {
    setPermissions(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const selectAll = () => setPermissions(ALL_TABS.map(t => t.id));
  const deselectAll = () => setPermissions([]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${type}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: person.id, role, permissions })
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "فشل تحديث الصلاحيات");
      }
    } catch (err) {
      alert("حدث خطأ أثناء تحديث الصلاحيات");
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6" dir="rtl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-md" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-2xl rounded-[3rem] shadow-3xl relative z-10 overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#0F172A]">تعديل الصلاحيات والمداخل</h2>
            <button onClick={onClose} className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
              <span className="material-symbols-rounded">close</span>
            </button>
          </div>
          
          <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-8">
            <div className="flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">الموظف الحالي</p>
                  <p className="font-bold text-lg text-[#0F172A]">{person.name || person.user?.name}</p>
               </div>
               <div className="w-40">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">مستوى الدور</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all"
                  >
                    <option value="USER">موظف عادي</option>
                    <option value="DRIVER">مندوب</option>
                    <option value="MODERATOR">مشرف</option>
                    <option value="ADMIN">مدير كامل</option>
                  </select>
               </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-widest">تخصيص الوصول للصفحات</h3>
                <div className="flex gap-4">
                  <button onClick={selectAll} className="text-[10px] font-black text-[#C5A021] hover:underline">اختيار الكل</button>
                  <button onClick={deselectAll} className="text-[10px] font-black text-red-400 hover:underline">إلغاء الكل</button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ALL_TABS.map((tab) => {
                  const isSelected = permissions.includes(tab.id);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => togglePermission(tab.id)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-4 rounded-2xl border transition-all text-right group",
                        isSelected 
                          ? "bg-[#C5A021] border-[#C5A021] text-white shadow-lg shadow-[#C5A021]/20" 
                          : "bg-white border-gray-100 text-gray-400 hover:border-[#C5A021]/30"
                      )}
                    >
                      <span className={cn(
                        "material-symbols-rounded text-xl transition-transform group-hover:scale-110",
                        isSelected ? "text-white" : "text-gray-300"
                      )}>{tab.icon}</span>
                      <span className="text-[11px] font-bold truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-8 bg-gray-50 flex items-center gap-4">
            <button onClick={onClose} className="flex-1 bg-white border border-gray-200 text-gray-600 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">
              إلغاء
            </button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-[#C5A021] text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-[#C5A021]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
              {loading ? "جاري الحفظ..." : "تحديث الصلاحيات"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
