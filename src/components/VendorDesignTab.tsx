"use client";

import React, { useState, useEffect } from "react";
import { motion, Reorder } from "framer-motion";
import {
  GripVertical, Eye, EyeOff, Layout, Image as ImageIcon, ShoppingBag,
  Star, MessageSquare, Sparkles, Save, Crown, Lock, CheckCircle, Upload, X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "../lib/utils";

const TIER_SECTIONS: Record<string, string[]> = {
  basic: ["hero", "featured", "latest", "trust"],
  premium: ["hero", "featured", "categories", "latest", "reviews", "trust"],
  custom: ["hero", "featured", "categories", "latest", "reviews", "trust", "testimonials", "offers", "brands", "stats"],
};

const ALL_SECTIONS = [
  { id: "hero", label: "البانر الرئيسي", icon: ImageIcon, desc: "صورة ترحيبية كبيرة" },
  { id: "featured", label: "المنتجات المميزة", icon: Sparkles, desc: "أفضل منتجاتك" },
  { id: "categories", label: "الأقسام", icon: Layout, desc: "تصنيفات المتجر" },
  { id: "latest", label: "أحدث المنتجات", icon: ShoppingBag, desc: "أحدث الإضافات" },
  { id: "reviews", label: "آراء العملاء", icon: MessageSquare, desc: "تقييمات العملاء" },
  { id: "trust", label: "مميزات المتجر", icon: Star, desc: "شعارات الثقة" },
  { id: "testimonials", label: "شهادات العملاء", icon: MessageSquare, desc: "اقتباسات العملاء" },
  { id: "offers", label: "العروض", icon: Sparkles, desc: "عروض وتخفيضات" },
  { id: "brands", label: "الماركات", icon: ShoppingBag, desc: "شعارات الماركات" },
  { id: "stats", label: "إحصائيات", icon: Layout, desc: "أرقام وإحصائيات" },
];

const TIERS = [
  { id: "basic", label: "المتجر الأساسي", price: "مجاني", sections: 4, color: "from-gray-500 to-gray-600", icon: ShoppingBag },
  { id: "premium", label: "المتجر المتقدم", price: "15,000 ج.س", sections: 6, color: "from-[#C5A021] to-[#F29124]", icon: Crown },
  { id: "custom", label: "المتجر المخصص", price: "35,000 ج.س", sections: 10, color: "from-[#0F172A] to-[#1a2744]", icon: Sparkles },
];

export default function VendorDesignTab() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [designTier, setDesignTier] = useState("basic");
  const [designPricing, setDesignPricing] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [vendorTier, setVendorTier] = useState<string>("FREEMIUM");
  const [welcomeText, setWelcomeText] = useState<string>("");
  const [bannerUrl, setBannerUrl] = useState<string>("");
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [featuredProductIds, setFeaturedProductIds] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [showFeaturedPicker, setShowFeaturedPicker] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/vendor/design");
        if (res.ok) {
          const data = await res.json();
          const vTier = data.vendor?.tier || "FREEMIUM";
          setVendorTier(vTier);
          setWelcomeText(data.vendor?.storeDescription || "");
          setBannerUrl(data.vendor?.storeBanner || "");
          if (Array.isArray(data.design?.featuredProductIds)) {
            setFeaturedProductIds(data.design.featuredProductIds);
          }

          if (vTier !== "FREEMIUM") {
            try {
              const pRes = await fetch("/api/vendor/products");
              if (pRes.ok) {
                const products = await pRes.json();
                setAllProducts(Array.isArray(products) ? products : []);
              }
            } catch {}
          }

          // Enforce active subscription tier locks
          const allowedTiers: Record<string, string[]> = {
            FREEMIUM: ["basic"],
            PREMIUM_BUILDER: ["basic", "premium"],
            CUSTOM_DESIGN: ["basic", "premium", "custom"]
          };
          const allowed = allowedTiers[vTier] || ["basic"];
          
          let savedTier = data.design?.designTier || "basic";
          if (!allowed.includes(savedTier)) {
            savedTier = allowed[allowed.length - 1]; // Fallback to max allowed
          }

          const allowedSections = TIER_SECTIONS[savedTier] || TIER_SECTIONS.basic;

          if (data.design?.sections?.length > 0) {
            const merged = ALL_SECTIONS.map(s => {
              const saved = data.design.sections.find((ds: any) => ds.id === s.id);
              const isVisible = saved ? saved.isVisible : true;
              return { 
                ...s, 
                isVisible: isVisible && allowedSections.includes(s.id)
              };
            });
            setSections(merged);
            setDesignTier(savedTier);
          } else {
            setSections(ALL_SECTIONS.map(s => ({ ...s, isVisible: allowedSections.includes(s.id) })));
            setDesignTier(savedTier);
          }
          if (data.designPricing) setDesignPricing(data.designPricing);
        }
      } catch (err) {
        console.error(err);
        setSections(ALL_SECTIONS.map(s => ({ ...s, isVisible: TIER_SECTIONS.basic.includes(s.id) })));
      } finally {
        setFetching(false);
      }
    }
    load();
  }, []);

  const toggleVisibility = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s));
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/vendor/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: sections.map(s => ({ id: s.id, isVisible: s.isVisible })),
          designTier,
          welcomeText,
          bannerUrl,
          featuredProductIds,
        }),
      });
      if (res.ok) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    }
  };

  const handleBannerUpload = async (file: File) => {
    setUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setBannerUrl(data.url);
      } else {
        alert("فشل رفع الصورة");
      }
    } catch {
      alert("فشل رفع الصورة");
    } finally {
      setUploadingBanner(false);
    }
  };

  const toggleFeatured = (productId: string) => {
    setFeaturedProductIds(prev => {
      const max = vendorTier === "CUSTOM_DESIGN" ? 12 : 6;
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      if (prev.length >= max) {
        alert(`الحد الأقصى ${max} منتجات مميزة`);
        return prev;
      }
      return [...prev, productId];
    });
  };

  const selectTier = (tierId: string) => {
    const allowedTiers: Record<string, string[]> = {
      FREEMIUM: ["basic"],
      PREMIUM_BUILDER: ["basic", "premium"],
      CUSTOM_DESIGN: ["basic", "premium", "custom"]
    };
    const allowed = allowedTiers[vendorTier] || ["basic"];
    if (!allowed.includes(tierId)) {
      alert("عذراً، هذه الباقة التصميمية غير متاحة لاشتراكك الحالي. يرجى ترقية اشتراك متجرك أولاً من قسم الاشتراكات.");
      return;
    }

    setDesignTier(tierId);
    const allowedSections = TIER_SECTIONS[tierId] || TIER_SECTIONS.basic;
    setSections(prev => prev.map(s => ({ ...s, isVisible: allowedSections.includes(s.id) })));
  };

  const availableSections = TIER_SECTIONS[designTier] || TIER_SECTIONS.basic;
  const currentTier = TIERS.find(t => t.id === designTier) || TIERS[0];

  if (fetching) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-[#C5A021] border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (vendorTier === "FREEMIUM") {
    return (
      <div className="max-w-3xl mx-auto py-16" dir="rtl">
        <div className="bg-gradient-to-br from-[#0F172A] via-[#1a2744] to-[#0F172A] text-white rounded-[3rem] p-12 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#C5A021]/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 blur-3xl rounded-full" />
          <div className="relative z-10 space-y-6">
            <div className="w-24 h-24 mx-auto rounded-[2rem] bg-gradient-to-br from-[#C5A021] to-[#F29124] flex items-center justify-center">
              <Crown size={48} className="text-white" />
            </div>
            <h2 className="text-3xl font-black">محرر المتجر SaaS</h2>
            <p className="text-white/60 font-bold max-w-md mx-auto leading-relaxed">
              محرر المتجر المتقدم متاح فقط لباقات Premium Builder و Custom Design.
              ارفع بانر مخصص، حرّر نص الترحيب، اختر المنتجات المميزة، وصمّم متجرك كأنه نظام Odoo.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-6">
              <div className="bg-white/5 rounded-2xl p-4">
                <p className="text-[10px] font-black text-white/40 uppercase">Premium Builder</p>
                <p className="text-2xl font-black text-[#C5A021]">
                  {designPricing?.premium?.price?.toLocaleString() ?? "15,000"} ج.س
                </p>
                <p className="text-[10px] text-white/40 font-bold">6 أقسام + بانر + تعديلات</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <p className="text-[10px] font-black text-white/40 uppercase">Custom Design</p>
                <p className="text-2xl font-black text-purple-300">
                  {designPricing?.custom?.price?.toLocaleString() ?? "35,000"} ج.س
                </p>
                <p className="text-[10px] text-white/40 font-bold">فريق Vixcell + بدون حدود</p>
              </div>
            </div>
            <Link
              href="/vendor/dashboard?tab=subscription"
              className="inline-block bg-[#C5A021] hover:bg-[#C5A021]/90 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-2xl transition-all"
            >
              ترقية الاشتراك الآن
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0F172A]">تصميم المتجر (نظام أودو)</h2>
          <p className="text-gray-400 font-bold mt-1">صمم متجرك الخاص كما تريد — اختر الباقة ثم رتب الأقسام</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className={cn(
            "px-8 py-4 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center gap-3",
            saveStatus === "saved" ? "bg-green-500 text-white" : "bg-[#C5A021] text-white hover:scale-105"
          )}
        >
          {saveStatus === "saving" ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> :
           saveStatus === "saved" ? <CheckCircle size={20} /> : <Save size={20} />}
          {saveStatus === "saving" ? "جاري الحفظ..." : saveStatus === "saved" ? "تم الحفظ!" : "حفظ التصميم"}
        </button>
      </div>

      {/* Pricing Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIERS.map((tier) => {
          const isActive = designTier === tier.id;
          const isLocked = TIERS.indexOf(tier) > TIERS.indexOf(currentTier);
          return (
            <button
              key={tier.id}
              onClick={() => selectTier(tier.id)}
              className={cn(
                "p-6 rounded-[2rem] border-2 transition-all text-right relative overflow-hidden",
                isActive ? "border-[#C5A021] bg-[#C5A021]/5 shadow-xl shadow-[#C5A021]/10" : "border-gray-100 bg-white hover:border-gray-200"
              )}
            >
              {isActive && <div className="absolute top-3 left-3 bg-[#C5A021] text-white px-2 py-0.5 rounded-full text-[8px] font-black">مُختار</div>}
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br", tier.color)}>
                <tier.icon size={22} className="text-white" />
              </div>
              <h4 className="font-black text-[#0F172A] text-lg mb-1">{tier.label}</h4>
              <p className="text-2xl font-black text-[#C5A021] mb-2">{tier.price}</p>
              <p className="text-[10px] text-gray-400 font-bold">يشمل {tier.sections} أقسام</p>
            </button>
          );
        })}
      </div>

      {/* Storefront Customization */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 p-8 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C5A021] to-[#F29124] text-white flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-black text-[#0F172A] text-lg">تخصيص واجهة المتجر</h3>
            <p className="text-xs text-gray-400 font-bold">بانر، نص ترحيب، منتجات مميزة — يظهر فوراً في صفحة متجرك العامة</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Banner Upload */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">صورة البانر الرئيسية</label>
            <div className="relative">
              {bannerUrl ? (
                <div className="relative h-40 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                  <Image src={bannerUrl} alt="بانر المتجر" fill className="object-cover" sizes="100%" />
                  <button
                    type="button"
                    onClick={() => setBannerUrl("")}
                    className="absolute top-2 left-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-500"
                    title="إزالة"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[#C5A021] hover:bg-[#C5A021]/5 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleBannerUpload(file);
                    }}
                  />
                  {uploadingBanner ? (
                    <div className="w-6 h-6 border-2 border-[#C5A021] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload size={24} className="text-gray-300 mb-2" />
                      <span className="text-xs font-black text-gray-400">اضغط لرفع صورة البانر</span>
                      <span className="text-[10px] text-gray-300">JPG / PNG حتى 10MB</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          {/* Welcome Text */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">نص الترحيب في المتجر</label>
            <textarea
              value={welcomeText}
              onChange={(e) => setWelcomeText(e.target.value)}
              maxLength={500}
              placeholder="مرحباً بك في متجرنا — اكتشف أفضل العروض..."
              className="w-full h-40 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#C5A021] resize-none"
            />
            <p className="text-[10px] text-gray-300 text-right">{welcomeText.length}/500</p>
          </div>
        </div>

        {/* Featured Products */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              المنتجات المميزة ({featuredProductIds.length}/{vendorTier === "CUSTOM_DESIGN" ? 12 : 6})
            </label>
            <button
              type="button"
              onClick={() => setShowFeaturedPicker(true)}
              className="text-xs font-black text-[#C5A021] hover:underline"
            >
              + اختيار منتجات
            </button>
          </div>
          {featuredProductIds.length === 0 ? (
            <div className="p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center">
              <Star size={24} className="text-gray-200 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-400">لم تختر منتجات مميزة بعد</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {featuredProductIds.map((pid) => {
                const product = allProducts.find((p) => p.id === pid);
                if (!product) return null;
                const firstImage = product.images?.split(",")[0];
                return (
                  <div key={pid} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 border border-gray-100">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0 relative">
                      {firstImage && <Image src={firstImage} alt={product.title} fill className="object-cover" sizes="48px" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-black truncate">{product.title}</p>
                      <p className="text-[10px] text-[#C5A021] font-bold">{product.price?.toLocaleString()} ج.س</p>
                    </div>
                    <button
                      onClick={() => toggleFeatured(pid)}
                      className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Featured Products Picker Modal */}
      {showFeaturedPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFeaturedPicker(false)} />
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full relative z-10 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-[#0F172A]">اختيار المنتجات المميزة</h3>
              <button onClick={() => setShowFeaturedPicker(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={14} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              اختر حتى {vendorTier === "CUSTOM_DESIGN" ? 12 : 6} منتجات لتظهر في قسم "المميزة" بمتجرك.
            </p>
            <div className="flex-1 overflow-y-auto space-y-2">
              {allProducts.length === 0 ? (
                <p className="text-center py-10 text-xs font-bold text-gray-400">لا توجد منتجات. أضف منتجات أولاً.</p>
              ) : (
                allProducts.map((p) => {
                  const isSelected = featuredProductIds.includes(p.id);
                  const firstImage = p.images?.split(",")[0];
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleFeatured(p.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-right",
                        isSelected ? "border-[#C5A021] bg-[#C5A021]/5" : "border-gray-100 hover:border-gray-200"
                      )}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 shrink-0 relative">
                        {firstImage && <Image src={firstImage} alt={p.title} fill className="object-cover" sizes="48px" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black truncate">{p.title}</p>
                        <p className="text-xs text-[#C5A021] font-bold">{p.price?.toLocaleString()} ج.س</p>
                      </div>
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", isSelected ? "bg-[#C5A021] text-white" : "bg-gray-100 text-gray-300")}>
                        {isSelected && <CheckCircle size={14} />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            <button
              onClick={() => setShowFeaturedPicker(false)}
              className="w-full mt-4 bg-[#0F172A] text-white py-3 rounded-xl font-black text-sm hover:bg-[#C5A021] transition-all"
            >
              تم
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Editor Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">مكونات الصفحة</h3>
              <span className="text-[10px] font-black text-[#C5A021]">{sections.filter(s => s.isVisible).length}/{availableSections.length}</span>
            </div>

            <Reorder.Group axis="y" values={sections} onReorder={setSections} className="space-y-3">
              {sections.map((section) => {
                const isLocked = !availableSections.includes(section.id);
                return (
                  <Reorder.Item
                    key={section.id}
                    value={section}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-grab active:cursor-grabbing",
                      section.isVisible ? "bg-white border-gray-100 shadow-sm" : "bg-gray-50 border-transparent opacity-60"
                    )}
                  >
                    <GripVertical size={18} className="text-gray-300" />
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      section.isVisible ? "bg-[#C5A021]/10 text-[#C5A021]" : "bg-gray-200 text-gray-400"
                    )}>
                      <section.icon size={20} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <span className="font-black text-sm text-[#0F172A] block truncate">{section.label}</span>
                      <span className="text-[9px] text-gray-400">{section.desc}</span>
                    </div>
                    {isLocked ? (
                      <Lock size={14} className="text-gray-300" />
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleVisibility(section.id); }}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0",
                          section.isVisible ? "text-[#C5A021] hover:bg-[#C5A021]/10" : "text-gray-300 hover:bg-gray-200"
                        )}
                      >
                        {section.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    )}
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          </div>

          <div className="bg-[#0F172A] p-8 rounded-[2.5rem] text-white overflow-hidden relative">
            <div className="relative z-10">
              <h4 className="font-black mb-2">نصيحة التصميم</h4>
              <p className="text-xs text-white/50 leading-relaxed font-bold">
                المتاجر التي تستخدم "البانر الرئيسي" و"المنتجات المميزة" في الأعلى تحقق مبيعات أعلى بنسبة 40%.
                الباقة المخصصة تتيح لك جميع الأقسام مع إمكانية ترتيبها بحرية تامة.
              </p>
            </div>
            <Sparkles className="absolute -bottom-4 -left-4 text-white/5 w-24 h-24 rotate-12" />
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">معاينة مباشرة (سطح المكتب)</h3>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <div className="w-2 h-2 rounded-full bg-green-400" />
            </div>
          </div>

          <div className="bg-gray-100 rounded-[3rem] border-8 border-white shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
            <div className="bg-white p-4 flex items-center gap-4 border-b">
              <div className="bg-gray-50 rounded-lg px-4 py-1.5 text-[10px] font-mono text-gray-400 flex-grow">morsall.com/store/my-store</div>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {sections.filter(s => s.isVisible).map((section) => (
                <motion.div
                  key={section.id}
                  layoutId={section.id}
                  className="w-full bg-white rounded-2xl border border-gray-200 p-8 flex flex-col items-center justify-center gap-4 min-h-[120px]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                    <section.icon size={24} />
                  </div>
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{section.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
