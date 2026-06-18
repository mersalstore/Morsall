"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Upload, 
  Trash2, 
  Package, 
  Tag, 
  CheckCircle,
  Image as ImageIcon,
  Layers,
  Settings2,
  DollarSign,
  Plus,
  ArrowRight,
  Info,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingProduct?: any;
  initialVendorId?: string;
  showToast?: (message: string, type?: "success" | "error" | "info") => void;
}

export default function AddProductModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingProduct, 
  initialVendorId,
  showToast
}: AddProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
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
    vendorId: "",
  });

  const [bundleItems, setBundleItems] = useState<{ name: string; price: string }[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<{ name: string; values: string[] }[]>([]);
  const [variations, setVariations] = useState<any[]>([]);
  const [activeAttributeId, setActiveAttributeId] = useState<string | null>(null);
  const [attrSearch, setAttrSearch] = useState("");
  const [isAttrDropdownOpen, setIsAttrDropdownOpen] = useState(false);

  // Unified Image State
  const [previews, setPreviews] = useState<{ url: string; file?: File }[]>([]);

  // Tabular specifications
  const [specs, setSpecs] = useState<{ key: string; values: string[] }[]>([{ key: "", values: [""] }]);

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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Fetch data
      fetch("/api/admin/categories").then(r => r.json()).then(data => setCategories(Array.isArray(data) ? data : [])).catch(() => {});
      fetch("/api/admin/vendors").then(r => r.json()).then(data => setVendors(Array.isArray(data) ? data : [])).catch(() => {});
      fetch("/api/attributes").then(r => r.json()).then(data => setAvailableAttributes(Array.isArray(data) ? data : [])).catch(() => {});

      if (editingProduct) {
        setLoading(true);
        fetch(`/api/products/${editingProduct.id}`)
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
                vendorId: data.vendorId || "",
              });
              
              setBundleItems(data.bundleData || []);
              setSelectedAttributes(data.productAttributes?.map((attr: any) => ({
                name: attr.name,
                values: attr.values
              })) || []);
              
              setVariations(data.variations?.map((v: any) => ({
                combination: v.combination,
                price: v.price?.toString() || "",
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
                setPreviews(data.images.map((url: string) => ({ url })));
              } else if (typeof data.images === "string" && data.images.trim()) {
                setPreviews(data.images.split(",").map((url: string) => ({ url: url.trim() })).filter(Boolean));
              } else {
                setPreviews([]);
              }
            }
          })
          .catch(err => console.error("Error fetching detailed product for admin editing", err))
          .finally(() => setLoading(false));
      } else {
        setFormData({
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
          vendorId: initialVendorId || "",
        });
        setBundleItems([]);
        setSelectedAttributes([]);
        setVariations([]);
        setPreviews([]);
        setSpecs([{ key: "", values: [""] }]);
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; }
  }, [isOpen, editingProduct, initialVendorId]);

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
      const newItems = files.map(file => ({
        url: URL.createObjectURL(file),
        file
      }));
      setPreviews(prev => [...prev, ...newItems]);
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
      const newItems = files.map(file => ({
        url: URL.createObjectURL(file),
        file
      }));
      setPreviews(prev => [...prev, ...newItems]);
    }
  };

  const removeFile = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.price || !formData.categoryId || !formData.vendorId) {
      if (showToast) {
        showToast("يرجى ملء البيانات الأساسية المعلمة بنجمة (*)", "error");
      } else {
        alert("يرجى ملء البيانات الأساسية المعلمة بنجمة (*)");
      }
      return;
    }

    setLoading(true);
    try {
      // 1. Upload newly selected main files
      const uploadPromises = previews.map(async (item) => {
        if (item.file) {
          const body = new FormData();
          body.append("file", item.file);
          const res = await fetch("/api/upload", {
            method: "POST",
            body,
            cache: "no-cache"
          });

          if (!res.ok) {
            throw new Error(`فشل رفع الصورة — قد يكون الملف كبير جداً`);
          }

          const data = await res.json();
          return data.url;
        } else {
          return item.url;
        }
      });

      const urls = await Promise.all(uploadPromises);
      const finalImageUrl = urls.filter(Boolean).join(",");

      // 2. Submit payload
      const payload: any = {
        ...formData,
        images: finalImageUrl,
        productAttributes: selectedAttributes,
        variations: variations,
        bundleData: formData.type === 'BUNDLE' ? JSON.stringify(bundleItems) : null,
        specifications: specs,
        status: "APPROVED"
      };

      if (editingProduct) {
        payload.id = editingProduct.id;
      }

      const res = await fetch("/api/admin/inventory", {
        method: editingProduct ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => ({ error: "خطأ في الاتصال بالسيرفر" }));

      if (!res.ok) {
        throw new Error(result.error || "فشل في حفظ المنتج");
      }

      if (showToast) {
        showToast(editingProduct ? "تم تحديث المنتج بنجاح! ✨" : "تمت إضافة المنتج بنجاح! 🎉", "success");
      } else {
        alert(editingProduct ? "تم تحديث المنتج بنجاح!" : "تمت إضافة المنتج بنجاح!");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Admin Submission Error:", error);
      if (showToast) {
        showToast(error.message || "حدث خطأ غير متوقع", "error");
      } else {
        alert(error.message || "حدث خطأ غير متوقع");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Full Screen Page Layout - Noon/Amazon Style */}
      <div className="fixed inset-0 z-[1000] bg-[#F3F4F6] w-full h-full overflow-hidden flex flex-col" dir="rtl">
        
        {/* Top Header / Sticky App Bar */}
        <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between flex-shrink-0 shadow-sm z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowRight size={20} className="text-gray-600" />
            </button>
            <div className="h-6 w-px bg-gray-300 mx-2"></div>
            <h2 className="text-lg font-bold text-gray-900">
              {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
            </h2>
            {editingProduct && (
              <span className="bg-[#C5A021]/10 text-[#C5A021] text-[10px] font-bold px-2.5 py-1 rounded-md ml-4">
                تعديل مباشر
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-[#C5A021] hover:bg-[#b08e1c] text-white text-sm font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? "جاري الحفظ..." : "حفظ المنتج"}
            </button>
          </div>
        </div>

        {/* Main Scrolling Content Area */}
        <div className="flex-grow overflow-y-auto overflow-x-hidden p-6 custom-scrollbar pb-24">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* LEFT COLUMN: Main Form Content (70%) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Card 1: Basic Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-[#C5A021] rounded-full"></div>
                  <h3 className="font-bold text-gray-900 text-sm">المعلومات الأساسية</h3>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">اسم المنتج <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="مثال: Apple iPhone 15 Pro Max, 256GB"
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] outline-none transition-all text-sm text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">وصف قصير (يظهر تحت العنوان)</label>
                    <input
                      type="text"
                      value={formData.shortDescription}
                      onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                      placeholder="وصف مختصر وجذاب للمنتج..."
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] outline-none transition-all text-sm text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">الوصف التفصيلي والمواصفات</label>
                    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-[#C5A021] focus-within:ring-1 focus-within:ring-[#C5A021] transition-all">
                      {/* Fake Rich Text Toolbar for premium feel */}
                      <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex gap-2">
                        <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
                        <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
                        <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
                        <div className="h-4 w-px bg-gray-300 mx-1"></div>
                        <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
                      </div>
                      <textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="اكتب مواصفات المنتج الكاملة هنا..."
                        className="w-full bg-white px-4 py-3 outline-none min-h-[150px] text-sm text-gray-900 resize-y"
                      />
                    </div>
                  </div>

                  {/* Tabular Specifications */}
                  <div className="border-t border-gray-100 pt-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">المواصفات الفنية الديناميكية</h4>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">أضف الخصائص الفنية للمنتج وقيمها المتعددة (مثل: اللون، الذاكرة...)</p>
                      </div>
                      <button 
                        type="button"
                        onClick={addSpec} 
                        className="px-3.5 py-1.5 bg-[#C5A021] text-white hover:bg-[#b08e1c] rounded-lg font-bold text-xs transition-all flex items-center gap-1 shadow-sm"
                      >
                        <Plus size={14} />
                        إضافة صف جديد
                      </button>
                    </div>

                    <div className="space-y-3">
                      {specs.map((spec, rowIdx) => (
                        <div key={rowIdx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
                          <div className="flex gap-3 items-center">
                            <input
                              type="text"
                              value={spec.key}
                              onChange={e => updateSpecKey(rowIdx, e.target.value)}
                              placeholder="اسم الصفة (مثلاً: اللون أو الذاكرة)"
                              className="w-1/3 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] outline-none transition-all text-gray-900"
                            />
                            <div className="flex-1 flex flex-wrap gap-2 items-center">
                              {spec.values.map((val, valIdx) => (
                                <div key={valIdx} className="flex items-center gap-1.5 bg-white rounded-lg px-2 py-1 border border-gray-300 shadow-sm">
                                  <input
                                    type="text"
                                    value={val}
                                    onChange={e => updateSpecValue(rowIdx, valIdx, e.target.value)}
                                    placeholder="القيمة"
                                    className="bg-transparent border-none outline-none text-xs font-bold w-20 focus:ring-0 text-gray-900"
                                  />
                                  {spec.values.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeSpecValue(rowIdx, valIdx)}
                                      className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                                    >
                                      <X size={12} />
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addSpecValue(rowIdx)}
                                className="w-7 h-7 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300 transition-all shrink-0"
                                title="إضافة قيمة فرعية أفقياً"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button 
                              type="button"
                              onClick={() => removeSpec(rowIdx)} 
                              className="w-9 h-9 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100 transition-all shrink-0 border border-red-100"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          {/* Bottom plus button under each unit */}
                          <div className="flex justify-end pt-1 border-t border-gray-200">
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
                              <Plus size={12} />
                              <span>إضافة صف مواصفات جديد بالأسفل</span>
                            </button>
                          </div>
                        </div>
                      ))}
                      {specs.length === 0 && (
                        <p className="text-center text-xs text-gray-400 py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          لا توجد مواصفات فنية ديناميكية. اضغط "إضافة صف جديد" للبدء.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Media & Images */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-[#C5A021] rounded-full"></div>
                    <h3 className="font-bold text-gray-900 text-sm">الصور والوسائط</h3>
                  </div>
                  <span className="text-[10px] text-gray-500">الصورة الأولى هي الرئيسية</span>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {/* Upload Button Box */}
                    <label
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={cn(
                        "aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer group",
                        isDragging
                          ? "border-[#C5A021] bg-[#C5A021]/20 scale-105"
                          : "border-gray-300 hover:border-[#C5A021] bg-gray-50 hover:bg-[#C5A021]/5"
                      )}
                    >
                      <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                      <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Upload size={18} className="text-[#C5A021]" />
                      </div>
                      <span className="text-[11px] font-bold text-gray-600">إضافة صور</span>
                    </label>

                    {previews.map((item, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-white group shadow-sm">
                        <img src={item.url} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="w-8 h-8 bg-white/20 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {idx === 0 && (
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-[#0F172A] text-[9px] font-black px-2 py-1 rounded-md shadow-sm">
                            الرئيسية
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 3: Pricing & Inventory */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-[#C5A021] rounded-full"></div>
                  <h3 className="font-bold text-gray-900 text-sm">التسعير والمخزون</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">السعر الأساسي (ج.س) <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <DollarSign size={14} className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={e => setFormData({ ...formData, price: e.target.value })}
                          placeholder="0.00"
                          className="w-full bg-white border border-gray-300 rounded-lg pl-4 pr-9 py-2.5 focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] outline-none transition-all text-sm font-bold text-gray-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">الكمية المتوفرة (المخزون) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                        placeholder="مثال: 50"
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] outline-none transition-all text-sm text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">قيمة الخصم (اختياري)</label>
                      <input
                        type="number"
                        value={formData.discountPrice}
                        onChange={e => setFormData({ ...formData, discountPrice: e.target.value })}
                        placeholder="0.00"
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] outline-none transition-all text-sm text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">نوع الخصم</label>
                      <div className="relative">
                        <select
                          value={formData.discountType}
                          onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                          className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] outline-none transition-all text-sm text-gray-900"
                        >
                          <option value="FIXED">مبلغ ثابت (ج.س)</option>
                          <option value="PERCENTAGE">نسبة مئوية (%)</option>
                        </select>
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <ChevronDown size={14} className="text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Variants & Attributes (ONLY IF VARIABLE) */}
              {formData.type === "VARIABLE" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-[#C5A021] rounded-full"></div>
                    <h3 className="font-bold text-gray-900 text-sm">الخيارات والسمات (Variations)</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <p className="text-xs text-gray-500">أضف سمات مثل اللون أو المقاس لإنشاء خيارات مختلفة للمنتج.</p>
                      <button
                        type="button"
                        onClick={() => {
                          const name = prompt("ادخل اسم السمة (مثل: رامات، اللون، المقاس):");
                          const valuesStr = prompt("ادخل قيم السمة مفصولة بفواصل (مثال: 8 جيجا، 12 جيجا):");
                          if (name && valuesStr) {
                            setAvailableAttributes(prev => [...prev, {
                              id: `custom-${Date.now()}`,
                              name,
                              options: valuesStr.split(",").map((v, i) => ({ id: i.toString(), value: v.trim() }))
                            }]);
                          }
                        }}
                        className="text-xs font-bold text-[#C5A021] hover:underline"
                      >
                        + إضافة سمة مخصصة
                      </button>
                    </div>

                    <div className="relative attribute-select-container mb-6">
                      <input
                        type="text"
                        placeholder="ابحث عن سمة لإضافتها (اللون، الرامات، الذاكرة)..."
                        value={attrSearch}
                        onChange={(e) => {
                          setAttrSearch(e.target.value);
                          setIsAttrDropdownOpen(true);
                        }}
                        onFocus={() => setIsAttrDropdownOpen(true)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:border-[#C5A021] focus:bg-white outline-none transition-all text-sm text-gray-900"
                      />
                      {isAttrDropdownOpen && (
                        <div className="absolute z-[1100] w-full mt-1 max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg p-1.5">
                          {availableAttributes.filter(a => a.name.includes(attrSearch)).map(attr => (
                            <button
                              type="button"
                              key={attr.id}
                              onClick={() => {
                                setActiveAttributeId(attr.id);
                                setAttrSearch(attr.name);
                                setIsAttrDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full text-right px-3 py-2 rounded-md text-xs font-bold transition-all",
                                activeAttributeId === attr.id ? "bg-[#C5A021]/10 text-[#C5A021]" : "hover:bg-gray-50 text-gray-700"
                              )}
                            >
                              {attr.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {activeAttributeId && (() => {
                      const attr = availableAttributes.find(a => a.id === activeAttributeId);
                      if (!attr) return null;
                      return (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                          <label className="block text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider">حدد القيم المتاحة لـ ({attr.name})</label>
                          <div className="flex flex-wrap gap-2">
                            {attr.options?.map((opt: any) => {
                              const current = selectedAttributes.find(a => a.name === attr.name);
                              const isSelected = current?.values.includes(opt.value);
                              return (
                                <button
                                  type="button"
                                  key={opt.id}
                                  onClick={() => {
                                    setSelectedAttributes(prev => {
                                      const existing = prev.find(a => a.name === attr.name);
                                      if (existing) {
                                        if (existing.values.includes(opt.value)) {
                                          const filtered = existing.values.filter(v => v !== opt.value);
                                          return filtered.length
                                            ? prev.map(a => a.name === attr.name ? { ...a, values: filtered } : a)
                                            : prev.filter(a => a.name !== attr.name);
                                        }
                                        return prev.map(a => a.name === attr.name ? { ...a, values: [...a.values, opt.value] } : a);
                                      }
                                      return [...prev, { name: attr.name, values: [opt.value] }];
                                    });
                                  }}
                                  className={cn(
                                    "px-4 py-2 rounded-lg text-xs font-bold border transition-all",
                                    isSelected ? "bg-[#0F172A] border-[#0F172A] text-white shadow-sm" : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                                  )}
                                >
                                  {opt.value}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Combinations Generator */}
                    {selectedAttributes.length > 0 && (
                      <div className="border-t border-gray-200 pt-6">
                        {variations.length === 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              const generateCombinations = (attrs: any[]) => {
                                if (attrs.length === 0) return [];
                                let results: any[] = [{}];
                                for (const attr of attrs) {
                                  const next: any[] = [];
                                  for (const res of results) {
                                    for (const val of attr.values) {
                                      next.push({ ...res, [attr.name]: val });
                                    }
                                  }
                                  results = next;
                                }
                                return results;
                              };
                              const combos = generateCombinations(selectedAttributes);
                              setVariations(combos.map(c => ({
                                combination: c,
                                price: formData.price || "0",
                                stock: formData.stock || "10",
                                sku: `${formData.sku || 'SKU'}-${Object.values(c).join('-').toUpperCase()}`,
                                image: ""
                              })));
                            }}
                            className="w-full py-3.5 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-gray-800 transition-all shadow-sm flex items-center justify-center gap-2"
                          >
                            توليد الخيارات تلقائياً بناءً على السمات المختارة
                          </button>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                              <p className="text-xs font-bold text-gray-700">الخيارات المُولدة ({variations.length})</p>
                              <button
                                type="button"
                                onClick={() => setVariations([])}
                                className="text-xs text-red-500 font-bold hover:underline"
                              >
                                إعادة تعيين وحذف
                              </button>
                            </div>

                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                              <table className="w-full text-right text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                  <tr>
                                    <th className="px-4 py-3 font-bold text-xs text-gray-500 uppercase tracking-wider">الخيار (التركيبة)</th>
                                    <th className="px-4 py-3 font-bold text-xs text-gray-500 uppercase tracking-wider w-32">السعر (ج.س)</th>
                                    <th className="px-4 py-3 font-bold text-xs text-gray-500 uppercase tracking-wider w-32">المخزون</th>
                                    <th className="px-4 py-3 font-bold text-xs text-gray-500 uppercase tracking-wider w-24">صورة</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {variations.map((v, idx) => (
                                    <tr key={idx} className="bg-white hover:bg-gray-50 transition-colors">
                                      <td className="px-4 py-3">
                                        <div className="font-bold text-gray-900 text-xs">
                                          {Object.entries(v.combination).map(([k, val]) => `${val}`).join(" • ")}
                                        </div>
                                        <div className="text-[10px] text-gray-400 mt-1">{v.sku}</div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <input
                                          type="number"
                                          value={v.price}
                                          onChange={e => {
                                            const next = [...variations];
                                            next[idx].price = e.target.value;
                                            setVariations(next);
                                          }}
                                          className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-xs focus:border-[#C5A021] outline-none bg-white"
                                        />
                                      </td>
                                      <td className="px-4 py-3">
                                        <input
                                          type="number"
                                          value={v.stock}
                                          onChange={e => {
                                            const next = [...variations];
                                            next[idx].stock = e.target.value;
                                            setVariations(next);
                                          }}
                                          className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-xs focus:border-[#C5A021] outline-none bg-white"
                                        />
                                      </td>
                                      <td className="px-4 py-3">
                                        <label className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer overflow-hidden transition-colors">
                                          {v.image ? (
                                            <img src={v.image} className="w-full h-full object-cover" alt="" />
                                          ) : (
                                            <ImageIcon size={14} className="text-gray-400" />
                                          )}
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                              const file = e.target.files?.[0];
                                              if (!file) return;
                                              const body = new FormData();
                                              body.append("file", file);
                                              try {
                                                const res = await fetch("/api/upload", { method: "POST", body });
                                                const data = await res.json();
                                                if (data.url) {
                                                  const next = [...variations];
                                                  next[idx].image = data.url;
                                                  setVariations(next);
                                                }
                                              } catch (err) {
                                                if (showToast) {
                                                  showToast("فشل رفع صورة اللون", "error");
                                                } else {
                                                  alert("فشل رفع صورة اللون");
                                                }
                                              }
                                            }}
                                          />
                                        </label>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Sidebar (30%) */}
            <div className="space-y-6">
              
              {/* Card 5: Product Organization */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-[#C5A021] rounded-full"></div>
                  <h3 className="font-bold text-gray-900 text-sm">التنظيم والتصنيف</h3>
                </div>
                <div className="p-5 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">نوع المنتج</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "SIMPLE", name: "منتج بسيط" },
                        { id: "VARIABLE", name: "متغير (مقاسات/ألوان)" },
                        { id: "BUNDLE", name: "حزمة (Bundle)" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: t.id })}
                          className={cn(
                            "py-2 px-2 rounded-lg border text-center transition-all text-xs font-bold",
                            formData.type === t.id
                              ? "bg-[#C5A021]/10 border-[#C5A021] text-[#C5A021]"
                              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50",
                            t.id === "BUNDLE" ? "col-span-2" : ""
                          )}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">التصنيف (القسم) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select
                        value={formData.categoryId}
                        onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] outline-none transition-all text-sm text-gray-900"
                      >
                        <option value="" disabled>اختر القسم المناسب</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <ChevronDown size={14} className="text-gray-500" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">المتجر / المورد <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select
                        value={formData.vendorId}
                        onChange={e => setFormData({ ...formData, vendorId: e.target.value })}
                        className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] outline-none transition-all text-sm text-gray-900"
                      >
                        <option value="" disabled>اختر متجر المورد</option>
                        {vendors.map(v => (
                          <option key={v.id} value={v.id}>{v.storeName || v.name}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <ChevronDown size={14} className="text-gray-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">الماركة (Brand)</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={e => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="مثال: Nike, Samsung"
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] outline-none transition-all text-sm text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Card 6: Additional Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-[#C5A021] rounded-full"></div>
                  <h3 className="font-bold text-gray-900 text-sm">مواصفات الشحن والتخزين</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">رمز المنتج التخزيني (SKU)</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={e => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="مثال: APP-IP15-256"
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] outline-none transition-all text-sm font-mono text-gray-900"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">الوزن التقريبي (كجم)</label>
                      <input
                        type="number"
                        value={formData.weight}
                        onChange={e => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="مثال: 0.5"
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] outline-none transition-all text-sm text-gray-900"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-700 mb-1.5">الطول (سم)</label>
                        <input
                          type="number"
                          value={formData.length}
                          onChange={e => setFormData({ ...formData, length: e.target.value })}
                          placeholder="0"
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] outline-none transition-all text-sm text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-700 mb-1.5">العرض (سم)</label>
                        <input
                          type="number"
                          value={formData.width}
                          onChange={e => setFormData({ ...formData, width: e.target.value })}
                          placeholder="0"
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] outline-none transition-all text-sm text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-700 mb-1.5">الارتفاع (سم)</label>
                        <input
                          type="number"
                          value={formData.height}
                          onChange={e => setFormData({ ...formData, height: e.target.value })}
                          placeholder="0"
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] outline-none transition-all text-sm text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}
