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
    primaryColor: "#C5A021",
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
            primaryColor: data.primaryColor || "#C5A021",
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

  const extractColorsFromLogo = (logoUrl: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = logoUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 50;
        canvas.height = 50;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 50, 50);
        const imgData = ctx.getImageData(0, 0, 50, 50).data;
        
        const colorMap: Record<string, number> = {};
        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i+1];
          const b = imgData[i+2];
          const a = imgData[i+3];
          
          if (a < 200) continue;
          if (r > 240 && g > 240 && b > 240) continue;
          if (r < 20 && g < 20 && b < 20) continue;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          if (max - min < 20) continue;
          
          const bucketR = Math.round(r / 15) * 15;
          const bucketG = Math.round(g / 15) * 15;
          const bucketB = Math.round(b / 15) * 15;
          const rgb = `${bucketR},${bucketG},${bucketB}`;
          colorMap[rgb] = (colorMap[rgb] || 0) + 1;
        }
        
        const sortedColors = Object.entries(colorMap).sort((a, b) => b[1] - a[1]);
        if (sortedColors.length >= 1) {
          const toHex = (r: number, g: number, b: number) => "#" + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
          }).join("");
          
          const primaryRGB = sortedColors[0][0].split(",").map(Number);
          const primaryHex = toHex(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
          
          let secondaryHex = "#F29124";
          if (sortedColors.length >= 2) {
            const secondaryRGB = sortedColors[1][0].split(",").map(Number);
            secondaryHex = toHex(secondaryRGB[0], secondaryRGB[1], secondaryRGB[2]);
          } else {
            secondaryHex = toHex(
              Math.min(255, primaryRGB[0] + 40),
              Math.max(0, primaryRGB[1] - 40),
              Math.max(0, primaryRGB[2] - 40)
            );
          }
          
          setFormData(prev => ({
            ...prev,
            primaryColor: primaryHex,
            secondaryColor: secondaryHex
          }));
        }
      } catch (err) {
        console.error("Failed to extract colors:", err);
      }
    };
  };

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
      
      // Auto recommend theme colors if logo uploaded
      if (type === "storeLogo" && data.url) {
        extractColorsFromLogo(data.url);
      }
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
      <div className="animate-spin material-symbols-rounded text-5xl text-[#C5A021]">sync</div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-[#0F172A]">إعدادات النشر</h2>
          <p className="text-gray-400 font-bold">تحكم في هوية متجرك البصرية وروابط التواصل.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#C5A021] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-[#C5A021]/20 hover:scale-105 transition-all disabled:opacity-50"
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
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">شعار المتجر (الغلاف)</label>
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
                    className="w-full flex items-center justify-between bg-white border border-dashed border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:border-[#C5A021] hover:bg-gray-50 transition-all"
                  >
                    <span className="text-xs font-bold text-gray-400">اختر صورة الشعار (الغلاف)...</span>
                    <span className="material-symbols-rounded text-[#C5A021]">upload_file</span>
                  </label>
                  <p className="text-[10px] text-gray-400 font-bold mt-1 px-1">📐 الأبعاد المثالية: <span className="text-[#C5A021]">1920 × 1080 بكسل</span> (نسبة 16:9)</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">أيقونة المتجر</label>
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
                    className="w-full flex items-center justify-between bg-white border border-dashed border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:border-[#C5A021] hover:bg-gray-50 transition-all"
                  >
                    <span className="text-xs font-bold text-gray-400">اختر أيقونة المتجر...</span>
                    <span className="material-symbols-rounded text-[#C5A021]">cloud_upload</span>
                  </label>
                  <p className="text-[10px] text-gray-400 font-bold mt-1 px-1">📐 الأبعاد المثالية: <span className="text-[#C5A021]">500 × 500 بكسل</span> (مربع)</p>
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
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:border-[#C5A021] focus:bg-white outline-none transition-all font-black text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">رابط المتجر (Slug)</label>
                <div className="flex items-center bg-gray-50 rounded-xl border border-transparent focus-within:border-[#C5A021] focus-within:bg-white transition-all overflow-hidden px-4">
                  <span className="text-[10px] font-black text-[#C5A021]/50">https://www.morsall.com/store/</span>
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
                    className="flex-grow bg-transparent py-3 outline-none font-black text-sm text-[#C5A021]"
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
                className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:border-[#C5A021] focus:bg-white outline-none transition-all font-bold text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">المنطقة</label>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:border-[#C5A021] focus:bg-white outline-none transition-all font-bold text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">العنوان</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:border-[#C5A021] focus:bg-white outline-none transition-all font-bold text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Colors Card */}
          <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#0F172A]">ألوان الهوية</h3>
              {formData.storeLogo && (
                <button
                  type="button"
                  onClick={() => extractColorsFromLogo(formData.storeLogo)}
                  className="text-[10px] font-black text-[#C5A021] hover:underline flex items-center gap-1"
                  title="تحليل اللوجو واقتراح ألوان متناسقة"
                >
                  <span className="material-symbols-rounded text-sm">palette</span>
                  اقتراح تلقائي من اللوجو
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">اللون الأساسي</p>
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
                  <p className="text-[10px] font-black text-gray-400 uppercase">اللون الفرعي</p>
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

            {/* Presets */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">قوالب ألوان جاهزة</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "ذهبي مرسال", primary: "#C5A021", secondary: "#0F172A" },
                  { name: "أزرق ملكي", primary: "#1E40AF", secondary: "#3B82F6" },
                  { name: "وردي أنيق", primary: "#DB2777", secondary: "#F472B6" },
                  { name: "أخضر حيوي", primary: "#059669", secondary: "#34D399" },
                  { name: "بنفسجي ساحر", primary: "#7C3AED", secondary: "#A78BFA" },
                  { name: "برتقالي دافئ", primary: "#EA580C", secondary: "#F97316" }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, primaryColor: preset.primary, secondaryColor: preset.secondary })}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl hover:bg-gray-100/80 transition-colors text-right border border-gray-100"
                  >
                    <div className="flex gap-0.5 shrink-0">
                      <div className="w-3.5 h-3.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: preset.primary }} />
                      <div className="w-3.5 h-3.5 rounded-full border border-white shadow-sm -mr-1.5" style={{ backgroundColor: preset.secondary }} />
                    </div>
                    <span className="text-[10px] font-black text-gray-600 truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
