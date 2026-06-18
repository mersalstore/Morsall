"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { useRouter } from "next/navigation";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct?: any;
}

export default function AddProductModal({ isOpen, onClose, editingProduct }: AddProductModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [availableAttributes, setAvailableAttributes] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    type: "SIMPLE",
    title: "",
    shortDescription: "",
    description: "",
    sku: "",
    brand: "",
    range: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    price: "",
    stock: "",
    discountPrice: "",
    discountType: "FIXED",
    categoryId: "",
    images: "",
    externalImageUrl: "",
  });

  const [bundleItems, setBundleItems] = useState<{ name: string, price: string }[]>([]);
  const [step, setStep] = useState(1);

  const [selectedAttributes, setSelectedAttributes] = useState<{ name: string, values: string[] }[]>([]);
  const [variations, setVariations] = useState<any[]>([]);
  const [activeAttributeId, setActiveAttributeId] = useState<string | null>(null);
  const [attrSearch, setAttrSearch] = useState("");
  const [isAttrDropdownOpen, setIsAttrDropdownOpen] = useState(false);

  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Tabular specifications
  const [specs, setSpecs] = useState<{ key: string; values: string[] }[]>([{ key: "", values: [""] }]);

  // Variant pricing mode: "absolute" | "adjustment"
  const [variantPricingMode, setVariantPricingMode] = useState<"absolute" | "adjustment">("absolute");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setStep(1);
      fetch("/api/categories")
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setCategories(data); else setCategories([]); })
        .catch(() => {});
      fetch("/api/attributes")
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setAvailableAttributes(data); else setAvailableAttributes([]); })
        .catch(() => {});

      if (editingProduct) {
        setLoading(true);
        fetch(`/api/vendor/products/${editingProduct.id}`)
          .then(res => res.json())
          .then(data => {
            if (data && !data.error) {
              setFormData({
                type: data.type || "SIMPLE",
                title: data.title || "",
                shortDescription: data.shortDescription || "",
                description: data.description || "",
                sku: data.sku || "",
                brand: data.brand || "",
                range: data.range || "",
                weight: data.weight?.toString() || "",
                length: data.length?.toString() || "",
                width: data.width?.toString() || "",
                height: data.height?.toString() || "",
                price: data.price?.toString() || "",
                stock: data.stock?.toString() || "",
                discountPrice: data.discountPrice?.toString() || "",
                discountType: data.discountType || "FIXED",
                categoryId: data.categoryId || "",
                images: "",
                externalImageUrl: "",
              });
              setBundleItems(data.bundleData ? (typeof data.bundleData === 'string' ? JSON.parse(data.bundleData) : data.bundleData) : []);
              setSelectedAttributes(data.productAttributes?.map((attr: any) => ({
                name: attr.name,
                values: attr.values
              })) || []);
              setVariations(data.variations?.map((v: any) => ({
                combination: typeof v.combination === 'string' ? JSON.parse(v.combination) : v.combination,
                price: v.price?.toString() || data.price?.toString() || "",
                stock: v.stock?.toString() || "",
                sku: v.sku || "",
                image: v.image || ""
              })) || []);

              // Parse specifications
              if (data.specifications) {
                try {
                  const parsed = typeof data.specifications === 'string' ? JSON.parse(data.specifications) : data.specifications;
                  if (Array.isArray(parsed)) {
                    const normalized = parsed.map((s: any) => {
                      if (Array.isArray(s.values)) {
                        return { key: s.key, values: s.values };
                      } else if (s.value !== undefined) {
                        return { key: s.key, values: [String(s.value)] };
                      }
                      return { key: s.key || "", values: [""] };
                    });
                    setSpecs(normalized);
                  } else if (typeof parsed === 'object') {
                    setSpecs(Object.entries(parsed).map(([k, v]) => ({ key: k, values: [String(v)] })));
                  } else {
                    setSpecs([{ key: "", values: [""] }]);
                  }
                } catch {
                  setSpecs([{ key: "", values: [""] }]);
                }
              } else {
                setSpecs([{ key: "", values: [""] }]);
              }

              if (Array.isArray(data.images)) {
                setPreviews(data.images);
              } else if (typeof data.images === "string" && data.images.trim()) {
                setPreviews(data.images.split(",").map((u: string) => u.trim()).filter(Boolean));
              }
            }
          })
          .catch(err => console.error("Error fetching product for edit", err))
          .finally(() => setLoading(false));
      } else {
        resetForm();
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; }
  }, [isOpen, editingProduct]);

  const resetForm = () => {
    setFormData({
      type: "SIMPLE", title: "", shortDescription: "", description: "", sku: "", brand: "", range: "",
      weight: "", length: "", width: "", height: "", price: "", stock: "",
      discountPrice: "", discountType: "FIXED",
      categoryId: "", images: "", externalImageUrl: ""
    });
    setBundleItems([]);
    setSelectedAttributes([]);
    setVariations([]);
    setPreviews([]);
    setSpecs([{ key: "", values: [""] }]);
    setVariantPricingMode("absolute");
    setStep(1);
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".attribute-select-container")) {
        setIsAttrDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setLocalFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith("image/"));
    if (files.length > 0) {
      setLocalFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setLocalFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addSpec = () => setSpecs(prev => [...prev, { key: "", values: [""] }]);
  const removeSpec = (idx: number) => setSpecs(prev => prev.filter((_, i) => i !== idx));
  const updateSpecKey = (idx: number, keyVal: string) => {
    setSpecs(prev => prev.map((s, i) => i === idx ? { ...s, key: keyVal } : s));
  };
  const updateSpecValue = (rowIdx: number, valIdx: number, val: string) => {
    setSpecs(prev => prev.map((s, i) => {
      if (i === rowIdx) {
        const newVals = [...s.values];
        newVals[valIdx] = val;
        return { ...s, values: newVals };
      }
      return s;
    }));
  };
  const addSpecValue = (rowIdx: number) => {
    setSpecs(prev => prev.map((s, i) => {
      if (i === rowIdx) {
        return { ...s, values: [...s.values, ""] };
      }
      return s;
    }));
  };
  const removeSpecValue = (rowIdx: number, valIdx: number) => {
    setSpecs(prev => prev.map((s, i) => {
      if (i === rowIdx) {
        const newVals = s.values.filter((_, vi) => vi !== valIdx);
        return { ...s, values: newVals.length > 0 ? newVals : [""] };
      }
      return s;
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.price || !formData.categoryId) {
      alert("يرجى ملء البيانات الأساسية (الاسم، السعر، التصنيف)");
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = formData.images;

      if (localFiles.length > 0) {
        const uploadPromises = localFiles.map(async (file) => {
          const body = new FormData();
          body.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body });
          if (!res.ok) throw new Error("فشل في رفع إحدى الصور");
          const data = await res.json();
          return data.url;
        });
        const urls = await Promise.all(uploadPromises);
        finalImageUrl = urls.filter(u => !!u).join(",");
      }

      if (formData.externalImageUrl) {
        finalImageUrl = finalImageUrl
          ? `${formData.externalImageUrl},${finalImageUrl}`
          : formData.externalImageUrl;
      }

      // Use preview URLs directly if no new uploads and we have existing images
      if (!finalImageUrl && previews.length > 0 && editingProduct) {
        finalImageUrl = previews.join(",");
      }

      const payload: any = {
        ...formData,
        images: finalImageUrl,
        productAttributes: selectedAttributes,
        variations: variations,
        bundleData: formData.type === 'BUNDLE' ? JSON.stringify(bundleItems) : null,
        specifications: specs,
      };

      const url = editingProduct
        ? `/api/vendor/products/${editingProduct.id}`
        : "/api/vendor/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => ({ error: "خطأ في السيرفر" }));

      if (!res.ok) {
        throw new Error(result.error || result.message || "فشل في حفظ المنتج");
      }

      alert(editingProduct ? "تم تحديث المنتج بنجاح!" : "تم إرسال المنتج للمراجعة بنجاح!");
      onClose();
      router.refresh();
      resetForm();
    } catch (error: any) {
      alert(error.message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const generateCombinations = (attrs: any[]) => {
    if (attrs.length === 0) return [];
    let results: any[] = [{}];
    for (const attr of attrs) {
      const next: any[] = [];
      for (const res of results) {
        for (const val of attr.values) next.push({ ...res, [attr.name]: val });
      }
      results = next;
    }
    return results;
  };

  const basePrice = parseFloat(formData.price) || 0;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col relative z-10 border-8 border-white"
        >
          {/* Header with Steps */}
          <div className="px-12 py-8 border-b border-border flex items-center justify-between flex-shrink-0 bg-white">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-[#C5A021]/10 text-[#C5A021] rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-[#C5A021]/5 border border-[#C5A021]/10 font-black text-xl">
                {editingProduct ? <span className="material-symbols-rounded text-2xl">edit</span> : step}
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-[#0F172A]">
                  {editingProduct ? "تعديل المنتج" : step === 1 ? "اختيار النوع والتصنيف" : step === 2 ? "بيانات المنتج والسمات" : "التسعير والمخزون والصور"}
                </h2>
                {!editingProduct && (
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3].map(s => (
                      <div key={s} className={cn("h-1 rounded-full transition-all", step >= s ? "w-8 bg-[#C5A021]" : "w-4 bg-gray-100")} />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-4 hover:bg-muted rounded-2xl transition-all group">
              <span className="material-symbols-rounded text-2xl text-foreground/20 group-hover:text-red-500 transition-colors">close</span>
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-12 custom-scrollbar">
            <AnimatePresence mode="wait">
              {/* STEP 1 */}
              {step === 1 && !editingProduct && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-12"
                >
                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#C5A021] px-2">1. حدد نوع المنتج</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {[
                        { id: "SIMPLE", name: "منتج ثابت", icon: "inventory", desc: "بدون خيارات (مثل كتاب)" },
                        { id: "VARIABLE", name: "منتج متغير", icon: "style", desc: "بخيارات (مثل ملابس بمقاسات)" },
                        { id: "BUNDLE", name: "منتج مركب", icon: "layers", desc: "مجموعة منتجات معاً" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setFormData({ ...formData, type: t.id })}
                          className={cn(
                            "flex flex-col items-center text-center gap-4 p-8 rounded-[2.5rem] border-2 transition-all group",
                            formData.type === t.id
                              ? "bg-[#0F172A] border-[#0F172A] text-white shadow-2xl scale-105"
                              : "bg-white border-gray-100 hover:border-[#C5A021]/30"
                          )}
                        >
                          <span className={cn("material-symbols-rounded text-4xl", formData.type === t.id ? "text-white" : "text-[#C5A021]")}>{t.icon}</span>
                          <div>
                            <span className="text-sm font-black block mb-1">{t.name}</span>
                            <span className={cn("text-[10px] font-bold opacity-60", formData.type === t.id ? "text-white/60" : "text-gray-400")}>{t.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#C5A021] px-2">2. اختر القسم المناسب</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setFormData({ ...formData, categoryId: cat.id })}
                          className={cn(
                            "p-4 rounded-2xl border-2 transition-all text-center",
                            formData.categoryId === cat.id
                              ? "bg-[#C5A021] border-[#C5A021] text-white shadow-lg"
                              : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100"
                          )}
                        >
                          <span className="text-xs font-black">{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 - Product Details & Attributes */}
              {(step === 2 || editingProduct) && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">اسم المنتج *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="مثلاً: قميص بولو قطني"
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#C5A021] focus:bg-white outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">الماركة (اختياري)</label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={e => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="مثلاً: نايك"
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#C5A021] focus:bg-white outline-none transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">وصف موجز</label>
                    <textarea
                      value={formData.shortDescription}
                      onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                      placeholder="وصف سريع يظهر في قائمة المنتجات..."
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#C5A021] focus:bg-white outline-none transition-all font-bold min-h-[100px]"
                    />
                  </div>

                  {/* Tabular Specifications */}
                  <div className="space-y-6 p-8 bg-blue-50/30 rounded-[2.5rem] border-2 border-dashed border-blue-200" dir="rtl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-black text-[#0F172A]">المواصفات الفنية للمنتج</h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-1">أضف صفات المنتج وقيمها المتعددة أفقياً وعمودياً</p>
                      </div>
                      <button 
                        type="button"
                        onClick={addSpec} 
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        إضافة صف جديد (+)
                      </button>
                    </div>
                    <div className="space-y-4">
                      {specs.map((spec, rowIdx) => (
                        <div key={rowIdx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                          <div className="flex gap-3 items-center">
                            <input
                              type="text"
                              value={spec.key}
                              onChange={e => updateSpecKey(rowIdx, e.target.value)}
                              placeholder="اسم الصفة (مثلاً: اللون أو الذاكرة)"
                              className="w-1/3 bg-gray-50 border-2 border-transparent rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#C5A021] focus:bg-white transition-all"
                            />
                            <div className="flex-1 flex flex-wrap gap-2 items-center">
                              {spec.values.map((val, valIdx) => (
                                <div key={valIdx} className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-2.5 py-1.5 border border-gray-200">
                                  <input
                                    type="text"
                                    value={val}
                                    onChange={e => updateSpecValue(rowIdx, valIdx, e.target.value)}
                                    placeholder="القيمة"
                                    className="bg-transparent border-none outline-none text-xs font-bold w-24 focus:ring-0"
                                  />
                                  {spec.values.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeSpecValue(rowIdx, valIdx)}
                                      className="text-red-400 hover:text-red-600 shrink-0"
                                    >
                                      <span className="material-symbols-rounded text-xs">close</span>
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addSpecValue(rowIdx)}
                                className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition-all shrink-0"
                                title="إضافة قيمة فرعية أفقياً"
                              >
                                <span className="material-symbols-rounded text-sm">add</span>
                              </button>
                            </div>
                            <button 
                              type="button"
                              onClick={() => removeSpec(rowIdx)} 
                              className="w-10 h-10 bg-red-50 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-100 transition-all shrink-0"
                            >
                              <span className="material-symbols-rounded text-sm">delete</span>
                            </button>
                          </div>
                          {/* Bottom plus button under each unit */}
                          <div className="flex justify-end pt-1 border-t border-gray-50">
                            <button
                              type="button"
                              onClick={() => {
                                setSpecs(prev => {
                                  const next = [...prev];
                                  next.splice(rowIdx + 1, 0, { key: "", values: [""] });
                                  return next;
                                });
                              }}
                              className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1 transition-all"
                            >
                              <span className="material-symbols-rounded text-sm">add_circle</span>
                              <span>إضافة صف مواصفات جديد بالأسفل</span>
                            </button>
                          </div>
                        </div>
                      ))}
                      {specs.length === 0 && (
                        <p className="text-center text-xs text-gray-400 py-6 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                          لا توجد مواصفات. اضغط "إضافة صف جديد" للبدء.
                        </p>
                      )}
                    </div>
                  </div>
                  {specs.length > 0 && (
                    <p className="text-[10px] text-green-600 font-bold">✓ سيتم عرض المواصفات كجدول في صفحة المنتج</p>
                  )}

                  {/* Attributes & Variations Manager */}
                  {formData.type === "VARIABLE" && (
                    <div className="space-y-8 p-8 bg-[#C5A021]/5 rounded-[2.5rem] border-2 border-dashed border-[#C5A021]/20">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-[#0F172A]">تحديد الخيارات (المقاسات، الألوان، الخ)</h4>
                        <button
                          onClick={() => {
                            const name = prompt("اسم السمة:");
                            const vals = prompt("القيم (مفصولة بفواصل):");
                            if (name && vals) {
                              setAvailableAttributes(prev => [...prev, {
                                id: `custom-${Date.now()}`,
                                name,
                                options: vals.split(",").map((v, i) => ({ id: i.toString(), value: v.trim() }))
                              }]);
                            }
                          }}
                          className="text-[10px] font-black text-[#C5A021] underline"
                        >
                          إضافة سمة مخصصة +
                        </button>
                      </div>

                      <div className="space-y-4 relative attribute-select-container">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="ابحث عن سمة (مثال: لون، مقاس، خامة)..."
                            value={attrSearch}
                            onChange={(e) => { setAttrSearch(e.target.value); setIsAttrDropdownOpen(true); }}
                            onFocus={() => setIsAttrDropdownOpen(true)}
                            className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-4 pr-12 focus:border-[#C5A021] outline-none font-bold transition-all text-right"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-rounded">search</span>
                          {attrSearch && (
                            <button type="button" onClick={() => { setAttrSearch(""); setActiveAttributeId(null); }} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              <span className="material-symbols-rounded text-sm">close</span>
                            </button>
                          )}
                        </div>

                        {isAttrDropdownOpen && (
                          <div className="absolute z-[110] w-full mt-2 max-h-60 overflow-y-auto bg-white border border-gray-100 rounded-2xl shadow-xl p-2 space-y-1">
                            {availableAttributes.filter(attr => attr.name.toLowerCase().includes(attrSearch.toLowerCase())).length > 0 ? (
                              availableAttributes.filter(attr => attr.name.toLowerCase().includes(attrSearch.toLowerCase())).map(attr => (
                                <button
                                  type="button"
                                  key={attr.id}
                                  onClick={() => { setActiveAttributeId(attr.id); setAttrSearch(attr.name); setIsAttrDropdownOpen(false); }}
                                  className={cn("w-full text-right px-4 py-3 rounded-xl text-sm font-bold transition-all block", activeAttributeId === attr.id ? "bg-[#C5A021]/10 text-[#C5A021]" : "hover:bg-gray-50 text-gray-700")}
                                >
                                  {attr.name}
                                </button>
                              ))
                            ) : (
                              <div className="p-4 text-center text-xs text-gray-400">لا توجد سمات مطابقة. يمكنك إضافة سمة مخصصة أعلاه.</div>
                            )}
                          </div>
                        )}

                        {activeAttributeId && availableAttributes.find(a => a.id === activeAttributeId) && (() => {
                          const attr = availableAttributes.find(a => a.id === activeAttributeId);
                          return (
                            <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4 mt-4 animate-in fade-in slide-in-from-top-4">
                              <label className="text-[10px] font-black uppercase text-gray-400">خيارات {attr.name}</label>
                              <div className="flex flex-wrap gap-2">
                                {attr.options?.map((opt: any) => {
                                  const current = selectedAttributes.find(a => a.name === attr.name);
                                  const isSelected = current?.values.includes(opt.value);
                                  return (
                                    <button
                                      key={opt.id}
                                      onClick={() => {
                                        setSelectedAttributes(prev => {
                                          const existing = prev.find(a => a.name === attr.name);
                                          if (existing) {
                                            if (existing.values.includes(opt.value)) {
                                              const filtered = existing.values.filter(v => v !== opt.value);
                                              return filtered.length ? prev.map(a => a.name === attr.name ? { ...a, values: filtered } : a) : prev.filter(a => a.name !== attr.name);
                                            }
                                            return prev.map(a => a.name === attr.name ? { ...a, values: [...a.values, opt.value] } : a);
                                          }
                                          return [...prev, { name: attr.name, values: [opt.value] }];
                                        });
                                      }}
                                      className={cn("px-4 py-2 rounded-xl text-[10px] font-black transition-all border-2", isSelected ? "bg-[#0F172A] border-[#0F172A] text-white" : "bg-gray-50 border-transparent text-gray-400 hover:border-gray-200")}
                                    >
                                      {opt.value}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}

                        {selectedAttributes.length > 0 && (
                          <div className="mt-6 p-4 bg-white rounded-2xl">
                            <label className="text-[10px] font-black uppercase text-[#C5A021] mb-2 block">السمات المحددة للمنتج</label>
                            <div className="flex flex-wrap gap-2">
                              {selectedAttributes.map((sa, i) => (
                                <div key={i} className="bg-gray-50 px-3 py-1 rounded-lg border text-[10px] font-bold">
                                  {sa.name}: {sa.values.join("، ")}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {formData.type === "BUNDLE" && (
                    <div className="p-8 bg-purple-50 rounded-[2.5rem] border-2 border-dashed border-purple-200 space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-purple-900">محتويات الحزمة (Bundle)</h4>
                        <button onClick={() => setBundleItems([...bundleItems, { name: "", price: "" }])} className="text-xs font-black text-purple-600 underline">إضافة منتج +</button>
                      </div>
                      {bundleItems.map((item, idx) => (
                        <div key={idx} className="flex gap-4">
                          <input placeholder="اسم المنتج في الحزمة" value={item.name} onChange={e => { const next = [...bundleItems]; next[idx].name = e.target.value; setBundleItems(next); }} className="flex-grow bg-white border rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                          <button onClick={() => setBundleItems(bundleItems.filter((_, i) => i !== idx))} className="text-red-500 material-symbols-rounded">delete</button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 3 - Pricing, Stock, Images, Variations */}
              {(step === 3 || editingProduct) && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">السعر الأساسي *</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#C5A021] focus:bg-white outline-none transition-all font-black text-lg text-[#C5A021]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">المخزون المتوفر</label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#C5A021] focus:bg-white outline-none transition-all font-black text-lg text-[#0F172A]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">SKU / رمز المنتج</label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={e => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#C5A021] focus:bg-white outline-none transition-all font-bold text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">الوزن التقريبي (كجم)</label>
                      <input
                        type="number"
                        value={formData.weight}
                        onChange={e => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="مثال: 0.5"
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#C5A021] focus:bg-white outline-none transition-all font-bold text-sm text-gray-900"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">الطول (سم)</label>
                        <input
                          type="number"
                          value={formData.length}
                          onChange={e => setFormData({ ...formData, length: e.target.value })}
                          placeholder="0"
                          className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-3 py-4 focus:border-[#C5A021] focus:bg-white outline-none transition-all font-bold text-sm text-gray-900"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">العرض (سم)</label>
                        <input
                          type="number"
                          value={formData.width}
                          onChange={e => setFormData({ ...formData, width: e.target.value })}
                          placeholder="0"
                          className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-3 py-4 focus:border-[#C5A021] focus:bg-white outline-none transition-all font-bold text-sm text-gray-900"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">الارتفاع (سم)</label>
                        <input
                          type="number"
                          value={formData.height}
                          onChange={e => setFormData({ ...formData, height: e.target.value })}
                          placeholder="0"
                          className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-3 py-4 focus:border-[#C5A021] focus:bg-white outline-none transition-all font-bold text-sm text-gray-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">صور المنتج</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {previews.map((src, idx) => (
                        <div key={idx} className="relative aspect-square rounded-3xl overflow-hidden border bg-gray-50 group">
                          <img src={src} alt="Preview" className="w-full h-full object-cover" />
                          <button onClick={() => removeFile(idx)} className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-rounded text-sm">close</span></button>
                        </div>
                      ))}
                      <label
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={cn(
                          "aspect-square border-4 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer",
                          isDragging
                            ? "border-[#C5A021] bg-[#C5A021]/20 scale-105"
                            : "border-[#C5A021]/20 bg-[#C5A021]/5 hover:bg-[#C5A021]/10"
                        )}
                      >
                        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                        <span className="material-symbols-rounded text-3xl text-[#C5A021]">add_photo_alternate</span>
                        <span className="text-[10px] font-black mt-2">
                          {isDragging ? "أفلت الصور هنا" : "اضغط أو اسحب الصور"}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Variable Product: Generate Variations */}
                  {formData.type === "VARIABLE" && selectedAttributes.length > 0 && (() => {
                    const hasCombos = variations.length > 0;
                    return (
                      <div className="space-y-6">
                        {!hasCombos ? (
                          <button
                            onClick={() => {
                              const combos = generateCombinations(selectedAttributes);
                              setVariations(combos.map(c => ({
                                combination: c,
                                price: formData.price,
                                stock: formData.stock || "10",
                                sku: `${formData.sku || 'SKU'}-${Object.values(c).join('-').toUpperCase()}`,
                                image: ""
                              })));
                            }}
                            className="w-full py-4 bg-[#0F172A] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
                          >
                            ⚡ توليد خيارات المنتج تلقائياً
                          </button>
                        ) : (
                          <div className="space-y-4 border-t pt-6">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-black uppercase text-[#C5A021]">قائمة الخيارات المولدة</p>
                              <button onClick={() => setVariations([])} className="text-[10px] text-red-400 underline">إعادة توليد</button>
                            </div>

                            {/* Pricing Mode Selector */}
                            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200">
                              <span className="text-xs font-bold text-gray-600">طريقة تسعير الخيارات:</span>
                              <button
                                onClick={() => setVariantPricingMode("absolute")}
                                className={cn("px-4 py-2 rounded-xl text-[10px] font-black transition-all border-2", variantPricingMode === "absolute" ? "bg-[#0F172A] border-[#0F172A] text-white" : "bg-gray-50 border-gray-200 text-gray-400")}
                              >
                                سعر مطلق لكل خيار
                              </button>
                              <button
                                onClick={() => setVariantPricingMode("adjustment")}
                                className={cn("px-4 py-2 rounded-xl text-[10px] font-black transition-all border-2", variantPricingMode === "adjustment" ? "bg-[#C5A021] border-[#C5A021] text-white" : "bg-gray-50 border-gray-200 text-gray-400")}
                              >
                                إضافة / خصم من السعر الأساسي
                              </button>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto space-y-3 pr-1">
                              {variations.map((v, idx) => {
                                const isColor = Object.keys(v.combination).some(k =>
                                  ["color","لون","colour","كلر","اللون"].some(c => k.toLowerCase().includes(c))
                                );
                                const variantPrice = parseFloat(v.price) || 0;
                                const displayPrice = variantPricingMode === "adjustment"
                                  ? `${variantPrice >= 0 ? '+' : ''}${variantPrice.toLocaleString()} (المجموع: ${(basePrice + variantPrice).toLocaleString()} ج.س)`
                                  : `${variantPrice.toLocaleString()} ج.س`;

                                return (
                                  <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-black text-[#0F172A]">
                                        {Object.entries(v.combination).map(([k,val]) => `${k}: ${val}`).join(" / ")}
                                      </span>
                                      <span className="text-[10px] font-black text-[#C5A021]">{displayPrice}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase">
                                          {variantPricingMode === "adjustment" ? "التعديل على السعر (ج.س)" : "السعر (ج.س)"}
                                        </label>
                                        <input
                                          type="number"
                                          value={v.price}
                                          onChange={e => {
                                            const updated = [...variations];
                                            updated[idx] = { ...updated[idx], price: e.target.value };
                                            setVariations(updated);
                                          }}
                                          placeholder={variantPricingMode === "adjustment" ? "+500 أو -200" : "0"}
                                          className="w-full bg-white border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-black text-[#C5A021] outline-none focus:border-[#C5A021]"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400">المخزون</label>
                                        <input
                                          type="number"
                                          value={v.stock}
                                          onChange={e => {
                                            const updated = [...variations];
                                            updated[idx] = { ...updated[idx], stock: e.target.value };
                                            setVariations(updated);
                                          }}
                                          className="w-full bg-white border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-gray-300"
                                        />
                                      </div>
                                    </div>
                                    {isColor && (
                                      <div className="space-y-2 border-t pt-2">
                                        <label className="text-[9px] font-black uppercase text-blue-500">صورة هذا اللون</label>
                                        <div className="flex items-center gap-3">
                                          {v.image && (
                                            <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-[#C5A021]/30">
                                              <img src={v.image} alt="variant" className="w-full h-full object-cover" />
                                              <button type="button" onClick={() => { const updated = [...variations]; updated[idx] = { ...updated[idx], image: "" }; setVariations(updated); }} className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px]">×</button>
                                            </div>
                                          )}
                                          <label className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl hover:bg-blue-100 transition-all">
                                            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                              const file = e.target.files?.[0];
                                              if (!file) return;
                                              const body = new FormData();
                                              body.append("file", file);
                                              try {
                                                const res = await fetch("/api/upload", { method: "POST", body });
                                                const data = await res.json();
                                                if (data.url) { const updated = [...variations]; updated[idx] = { ...updated[idx], image: data.url }; setVariations(updated); }
                                              } catch { alert("فشل رفع صورة اللون"); }
                                            }} />
                                            <span className="material-symbols-rounded text-blue-400 text-sm">add_photo_alternate</span>
                                            <span className="text-[10px] font-black text-blue-500">{v.image ? "تغيير الصورة" : "ارفع صورة اللون"}</span>
                                          </label>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-12 py-10 border-t border-border bg-stone-50/50 flex items-center justify-between flex-shrink-0">
            <button
              onClick={() => editingProduct ? onClose() : (step > 1 ? setStep(step - 1) : onClose())}
              className="px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-white border-2 border-border hover:bg-muted transition-all text-foreground/40"
            >
              {editingProduct ? "إلغاء" : (step === 1 ? "إلغاء" : "السابق")}
            </button>
            {editingProduct ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-14 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-[#0F172A] text-white shadow-2xl shadow-[#0F172A]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
              >
                {loading ? <span className="animate-spin material-symbols-rounded">sync</span> : <span className="material-symbols-rounded">check_circle</span>}
                {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
              </button>
            ) : (
              <div className="flex gap-4">
                {step < 3 ? (
                  <button
                    onClick={() => {
                      if (step === 1 && !formData.type) return alert("اختر نوع المنتج");
                      if (step === 1 && !formData.categoryId) return alert("اختر القسم");
                      setStep(step + 1);
                    }}
                    className="px-14 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-[#C5A021] text-white shadow-2xl shadow-[#C5A021]/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    التالي
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-14 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-[#0F172A] text-white shadow-2xl shadow-[#0F172A]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    {loading ? <span className="animate-spin material-symbols-rounded">sync</span> : <span className="material-symbols-rounded">check_circle</span>}
                    {loading ? "جاري الحفظ..." : "حفظ المنتج"}
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
