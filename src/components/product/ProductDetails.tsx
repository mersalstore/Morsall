"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

function Stars({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex text-[#C5A021]">
        {[1, 2, 3, 4, 5].map((s) => (
          <span
            key={s}
            className={cn(
              "material-symbols-rounded text-[15px]",
              s <= Math.round(rating) ? "fill-1" : "fill-0 opacity-20"
            )}
          >
            star
          </span>
        ))}
      </div>
      <a href="#reviews" className="text-xs font-bold text-[#0F172A] hover:text-[#C5A021] hover:underline transition-colors">
        {rating} ({count.toLocaleString()} تقييم)
      </a>
    </div>
  );
}

interface ProductDetailsProps {
  product: any;
  selectedOptions: Record<string, string>;
  onOptionChange: (name: string, value: string) => void;
  currentVariation: any | null;
  displayPrice: number;
}

export default function ProductDetails({
  product,
  selectedOptions,
  onOptionChange,
  currentVariation,
  displayPrice,
}: ProductDetailsProps) {
  const originalPrice = product.discountPrice || null;
  const discountPercent = originalPrice
    ? Math.round((1 - displayPrice / originalPrice) * 100)
    : null;

  // Determine if color attribute for swatch rendering
  const COLOR_KEYWORDS = ["color", "لون", "colour"];
  const isColorAttr = (name: string) =>
    COLOR_KEYWORDS.some((k) => name.toLowerCase().includes(k));

  const descriptionBullets = product.description
    ? product.description.split("\n").filter((l: string) => l.trim())
    : [];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
        <Link href="/" className="hover:text-[#C5A021] transition-colors">الرئيسية</Link>
        <span className="material-symbols-rounded text-[14px]">chevron_left</span>
        {product.category && (
          <>
            <Link href={`/category/${product.categoryId}`} className="hover:text-[#C5A021] transition-colors">
              {product.category}
            </Link>
            <span className="material-symbols-rounded text-[14px]">chevron_left</span>
          </>
        )}
        <span className="text-[#0F172A] line-clamp-1 bg-gray-100 px-2 py-0.5 rounded-md">{product.title}</span>
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-[28px] font-black text-[#0F172A] leading-snug tracking-tight">
        {product.title}
      </h1>

      {/* Ratings & Metrics */}
      <div className="flex items-center flex-wrap gap-4 pb-4 border-b border-gray-100">
        <Stars rating={product.rating || 4.5} count={product.reviews || 0} />
        {product.purchaseCount > 0 && (
          <>
            <div className="w-px h-4 bg-gray-200"></div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
              <span className="material-symbols-rounded text-[14px]">trending_up</span>
              {product.purchaseCount.toLocaleString()} عملية شراء أخيرة
            </span>
          </>
        )}
      </div>

      {/* Vendor Identity Card (Transparent Glass Style) */}
      <div className="bg-[#0F172A]/[0.02] border border-[#0F172A]/5 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm overflow-hidden">
             {/* Fallback to store icon if no vendor logo */}
             <span className="material-symbols-rounded text-[#C5A021] text-xl">storefront</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">البائع المعتمد</p>
            {product.vendorSlug ? (
              <Link href={`/store/${product.vendorSlug}`} className="text-sm font-black text-[#0F172A] hover:text-[#C5A021] transition-colors line-clamp-1">
                {product.vendor || product.brand || "متجر مرسال الموثوق"}
              </Link>
            ) : (
              <span className="text-sm font-black text-[#0F172A] line-clamp-1">
                {product.vendor || product.brand || "متجر مرسال الموثوق"}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-emerald-600 justify-end mb-0.5">
            <span className="material-symbols-rounded text-[14px]">speed</span>
            <span className="text-[11px] font-black">SLA: سريع جداً</span>
          </div>
          <p className="text-[9px] font-bold text-gray-500">تسليم للمستودع خلال 24 ساعة</p>
        </div>
      </div>

      {/* Price Block (Optimized for Mobile, Desktop has Buy Box) */}
      <div className="bg-white py-4 border-b border-gray-100 lg:hidden">
        {discountPercent && (
          <span className="text-white bg-red-500 px-2 py-0.5 rounded text-[11px] font-black mb-2 inline-block">خصم {discountPercent}%</span>
        )}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-[#0F172A]">
            {displayPrice.toLocaleString()}
          </span>
          <span className="text-base font-bold text-[#C5A021]">ج.س</span>
        </div>
        {originalPrice && (
          <p className="text-xs font-bold text-gray-400 mt-1">
            السعر الأصلي:{" "}
            <span className="line-through">{originalPrice.toLocaleString()} ج.س</span>
          </p>
        )}
      </div>

      {/* Dynamic Variant Selector (Matrix) */}
      {product.type === "VARIABLE" && product.productAttributes?.length > 0 && (
        <div className="space-y-5 pb-5 border-b border-gray-100">
          {product.productAttributes.map((attr: any) => (
            <div key={attr.id} className="space-y-3">
              <p className="text-xs font-black text-[#0F172A] flex items-center gap-2">
                {attr.name}:{" "}
                <span className="font-bold text-[#C5A021] bg-[#C5A021]/10 px-2 py-0.5 rounded">
                  {selectedOptions[attr.name] || "لم يتم التحديد"}
                </span>
              </p>
              <div className="flex flex-wrap gap-2.5">
                {isColorAttr(attr.name)
                  ? // Color swatches
                    attr.values.map((val: string) => {
                      const isSelected = selectedOptions[attr.name] === val;
                      return (
                        <button
                          key={val}
                          title={val}
                          onClick={() => onOptionChange(attr.name, val)}
                          className={cn(
                            "w-10 h-10 rounded-full border-2 transition-all duration-300",
                            isSelected
                              ? "border-[#0F172A] ring-4 ring-[#0F172A]/10 scale-110 shadow-md"
                              : "border-gray-200 hover:border-gray-400 hover:scale-105"
                          )}
                          style={{
                            backgroundColor:
                              val.toLowerCase() === "أبيض" || val.toLowerCase() === "white"
                                ? "#ffffff"
                                : val.toLowerCase() === "أسود" || val.toLowerCase() === "black"
                                ? "#0F172A"
                                : val.toLowerCase() === "أحمر" || val.toLowerCase() === "red"
                                ? "#ef4444"
                                : val.toLowerCase() === "أزرق" || val.toLowerCase() === "blue"
                                ? "#3b82f6"
                                : val.toLowerCase() === "أخضر" || val.toLowerCase() === "green"
                                ? "#10b981"
                                : val.toLowerCase() === "ذهبي" || val.toLowerCase() === "gold"
                                ? "#C5A021"
                                : val.toLowerCase() === "فضي" || val.toLowerCase() === "silver"
                                ? "#94a3b8"
                                : "#cbd5e1",
                          }}
                        />
                      );
                    })
                  : // Rectangular size/capacity buttons
                    attr.values.map((val: string) => {
                      const isSelected = selectedOptions[attr.name] === val;
                      return (
                        <button
                          key={val}
                          onClick={() => onOptionChange(attr.name, val)}
                          className={cn(
                            "px-4 py-2 border-2 text-xs font-black transition-all rounded-xl",
                            isSelected
                              ? "border-[#0F172A] bg-[#0F172A] text-white shadow-md shadow-[#0F172A]/20 scale-[1.02]"
                              : "border-gray-200 bg-white text-gray-600 hover:border-[#C5A021] hover:text-[#C5A021]"
                          )}
                        >
                          {val}
                        </button>
                      );
                    })}
              </div>

              {/* Variant Price Change indicator */}
              {currentVariation && isColorAttr(attr.name) && currentVariation.price !== product.price && (
                <p className="text-[11px] text-gray-500 font-bold bg-gray-50 w-fit px-2 py-1 rounded-md border border-gray-100">
                  سعر <span className="text-[#0F172A]">{selectedOptions[attr.name]}</span>: <span className="text-[#C5A021]">{currentVariation.price?.toLocaleString()} ج.س</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Short Description */}
      {product.shortDescription && (
        <div className="bg-[#C5A021]/5 border border-[#C5A021]/20 rounded-xl px-4 py-3">
          <p className="text-xs font-bold text-[#0F172A] leading-relaxed">
            <span className="text-[#C5A021] mr-1">✨</span> {product.shortDescription}
          </p>
        </div>
      )}

      {/* About this item */}
      <div className="border-b border-gray-100 pb-6 pt-2">
        <h3 className="text-sm font-black text-[#0F172A] mb-4 flex items-center gap-2">
           <span className="w-1.5 h-4 bg-[#C5A021] rounded-full"></span>
           عن هذا المنتج
        </h3>
        {descriptionBullets.length > 1 ? (
          <ul className="space-y-2.5 text-xs font-bold text-gray-600">
            {descriptionBullets.map((line: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                 <span className="material-symbols-rounded text-[14px] text-[#C5A021] mt-0.5 shrink-0">check_circle</span>
                 <span className="leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs font-bold text-gray-600 leading-loose">{product.description}</p>
        )}
      </div>

      {/* Specs Grid */}
      {(product.brand || product.sku || product.weight || product.ram || product.storage || product.screenSize) && (
        <div className="border-b border-gray-100 pb-6 pt-2">
          <h3 className="text-sm font-black text-[#0F172A] mb-4 flex items-center gap-2">
             <span className="w-1.5 h-4 bg-[#C5A021] rounded-full"></span>
             المواصفات التقنية
          </h3>
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <tbody>
                {[
                  { label: "العلامة التجارية", val: product.brand },
                  { label: "الفئة", val: product.category },
                  { label: "رمز المنتج (SKU)", val: product.sku },
                  { label: "الوزن", val: product.weight ? `${product.weight} كجم` : null },
                  { label: "ذاكرة الرام", val: product.ram },
                  { label: "التخزين", val: product.storage },
                  { label: "حجم الشاشة", val: product.screenSize },
                ]
                  .filter((r) => r.val)
                  .map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}>
                      <td className="py-3 px-4 font-black text-[#0F172A] w-[40%] border-l border-gray-100">{row.label}</td>
                      <td className="py-3 px-4 font-bold text-gray-600">{row.val}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bundle items */}
      {product.type === "BUNDLE" && product.bundleData?.length > 0 && (
        <div className="bg-[#0F172A] rounded-xl border border-[#1e293b] p-5 shadow-lg shadow-[#0F172A]/10">
          <h4 className="text-xs font-black text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-rounded text-lg text-[#C5A021]">inventory_2</span>
            محتويات الحزمة (البكج)
          </h4>
          <div className="space-y-2.5">
            {product.bundleData.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs bg-white/5 rounded-lg p-2.5">
                <span className="font-bold text-gray-300 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-[#C5A021]"></span>
                   {item.name}
                </span>
                <span className="font-black text-[#C5A021]">{item.price} ج.س</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
