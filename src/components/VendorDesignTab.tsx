"use client";

import React, { useState } from "react";
import { motion, Reorder } from "framer-motion";
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Layout, 
  Image as ImageIcon, 
  ShoppingBag, 
  Star, 
  MessageSquare,
  Sparkles,
  Save
} from "lucide-react";
import { cn } from "../lib/utils";

const INITIAL_SECTIONS = [
  { id: "hero", label: "البانر الرئيسي", icon: ImageIcon, isVisible: true },
  { id: "featured", label: "المنتجات المميزة", icon: Sparkles, isVisible: true },
  { id: "categories", label: "الأقسام", icon: Layout, isVisible: true },
  { id: "latest", label: "أحدث المنتجات", icon: ShoppingBag, isVisible: true },
  { id: "reviews", label: "آراء العملاء", icon: MessageSquare, isVisible: false },
  { id: "trust", label: "مميزات المتجر", icon: Star, isVisible: true },
];

export default function VendorDesignTab() {
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [loading, setLoading] = useState(false);

  const toggleVisibility = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s));
  };

  const handleSave = async () => {
    setLoading(true);
    // Simulating save to DB
    setTimeout(() => {
      setLoading(false);
      alert("تم حفظ تصميم المتجر بنجاح!");
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0F172A]">تصميم المتجر</h2>
          <p className="text-gray-400 font-bold mt-1">قم بسحب وإفلات العناصر لترتيب مظهر متجرك (نظام أودو)</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#C5A021] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-[#C5A021]/20 hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={20} />}
          حفظ التخطيط
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Editor Sidebar */}
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">مكونات الصفحة</h3>
              
              <Reorder.Group axis="y" values={sections} onReorder={setSections} className="space-y-3">
                {sections.map((section) => (
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
                    <span className="flex-grow font-black text-sm text-[#0F172A]">{section.label}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleVisibility(section.id); }}
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                        section.isVisible ? "text-[#C5A021] hover:bg-[#C5A021]/10" : "text-gray-300 hover:bg-gray-200"
                      )}
                    >
                      {section.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
           </div>

           <div className="bg-[#0F172A] p-8 rounded-[2.5rem] text-white overflow-hidden relative">
              <div className="relative z-10">
                <h4 className="font-black mb-2">نصيحة التصميم</h4>
                <p className="text-xs text-white/50 leading-relaxed font-bold">المتاجر التي تستخدم "البانر الرئيسي" و"المنتجات المميزة" في الأعلى تحقق مبيعات أعلى بنسبة 40%.</p>
              </div>
              <Sparkles className="absolute -bottom-4 -left-4 text-white/5 w-24 h-24 rotate-12" />
           </div>
        </div>

        {/* Live Preview Placeholder */}
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
              {/* Fake Browser Header */}
              <div className="bg-white p-4 flex items-center gap-4 border-b">
                 <div className="bg-gray-50 rounded-lg px-4 py-1.5 text-[10px] font-mono text-gray-400 flex-grow">morsall.com/store/my-store</div>
              </div>
              
              {/* Preview Content */}
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
