"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [availableAttributes, setAvailableAttributes] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    type: "SIMPLE", // SIMPLE | VARIABLE | BUNDLE
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
    discountType: "FIXED", // FIXED | PERCENTAGE
    categoryId: "",
    images: "", // Commas separated URLs for now
    externalImageUrl: "",
  });

  const [bundleItems, setBundleItems] = useState<{ name: string, price: string }[]>([]);

  const [step, setStep] = useState(1);

  // Advanced Variations State
  const [selectedAttributes, setSelectedAttributes] = useState<{ name: string, values: string[] }[]>([]);
  const [variations, setVariations] = useState<any[]>([]);

  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStep(1); // Reset to first step when opening
      // Fetch Categories
      fetch("/api/categories")
        .then(res => res.json())
        .then(data => setCategories(data))
        .catch(err => console.error("Failed to fetch categories", err));

      // Fetch Global Attributes
      fetch("/api/attributes")
        .then(res => res.json())
        .then(data => setAvailableAttributes(data))
        .catch(err => console.error("Failed to fetch attributes", err));
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
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

  const handleSubmit = async () => {
    if (!formData.title || !formData.price || !formData.categoryId) {
      alert("يرجى ملء البيانات الأساسية (الاسم، السعر، التصنيف)");
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = formData.images;

      // Upload local files first
      if (localFiles.length > 0) {
        const uploadPromises = localFiles.map(async (file) => {
          const body = new FormData();
          body.append("file", file);
          const res = await fetch("/api/upload", {
            method: "POST",
            body,
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "فشل في رفع إحدى الصور — قد يكون السبب حجم الملف أو قيود السيرفر");
          }

          const data = await res.json();
          return data.url;
        });

        const urls = await Promise.all(uploadPromises);
        finalImageUrl = urls.filter(u => !!u).join(",");
      }

      // Merge with external URL if provided
      if (formData.externalImageUrl) {
        finalImageUrl = finalImageUrl
          ? `${formData.externalImageUrl},${finalImageUrl}`
          : formData.externalImageUrl;
      }

      const res = await fetch("/api/vendor/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          images: finalImageUrl,
          productAttributes: selectedAttributes,
          variations: variations,
          bundleData: formData.type === 'BUNDLE' ? JSON.stringify(bundleItems) : null,
        }),
      });

      const result = await res.json().catch(() => ({ error: "خطأ في السيرفر أو لم يتم استلام استجابة صالحة" }));

      if (!res.ok) {
        throw new Error(result.error || result.message || "فشل في حفظ بيانات المنتج — تأكد من صحة البيانات المدخلة");
      }

      alert("تم إرسال المنتج للمراجعة بنجاح!");
      onClose();
      router.refresh();
      // Reset form
      setFormData({
        type: "SIMPLE", title: "", shortDescription: "", description: "", sku: "", brand: "", range: "",
        weight: "", length: "", width: "", height: "", price: "", stock: "",
        discountPrice: "", discountType: "FIXED",
        categoryId: "", 
        images: "", externalImageUrl: ""
      });
      setBundleItems([]);
      setSelectedAttributes([]);
      setVariations([]);
      setStep(1);
    } catch (error: any) {
      console.error("Submission Error:", error);
      alert(error.message || "حدث خطأ غير متوقع أثناء حفظ المنتج");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#021D24]/40 backdrop-blur-sm"
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
              <div className="w-16 h-16 bg-[#1089A4]/10 text-[#1089A4] rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-[#1089A4]/5 border border-[#1089A4]/10 font-black text-xl">
                {step}
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-[#021D24]">
                  {step === 1 ? "اختيار النوع والتصنيف" : step === 2 ? "بيانات المنتج والسمات" : "التسعير والمخزون والصور"}
                </h2>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3].map(s => (
                    <div key={s} className={cn("h-1 rounded-full transition-all", step >= s ? "w-8 bg-[#1089A4]" : "w-4 bg-gray-100")} />
                  ))}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-4 hover:bg-muted rounded-2xl transition-all group">
              <span className="material-symbols-rounded text-2xl text-foreground/20 group-hover:text-red-500 transition-colors">close</span>
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-12 custom-scrollbar">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-12"
                >
                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#1089A4] px-2">1. حدد نوع المنتج</label>
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
                              ? "bg-[#021D24] border-[#021D24] text-white shadow-2xl scale-105"
                              : "bg-white border-gray-100 hover:border-[#1089A4]/30"
                          )}
                        >
                          <span className={cn("material-symbols-rounded text-4xl", formData.type === t.id ? "text-white" : "text-[#1089A4]")}>{t.icon}</span>
                          <div>
                            <span className="text-sm font-black block mb-1">{t.name}</span>
                            <span className={cn("text-[10px] font-bold opacity-60", formData.type === t.id ? "text-white/60" : "text-gray-400")}>{t.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#1089A4] px-2">2. اختر القسم المناسب</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setFormData({ ...formData, categoryId: cat.id })}
                          className={cn(
                            "p-4 rounded-2xl border-2 transition-all text-center",
                            formData.categoryId === cat.id
                              ? "bg-[#1089A4] border-[#1089A4] text-white shadow-lg"
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

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">اسم المنتج</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="مثلاً: قميص بولو قطني"
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#1089A4] focus:bg-white outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">الماركة (اختياري)</label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={e => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="مثلاً: نايك"
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#1089A4] focus:bg-white outline-none transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">وصف موجز</label>
                    <textarea
                      value={formData.shortDescription}
                      onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                      placeholder="وصف سريع يظهر في قائمة المنتجات..."
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#1089A4] focus:bg-white outline-none transition-all font-bold min-h-[100px]"
                    />
                  </div>

                  {/* Dynamic Attributes Manager */}
                  {formData.type === "VARIABLE" && (
                    <div className="space-y-8 p-8 bg-[#1089A4]/5 rounded-[2.5rem] border-2 border-dashed border-[#1089A4]/20">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-[#021D24]">تحديد الخيارات (المقاسات، الألوان، الخ)</h4>
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
                          className="text-[10px] font-black text-[#1089A4] underline"
                        >
                          إضافة سمة مخصصة +
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {availableAttributes.map(attr => (
                          <div key={attr.id} className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                            <label className="text-[10px] font-black uppercase text-gray-400">{attr.name}</label>
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
                                    className={cn(
                                      "px-4 py-2 rounded-xl text-[10px] font-black transition-all border-2",
                                      isSelected ? "bg-[#021D24] border-[#021D24] text-white" : "bg-gray-50 border-transparent text-gray-400"
                                    )}
                                  >
                                    {opt.value}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
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
                          <input
                            placeholder="اسم المنتج في الحزمة"
                            value={item.name}
                            onChange={e => {
                              const next = [...bundleItems];
                              next[idx].name = e.target.value;
                              setBundleItems(next);
                            }}
                            className="flex-grow bg-white border rounded-xl px-4 py-2 text-xs font-bold outline-none"
                          />
                          <button onClick={() => setBundleItems(bundleItems.filter((_, i) => i !== idx))} className="text-red-500 material-symbols-rounded">delete</button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">السعر الأساسي</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#1089A4] focus:bg-white outline-none transition-all font-black text-lg text-[#1089A4]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">المخزون المتوفر</label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#1089A4] focus:bg-white outline-none transition-all font-black text-lg text-[#021D24]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">SKU / رمز المنتج</label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={e => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-[#1089A4] focus:bg-white outline-none transition-all font-bold text-gray-400"
                      />
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
                      <label className="aspect-square border-4 border-dashed border-[#1089A4]/20 rounded-3xl flex flex-col items-center justify-center bg-[#1089A4]/5 hover:bg-[#1089A4]/10 transition-all cursor-pointer">
                        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                        <span className="material-symbols-rounded text-3xl text-[#1089A4]">add_photo_alternate</span>
                        <span className="text-[10px] font-black mt-2">رفع صور</span>
                      </label>
                    </div>
                  </div>

                  {formData.type === "VARIABLE" && variations.length === 0 && (
                    <button
                      onClick={() => {
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
                        const combos = generateCombinations(selectedAttributes);
                        setVariations(combos.map(c => ({
                          combination: c,
                          price: formData.price,
                          stock: formData.stock || "10",
                          sku: `${formData.sku || 'SKU'}-${Object.values(c).join('-').toUpperCase()}`
                        })));
                      }}
                      className="w-full py-4 bg-[#021D24] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
                    >
                      توليد خيارات المنتج (Variations)
                    </button>
                  )}

                  {variations.length > 0 && (
                    <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar border-t pt-6">
                      <p className="text-[10px] font-black uppercase text-[#1089A4]">قائمة الخيارات المولدة</p>
                      {variations.map((v, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <span className="text-[10px] font-black">{Object.values(v.combination).join(" / ")}</span>
                          <div className="flex gap-4">
                            <input type="number" value={v.price} className="w-20 bg-white border rounded-lg px-2 py-1 text-xs font-bold" />
                            <input type="number" value={v.stock} className="w-16 bg-white border rounded-lg px-2 py-1 text-xs font-bold" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-12 py-10 border-t border-border bg-stone-50/50 flex items-center justify-between flex-shrink-0">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              className="px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-white border-2 border-border hover:bg-muted transition-all text-foreground/40"
            >
              {step === 1 ? "إلغاء" : "السابق"}
            </button>
            <div className="flex gap-4">
              {step < 3 ? (
                <button
                  onClick={() => {
                    if (step === 1 && !formData.type) return alert("اختر نوع المنتج");
                    if (step === 1 && !formData.categoryId) return alert("اختر القسم");
                    setStep(step + 1);
                  }}
                  className="px-14 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-[#1089A4] text-white shadow-2xl shadow-[#1089A4]/30 hover:scale-105 active:scale-95 transition-all"
                >
                  التالي
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-14 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-[#021D24] text-white shadow-2xl shadow-[#021D24]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  {loading ? <span className="animate-spin material-symbols-rounded">sync</span> : <span className="material-symbols-rounded">check_circle</span>}
                  {loading ? "جاري الحفظ..." : "حفظ المنتج"}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
