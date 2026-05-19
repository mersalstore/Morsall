"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ProductDetailsModalProps {
  isOpen: boolean;
  product: any;
  onClose: () => void;
}

export default function ProductDetailsModal({ isOpen, product, onClose }: ProductDetailsModalProps) {
  const [activeImg, setActiveImg] = useState(0);

  if (!isOpen || !product) return null;

  const images: string[] = product.images
    ? product.images.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  const statusColor =
    product.status === "APPROVED"
      ? "bg-green-100 text-green-700"
      : product.status === "REJECTED"
      ? "bg-red-100 text-red-600"
      : "bg-orange-100 text-orange-600";

  const statusLabel =
    product.status === "APPROVED"
      ? "مقبول"
      : product.status === "REJECTED"
      ? "مرفوض"
      : "قيد المراجعة";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-6" dir="rtl">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-2xl font-black text-[#0F172A]">تفاصيل المنتج</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                ID: {product.id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <span className="material-symbols-rounded">close</span>
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">

            {/* Images */}
            {images.length > 0 && (
              <div className="space-y-3">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                  <Image
                    src={images[activeImg]}
                    alt={product.title}
                    fill
                    className="object-contain"
                  />
                  {/* Status badge */}
                  <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColor}`}>
                    {statusLabel}
                  </span>
                </div>
                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                          activeImg === i ? "border-[#C5A021] scale-105" : "border-gray-100"
                        }`}
                      >
                        <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Product Title & Price */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black text-[#0F172A] leading-tight">{product.title}</h3>
                {product.vendor?.storeName && (
                  <p className="text-xs font-bold text-[#C5A021] mt-1 flex items-center gap-1">
                    <span className="material-symbols-rounded text-sm">store</span>
                    {product.vendor.storeName}
                  </p>
                )}
              </div>
              <div className="shrink-0 bg-[#0F172A] text-white px-6 py-3 rounded-2xl text-center">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">السعر</p>
                <p className="text-2xl font-black">
                  {product.price?.toLocaleString()}{" "}
                  <span className="text-sm font-bold text-white/70">ج.س</span>
                </p>
                {product.originalPrice && product.originalPrice > product.price && (
                  <p className="text-[10px] line-through text-white/40 font-bold">
                    {product.originalPrice?.toLocaleString()} ج.س
                  </p>
                )}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "الفئة", value: product.category?.name || product.categoryName || "—", icon: "category" },
                { label: "الكمية في المخزون", value: product.stock ?? "—", icon: "inventory_2" },
                { label: "تاريخ الإضافة", value: product.createdAt ? new Date(product.createdAt).toLocaleDateString("ar-EG") : "—", icon: "calendar_today" },
                { label: "عدد المبيعات", value: product.soldCount ?? "0", icon: "shopping_bag" },
              ].map((row, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{row.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-rounded text-[#C5A021] text-lg">{row.icon}</span>
                    <span className="text-sm font-black text-[#0F172A]">{row.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">وصف المنتج</span>
                <p className="text-sm text-gray-600 font-bold leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Attributes / Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">المتغيرات</span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any, i: number) => (
                    <span key={i} className="bg-[#C5A021]/10 text-[#C5A021] px-3 py-1.5 rounded-xl text-[11px] font-black">
                      {v.name || v}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                product.status === "APPROVED" ? "bg-green-500" :
                product.status === "REJECTED" ? "bg-red-500" : "bg-orange-500 animate-pulse"
              }`} />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                حالة المنتج: {statusLabel}
              </span>
            </div>
            <button
              onClick={onClose}
              className="bg-white border border-gray-200 text-[#0F172A] px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all shadow-sm"
            >
              إغلاق
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
