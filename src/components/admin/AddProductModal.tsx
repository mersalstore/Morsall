"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Plus, Trash2, Package } from "lucide-react";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingProduct?: any;
}

export default function AddProductModal({ isOpen, onClose, onSuccess, editingProduct }: AddProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    vendorId: "",
    sku: "",
    images: [] as string[]
  });

  useEffect(() => {
    if (isOpen) {
      fetch("/api/admin/categories").then(res => res.json()).then(setCategories);
      fetch("/api/admin/vendors").then(res => res.json()).then(setVendors);

      if (editingProduct) {
        setFormData({
          title: editingProduct.title || "",
          description: editingProduct.description || "",
          price: editingProduct.price?.toString() || "",
          stock: editingProduct.stock?.toString() || "",
          categoryId: editingProduct.categoryId || "",
          vendorId: editingProduct.vendorId || "",
          sku: editingProduct.sku || "",
          images: Array.isArray(editingProduct.images) ? editingProduct.images : (editingProduct.images?.split(",").filter(Boolean) || [])
        });
      } else {
        setFormData({ title: "", description: "", price: "", stock: "", categoryId: "", vendorId: "", sku: "", images: [] });
      }
    }
  }, [isOpen, editingProduct]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setLoading(true);
    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const fd = new FormData();
      fd.append("file", files[i]);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        uploadedUrls.push(url);
      }
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/inventory", {
      method: editingProduct ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        id: editingProduct?.id,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images: formData.images.join(",")
      })
    });
    if (res.ok) {
      onSuccess();
      onClose();
      setFormData({ title: "", description: "", price: "", stock: "", categoryId: "", vendorId: "", sku: "", images: [] });
    } else {
      const err = await res.json();
      alert(err.error || "فشل إضافة المنتج");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[#021D24]/90 backdrop-blur-md" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] shadow-3xl p-12"
      >
        <button onClick={onClose} className="absolute top-8 left-8 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-all"><X size={24} /></button>
        
        <div className="flex items-center gap-6 mb-12">
           <div className="w-16 h-16 rounded-[2rem] bg-[#1089A4]/10 text-[#1089A4] flex items-center justify-center">
              <Package size={32} />
           </div>
           <div>
              <h2 className="text-3xl font-black text-[#021D24]">{editingProduct ? "تعديل بيانات المنتج" : "إضافة منتج جديد"}</h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">{editingProduct ? "Update inventory item" : "Add new inventory item"}</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="space-y-8">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">اسم المنتج</label>
                 <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 border border-transparent focus:border-[#1089A4] rounded-2xl px-6 py-4 outline-none font-bold" required />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">السعر (ج.س)</label>
                    <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-gray-50 border border-transparent focus:border-[#1089A4] rounded-2xl px-6 py-4 outline-none font-bold" required />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الكمية</label>
                    <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full bg-gray-50 border border-transparent focus:border-[#1089A4] rounded-2xl px-6 py-4 outline-none font-bold" required />
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">القسم</label>
                 <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full bg-gray-50 border border-transparent focus:border-[#1089A4] rounded-2xl px-6 py-4 outline-none font-bold" required>
                    <option value="">اختر القسم</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">المورد / البائع</label>
                 <select value={formData.vendorId} onChange={e => setFormData({...formData, vendorId: e.target.value})} className="w-full bg-gray-50 border border-transparent focus:border-[#1089A4] rounded-2xl px-6 py-4 outline-none font-bold" required>
                    <option value="">اختر المورد</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.storeName || v.name}</option>)}
                 </select>
              </div>
           </div>

           <div className="space-y-8">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">صور المنتج</label>
                 <div className="grid grid-cols-3 gap-4 mb-4">
                    {formData.images.map((url, i) => (
                       <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setFormData({...formData, images: formData.images.filter((_, idx) => idx !== i)})} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12} /></button>
                       </div>
                    ))}
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#1089A4] hover:bg-gray-50 transition-all">
                       <Upload size={20} className="text-gray-300" />
                       <span className="text-[9px] font-black text-gray-400 uppercase">رفع صور</span>
                       <input type="file" multiple onChange={handleUpload} className="hidden" />
                    </label>
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">وصف المنتج</label>
                 <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 border border-transparent focus:border-[#1089A4] rounded-2xl px-6 py-4 outline-none font-medium min-h-[150px]" required />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#1089A4] text-white py-6 rounded-2xl font-black shadow-xl hover:bg-[#021D24] transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 mt-auto">
                 {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={24} />}
                 {editingProduct ? "حفظ التغييرات" : "تأكيد إضافة المنتج"}
              </button>
           </div>
        </form>
      </motion.div>
    </div>
  );
}
