"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/CartContext";
import Link from "next/link";

interface PurchaseBoxProps {
  product: any;
  selectedOptions: Record<string, string>;
  onOptionChange: (name: string, value: string) => void;
  currentVariation: any | null;
  displayPrice: number;
}

export default function PurchaseBox({
  product,
  selectedOptions,
  onOptionChange,
  currentVariation,
  displayPrice,
}: PurchaseBoxProps) {
  const [quantity, setQuantity] = useState(1);
  const [timeLeft, setTimeLeft] = useState("");
  const { addItem } = useCart();

  const isVariable = product.type === "VARIABLE" && product.productAttributes?.length;
  // If variable, force strict checking of variation stock. Otherwise use product stock.
  const stockCount = isVariable 
    ? (currentVariation ? currentVariation.stock : 0)
    : (product.stock || 0);
  
  const inStock = stockCount > 0;

  // Logistics Progress Bar Logic
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Assume dispatch cut-off is 4 PM (16:00) today
      const cutoff = new Date(now);
      cutoff.setHours(16, 0, 0, 0);
      
      if (now > cutoff) {
        // If past 4 PM, cut-off is 4 PM tomorrow
        cutoff.setDate(cutoff.getDate() + 1);
      }
      
      const diff = cutoff.getTime() - now.getTime();
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      setTimeLeft(`${hours} ساعة و ${minutes} دقيقة`);
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = () => {
    if (isVariable) {
      const allSelected = product.productAttributes.every(
        (attr: any) => selectedOptions[attr.name]
      );
      if (!allSelected) {
        alert("يرجى اختيار جميع المواصفات قبل الإضافة للعربة");
        return;
      }
    }
    if (!inStock) {
      alert("النسخة المحددة غير متوفرة حالياً في الفروع");
      return;
    }
    addItem({
      id: product.id,
      title: product.title,
      price: displayPrice,
      quantity,
      vendor: product.vendor,
      image: currentVariation?.image || product.image,
      variationId: currentVariation?.id,
      selectedOptions,
    });
    alert("✓ تمت الإضافة إلى عربة التسوق بنجاح");
  };

  // Delivery estimate
  const today = new Date();
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + 1); // Next day delivery SLA
  const dateStr = deliveryDate.toLocaleDateString("ar-SA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="border border-gray-200/60 rounded-2xl p-5 md:p-6 space-y-5 bg-white/90 backdrop-blur-md sticky top-32 shadow-xl shadow-gray-200/30 transition-all"
      dir="rtl"
    >
      {/* Price */}
      <div>
        <p className="text-3xl font-black text-[#0F172A] tracking-tight">
          {displayPrice.toLocaleString()}{" "}
          <span className="text-lg font-bold text-gray-500">ج.س</span>
        </p>
        {!currentVariation?.price && product.discountPrice && product.discountPrice < product.price && (
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-sm text-gray-400 line-through">{product.price.toLocaleString()} ج.س</span>
            <span className="text-[11px] font-black text-white bg-[#CC0C39] px-2 py-0.5 rounded-md">
              خصم {Math.round((1 - product.discountPrice / product.price) * 100)}%
            </span>
            <span className="text-[11px] font-bold text-emerald-600">
              توفّر {(product.price - product.discountPrice).toLocaleString()} ج.س
            </span>
          </div>
        )}
        {currentVariation?.price && currentVariation.price !== product.price && (
          <p className="text-xs text-[#C5A021] font-bold mt-1 bg-[#C5A021]/10 w-fit px-2 py-0.5 rounded-md">
            السعر المخصص لهذه النسخة
          </p>
        )}
      </div>

      {/* Advanced Logistics Progress Bar */}
      <div className="bg-[#0F172A]/5 border border-[#0F172A]/10 rounded-xl p-3 space-y-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1 h-full bg-[#C5A021]"></div>
        <div className="flex flex-col gap-1 text-sm pl-2">
          <p className="text-[#0F172A] font-black flex items-center gap-1.5 text-xs">
            <span className="material-symbols-rounded text-sm text-[#C5A021]">local_shipping</span>
            توصيل فوري غداً ({dateStr})
          </p>
          <p className="text-gray-600 text-[10px] font-bold leading-relaxed">
            اطلب خلال <span className="text-red-500 font-black">{timeLeft}</span> ليتم شحن طلبك فوراً من أقرب فرع لمرسال.
          </p>
        </div>
      </div>

      {/* Stock Status */}
      <div>
        {inStock ? (
          <div className="flex flex-col gap-0.5">
            <p className="text-emerald-600 font-black text-sm flex items-center gap-1">
              <span className="material-symbols-rounded text-sm">check_circle</span>
              متوفر في المخزون
            </p>
            {stockCount < 10 && stockCount > 0 && (
              <p className="text-red-500 font-bold text-[11px]">
                (تبقّى {stockCount} قطع فقط في أقرب فرع - سارع بالطلب!)
              </p>
            )}
          </div>
        ) : (
          <p className="text-red-500 font-black text-sm flex items-center gap-1">
            <span className="material-symbols-rounded text-sm">cancel</span>
            عذراً، هذه النسخة غير متوفرة حالياً
          </p>
        )}
      </div>

      {/* Variant options are selected in ProductDetails (column 2). The duplicate selector
          that used to live here next to the cart button was removed per client feedback. */}

      {/* Quantity */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-black text-[#0F172A]">الكمية:</span>
        <select
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          disabled={!inStock}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold bg-gray-50 focus:outline-none focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] transition-all w-24 disabled:opacity-50"
        >
          {Array.from({ length: Math.max(1, Math.min(stockCount || 1, 10)) }, (_, i) => i + 1).map(
            (q) => (
              <option key={q} value={q}>
                {q}
              </option>
            )
          )}
        </select>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-3 pt-2">
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={cn(
            "w-full py-3.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2",
            inStock
              ? "bg-[#C5A021] hover:bg-[#b08e1c] text-white shadow-lg shadow-[#C5A021]/30 hover:scale-[1.02]"
              : "bg-gray-100 text-gray-400 cursor-not-allowed line-through decoration-2 decoration-gray-400"
          )}
        >
          <span className="material-symbols-rounded text-lg">shopping_cart</span>
          إضافة إلى العربة
        </button>
        <button
          disabled={!inStock}
          className={cn(
            "w-full py-3.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2",
            inStock
              ? "bg-[#0F172A] hover:bg-[#1e293b] text-white shadow-lg shadow-[#0F172A]/20 hover:scale-[1.02]"
              : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
          )}
        >
          <span className="material-symbols-rounded text-lg">bolt</span>
          شراء سريع الآن
        </button>
      </div>

      {/* Meta & Trust Badges */}
      <div className="text-[11px] text-gray-500 font-bold space-y-2 border-t border-gray-100 pt-4">
        <p className="flex justify-between">
          <span className="text-gray-400">يشحن بواسطة:</span>
          <span className="text-[#0F172A] flex items-center gap-1">
            <span className="material-symbols-rounded text-[12px] text-[#C5A021]">verified</span>
            مرسال اللوجستية (Morsall Care)
          </span>
        </p>
        <p className="flex justify-between">
          <span className="text-gray-400">يباع بواسطة:</span>
          {product.vendorSlug ? (
            <Link href={`/store/${product.vendorSlug}`} className="text-[#C5A021] hover:underline underline-offset-2">
              {product.vendor || "بائع معتمد"}
            </Link>
          ) : (
            <span className="text-[#0F172A]">{product.vendor || "بائع معتمد"}</span>
          )}
        </p>
        
        <div className="flex gap-2 pt-2">
          <div className="flex-1 bg-gray-50 rounded-lg p-2 flex flex-col items-center justify-center text-center gap-1 border border-gray-100">
            <span className="material-symbols-rounded text-emerald-600 text-sm">replay</span>
            <span className="text-[9px]">إرجاع مجاني<br/>خلال 15 يوم</span>
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg p-2 flex flex-col items-center justify-center text-center gap-1 border border-gray-100">
            <span className="material-symbols-rounded text-[#C5A021] text-sm">shield_lock</span>
            <span className="text-[9px]">دفع آمن<br/>ومشفر 100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
