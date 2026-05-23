"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";

interface FBTProps {
  mainProduct: any;
  upsellProducts: any[];
}

export default function FrequentlyBoughtTogether({ mainProduct, upsellProducts }: FBTProps) {
  const { addItem } = useCart();
  const items = [mainProduct, ...upsellProducts.slice(0, 2)];
  const totalPrice = items.reduce((sum, p) => sum + (p.price || 0), 0);
  const [added, setAdded] = useState(false);

  const handleAddAll = () => {
    items.forEach((p) => {
      addItem({
        id: p.id,
        title: p.title,
        price: p.price || 0,
        quantity: 1,
        vendor: p.vendor,
        image: typeof p.images === "string" ? p.images.split(",")[0].trim() : (p.image || ""),
      });
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (items.length < 2) return null;

  return (
    <div className="border border-[#d5d9d9] rounded-lg p-6" dir="rtl">
      <h2 className="text-lg font-semibold text-[#0F1111] mb-5">
        يُشترى معاً بشكل متكرر
      </h2>

      <div className="flex items-center flex-wrap gap-3">
        {items.map((product, index) => (
          <div key={product.id} className="flex items-center gap-3">
            {index > 0 && (
              <span className="text-2xl font-bold text-gray-400">+</span>
            )}
            <div className="flex flex-col items-center gap-1">
              <Link href={`/product/${product.id}`}>
                <div className="w-24 h-24 relative border border-[#e7e7e7] rounded bg-white overflow-hidden hover:opacity-80 transition-opacity">
                  <Image
                    src={
                      typeof product.images === "string" && product.images.trim()
                        ? product.images.split(",")[0].trim()
                        : product.image || "https://placehold.co/200x200/F3F4F6/aaa?text=صورة"
                    }
                    alt={product.title}
                    fill
                    className="object-contain p-1"
                  />
                </div>
              </Link>
              <span className="text-xs text-[#B12704] font-semibold">
                {(product.price || 0).toLocaleString()} ج.س
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="text-sm">
          <p className="text-[#0F1111]">
            الإجمالي:{" "}
            <span className="font-semibold text-[#B12704]">
              {totalPrice.toLocaleString()} ج.س
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-0.5">للمنتجات الـ{items.length} معاً</p>
        </div>
        <button
          onClick={handleAddAll}
          className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] text-sm font-semibold px-5 py-2 rounded-full transition-all shadow-sm"
        >
          {added ? "✓ تمت الإضافة!" : `إضافة المنتجات الـ${items.length} إلى العربة`}
        </button>
      </div>

      {/* Individual item titles */}
      <div className="mt-4 space-y-1">
        {items.map((p) => (
          <p key={p.id} className="text-xs text-gray-600">
            <span className="text-[#007185] font-medium">•</span>{" "}
            <Link href={`/product/${p.id}`} className="text-[#007185] hover:text-[#C7511F] hover:underline">
              {p.title}
            </Link>
            {" — "}
            <span className="text-[#B12704]">{(p.price || 0).toLocaleString()} ج.س</span>
          </p>
        ))}
      </div>
    </div>
  );
}
