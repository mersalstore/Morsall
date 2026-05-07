"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Palette, Image as ImageIcon, Layout, Plus, Trash2, Save, UploadCloud, ArrowUp, ArrowDown } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function AppearanceSettings() {
  const [settings, setSettings] = useState<any>({
    siteTitle: "مبهورون",
    siteDescription: "منصة مبهورون للتجارة الإلكترونية",
    logo: "",
    primaryColor: "#1089A4",
    secondaryColor: "#F29124",
    whatsappNumber: "",
    facebookUrl: "",
    instagramUrl: "",
  });
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/appearance");
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
      if (data.banners) setBanners(data.banners);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSaveSettings = async () => {
    setActionLoading("settings");
    try {
      const res = await fetch("/api/admin/settings/appearance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        alert("تم حفظ إعدادات الهوية بنجاح! ✨");
      } else {
        const errorData = await res.json();
        alert(`فشل الحفظ: ${errorData.error || "خطأ غير معروف"}`);
      }
    } catch (err) {
      alert("حدث خطأ تقني أثناء محاولة الحفظ");
    }
    setActionLoading(null);
  };

  const handleUpload = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) return data.url;
      else alert(`فشل الرفع: ${data.error}`);
    } catch (err) {
      alert("حدث خطأ أثناء رفع الملف");
    }
    return null;
  };

  const handleAddBanner = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setActionLoading("banner_add");
      const url = await handleUpload(file);
      if (url) {
        try {
          const res = await fetch("/api/admin/settings/appearance", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              type: "BANNER",
              imageUrl: url, 
              title: "عرض جديد وحصري",
              subtitle: "تسوق أفضل الماركات العالمية الآن",
              order: banners.length,
              isActive: true
            }),
          });
          if (res.ok) {
             const newBanner = await res.json();
             setBanners([...banners, newBanner]);
             alert("تم إضافة البانر بنجاح! 🎉");
          } else {
            alert("فشل في إنشاء البانر في قاعدة البيانات");
          }
        } catch (err) {
          alert("خطأ في الاتصال بالخادم");
        }
      }
      setActionLoading(null);
    };
    input.click();
  };

  const handleUpdateBanner = async (id: string, data: any) => {
    // Only proceed if it's a field we want to sync immediately or wait for save?
    // Let's do immediate sync for better UX
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/settings/appearance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "BANNER", id, ...data }),
      });
      if (res.ok) {
        setBanners(banners.map(b => b.id === id ? { ...b, ...data } : b));
      } else {
        console.error("Failed to update banner");
      }
    } catch (err) {
      console.error(err);
    }
    setActionLoading(null);
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا البانر؟ لا يمكن التراجع عن هذه الخطوة.")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setBanners(banners.filter(b => b.id !== id));
      } else {
        alert("حدث خطأ أثناء حذف البانر");
      }
    } catch (err) {
      console.error(err);
    }
    setActionLoading(null);
  };

  const moveBanner = async (index: number, direction: 'up' | 'down') => {
    const newBanners = [...banners];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBanners.length) return;

    [newBanners[index], newBanners[targetIndex]] = [newBanners[targetIndex], newBanners[index]];
    setBanners(newBanners);

    // Sync order for all affected banners
    for (let i = 0; i < newBanners.length; i++) {
       await fetch("/api/admin/settings/appearance", {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ type: "BANNER", id: newBanners[i].id, order: i }),
       });
    }
  };

  if (loading) return (
    <div className="p-20 text-center">
       <div className="w-16 h-16 border-4 border-[#1089A4] border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-2xl" />
       <p className="text-[#021D24] font-black uppercase tracking-[0.2em] text-xs">جاري تجهيز استوديو التصميم...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
      
      {/* Storage & Info Banner */}
      <div className="bg-gradient-to-r from-[#1089A4] to-[#021D24] rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-[#1089A4]/20 relative overflow-hidden group">
         <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-3 mb-4">
               <UploadCloud className="text-[#F29124] animate-bounce" size={24} />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Hostinger Cloud Storage</span>
            </div>
            <h2 className="text-3xl font-black mb-4 leading-tight">مساحة التخزين الخاصة بك (50GB)</h2>
            <p className="text-white/60 text-sm font-medium leading-relaxed">
              يتم تخزين جميع صورك وبانراتك مباشرة على سيرفر هوتنيجر الخاص بك. يمكنك رفع آلاف الصور عالية الجودة دون القلق بشأن المساحة.
            </p>
         </div>
         <div className="relative z-10 min-w-[240px] bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
            <div className="flex justify-between items-end mb-4">
               <span className="text-xs font-black uppercase tracking-widest">مساحة الصور</span>
               <span className="text-xl font-black text-[#F29124]">0.2%</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
               <div className="w-[2%] h-full bg-[#F29124] shadow-[0_0_15px_#F29124]" />
            </div>
            <p className="text-[9px] text-white/40 font-bold mt-4 uppercase tracking-[0.2em]">تم استخدام 104MB من 50GB</p>
         </div>
         <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 blur-[100px] rounded-full" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
        
        {/* Left Column: Identity & Branding (3/5) */}
        <div className="xl:col-span-3 space-y-8">
           <section className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-gray-200/40 border border-white/50 relative overflow-hidden">
              <div className="flex items-center gap-6 mb-12">
                 <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-[#1089A4] to-[#021D24] text-white flex items-center justify-center shadow-2xl shadow-[#1089A4]/20">
                    <Palette size={28} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-[#021D24]">الهوية البصرية للمنصة</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-1">إدارة العلامة التجارية وتجربة المستخدم</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] px-1">اسم المتجر / المنصة</label>
                       <input 
                          value={settings.siteTitle} 
                          onChange={e => setSettings({...settings, siteTitle: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] px-8 py-5 text-sm font-bold outline-none focus:border-[#1089A4] focus:bg-white transition-all shadow-inner" 
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] px-1">وصف المنصة (SEO)</label>
                       <textarea 
                          rows={4}
                          value={settings.siteDescription} 
                          onChange={e => setSettings({...settings, siteDescription: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] px-8 py-5 text-sm font-bold outline-none focus:border-[#1089A4] focus:bg-white transition-all shadow-inner resize-none" 
                       />
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] px-1">اللون الرئيسي</label>
                          <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-[1.5rem] border border-gray-100 shadow-inner">
                             <input 
                                type="color" 
                                value={settings.primaryColor} 
                                onChange={e => setSettings({...settings, primaryColor: e.target.value})}
                                className="w-12 h-12 rounded-2xl cursor-pointer border-none p-0 overflow-hidden shadow-lg" 
                             />
                             <span className="text-[10px] font-mono font-black text-[#021D24]">{settings.primaryColor}</span>
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] px-1">اللون الثانوي</label>
                          <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-[1.5rem] border border-gray-100 shadow-inner">
                             <input 
                                type="color" 
                                value={settings.secondaryColor} 
                                onChange={e => setSettings({...settings, secondaryColor: e.target.value})}
                                className="w-12 h-12 rounded-2xl cursor-pointer border-none p-0 overflow-hidden shadow-lg" 
                             />
                             <span className="text-[10px] font-mono font-black text-[#021D24]">{settings.secondaryColor}</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] px-1">رقم خدمة العملاء (واتساب)</label>
                       <input 
                          value={settings.whatsappNumber} 
                          onChange={e => setSettings({...settings, whatsappNumber: e.target.value})}
                          placeholder="مثلاً: 249123456789"
                          className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] px-8 py-5 text-sm font-bold outline-none focus:border-[#1089A4] focus:bg-white transition-all shadow-inner" 
                       />
                    </div>
                 </div>
              </div>

              {/* Logo Upload Section */}
              <div className="mt-12 p-10 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col md:flex-row items-center gap-12 group hover:border-[#1089A4]/30 transition-all">
                 <div className="relative w-40 h-40 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center overflow-hidden border-8 border-white transform group-hover:scale-105 transition-all duration-700">
                    {settings.logo ? (
                       <Image src={settings.logo} alt="Logo" fill className="object-contain p-6" />
                    ) : (
                       <div className="flex flex-col items-center gap-3">
                          <ImageIcon className="text-gray-100" size={48} />
                          <span className="text-[8px] font-black text-gray-200 uppercase tracking-widest">No Logo</span>
                       </div>
                    )}
                 </div>
                 <div className="flex-1 space-y-6 text-center md:text-right">
                    <div>
                       <h4 className="text-xl font-black text-[#021D24] mb-2">شعار المتجر الرسمي</h4>
                       <p className="text-[11px] text-gray-400 font-medium leading-relaxed max-w-sm">
                          سيظهر هذا الشعار في الفاتورة، الموقع، ورسائل الواتساب. تأكد من رفعه بخلفية شفافة PNG.
                       </p>
                    </div>
                    <label className="inline-flex items-center gap-4 px-10 py-4 bg-[#1089A4] text-white text-[10px] font-black rounded-2xl cursor-pointer hover:bg-[#021D24] transition-all shadow-xl shadow-[#1089A4]/20 active:scale-95">
                       <UploadCloud size={18} />
                       تحديث شعار المنصة
                       <input type="file" className="hidden" onChange={async e => {
                          const file = e.target.files?.[0];
                          if (file) {
                             const url = await handleUpload(file);
                             if (url) {
                               setSettings({...settings, logo: url});
                               alert("تم تحديث الشعار بنجاح! 🎨");
                             }
                          }
                       }} />
                    </label>
                 </div>
              </div>

              <button 
                 onClick={handleSaveSettings}
                 disabled={actionLoading === "settings"}
                 className="w-full mt-12 py-6 bg-[#021D24] text-white rounded-[1.8rem] font-black text-base flex items-center justify-center gap-4 hover:bg-[#1089A4] transition-all shadow-2xl shadow-[#021D24]/20 active:scale-95 disabled:opacity-50"
              >
                 {actionLoading === "settings" ? (
                   <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                 ) : <Save size={22} />}
                 {actionLoading === "settings" ? "جاري الحفظ..." : "حفظ جميع إعدادات الهوية"}
              </button>
           </section>
        </div>

        {/* Right Column: Banners Management (2/5) */}
        <div className="xl:col-span-2 space-y-8">
           <section className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-gray-200/40 border border-white/50 h-full">
              <div className="flex items-center justify-between mb-12">
                 <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-[#F29124]/10 text-[#F29124] flex items-center justify-center shadow-inner">
                       <Layout size={28} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-[#021D24]">بانرات الواجهة</h3>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-1">إدارة العروض الترويجية</p>
                    </div>
                 </div>
                 <button 
                    onClick={handleAddBanner}
                    disabled={actionLoading === "banner_add"}
                    className="w-14 h-14 rounded-2xl bg-[#F29124] text-white flex items-center justify-center hover:bg-[#021D24] hover:scale-110 transition-all shadow-2xl shadow-[#F29124]/20 active:scale-95"
                 >
                    {actionLoading === "banner_add" ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={30} />}
                 </button>
              </div>

              <div className="space-y-8 max-h-[1000px] overflow-y-auto pr-4 custom-scrollbar">
                 {banners.map((banner, index) => (
                    <motion.div 
                       key={banner.id} 
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       className="bg-gray-50/50 rounded-[2.5rem] p-6 border border-gray-100 space-y-6 group hover:bg-white hover:border-[#1089A4]/20 transition-all duration-500"
                    >
                       <div className="flex gap-6">
                          <div className="relative w-40 aspect-video rounded-2xl overflow-hidden bg-white border-4 border-white shadow-xl shrink-0 transform group-hover:scale-105 transition-transform duration-700">
                             <Image src={banner.imageUrl} alt="" fill className="object-cover" />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button onClick={() => handleDeleteBanner(banner.id)} className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all"><Trash2 size={18} /></button>
                             </div>
                          </div>
                          <div className="flex-1 space-y-3">
                             <input 
                                placeholder="عنوان العرض (Main Title)"
                                value={banner.title || ""}
                                onChange={e => handleUpdateBanner(banner.id, { title: e.target.value })}
                                className="w-full bg-white border border-gray-100 rounded-xl px-5 py-3 text-xs font-black outline-none focus:border-[#1089A4] shadow-sm"
                             />
                             <input 
                                placeholder="نص توضيحي (Sub Title)"
                                value={banner.subtitle || ""}
                                onChange={e => handleUpdateBanner(banner.id, { subtitle: e.target.value })}
                                className="w-full bg-white border border-gray-100 rounded-xl px-5 py-3 text-[10px] font-bold text-gray-400 outline-none focus:border-[#1089A4] shadow-sm"
                             />
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-3">
                          <div className="relative flex-1">
                             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-[10px] font-mono">URL:</span>
                             <input 
                                placeholder="رابط التوجيه عند الضغط"
                                value={banner.link || ""}
                                onChange={e => handleUpdateBanner(banner.id, { link: e.target.value })}
                                className="w-full bg-white border border-gray-100 rounded-xl pr-14 pl-5 py-3 text-[10px] font-mono text-[#1089A4] outline-none focus:border-[#1089A4] shadow-sm"
                             />
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => moveBanner(index, 'up')} className="w-10 h-10 bg-white rounded-xl border border-gray-100 text-[#021D24] flex items-center justify-center hover:bg-[#021D24] hover:text-white transition-all shadow-sm"><ArrowUp size={16} /></button>
                             <button onClick={() => moveBanner(index, 'down')} className="w-10 h-10 bg-white rounded-xl border border-gray-100 text-[#021D24] flex items-center justify-center hover:bg-[#021D24] hover:text-white transition-all shadow-sm"><ArrowDown size={16} /></button>
                          </div>
                       </div>
                    </motion.div>
                 ))}
                 
                 {banners.length === 0 && (
                    <div className="py-32 text-center border-4 border-dashed border-gray-50 rounded-[3rem] flex flex-col items-center gap-6">
                       <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center">
                          <ImageIcon size={48} className="text-gray-100" />
                       </div>
                       <p className="text-xs font-black text-gray-300 uppercase tracking-[0.4em]">لا توجد بانرات ترويجية حالياً</p>
                    </div>
                 )}
              </div>
           </section>
        </div>

      </div>
    </div>
  );
}
