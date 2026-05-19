"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/CartContext";
import { calculateShipping, City } from "@/lib/logistics";
import { Product } from "@/lib/mockData/products";

export default function PurchaseBox({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [customerCity, setCustomerCity] = useState<City>("الخرطوم");
  const { addItem } = useCart();
  
  // Variation Logic
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  
  const currentVariation = product.variations?.find(v => {
    return Object.entries(v.combination).every(([name, value]) => selectedOptions[name] === value);
  });

  const displayPrice = currentVariation?.price || (product.discount 
    ? Math.floor(product.price * (1 - product.discount / 100)) 
    : product.price);

  const shippingFee = calculateShipping(customerCity, [product.vendorLocation]);

  const handleAddToCart = () => {
    // If it's a variable product, ensure all options are selected
    if (product.type === "VARIABLE" && product.productAttributes?.length) {
      const allSelected = product.productAttributes.every(attr => selectedOptions[attr.name]);
      if (!allSelected) {
        alert("يرجى اختيار جميع المواصفات (المقاس، اللون، إلخ) قبل الإضافة");
        return;
      }
    }

    addItem({ 
      id: product.id, 
      title: product.title, 
      price: displayPrice, 
      quantity, 
      vendor: product.vendor, 
      image: currentVariation?.image || product.image,
      variationId: currentVariation?.id,
      selectedOptions: selectedOptions
    });
    alert("تمت الإضافة إلى العربة");
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-8 sticky top-44">
      {/* Price & Primary Status */}
      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-[#CB2E26]">{displayPrice.toLocaleString()}</span>
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">ج.س</span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-black text-green-600">
            {currentVariation ? (currentVariation.stock > 0 ? "متوفّر — اطلب الآن" : "نفد المخزون") : "متوفّر — اطلب الآن"}
          </span>
        </div>
      </div>

      {/* Attributes Selection */}
      {product.type === "VARIABLE" && product.productAttributes?.map((attr: any) => (
        <div key={attr.id} className="space-y-3">
           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{attr.name}</label>
           <div className="flex flex-wrap gap-2">
              {attr.values.map((val: string) => (
                <button
                  key={val}
                  onClick={() => setSelectedOptions(prev => ({ ...prev, [attr.name]: val }))}
                  className={cn(
                    "px-4 py-2 border-2 rounded-xl text-xs font-black transition-all",
                    selectedOptions[attr.name] === val 
                      ? "border-[#C5A021] bg-[#C5A021]/5 text-[#C5A021]" 
                      : "border-gray-100 text-gray-400 hover:border-gray-200"
                  )}
                >
                  {val}
                </button>
              ))}
           </div>
        </div>
      ))}

      {/* Trust & Policy Bridge */}
      <div className="space-y-4 py-6 border-y border-gray-50">
        <div className="flex items-start gap-4">
          <span className="material-symbols-rounded text-[#F29124] text-xl">replay</span>
          <div>
            <p className="text-xs font-black text-[#0F172A]">إرجاع مجاني وسهل</p>
            <p className="text-[10px] text-gray-400 font-bold">خلال 15 يوماً من الاستلام</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <span className="material-symbols-rounded text-green-500 text-xl">verified_user</span>
          <div>
            <p className="text-xs font-black text-[#0F172A]">معاملة آمنة 100%</p>
            <p className="text-[10px] text-gray-400 font-bold">تشفير وحماية لكافة بياناتك</p>
          </div>
        </div>
      </div>

      {/* Shipping / Logistics Module */}
      <div className="space-y-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-[#C5A021] uppercase tracking-widest">التوصيل إلى:</label>
          <select 
            value={customerCity}
            onChange={(e) => setCustomerCity(e.target.value as City)}
            className="bg-transparent text-sm font-black text-[#0F172A] outline-none cursor-pointer border-none p-0"
          >
            <option value="الخرطوم">الخرطوم</option>
            <option value="أمدرمان">أمدرمان</option>
            <option value="بحري">بحري</option>
            <option value="بورتسودان">بورتسودان</option>
            <option value="مدني">مدني</option>
          </select>
        </div>
        
        <div className="flex flex-col">
          <p className="text-xs font-black text-[#0F172A]">توصيل غداً، 23 أبريل</p>
          <p className="text-[10px] text-gray-400 font-bold">إذا أتممت الطلب خلال 5 ساعات</p>
        </div>

        <div className="pt-2 flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">رسوم الشحن:</span>
            <span className="text-sm font-black text-[#C5A021]">{shippingFee === 0 ? "مجاني" : `${shippingFee.toLocaleString()} ج.س`}</span>
        </div>
      </div>

      {/* Checkout Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl p-4">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">الكمية:</span>
          <div className="flex items-center gap-4">
            <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="text-xl font-bold text-gray-300 hover:text-[#C5A021]">-</button>
            <span className="w-8 text-center font-black text-lg text-[#0F172A]">{quantity}</span>
            <button onClick={() => setQuantity(q => q+1)} className="text-xl font-bold text-gray-300 hover:text-[#C5A021]">+</button>
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleAddToCart}
            className="w-full h-16 bg-[#F29124] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-orange-500/10 hover:bg-orange-500 transition-all flex items-center justify-center gap-4"
          >
            إضافة إلى العربة <span className="material-symbols-rounded">shopping_cart</span>
          </button>
          <button className="w-full h-16 bg-[#C5A021] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#C5A021]/10 hover:bg-[#0D708E] transition-all">
            اشترِ الآن
          </button>
        </div>
      </div>

      {/* Meta Identity */}
      <div className="pt-4 space-y-1">
        <p className="text-[10px] font-bold text-gray-400">يشحن بواسطة: <span className="text-[#0F172A] font-black underline">مرسال كير</span></p>
        <p className="text-[10px] font-bold text-gray-400">يباع بواسطة: <span className="text-[#C5A021] font-black underline">{product.vendor}</span></p>
      </div>
    </div>
  );
}
