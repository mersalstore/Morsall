"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, UserPlus, Mail, Phone, Shield, Truck, BadgeCheck, Eye, EyeOff, Copy, CheckCircle2, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddPersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: "employees" | "drivers";
}

const ALL_TABS = [
  { id: "overview", label: "نظرة عامة", icon: "dashboard" },
  { id: "approvals", label: "الموافقات", icon: "order_approve" },
  { id: "users", label: "العملاء والتجار", icon: "group" },
  { id: "vendors", label: "المتاجر", icon: "store" },
  { id: "categories", label: "الأقسام", icon: "category" },
  { id: "employees", label: "الموظفين", icon: "badge" },
  { id: "orders", label: "الطلبات", icon: "shopping_cart" },
  { id: "payments", label: "طرق الدفع", icon: "credit_card" },
  { id: "logistics", label: "اللوجستي", icon: "local_shipping" },
  { id: "delivery", label: "مناطق التوصيل", icon: "map" },
  { id: "shipping", label: "شركات الشحن", icon: "airport_shuttle" },
  { id: "finance", label: "المالية", icon: "payments" },
  { id: "settings", label: "الإعدادات", icon: "settings" },
  { id: "inventory", label: "المنتجات", icon: "inventory_2" },
  { id: "drivers", label: "المناديب", icon: "delivery_dining" },
  { id: "subscriptions", label: "الاشتراكات", icon: "loyalty" },
  { id: "attributes", label: "خصائص المنتجات", icon: "tune" },
];

export default function AddPersonnelModal({ isOpen, onClose, onSuccess, type }: AddPersonnelModalProps) {
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState<any>(null);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    password: string;
    role: string;
    vehicleType: string;
    permissions: string[];
  }>({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: type === "employees" ? "PACKING" : "DRIVER",
    vehicleType: "موتور (دباب)",
    permissions: []
  });

  const togglePermission = (tabId: string) => {
    const current = formData.permissions;
    const next = current.includes(tabId)
      ? current.filter(id => id !== tabId)
      : [...current, tabId];
    setFormData({ ...formData, permissions: next });
  };

  const ROLE_LABELS: Record<string, string> = {
    PACKING: "مسؤول تغليف",
    SHIPPING: "مسؤول شحن",
    CUSTOMER_SERVICE: "خدمة عملاء",
    INVENTORY: "أمين مخزن",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/admin/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (res.ok) {
      setCreatedEmployee(data);
      onSuccess();
    } else {
      alert(data.error || "فشل الإضافة");
    }
    setLoading(false);
  };

  const handleClose = () => {
    setCreatedEmployee(null);
    setFormData({ name: "", email: "", phone: "", password: "", role: type === "employees" ? "PACKING" : "DRIVER", vehicleType: "موتور (دباب)", permissions: [] });
    onClose();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[#0F172A]/90 backdrop-blur-md" onClick={handleClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white w-full max-w-2xl rounded-[3.5rem] shadow-3xl overflow-hidden"
      >
        {/* Success State — show credentials */}
        {createdEmployee ? (
          <div className="p-12">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-black text-[#0F172A]">
                تم إضافة {type === "employees" ? "الموظف" : "المندوب"} بنجاح! 🎉
              </h2>
              <p className="text-gray-400 text-sm mt-1">{createdEmployee.name} — {ROLE_LABELS[createdEmployee.role] || createdEmployee.role}</p>
            </div>

            <div className="space-y-4">
              {/* Login info card */}
              <div className="bg-gradient-to-br from-[#0F172A] to-[#0D3B47] rounded-2xl p-6 text-white">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-4">بيانات تسجيل الدخول</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
                    <span className="font-mono text-sm">{createdEmployee.email}</span>
                    <span className="text-[10px] text-white/50 font-bold">الإيميل</span>
                  </div>
                  {createdEmployee.tempPassword && (
                    <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-[#F29124]">{createdEmployee.tempPassword}</span>
                        <button onClick={() => copyToClipboard(createdEmployee.tempPassword)}
                          className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-all">
                          {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                      <span className="text-[10px] text-white/50 font-bold">كلمة المرور</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-black text-amber-700 flex items-center gap-2">
                  <KeyRound size={14} />
                  تعليمات تسجيل الدخول للموظف:
                </p>
                <ul className="text-xs text-amber-600 space-y-1 list-disc list-inside">
                  <li>يمكنه الدخول بالإيميل وكلمة المرور أعلاه</li>
                  <li>أو استخدام زر <strong>Google Login</strong> بنفس الإيميل</li>
                  <li>سيتوجه تلقائياً للوحة التحكم الخاصة بدوره</li>
                  <li>ينصح بتغيير كلمة المرور عند أول دخول</li>
                </ul>
              </div>

              {createdEmployee.userCreated === false && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <p className="text-xs font-bold text-blue-700">ℹ️ الموظف لديه حساب مسجل مسبقاً — تم تحديث صلاحياته فقط</p>
                </div>
              )}
            </div>

            <button onClick={handleClose} className="w-full mt-6 bg-[#C5A021] text-white py-4 rounded-2xl font-black text-sm hover:bg-[#0F172A] transition-all">
              إغلاق
            </button>
          </div>
        ) : (
          /* Form State */
          <div className="p-12">
            <button onClick={handleClose} className="absolute top-8 left-8 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-all"><X size={24} /></button>

            <div className="flex items-center gap-6 mb-10">
              <div className="w-16 h-16 rounded-[2rem] bg-[#C5A021]/10 text-[#C5A021] flex items-center justify-center">
                {type === "employees" ? <UserPlus size={32} /> : <Truck size={32} />}
              </div>
              <div>
                <h2 className="text-3xl font-black text-[#0F172A]">إضافة {type === "employees" ? "موظف" : "مندوب"} جديد</h2>
                <p className="text-gray-400 text-xs font-bold mt-1">سيتم إنشاء حساب تلقائياً إذا لم يكن موجوداً</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الاسم الكامل</label>
                  <div className="relative">
                    <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-6 py-4 outline-none font-bold pr-14" required />
                    <BadgeCheck className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">البريد الإلكتروني</label>
                  <div className="relative">
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-6 py-4 outline-none font-bold pr-14" required />
                    <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">رقم الهاتف</label>
                  <div className="relative">
                    <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-6 py-4 outline-none font-bold pr-14" />
                    <Phone className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{type === "employees" ? "الدور الوظيفي" : "نوع المركبة"}</label>
                  <div className="relative">
                    {type === "employees" ? (
                      <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                        className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-6 py-4 outline-none font-bold pr-14 appearance-none" required>
                        <option value="USER">موظف عادي (تخصيص يدوي)</option>
                        <option value="PACKING">مسؤول تغليف</option>
                        <option value="SHIPPING">مسؤول شحن</option>
                        <option value="CUSTOMER_SERVICE">خدمة عملاء</option>
                        <option value="INVENTORY">أمين مخزن</option>
                      </select>
                    ) : (
                      <select value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})}
                        className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-6 py-4 outline-none font-bold pr-14 appearance-none" required>
                        <option value="موتور (دباب)">موتور (دباب)</option>
                        <option value="سيارة صالون">سيارة صالون</option>
                        <option value="بوكس / نقل">بوكس / نقل</option>
                      </select>
                    )}
                    <Shield className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  </div>
                </div>
              </div>

              {type === "employees" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">تحديد صلاحيات الوصول</label>
                    <button type="button" onClick={() => setFormData({...formData, permissions: ALL_TABS.map(t => t.id)})} className="text-[9px] font-bold text-[#C5A021] hover:underline">اختيار الكل</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ALL_TABS.map((tab) => {
                      const isSelected = formData.permissions.includes(tab.id);
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => togglePermission(tab.id)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center",
                            isSelected 
                              ? "bg-[#C5A021] border-[#C5A021] text-white" 
                              : "bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100"
                          )}
                        >
                          <span className="material-symbols-rounded text-lg">{tab.icon}</span>
                          <span className="text-[9px] font-bold leading-tight">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                  كلمة المرور <span className="text-gray-300 normal-case">(اتركها فارغة لتوليد كلمة مرور تلقائية)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="اتركها فارغة لكلمة مرور عشوائية..."
                    className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-6 py-4 outline-none font-bold pr-14"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                    {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="bg-[#C5A021]/5 border border-[#C5A021]/20 rounded-2xl p-4">
                <p className="text-xs font-bold text-[#C5A021]">
                  💡 سيتم إنشاء حساب للموظف تلقائياً — يمكنه الدخول بالإيميل وكلمة المرور أو عبر Google
                </p>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-[#C5A021] text-white py-5 rounded-2xl font-black shadow-xl hover:bg-[#0F172A] transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50">
                {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : <UserPlus size={24} />}
                تأكيد إضافة {type === "employees" ? "الموظف" : "المندوب"}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
