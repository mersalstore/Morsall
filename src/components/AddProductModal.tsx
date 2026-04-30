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
    ram: "",
    storage: "",
    screenSize: "",
  });
  
  const [bundleItems, setBundleItems] = useState<{name: string, price: string}[]>([]);

  // Advanced Variations State
  const [selectedAttributes, setSelectedAttributes] = useState<{name: string, values: string[]}[]>([]);
  const [variations, setVariations] = useState<any[]>([]);

  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch Categories
      fetch("/api/admin/categories")
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
        finalImageUrl = urls.join(",");
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

      const result = await res.json().catch(() => ({ error: "خطأ غير معروف في السيرفر" }));

      if (!res.ok) throw new Error(result.error || "فشل في حفظ بيانات المنتج");

      alert("تم إرسال المنتج للمراجعة بنجاح!");
      onClose();
      router.refresh();
      // Reset form
      setFormData({ 
        type: "SIMPLE", title: "", shortDescription: "", description: "", sku: "", brand: "", range: "", 
        weight: "", length: "", width: "", height: "", price: "", stock: "", 
        discountPrice: "", discountType: "FIXED",
        categoryId: "", 
        images: "", externalImageUrl: "", ram: "", storage: "", screenSize: "" 
      });
      setBundleItems([]);
      setSelectedAttributes([]);
      setVariations([]);
    } catch (error: any) {
      alert(error.message || "حدث خطأ أثناء حفظ المنتج");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          <div className="px-12 py-10 border-b border-border flex items-center justify-between flex-shrink-0 bg-white">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-[#1089A4]/10 text-[#1089A4] rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-[#1089A4]/5 border border-[#1089A4]/10">
                <span className="material-symbols-rounded text-3xl">inventory_2</span>
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight text-[#021D24]">إضافة منتج جديد</h2>
                <p className="text-[10px] text-[#F29124] font-black uppercase tracking-widest mt-1">سيخضع المنتج لمراجعة الإدارة والموافقة البرمجية</p>
              </div>
            </div>
            <button onClick={onClose} className="p-4 hover:bg-muted rounded-2xl transition-all group">
              <span className="material-symbols-rounded text-2xl text-foreground/20 group-hover:text-red-500 transition-colors">close</span>
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-12 space-y-12 custom-scrollbar">
            {/* Product Type Selector */}
            <div className="bg-muted/30 p-6 rounded-[2.5rem] border-2 border-dashed border-[#1089A4]/10">
               <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2 block mb-6 text-center">نوع المنتج</label>
               <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: "SIMPLE", name: "منتج ثابت", icon: "inventory" },
                    { id: "VARIABLE", name: "منتج متغير", icon: "style" },
                    { id: "BUNDLE", name: "منتج مركب / عرض", icon: "layers" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setFormData({ ...formData, type: t.id })}
                      className={cn(
                        "flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all",
                        formData.type === t.id 
                        ? "bg-[#021D24] border-[#021D24] text-white shadow-xl" 
                        : "bg-white border-transparent hover:bg-muted"
                      )}
                    >
                      <span className="material-symbols-rounded text-2xl">{t.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">{t.name}</span>
                    </button>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">اسم المنتج</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثلاً: سماعة بلوتوث لاسلكية" 
                    className="w-full bg-muted/30 border-2 border-transparent rounded-[1.5rem] px-6 py-4 focus:border-primary focus:bg-white outline-none transition-all font-bold text-sm" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">وصف مصغر</label>
                  <input 
                    type="text" 
                    value={formData.shortDescription}
                    onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="وصف سريع يظهر بجانب السعر" 
                    className="w-full bg-muted/30 border-2 border-transparent rounded-[1.5rem] px-6 py-4 focus:border-primary focus:bg-white outline-none transition-all font-bold text-sm" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">السعر (ج.س)</label>
                    <input 
                      type="number" 
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00" 
                      className="w-full bg-muted/30 border-2 border-transparent rounded-[1.5rem] px-6 py-4 focus:border-primary focus:bg-white outline-none transition-all font-black text-sm text-primary" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">الكمية</label>
                    <input 
                      type="number" 
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0" 
                      className="w-full bg-muted/30 border-2 border-transparent rounded-[1.5rem] px-6 py-4 focus:border-primary focus:bg-white outline-none transition-all font-black text-sm" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">سعر الخصم (اختياري)</label>
                    <input 
                      type="number" 
                      value={formData.discountPrice}
                      onChange={e => setFormData({ ...formData, discountPrice: e.target.value })}
                      placeholder="0.00" 
                      className="w-full bg-muted/30 border-2 border-transparent rounded-[1.5rem] px-6 py-4 focus:border-[#F29124] focus:bg-white outline-none transition-all font-black text-sm text-[#F29124]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">نوع الخصم</label>
                    <select 
                      value={formData.discountType}
                      onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                      className="w-full bg-muted/30 border-2 border-transparent rounded-[1.5rem] px-6 py-4 focus:border-primary focus:bg-white outline-none transition-all cursor-pointer font-bold text-sm"
                    >
                      <option value="FIXED">مبلغ ثابت</option>
                      <option value="PERCENTAGE">نسبة مئوية (%)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">رمز المنتج (SKU)</label>
                    <input 
                      type="text" 
                      value={formData.sku}
                      onChange={e => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="e.g. ELE-001" 
                      className="w-full bg-muted/30 border-2 border-transparent rounded-[1.5rem] px-6 py-4 focus:border-primary focus:bg-white outline-none transition-all font-bold text-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">التصنيف</label>
                    <select 
                      value={formData.categoryId}
                      onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full bg-muted/30 border-2 border-transparent rounded-[1.5rem] px-6 py-4 focus:border-primary focus:bg-white outline-none transition-all cursor-pointer font-bold text-sm"
                    >
                      <option value="">اختار التصنيف...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">العلامة التجارية (اختياري)</label>
                    <input 
                      type="text" 
                      value={formData.brand}
                      onChange={e => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="مثلاً: سامسونج" 
                      className="w-full bg-muted/30 border-2 border-transparent rounded-[1.5rem] px-6 py-4 focus:border-primary focus:bg-white outline-none transition-all font-bold text-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">النطاق / الحالة</label>
                    <input 
                      type="text" 
                      value={formData.range}
                      onChange={e => setFormData({ ...formData, range: e.target.value })}
                      placeholder="مثلاً: أصلي 100%" 
                      className="w-full bg-muted/30 border-2 border-transparent rounded-[1.5rem] px-6 py-4 focus:border-primary focus:bg-white outline-none transition-all font-bold text-sm" 
                    />
                  </div>
                </div>

                {/* Conditional Fields for VARIABLE Products */}
                {formData.type === "VARIABLE" && (
                   <div className="p-6 bg-blue-50/50 rounded-[2rem] border-2 border-blue-100 space-y-6">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">المواصفات التقنية</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase">الرام (RAM)</label>
                          <input value={formData.ram} onChange={e => setFormData({...formData, ram: e.target.value})} placeholder="e.g. 8GB" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase">سعة التخزين</label>
                          <input value={formData.storage} onChange={e => setFormData({...formData, storage: e.target.value})} placeholder="e.g. 256GB" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase">حجم الشاشة</label>
                          <input value={formData.screenSize} onChange={e => setFormData({...formData, screenSize: e.target.value})} placeholder="e.g. 6.7 inch" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none" />
                        </div>
                      </div>
                   </div>
                )}
              </div>

              <div className="space-y-4 h-full">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">رابط صورة خارجي (اختياري)</label>
                  <input 
                    type="text" 
                    value={formData.externalImageUrl || ""}
                    onChange={e => setFormData({ ...formData, externalImageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg" 
                    className="w-full bg-muted/30 border-2 border-transparent rounded-[1.5rem] px-6 py-4 focus:border-primary focus:bg-white outline-none transition-all font-bold text-sm" 
                  />
                  <p className="text-[10px] text-foreground/30 px-2">إذا قمت بإضافة رابط هنا، فسيتم استخدامه كصورة أساسية.</p>
                </div>

                {/* Dimensions & Weight */}
                <div className="p-6 bg-orange-50/50 rounded-[2rem] border-2 border-orange-100 space-y-6">
                   <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-2">أبعاد المنتج والوزن (اختياري)</p>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase">الوزن (kg)</label>
                        <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} placeholder="0.0" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase">الطول (cm)</label>
                        <input type="number" value={formData.length} onChange={e => setFormData({...formData, length: e.target.value})} placeholder="0" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase">العرض (cm)</label>
                        <input type="number" value={formData.width} onChange={e => setFormData({...formData, width: e.target.value})} placeholder="0" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase">الارتفاع (cm)</label>
                        <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} placeholder="0" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none" />
                      </div>
                   </div>
                </div>

                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1 block mt-6">صور المنتج (من المعرض)</label>
                <div className="space-y-6">
                  {/* Gallery Grid */}
                  {previews.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {previews.map((src, idx) => (
                        <div key={idx} className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-muted group">
                          <img src={src} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            onClick={(e) => { e.preventDefault(); removeFile(idx); }}
                            className="absolute top-2 left-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <span className="material-symbols-rounded text-sm">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="cursor-pointer group block">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                    <div className="border-4 border-dashed border-[#1089A4]/20 rounded-[2.5rem] flex flex-col items-center justify-center p-10 bg-[#1089A4]/5 group-hover:bg-[#1089A4]/10 group-hover:border-[#1089A4]/40 transition-all">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl mb-4 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-rounded text-3xl text-[#1089A4]">add_photo_alternate</span>
                      </div>
                      <span className="text-xs font-black text-[#021D24]">اختر صوراً من المعرض</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Composite Product Bundle Items */}
            {formData.type === "BUNDLE" && (
               <div className="p-10 bg-purple-50/50 rounded-[3rem] border-2 border-purple-100 space-y-8">
                  <div className="flex items-center justify-between">
                     <p className="text-xs font-black text-purple-700 uppercase tracking-[0.2em]">مكونات العرض المركب</p>
                     <button 
                       onClick={() => setBundleItems([...bundleItems, { name: "", price: "" }])}
                       className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-purple-600/20"
                     >
                       إضافة منتج للحقيبة +
                     </button>
                  </div>
                  <div className="space-y-4">
                     {bundleItems.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-end bg-white p-6 rounded-2xl border border-purple-100">
                           <div className="flex-grow space-y-2">
                              <label className="text-[9px] font-black text-gray-400">اسم المنتج المكون</label>
                              <input 
                                value={item.name} 
                                onChange={e => {
                                   const newItems = [...bundleItems];
                                   newItems[idx].name = e.target.value;
                                   setBundleItems(newItems);
                                }}
                                placeholder="مثلاً: قميص أبيض قطني" 
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-purple-300" 
                              />
                           </div>
                           <div className="w-32 space-y-2">
                              <label className="text-[9px] font-black text-gray-400">السعر ضمن العرض</label>
                              <input 
                                type="number"
                                value={item.price} 
                                onChange={e => {
                                   const newItems = [...bundleItems];
                                   newItems[idx].price = e.target.value;
                                   setBundleItems(newItems);
                                }}
                                placeholder="0.0" 
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-purple-300" 
                              />
                           </div>
                           <button 
                             onClick={() => setBundleItems(bundleItems.filter((_, i) => i !== idx))}
                             className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                           >
                              <span className="material-symbols-rounded text-sm">delete</span>
                           </button>
                        </div>
                     ))}
                     {bundleItems.length === 0 && (
                        <p className="text-center py-6 text-[10px] text-gray-400 font-bold bg-white/50 rounded-2xl border-2 border-dashed border-purple-100">لم يتم إضافة أي منتجات لهذا العرض بعد</p>
                     )}
                  </div>
               </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">وصف المنتج التفصيلي</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="اكتب وصفاً تفصيلياً يشمل المميزات والمواصفات..." 
                className="w-full bg-muted/30 border-2 border-transparent rounded-[2.5rem] px-8 py-6 focus:border-primary focus:bg-white outline-none transition-all min-h-[150px] font-medium text-sm leading-relaxed" 
              />
            </div>

            {/* Advanced Variations Manager */}
            {formData.type === "VARIABLE" && (
              <div className="space-y-10 pt-10 border-t border-border/50">
                <div className="flex items-center justify-between">
                   <h3 className="text-xl font-black text-[#021D24]">إدارة متغيرات المنتج</h3>
                   <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          // Cartesian product of attributes
                          const generateCombinations = (attrs: any[]) => {
                            if (attrs.length === 0) return [];
                            let results: any[] = [{}];
                            for (const attr of attrs) {
                              const newResults: any[] = [];
                              for (const result of results) {
                                for (const val of attr.values) {
                                  newResults.push({ ...result, [attr.name]: val });
                                }
                              }
                              results = newResults;
                            }
                            return results;
                          };
                          
                          const combos = generateCombinations(selectedAttributes);
                          setVariations(combos.map(c => ({
                            combination: c,
                            price: formData.price,
                            stock: "10",
                            sku: `${formData.sku || 'PROD'}-${Object.values(c).join('-').toUpperCase()}`
                          })));
                        }}
                        className="btn-secondary px-6 py-2 text-[10px]"
                      >
                        توليد كل التشكيلات الممكنة
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {availableAttributes.map((attr) => (
                    <div key={attr.id} className="p-6 bg-gray-50 rounded-[2rem] border-2 border-gray-100 space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1 block">{attr.name}</label>
                      <div className="flex flex-wrap gap-2">
                        {attr.options?.map((opt: any) => {
                          const currentAttr = selectedAttributes.find(a => a.name === attr.name);
                          const isSelected = currentAttr?.values.includes(opt.value);
                          
                          return (
                            <button 
                              key={opt.id} 
                              onClick={() => {
                                setSelectedAttributes(prev => {
                                  const existing = prev.find(a => a.name === attr.name);
                                  if (existing) {
                                    if (existing.values.includes(opt.value)) {
                                      const newValues = existing.values.filter(v => v !== opt.value);
                                      if (newValues.length === 0) return prev.filter(a => a.name !== attr.name);
                                      return prev.map(a => a.name === attr.name ? { ...a, values: newValues } : a);
                                    }
                                    return prev.map(a => a.name === attr.name ? { ...a, values: [...a.values, opt.value] } : a);
                                  }
                                  return [...prev, { name: attr.name, values: [opt.value] }];
                                });
                              }}
                              className={cn(
                                "px-4 py-2 border-2 rounded-xl text-[9px] font-black transition-all",
                                isSelected ? "bg-[#021D24] border-[#021D24] text-white" : "bg-white border-transparent text-gray-400 hover:border-gray-200"
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

                {/* Variations List */}
                {variations.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-[#1089A4] uppercase tracking-[0.2em]">قائمة التشكيلات المولدة ({variations.length})</p>
                    <div className="grid grid-cols-1 gap-4">
                      {variations.map((v, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl border-2 border-gray-100 flex flex-wrap items-center gap-6 shadow-sm">
                           <div className="flex-1 min-w-[200px]">
                              <div className="flex gap-2">
                                {Object.entries(v.combination).map(([name, val]: any) => (
                                  <span key={name} className="px-3 py-1 bg-gray-100 rounded-lg text-[9px] font-black text-gray-500">{name}: {val}</span>
                                ))}
                              </div>
                           </div>
                           <div className="w-32">
                              <label className="text-[9px] font-black text-gray-400 block mb-1">السعر</label>
                              <input 
                                type="number" 
                                value={v.price} 
                                onChange={e => {
                                  const newV = [...variations];
                                  newV[idx].price = e.target.value;
                                  setVariations(newV);
                                }}
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-bold" 
                              />
                           </div>
                           <div className="w-24">
                              <label className="text-[9px] font-black text-gray-400 block mb-1">المخزون</label>
                              <input 
                                type="number" 
                                value={v.stock} 
                                onChange={e => {
                                  const newV = [...variations];
                                  newV[idx].stock = e.target.value;
                                  setVariations(newV);
                                }}
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-bold" 
                              />
                           </div>
                           <div className="w-40">
                              <label className="text-[9px] font-black text-gray-400 block mb-1">SKU</label>
                              <input 
                                type="text" 
                                value={v.sku} 
                                onChange={e => {
                                  const newV = [...variations];
                                  newV[idx].sku = e.target.value;
                                  setVariations(newV);
                                }}
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-[10px] font-mono" 
                              />
                           </div>
                           <button 
                            onClick={() => setVariations(variations.filter((_, i) => i !== idx))}
                            className="w-10 h-10 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                           >
                              <span className="material-symbols-rounded text-sm">delete</span>
                           </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-12 py-10 border-t border-border bg-stone-50/50 flex items-center justify-end gap-6 flex-shrink-0">
            <button onClick={onClose} className="px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-white border-2 border-border hover:bg-muted transition-all text-foreground/40">إلغاء</button>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="px-14 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-primary text-white shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                 <span className="animate-spin material-symbols-rounded text-lg">sync</span>
              ) : (
                <span className="material-symbols-rounded text-lg">check_circle</span>
              )}
              {loading ? "جاري الحفظ..." : "حفظ وإرسال للمراجعة"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
