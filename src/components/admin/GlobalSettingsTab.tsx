"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, Percent, Globe, Palette, Crown, Sparkles, Store } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GlobalSettingsTab({ showToast }: { showToast?: (msg: string, type?: "success" | "error" | "info") => void }) {
  const [settings, setSettings] = useState<any>(null);
  const [designPricing, setDesignPricing] = useState<any>({
    basic: { price: 0, label: "مجاني", sections: 4 },
    premium: { price: 15000, label: "بريميوم", sections: 6 },
    custom: { price: 35000, label: "مخصص", sections: 10 },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/appearance")
      .then(res => res.json())
      .then(data => {
        setSettings(data.settings || {});
        if (data.designPricing) setDesignPricing(data.designPricing);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/settings/appearance", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings, designPricing })
    });
    setSaving(false);
    if (showToast) {
      showToast("تم حفظ الإعدادات بنجاح ✨", "success");
    } else {
      alert("تم حفظ الإعدادات بنجاح");
    }
  };

  const updateDesignPrice = (tier: string, field: string, value: any) => {
    setDesignPricing((prev: any) => ({
      ...prev,
      [tier]: { ...prev[tier], [field]: value }
    }));
  };

  if (loading) return <div className="p-20 text-center font-black text-gray-400 uppercase tracking-widest">جاري تحميل إعدادات النظام...</div>;

  return (
    <form onSubmit={handleSave} className="space-y-12">
      <div className="flex justify-between items-center bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-[#F29124]/10 text-[#F29124] flex items-center justify-center">
               <Settings size={32} />
            </div>
            <div>
               <h2 className="text-3xl font-black text-[#0F172A]">الإعدادات العامة</h2>
               <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Platform Core Configuration</p>
            </div>
         </div>
         <button 
           type="submit"
           disabled={saving}
           className="bg-[#0F172A] text-white px-12 py-5 rounded-[1.5rem] font-black text-sm shadow-xl hover:bg-[#C5A021] transition-all flex items-center gap-4 active:scale-95 disabled:opacity-50"
         >
            {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={20} />}
            حفظ التغييرات
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
         {/* Platform Economics */}
         <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-2xl space-y-10">
            <div className="flex items-center gap-4 text-[#C5A021]">
               <Percent size={24} />
               <h3 className="text-xl font-black text-[#0F172A]">اقتصاديات المنصة</h3>
            </div>
            
            <div className="space-y-4">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">نوع عمولة المنصة</label>
               <select 
                  value={settings.commissionType || "PERCENTAGE"}
                  onChange={e => setSettings({...settings, commissionType: e.target.value})}
                  className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-6 py-5 text-sm font-black outline-none transition-all"
               >
                  <option value="PERCENTAGE">نسبة مئوية (%) من الطلب / المنتج</option>
                  <option value="FIXED">مبلغ ثابت (ج.س) لكل طلب / منتج</option>
               </select>
            </div>

            {settings.commissionType === "FIXED" ? (
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">مبلغ العمولة الثابت (ج.س)</label>
                  <input 
                     type="number"
                     value={settings.fixedCommission || ""}
                     onChange={e => setSettings({...settings, fixedCommission: parseFloat(e.target.value)})}
                     className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-6 py-5 text-lg font-black outline-none transition-all"
                     placeholder="500"
                  />
                  <p className="text-[9px] text-gray-400 px-2 leading-relaxed">المبلغ الثابت بالجنيه السوداني الذي يتم خصمها من كل عملية بيع لصالح الموقع.</p>
               </div>
            ) : (
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">عمولة المنصة (%)</label>
                  <input 
                     type="number"
                     value={settings.platformCommission || ""}
                     onChange={e => setSettings({...settings, platformCommission: parseFloat(e.target.value)})}
                     className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-6 py-5 text-lg font-black outline-none transition-all"
                     placeholder="10"
                  />
                  <p className="text-[9px] text-gray-400 px-2 leading-relaxed">النسبة المئوية التي يتم خصمها من كل عملية بيع لصالح الموقع.</p>
               </div>
            )}

            <div className="space-y-4">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الحد الأدنى للسحب (ج.س)</label>
               <input 
                  type="number"
                  value={settings.minWithdrawal || ""}
                  onChange={e => setSettings({...settings, minWithdrawal: parseFloat(e.target.value)})}
                  className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-6 py-5 text-lg font-black outline-none transition-all"
                  placeholder="1000"
               />
            </div>
         </div>

         {/* SEO & Branding */}
         <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-2xl space-y-10">
            <div className="flex items-center gap-4 text-[#F29124]">
               <Globe size={24} />
               <h3 className="text-xl font-black text-[#0F172A]">الهوية وتحسين المحركات</h3>
            </div>
            
            <div className="space-y-4">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">عنوان الموقع (Meta Title)</label>
               <input 
                  value={settings.siteTitle || ""}
                  onChange={e => setSettings({...settings, siteTitle: e.target.value})}
                  className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-6 py-5 text-sm font-black outline-none transition-all"
                  placeholder="مرسال - Morsall"
               />
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">وصف الموقع (Meta Description)</label>
               <textarea 
                  value={settings.siteDescription || ""}
                  onChange={e => setSettings({...settings, siteDescription: e.target.value})}
                  className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-6 py-5 text-sm font-bold min-h-[120px] outline-none transition-all"
                  placeholder="أكبر منصة تجارة إلكترونية في السودان..."
               />
            </div>
         </div>

         {/* Payment Configuration */}
         <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-2xl space-y-10 md:col-span-2">
            <div className="flex items-center gap-4 text-[#C5A021]">
               <div className="w-10 h-10 rounded-xl bg-[#C5A021]/10 flex items-center justify-center text-[#C5A021]">
                  <Globe size={20} />
               </div>
               <h3 className="text-xl font-black text-[#0F172A]">إعدادات الدفع والحسابات</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">رسوم الدفع عند الاستلام (ج.س)</label>
                  <input 
                     type="number"
                     value={settings.codExtraFee || ""}
                     onChange={e => setSettings({...settings, codExtraFee: parseFloat(e.target.value)})}
                     className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-6 py-5 text-lg font-black outline-none transition-all"
                     placeholder="2000"
                  />
                  <p className="text-[9px] text-gray-400 px-2 leading-relaxed">المبلغ الإضافي الذي يتم تحصيله عند اختيار الدفع عند الاستلام.</p>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الحسابات البنكية</label>
                  <textarea 
                     value={settings.bankAccounts || ""}
                     onChange={e => setSettings({...settings, bankAccounts: e.target.value})}
                     className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-6 py-5 text-sm font-bold min-h-[150px] outline-none transition-all"
                     placeholder="مثال:
بنك الخرطوم: 1234567 (باسم: شركة مرسال)
بنك أم درمان الوطني: 7654321"
                  />
                  <p className="text-[9px] text-gray-400 px-2 leading-relaxed">اكتب تفاصيل الحسابات البنكية التي ستظهر للعملاء عند اختيار التحويل البنكي.</p>
               </div>
            </div>
         </div>

         {/* Vendor Product Limits Configuration */}
         <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-2xl space-y-10 md:col-span-2">
            <div className="flex items-center gap-4 text-[#F29124]">
               <div className="w-10 h-10 rounded-xl bg-[#F29124]/10 flex items-center justify-center text-[#F29124]">
                  <Settings size={20} />
               </div>
               <h3 className="text-xl font-black text-[#0F172A]">إعدادات حدود رفع المنتجات للتجار</h3>
            </div>
            <p className="text-[10px] text-gray-400 font-bold px-2 -mt-6">حدد الحد الأقصى للمنتجات التي يمكن للتاجر نشرها بناءً على باقة اشتراكه</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الحد الأقصى لمنتجات الفترة التجريبية (Freemium)</label>
                  <input 
                     type="number"
                     value={settings.trialMaxProducts !== undefined ? settings.trialMaxProducts : 10}
                     onChange={e => setSettings({...settings, trialMaxProducts: parseInt(e.target.value) || 0})}
                     className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-6 py-5 text-lg font-black outline-none transition-all"
                     placeholder="10"
                  />
                  <p className="text-[9px] text-gray-400 px-2 leading-relaxed">الحد الأقصى لعدد المنتجات التي يمكن رفعها خلال فترة التجربة المجانية (14 يوم).</p>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الحد الأقصى لمنتجات باقة منشئ المتاجر (Premium Builder)</label>
                  <input 
                     type="number"
                     value={settings.premiumMaxProducts !== undefined ? settings.premiumMaxProducts : 50}
                     onChange={e => setSettings({...settings, premiumMaxProducts: parseInt(e.target.value) || 0})}
                     className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-6 py-5 text-lg font-black outline-none transition-all"
                     placeholder="50"
                  />
                  <p className="text-[9px] text-gray-400 px-2 leading-relaxed">الحد الأقصى لعدد المنتجات التي يمكن رفعها في باقة منشئ المتاجر المدفوعة.</p>
               </div>
            </div>
         </div>

         {/* Store Design Pricing (Odoo System) */}
         <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-2xl space-y-10 md:col-span-2">
            <div className="flex items-center gap-4 text-[#C5A021]">
               <Palette size={24} />
               <h3 className="text-xl font-black text-[#0F172A]">أسعار تصميم المتاجر (نظام أودو)</h3>
               <span className="bg-[#C5A021]/10 text-[#C5A021] text-[9px] font-black px-3 py-1 rounded-full">Odoo-Style Store Designer</span>
            </div>
            <p className="text-[10px] text-gray-400 font-bold px-2 -mt-6">حدد أسعار الباقات التي يمكن للتجار الاشتراك بها لتصميم متجر خاص بهم</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {["basic", "premium", "custom"].map((tier) => {
                 const t = designPricing[tier] || { price: 0, label: tier, sections: 4 };
                 const icons: Record<string, any> = { basic: Store, premium: Crown, custom: Sparkles };
                 const Icon = icons[tier] || Store;
                 const colors: Record<string, string> = { basic: "from-gray-500 to-gray-600", premium: "from-[#C5A021] to-[#F29124]", custom: "from-[#0F172A] to-[#1a2744]" };
                 return (
                   <div key={tier} className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-200 space-y-6">
                     <div className="flex items-center gap-3">
                       <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center", colors[tier])}>
                         <Icon size={18} className="text-white" />
                       </div>
                       <div>
                         <h4 className="font-black text-[#0F172A]">{t.label || tier}</h4>
                         <p className="text-[9px] text-gray-400 font-bold">الباقة {tier === "basic" ? "الأساسية" : tier === "premium" ? "المتقدمة" : "المخصصة"}</p>
                       </div>
                     </div>
                     <div className="space-y-4">
                       <div className="space-y-2">
                         <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">السعر (ج.س)</label>
                         <input
                           type="number"
                           value={t.price || 0}
                           onChange={e => updateDesignPrice(tier, "price", parseFloat(e.target.value) || 0)}
                           className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-black text-[#0F172A] outline-none focus:border-[#C5A021] transition-all"
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">عدد الأقسام المسموحة</label>
                         <input
                           type="number"
                           value={t.sections || 4}
                           onChange={e => updateDesignPrice(tier, "sections", parseInt(e.target.value) || 4)}
                           className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-black text-[#0F172A] outline-none focus:border-[#C5A021] transition-all"
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">اسم الباقة</label>
                         <input
                           type="text"
                           value={t.label || ""}
                           onChange={e => updateDesignPrice(tier, "label", e.target.value)}
                           className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-[#C5A021] transition-all"
                         />
                       </div>
                     </div>
                   </div>
                 );
               })}
            </div>
         </div>
      </div>
    </form>
  );
}
