"use client"

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function VendorStoreSettings() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    storeName: "",
    storeDescription: "",
    slug: "",
    location: "",
    address: "",
    storeLogo: "",
    storeBanner: "",
    primaryColor: "#1089A4",
    secondaryColor: "#F29124",
    facebookUrl: "",
    instagramUrl: "",
    whatsappNumber: ""
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/vendor/settings");
        if (res.ok) {
          const data = await res.json();
          setFormData({
            storeName: data.storeName || "",
            storeDescription: data.storeDescription || "",
            slug: data.slug || "",
            location: data.location || "",
            address: data.address || "",
            storeLogo: data.storeLogo || "",
            storeBanner: data.storeBanner || "",
            primaryColor: data.primaryColor || "#1089A4",
            secondaryColor: data.secondaryColor || "#F29124",
            facebookUrl: data.facebookUrl || "",
            instagramUrl: data.instagramUrl || "",
            whatsappNumber: data.whatsappNumber || ""
          });
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setFetching(false);
      }
    }
    fetchSettings();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "storeLogo" | "storeBanner") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("حجم الملف كبير جداً، يرجى اختيار صورة أقل من 2 ميجابايت");
      return;
    }

    setLoading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل رفع الملف");

      setFormData(prev => ({ ...prev, [type]: data.url }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "فشل حفظ الإعدادات");
      
      alert("تم حفظ إعدادات النشر بنجاح!");
      setFormData(prev => ({ ...prev, slug: result.slug }));
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin material-symbols-rounded text-5xl text-[#1089A4]">sync</div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-[#021D24]">إعدادات النشر</h2>
          <p className="text-gray-400 font-bold">تحكم في هوية متجرك البصرية وروابط التواصل.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#1089A4] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-[#1089A4]/20 hover:scale-105 transition-all disabled:opacity-50"
        >
          {loading ? <span className="animate-spin material-symbols-rounded text-base">sync</span> : <span className="material-symbols-rounded text-base">save</span>}
          {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Banner & Logo Preview */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">الهوية البصرية</label>
            <div className="relative">
              <div className="w-full h-48 rounded-2xl bg-gray-50 border overflow-hidden relative shadow-sm">
                {formData.storeBanner ? (
                  <img src={formData.storeBanner} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                    <span className="material-symbols-rounded text-5xl">image</span>
                  </div>
                )}
                {/* Logo Overlap */}
                <div className="absolute -bottom-4 right-8 w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                  {formData.storeLogo ? (
                    <img src={formData.storeLogo} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <span className="material-symbols-rounded text-2xl text-gray-200">storefront</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">تغيير البانر</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    id="banner-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={e => handleFileUpload(e, "storeBanner")}
                  />
                  <label 
                    htmlFor="banner-upload"
                    className="w-full flex items-center justify-between bg-white border border-dashed border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:border-[#1089A4] hover:bg-gray-50 transition-all"
                  >
                    <span className="text-xs font-bold text-gray-400">اختر صورة للغلاف...</span>
                    <span className="material-symbols-rounded text-[#1089A4]">upload_file</span>
                  </label>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">تغيير الشعار</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    id="logo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={e => handleFileUpload(e, "storeLogo")}
                  />
                  <label 
                    htmlFor="logo-upload"
                    className="w-full flex items-center justify-between bg-white border border-dashed border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:border-[#1089A4] hover:bg-gray-50 transition-all"
                  >
                    <span className="text-xs font-bold text-gray-400">اختر صورة الشعار...</span>
                    <span className="material-symbols-rounded text-[#1089A4]">cloud_upload</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Store Info */}
          <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">اسم المتجر</label>
                <input 
                  type="text" 
                  value={formData.storeName}
                  onChange={e => {
                    const name = e.target.value;
                    const generatedSlug = name
                      .toLowerCase()
                      .trim()
                      .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, "")
                      .replace(/\s+/g, "-")
                      .replace(/-+/g, "-")
                      .replace(/^-+|-+$/g, "");
                    
                    setFormData({ 
                      ...formData, 
                      storeName: name,
                      slug: generatedSlug 
                    });
                  }}
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:border-[#1089A4] focus:bg-white outline-none transition-all font-black text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">رابط المتجر (Slug)</label>
                <div className="flex items-center bg-gray-50 rounded-xl border border-transparent focus-within:border-[#1089A4] focus-within:bg-white transition-all overflow-hidden px-4">
                  <span className="text-[10px] font-black text-[#1089A4]/50">https://www.morsall.com/store/</span>
                  <input 
                    type="text" 
                    value={formData.slug}
                    onChange={e => {
                      let val = e.target.value;
                      val = val.replace(/^(https?:\/\/)?(www\.)?morsall\.com\/store\//, "");
                      val = val.replace(/^(https?:\/\/)?(www\.)?morsall\.net\/store\//, "");
                      val = val.toLowerCase()
                        .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, "")
                        .replace(/\s+/g, "-")
                        .replace(/-+/g, "-")
                        .replace(/^-+|-+$/g, "");
                      
                      setFormData({ ...formData, slug: val });
                    }}
                    className="flex-grow bg-transparent py-3 outline-none font-black text-sm text-[#1089A4]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">وصف المتجر</label>
              <textarea 
                value={formData.storeDescription}
                onChange={e => setFormData({ ...formData, storeDescription: e.target.value })}
                rows={3}
                className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:border-[#1089A4] focus:bg-white outline-none transition-all font-bold text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">المنطقة</label>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:border-[#1089A4] focus:bg-white outline-none transition-all font-bold text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">العنوان</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:border-[#1089A4] focus:bg-white outline-none transition-all font-bold text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Colors Card */}
          <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#021D24]">ألوان الهوية</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">الأساسي</p>
                  <p className="text-[9px] font-bold text-gray-300">{formData.primaryColor}</p>
                </div>
                <input 
                  type="color" 
                  value={formData.primaryColor}
                  onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-12 h-12 rounded-xl cursor-pointer border-2 border-gray-50"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">الفرعي</p>
                  <p className="text-[9px] font-bold text-gray-300">{formData.secondaryColor}</p>
                </div>
                <input 
                  type="color" 
                  value={formData.secondaryColor}
                  onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-12 h-12 rounded-xl cursor-pointer border-2 border-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Social Media Card */}
          <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#1089A4]">بيانات النشر</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center bg-gray-50 rounded-xl border border-transparent focus-within:border-[#1089A4] focus-within:bg-white transition-all overflow-hidden px-3">
                  <span className="material-symbols-rounded text-lg text-blue-600">facebook</span>
                  <input 
                    type="text" 
                    value={formData.facebookUrl}
                    onChange={e => setFormData({ ...formData, facebookUrl: e.target.value })}
                    placeholder="facebook.com/..."
                    className="bg-transparent flex-grow px-2 py-3 text-xs outline-none font-bold"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center bg-gray-50 rounded-xl border border-transparent focus-within:border-[#1089A4] focus-within:bg-white transition-all overflow-hidden px-3">
                  <span className="material-symbols-rounded text-lg text-pink-600">photo_camera</span>
                  <input 
                    type="text" 
                    value={formData.instagramUrl}
                    onChange={e => setFormData({ ...formData, instagramUrl: e.target.value })}
                    placeholder="instagram.com/..."
                    className="bg-transparent flex-grow px-2 py-3 text-xs outline-none font-bold"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center bg-gray-50 rounded-xl border border-transparent focus-within:border-[#1089A4] focus-within:bg-white transition-all overflow-hidden px-3">
                  <span className="material-symbols-rounded text-lg text-green-600">chat</span>
                  <input 
                    type="text" 
                    value={formData.whatsappNumber}
                    onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    placeholder="249..."
                    className="bg-transparent flex-grow px-2 py-3 text-xs outline-none font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
