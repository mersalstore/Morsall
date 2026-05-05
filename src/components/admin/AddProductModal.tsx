"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Upload, Plus, Trash2, Package, Tag } from "lucide-react";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingProduct?: any;
  initialVendorId?: string;
}

export default function AddProductModal({ isOpen, onClose, onSuccess, editingProduct, initialVendorId }: AddProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    price: "",
    stock: "",
    categoryId: "",
    vendorId: "",
    sku: "",
    discountPrice: "",
    discountType: "PERCENTAGE",
    images: [] as string[]
  });

  useEffect(() => {
    if (isOpen) {
      fetch("/api/admin/categories").then(r => r.json()).then(setCategories).catch(() => {});
      fetch("/api/admin/vendors").then(r => r.json()).then(setVendors).catch(() => {});

      if (editingProduct) {
        let imgs: string[] = [];
        if (Array.isArray(editingProduct.images)) {
          imgs = editingProduct.images;
        } else if (typeof editingProduct.images === "string") {
          imgs = editingProduct.images.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
        setFormData({
          title: editingProduct.title || "",
          description: editingProduct.description || "",
          shortDescription: editingProduct.shortDescription || "",
          price: editingProduct.price?.toString() || "",
          stock: editingProduct.stock?.toString() || "",
          categoryId: editingProduct.categoryId || "",
          vendorId: editingProduct.vendorId || "",
          sku: editingProduct.sku || "",
          discountPrice: editingProduct.discountPrice?.toString() || "",
          discountType: editingProduct.discountType || "PERCENTAGE",
          images: imgs
        });
      } else {
        setFormData({ title: "", description: "", shortDescription: "", price: "", stock: "", categoryId: "", vendorId: initialVendorId || "", sku: "", discountPrice: "", discountType: "PERCENTAGE", images: [] });
      }
    }
  }, [isOpen, editingProduct]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const fd = new FormData();
      fd.append("file", files[i]);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (res.ok) {
          const { url } = await res.json();
          uploadedUrls.push(url);
        } else {
          const errData = await res.json().catch(() => ({}));
          alert(`فشل رفع الصورة (${files[i].name}): ${errData.error || "خطأ في السيرفر"}`);
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert(`فشل رفع الصورة (${files[i].name}): تأكد من حجم الملف واتصالك بالإنترنت`);
      }
    }
    if (uploadedUrls.length > 0) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    }
    // Reset input so same file can be re-uploaded
    e.target.value = "";
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0 && !editingProduct) {
      alert("يرجى رفع صورة واحدة على الأقل للمنتج");
      return;
    }
    if (!formData.categoryId) {
      alert("يرجى اختيار القسم (Category). إذا لم يكن هناك أقسام، يرجى إنشاؤها أولاً من تبويب الأقسام.");
      return;
    }
    if (!formData.vendorId) {
      alert("يرجى اختيار المورد (Vendor).");
      return;
    }
    setLoading(true);
    const payload: any = {
      title: formData.title,
      description: formData.description,
      shortDescription: formData.shortDescription,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      categoryId: formData.categoryId,
      vendorId: formData.vendorId,
      sku: formData.sku,
      images: formData.images.join(","),
      status: "APPROVED"
    };
    if (formData.discountPrice) {
      payload.discountPrice = parseFloat(formData.discountPrice);
      payload.discountType = formData.discountType;
    }
    if (editingProduct) payload.id = editingProduct.id;

    const res = await fetch("/api/admin/inventory", {
      method: editingProduct ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      onSuccess();
      onClose();
    } else {
      const err = await res.json();
      alert(err.error || "فشل حفظ المنتج");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-start md:items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-[#021D24]/90 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-3xl p-8 md:p-12 my-4"
      >
        <button onClick={onClose} className="absolute top-6 left-6 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-all">
          <X size={22} />
        </button>

        <div className="flex items-center gap-5 mb-10">
          <div className="w-14 h-14 rounded-[1.5rem] bg-[#1089A4]/10 text-[#1089A4] flex items-center justify-center">
            <Package size={28} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-[#021D24]">{editingProduct ? "تعديل بيانات المنتج" : "إضافة منتج جديد"}</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">{editingProduct ? "Update Product" : "Add New Product"}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Images Section */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
              صور المنتج {formData.images.length > 0 ? `(${formData.images.length} صورة)` : ""}
            </label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {formData.images.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  >
                    <Trash2 size={12} />
                  </button>
                  {i === 0 && (
                    <div className="absolute bottom-1 left-1 bg-[#1089A4] text-white text-[8px] font-black px-2 py-0.5 rounded-lg">رئيسية</div>
                  )}
                </div>
              ))}
              <label className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${uploading ? "border-[#1089A4] bg-[#1089A4]/5" : "border-gray-200 hover:border-[#1089A4] hover:bg-gray-50"}`}>
                {uploading ? (
                  <div className="w-6 h-6 border-3 border-[#1089A4] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload size={22} className="text-gray-300" />
                    <span className="text-[9px] font-black text-gray-400 uppercase text-center leading-tight">رفع صور<br/>متعددة</span>
                  </>
                )}
                <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">اسم المنتج *</label>
                <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-50 border border-transparent focus:border-[#1089A4] rounded-2xl px-5 py-4 outline-none font-bold transition-all" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">وصف مختصر</label>
                <input value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})}
                  className="w-full bg-gray-50 border border-transparent focus:border-[#1089A4] rounded-2xl px-5 py-4 outline-none font-bold transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">السعر (ج.س) *</label>
                  <input type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-gray-50 border border-transparent focus:border-[#1089A4] rounded-2xl px-5 py-4 outline-none font-bold transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الكمية *</label>
                  <input type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})}
                    className="w-full bg-gray-50 border border-transparent focus:border-[#1089A4] rounded-2xl px-5 py-4 outline-none font-bold transition-all" required />
                </div>
              </div>
              
              {/* Discount */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 flex items-center gap-2">
                  <Tag size={12} /> الخصم (اختياري)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}
                    className="bg-gray-50 border border-transparent focus:border-[#1089A4] rounded-2xl px-4 py-4 outline-none font-bold transition-all text-sm">
                    <option value="PERCENTAGE">نسبة مئوية %</option>
                    <option value="FIXED">مبلغ ثابت ج.س</option>
                  </select>
                  <input type="number" min="0" placeholder="قيمة الخصم"
                    value={formData.discountPrice} onChange={e => setFormData({...formData, discountPrice: e.target.value})}
                    className="bg-gray-50 border border-transparent focus:border-[#F29124] rounded-2xl px-5 py-4 outline-none font-bold transition-all" />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">القسم *</label>
                <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full bg-gray-50 border border-transparent focus:border-[#1089A4] rounded-2xl px-5 py-4 outline-none font-bold transition-all" required>
                  <option value="">اختر القسم</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">المورد *</label>
                <select value={formData.vendorId} onChange={e => setFormData({...formData, vendorId: e.target.value})}
                  className="w-full bg-gray-50 border border-transparent focus:border-[#1089A4] rounded-2xl px-5 py-4 outline-none font-bold transition-all" required>
                  <option value="">اختر المورد</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.storeName || v.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">كود المنتج (SKU)</label>
                <input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})}
                  className="w-full bg-gray-50 border border-transparent focus:border-[#1089A4] rounded-2xl px-5 py-4 outline-none font-bold transition-all"
                  placeholder="مثل: SKU-001" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">وصف تفصيلي *</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-50 border border-transparent focus:border-[#1089A4] rounded-2xl px-5 py-4 outline-none font-medium min-h-[130px] resize-none transition-all" required />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-5 rounded-2xl font-black text-sm text-gray-400 hover:bg-gray-50 transition-all">
              إلغاء
            </button>
            <button type="submit" disabled={loading || uploading}
              className="flex-[2] bg-[#1089A4] text-white py-5 rounded-2xl font-black shadow-xl hover:bg-[#021D24] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={22} />}
              {editingProduct ? "حفظ التغييرات" : "إضافة المنتج"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
