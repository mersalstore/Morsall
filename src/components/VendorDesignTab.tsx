"use client";

import React, { useState, useEffect } from "react";
import { motion, Reorder } from "framer-motion";
import { 
  GripVertical, Eye, EyeOff, Layout, Image as ImageIcon, ShoppingBag, 
  Star, MessageSquare, Sparkles, Save, Crown, Lock, CheckCircle
} from "lucide-react";
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

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/vendor/design");
        if (res.ok) {
          const data = await res.json();
          if (data.design?.sections?.length > 0) {
            const merged = ALL_SECTIONS.map(s => {
              const saved = data.design.sections.find((ds: any) => ds.id === s.id);
              return { ...s, isVisible: saved ? saved.isVisible : true };
            });
            setSections(merged);
            setDesignTier(data.design.designTier || "basic");
          } else {
            setSections(ALL_SECTIONS.map(s => ({ ...s, isVisible: TIER_SECTIONS.basic.includes(s.id) })));
          }
          if (data.designPricing) setDesignPricing(data.designPricing);
        }
      } catch (err) {
        console.error(err);
        setSections(ALL_SECTIONS.map(s => ({ ...s, isVisible: true })));
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

  const selectTier = (tierId: string) => {
    setDesignTier(tierId);
    const allowed = TIER_SECTIONS[tierId] || TIER_SECTIONS.basic;
    setSections(prev => prev.map(s => ({ ...s, isVisible: allowed.includes(s.id) })));
  };

  const availableSections = TIER_SECTIONS[designTier] || TIER_SECTIONS.basic;
  const currentTier = TIERS.find(t => t.id === designTier) || TIERS[0];

  if (fetching) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-[#C5A021] border-t-transparent rounded-full animate-spin" /></div>;
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
