"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Layout, Image as ImageIcon, Type, Grid3X3, Plus, Trash2, Save,
  ArrowUp, ArrowDown, Upload, GripVertical, Star, ShoppingBag
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SiteSection {
  id: string;
  type: "hero" | "banner" | "products" | "categories" | "text" | "image_grid" | "custom";
  title: string;
  subtitle?: string;
  images: string[];
  content?: string;
  link?: string;
  isActive: boolean;
  order: number;
  backgroundColor?: string;
  textColor?: string;
}

export default function SiteSectionsEditor({ showToast }: { showToast?: (msg: string, type?: "success" | "error" | "info") => void }) {
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  useEffect(() => { fetchSections(); }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/site-sections");
      const data = await res.json();
      if (data.sections) setSections(data.sections);
    } catch {}
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const ordered = sections.map((s, i) => ({ ...s, order: i }));
      await fetch("/api/admin/site-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: ordered }),
      });
      setSections(ordered);
      if (showToast) showToast("✅ تم حفظ أقسام الموقع", "success");
    } catch {}
    setSaving(false);
  };

  const addSection = (type: SiteSection["type"]) => {
    const newSection: SiteSection = {
      id: Date.now().toString(),
      type,
      title: type === "hero" ? "قسم رئيسي" :
             type === "banner" ? "بانر إعلاني" :
             type === "products" ? "منتجات مميزة" :
             type === "categories" ? "أقسام المتجر" :
             type === "text" ? "نص وصفي" :
             type === "image_grid" ? "شبكة صور" : "قسم مخصص",
      images: [],
      isActive: true,
      order: sections.length,
    };
    setSections([...sections, newSection]);
    setEditingSection(newSection.id);
  };

  const updateSection = (id: string, field: string, value: any) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const deleteSection = (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟")) return;
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setSections(newSections);
  };

  const handleImageUpload = async (sectionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        const section = sections.find(s => s.id === sectionId);
        if (section) {
          updateSection(sectionId, "images", [...(section.images || []), data.url]);
        }
      }
    } catch {}
  };

  const removeImage = (sectionId: string, imageIndex: number) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      const newImages = section.images.filter((_, i) => i !== imageIndex);
      updateSection(sectionId, "images", newImages);
    }
  };

  const sectionTypes = [
    { type: "hero" as const, label: "قسم رئيسي", icon: Star, color: "from-purple-500 to-pink-500" },
    { type: "banner" as const, label: "بانر إعلاني", icon: ImageIcon, color: "from-[#C5A021] to-[#F29124]" },
    { type: "products" as const, label: "منتجات مميزة", icon: ShoppingBag, color: "from-blue-500 to-cyan-500" },
    { type: "categories" as const, label: "أقسام المتجر", icon: Grid3X3, color: "from-green-500 to-emerald-500" },
    { type: "text" as const, label: "نص وصفي", icon: Type, color: "from-gray-500 to-gray-700" },
    { type: "image_grid" as const, label: "شبكة صور", icon: Layout, color: "from-indigo-500 to-purple-500" },
  ];

  const typeLabels: Record<string, string> = {
    hero: "قسم رئيسي", banner: "بانر إعلاني", products: "منتجات مميزة",
    categories: "أقسام المتجر", text: "نص وصفي", image_grid: "شبكة صور", custom: "مخصص",
  };

  if (loading) return <div className="p-20 text-center font-black text-gray-400">جاري تحميل أقسام الموقع...</div>;

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#0F172A]">محرر أقسام الموقع</h2>
          <p className="text-xs text-gray-400 font-bold mt-1">أضف وعدّل الأقسام التي تظهر في الصفحة الرئيسية</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-[#C5A021] text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50 shadow-lg"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
          حفظ الأقسام
        </button>
      </div>

      {/* Add Section Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {sectionTypes.map(({ type, label, icon: Icon, color }) => (
          <button
            key={type}
            onClick={() => addSection(type)}
            className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-[#C5A021] hover:bg-[#C5A021]/5 transition-all group"
          >
            <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white", color)}>
              <Icon size={18} />
            </div>
            <span className="text-[10px] font-black text-gray-400 group-hover:text-[#C5A021]">{label}</span>
          </button>
        ))}
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {sections.length === 0 && (
          <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-gray-100">
            <Layout size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold">لا توجد أقسام بعد</p>
            <p className="text-xs text-gray-300 mt-1">أضف قسماً جديداً من الأزرار أعلاه</p>
          </div>
        )}

        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm"
          >
            {/* Section Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-gray-400 bg-white px-2 py-1 rounded-lg">#{index + 1}</span>
                <span className="px-3 py-1 bg-[#C5A021]/10 text-[#C5A021] rounded-full text-[9px] font-black">
                  {typeLabels[section.type] || section.type}
                </span>
                <span className="text-sm font-black text-[#0F172A]">{section.title}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => moveSection(index, "up")} disabled={index === 0} className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#C5A021] disabled:opacity-30">
                  <ArrowUp size={14} />
                </button>
                <button onClick={() => moveSection(index, "down")} disabled={index === sections.length - 1} className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#C5A021] disabled:opacity-30">
                  <ArrowDown size={14} />
                </button>
                <label className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-green-500 cursor-pointer">
                  <input type="checkbox" checked={section.isActive} onChange={e => updateSection(section.id, "isActive", e.target.checked)} className="sr-only" />
                  <div className={cn("w-4 h-4 rounded border-2", section.isActive ? "bg-green-500 border-green-500" : "border-gray-300")}>
                    {section.isActive && <span className="text-white text-[8px] flex items-center justify-center">✓</span>}
                  </div>
                </label>
                <button onClick={() => setEditingSection(editingSection === section.id ? null : section.id)} className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-500">
                  <span className="text-xs font-black">{editingSection === section.id ? "✕" : "✎"}</span>
                </button>
                <button onClick={() => deleteSection(section.id)} className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Section Editor */}
            {editingSection === section.id && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-1">عنوان القسم</label>
                    <input value={section.title} onChange={e => updateSection(section.id, "title", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-[#C5A021]" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-1">النص الفرعي</label>
                    <input value={section.subtitle || ""} onChange={e => updateSection(section.id, "subtitle", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-[#C5A021]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 mb-1">المحتوى النصي</label>
                  <textarea value={section.content || ""} onChange={e => updateSection(section.id, "content", e.target.value)}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-[#C5A021] resize-none" />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 mb-1">الرابط (اختياري)</label>
                  <input value={section.link || ""} onChange={e => updateSection(section.id, "link", e.target.value)} placeholder="/category/..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-[#C5A021]" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-1">لون الخلفية</label>
                    <div className="flex gap-2">
                      <input type="color" value={section.backgroundColor || "#ffffff"} onChange={e => updateSection(section.id, "backgroundColor", e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer" />
                      <input value={section.backgroundColor || ""} onChange={e => updateSection(section.id, "backgroundColor", e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-[#C5A021]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-1">لون النص</label>
                    <div className="flex gap-2">
                      <input type="color" value={section.textColor || "#0F172A"} onChange={e => updateSection(section.id, "textColor", e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer" />
                      <input value={section.textColor || ""} onChange={e => updateSection(section.id, "textColor", e.target.value)}
                        placeholder="#0F172A"
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-[#C5A021]" />
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-2">الصور</label>
                  <div className="flex flex-wrap gap-3">
                    {section.images?.map((img, imgIndex) => (
                      <div key={imgIndex} className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 group">
                        <Image src={img} alt="" fill className="object-cover" />
                        <button onClick={() => removeImage(section.id, imgIndex)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))}
                    <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#C5A021] hover:bg-[#C5A021]/5 transition-all">
                      <Upload size={16} className="text-gray-300" />
                      <span className="text-[8px] font-bold text-gray-400 mt-1">إضافة</span>
                      <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(section.id, e)} />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {sections.length > 0 && (
        <div className="flex justify-center">
          <button onClick={handleSave} disabled={saving}
            className="px-10 py-4 bg-[#C5A021] text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50 shadow-lg">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
            حفظ جميع الأقسام
          </button>
        </div>
      )}
    </div>
  );
}
