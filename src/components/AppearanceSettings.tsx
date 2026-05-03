"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Palette, Image as ImageIcon, Layout, Plus, Trash2, Save, UploadCloud } from "lucide-react";
import Image from "next/image";

export default function AppearanceSettings() {
  const [settings, setSettings] = useState<any>({
    siteTitle: "مرسال",
    siteDescription: "منصة مرسال للتجارة الإلكترونية",
    logo: "",
    primaryColor: "#1089A4",
    secondaryColor: "#F29124",
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
      await fetch("/api/admin/settings/appearance", {
        method: "PATCH",
        body: JSON.stringify(settings),
      });
      alert("تم حفظ الإعدادات بنجاح!");
    } catch (err) {
      alert("حدث خطأ أثناء الحفظ");
    }
    setActionLoading(null);
  };

  const handleUpload = async (file: File, type: "LOGO" | "BANNER", bannerId?: string) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) {
      if (type === "LOGO") {
        setSettings({ ...settings, logo: data.url });
      } else {
        // Handle banner update or add logic here
      }
      return data.url;
    }
  };

  const handleAddBanner = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setActionLoading("banner_add");
      const url = await handleUpload(file, "BANNER");
      if (url) {
        const res = await fetch("/api/admin/settings/appearance", {
          method: "PATCH",
          body: JSON.stringify({ type: "BANNER", imageUrl: url, type_name: "HOME_HERO" }),
        });
        const newBanner = await res.json();
        setBanners([...banners, newBanner]);
      }
      setActionLoading(null);
    };
    input.click();
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا البانر؟")) return;
    await fetch("/api/admin/banners", { method: "DELETE", body: JSON.stringify({ id }) });
    setBanners(banners.filter(b => b.id !== id));
  };

  if (loading) return <div className="p-12 text-center text-gray-400">جاري التحميل...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Site Identity & Branding */}
        <section className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#1089A4]/10 text-[#1089A4] flex items-center justify-center">
              <Palette size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#021D24]">هوية العلامة التجارية</h3>
              <p className="text-xs text-gray-400 font-bold">تحكم في الشعار، الألوان والأسماء الأساسية</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">اسم الموقع</label>
              <input 
                value={settings.siteTitle} 
                onChange={e => setSettings({...settings, siteTitle: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:border-[#1089A4] transition-all" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">اللون الأساسي</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={settings.primaryColor} 
                    onChange={e => setSettings({...settings, primaryColor: e.target.value})}
                    className="w-12 h-12 rounded-xl cursor-pointer border-none p-0 overflow-hidden" 
                  />
                  <input 
                    value={settings.primaryColor} 
                    onChange={e => setSettings({...settings, primaryColor: e.target.value})}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 text-xs font-mono outline-none" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">اللون الثانوي</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={settings.secondaryColor} 
                    onChange={e => setSettings({...settings, secondaryColor: e.target.value})}
                    className="w-12 h-12 rounded-xl cursor-pointer border-none p-0 overflow-hidden" 
                  />
                  <input 
                    value={settings.secondaryColor} 
                    onChange={e => setSettings({...settings, secondaryColor: e.target.value})}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 text-xs font-mono outline-none" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">شعار الموقع (Logo)</label>
              <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200 group hover:border-[#1089A4] transition-all">
                <div className="relative w-24 h-24 bg-white rounded-2xl shadow-inner flex items-center justify-center overflow-hidden border">
                  {settings.logo ? (
                    <Image src={settings.logo} alt="Logo" fill className="object-contain p-2" />
                  ) : (
                    <ImageIcon className="text-gray-200" size={40} />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                    يفضل استخدام صورة بصيغة PNG وبخلفية شفافة. الحجم المقترح: 512x512 بكسل.
                  </p>
                  <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1089A4] text-white text-[10px] font-black rounded-xl cursor-pointer hover:bg-[#0d6e84] transition-all shadow-lg shadow-[#1089A4]/20">
                    <UploadCloud size={14} />
                    رفع شعار جديد
                    <input type="file" className="hidden" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file, "LOGO");
                    }} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSaveSettings}
            disabled={actionLoading === "settings"}
            className="w-full py-4 bg-[#021D24] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-[#0F1629] transition-all shadow-xl disabled:opacity-50"
          >
            <Save size={18} />
            {actionLoading === "settings" ? "جاري الحفظ..." : "حفظ هوية الموقع"}
          </button>
        </section>

        {/* Banners & Promo */}
        <section className="space-y-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F29124]/10 text-[#F29124] flex items-center justify-center">
                  <Layout size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#021D24]">البانرات الترويجية</h3>
                  <p className="text-xs text-gray-400 font-bold">إدارة الصور المتحركة في الصفحة الرئيسية</p>
                </div>
              </div>
              <button 
                onClick={handleAddBanner}
                className="w-10 h-10 rounded-xl bg-[#1089A4] text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-[#1089A4]/20"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {banners.map((banner, index) => (
                <div key={banner.id} className="group relative rounded-3xl overflow-hidden aspect-[21/9] bg-gray-50 border border-gray-100">
                  <Image src={banner.imageUrl} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6 justify-between">
                    <div className="text-white">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#F29124]">البانر #{index + 1}</p>
                      <p className="text-xs font-bold opacity-80 truncate max-w-[200px]">{banner.link || "بدون رابط"}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="w-10 h-10 bg-red-500 text-white rounded-2xl flex items-center justify-center hover:scale-110 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {banners.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center gap-4">
                  <ImageIcon size={48} className="text-gray-200" />
                  <p className="text-xs font-bold text-gray-400">لا توجد بانرات مضافة حالياً</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
