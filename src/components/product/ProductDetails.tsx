import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useCart } from "@/lib/CartContext";
import { useWishlist } from "@/lib/WishlistContext";
import { calculateShipping, City } from "@/lib/logistics";
import { Product } from "@/lib/mockData/products";

export default function ProductDetails({ product }: { product: Product }) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || { name: "Default", hex: "#ccc" });
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");

  const discountedPrice = product.discount ? Math.floor(product.price * (1 - product.discount / 100)) : product.price;

  return (
    <div className="space-y-12">
      {/* Product Title & Identity */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#C5A021]">
           {/* الباب الرابع: حقل البائع */}
           {((product as any).vendor || (product as any).vendorName || (product as any).storeName) && (
             <span className="flex items-center gap-1.5">
               <span className="material-symbols-rounded text-sm">storefront</span>
               يباع بواسطة: <span className="text-[#0F172A] font-black">{(product as any).storeName || (product as any).vendorName || (product as any).vendor}</span>
             </span>
           )}
           <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
           <Stars rating={product.rating} count={product.reviews} />
           {/* الباب الرابع: عداد مرات الشراء */}
           {(product as any).purchaseCount && (product as any).purchaseCount > 0 && (
             <>
               <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
               <span className="flex items-center gap-1 text-[#0F172A]">
                 <span className="material-symbols-rounded text-xs fill-1 text-[#F29124]">shopping_bag</span>
                 {(product as any).purchaseCount.toLocaleString()} عملية شراء
               </span>
             </>
           )}
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] leading-[1.1] tracking-tight">
           {product.title}
        </h1>

        {product.shortDescription && (
          <p className="text-lg font-bold text-[#C5A021] bg-[#C5A021]/5 px-6 py-3 rounded-2xl border border-[#C5A021]/10 inline-block">
             {product.shortDescription}
          </p>
        )}

        <div className="flex items-center gap-6 border-b border-gray-100 pb-8">
           <div className="flex flex-col">
              <span className="text-sm font-black text-[#CB2E26]">{product.discount ? `%${product.discount}-` : "سعر مغري"}</span>
              <div className="flex items-baseline gap-1">
                 <span className="text-4xl font-black text-[#0F172A]">{discountedPrice.toLocaleString()}</span>
                 <span className="text-sm font-black text-gray-400">ج.س</span>
              </div>
              {product.oldPrice && (
                <span className="text-xs font-bold text-gray-400 line-through">السعر الأصلي: {product.oldPrice.toLocaleString()} ج.س</span>
              )}
           </div>
           
           {/* Coupons/Offers Section (Amazon style) */}
           <div className="bg-green-50 px-6 py-4 rounded-2xl border border-green-100 flex items-center gap-4">
              <span className="material-symbols-rounded text-green-600">sell</span>
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-green-800 uppercase tracking-widest">توفير رائع</span>
                 <p className="text-xs font-bold text-green-700">خصم إضافي %15 عند استخدام الكود <span className="font-black text-[#0F172A]">MERSAL15</span></p>
              </div>
           </div>
        </div>
      </div>

      {/* Variant Selection - الباب الرابع: إخفاء "النمط" و"الحجم المتاح" من عرض المستخدم */}
      {/* نُبقي منطق الاختيار لكن نخفي النمط والحجم المتاح كما طلب العميل */}
      <div className="space-y-12 pb-8 border-b border-gray-100">
         {/* Color Selection - مخفي النص "النمط" */}
         {product.colors && (
           <div className="space-y-6">
              <span className="text-xs font-black uppercase tracking-wide text-gray-400">اختر اللون: <span className="text-[#0F172A]">{selectedColor.name}</span></span>
              <div className="flex gap-4">
                 {product.colors.map((color: any) => (
                   <button 
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "w-12 h-12 rounded-2xl border-2 transition-all p-1.5 bg-white",
                      selectedColor.name === color.name ? "border-[#C5A021] shadow-lg scale-110" : "border-gray-100 hover:border-gray-200"
                    )}
                   >
                      <div className="w-full h-full rounded-xl shadow-inner" style={{ backgroundColor: color.hex }} />
                   </button>
                 ))}
              </div>
           </div>
         )}
         {/* Size Selection - الحجم المتاح مخفي حسب طلب الباب الرابع */}
      </div>

      {/* Description Deep Dive */}
      <div className="space-y-4">
         <h4 className="text-xl font-black uppercase tracking-widest text-[#0F172A]">تفاصيل المنتج</h4>
         <p className="text-sm font-medium text-gray-600 leading-relaxed">
            {product.description}
         </p>
         <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <li className="flex items-center gap-3 text-xs font-bold text-gray-500">
               <span className="w-1.5 h-1.5 bg-[#C5A021] rounded-full" /> العلامة التجارية: {product.brand || "غير محدد"}
            </li>
            <li className="flex items-center gap-3 text-xs font-bold text-gray-500">
               <span className="w-1.5 h-1.5 bg-[#C5A021] rounded-full" /> النطاق: {product.range || "أصلي 100%"}
            </li>
            {product.sku && (
              <li className="flex items-center gap-3 text-xs font-bold text-gray-500">
                 <span className="w-1.5 h-1.5 bg-[#C5A021] rounded-full" /> رمز المنتج: {product.sku}
              </li>
            )}
         </ul>
      </div>

      {/* Tech Specs (Grid) if available */}
      {(product.ram || product.storage || product.screenSize) && (
         <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
            {product.ram && (
               <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-[8px] font-black text-gray-400 uppercase">ذاكرة الرام</span>
                  <span className="text-xs font-black text-[#0F172A]">{product.ram}</span>
               </div>
            )}
            {product.storage && (
               <div className="flex flex-col items-center gap-1 border-r border-gray-200 text-center">
                  <span className="text-[8px] font-black text-gray-400 uppercase">سعة التخزين</span>
                  <span className="text-xs font-black text-[#0F172A]">{product.storage}</span>
               </div>
            )}
            {product.screenSize && (
               <div className="flex flex-col items-center gap-1 border-r border-gray-200 text-center">
                  <span className="text-[8px] font-black text-gray-400 uppercase">حجم الشاشة</span>
                  <span className="text-xs font-black text-[#0F172A]">{product.screenSize}</span>
               </div>
            )}
         </div>
      )}

      {/* Bundle Items for Composite Products */}
      {product.type === 'BUNDLE' && product.bundleData && product.bundleData.length > 0 && (
        <div className="space-y-6 p-8 bg-purple-50 rounded-[2.5rem] border border-purple-100">
           <div className="flex items-center gap-3 text-purple-700">
              <span className="material-symbols-rounded">inventory_2</span>
              <h4 className="text-sm font-black uppercase tracking-widest">مكونات هذا العرض</h4>
           </div>
           <div className="space-y-3">
              {product.bundleData.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-purple-200/50 last:border-0">
                   <span className="text-xs font-bold text-purple-900">{item.name}</span>
                   <span className="text-[10px] font-black text-purple-600 bg-white px-2 py-1 rounded-lg">{item.price} ج.س</span>
                </div>
              ))}
           </div>
        </div>
      )}



      {/* Comparisons Tier (Static Placeholder) */}
      <div className="pt-12">
         <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-5">
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                  <span className="material-symbols-rounded text-3xl text-gray-400">compare</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-sm font-black text-[#0F172A]">مقارنة مع سلع مماثلة</span>
                  <p className="text-[10px] text-gray-400 font-bold underline cursor-pointer">انظر جدول الفوارق الفنية</p>
               </div>
            </div>
            <span className="material-symbols-rounded text-gray-300">chevron_left</span>
         </div>
      </div>



      {/* Price Comparison (Other Offers) */}
      {product.otherOffers && (
        <div className="space-y-6 pt-10 border-t border-gray-100">
           <h3 className="text-xl font-black text-[#0F172A]">عروض أخرى لهذا المنتج 🏷️</h3>
           <div className="space-y-3">
              {product.otherOffers.map((offer, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all group">
                   <div className="flex flex-col">
                      <span className="text-sm font-black text-[#0F172A] group-hover:text-[#C5A021] transition-colors">{offer.vendor}</span>
                      <div className="flex items-center gap-1">
                         <span className="material-symbols-rounded text-[#F29124] text-[10px] fill-1">star</span>
                         <span className="text-[10px] font-bold text-gray-400">{offer.rating} تقييم التاجر</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="text-left">
                         <p className="text-lg font-black text-[#CB2E26]">{offer.price.toLocaleString()} ج.س</p>
                         <p className="text-[9px] text-green-600 font-bold">متوفر للتوصيل</p>
                      </div>
                      <button className="bg-[#C5A021]/10 text-[#C5A021] hover:bg-[#C5A021] hover:text-white px-5 py-2.5 rounded-xl text-[10px] font-black transition-all">
                         عرض العرض
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}

function Stars({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
       <div className="flex text-[#F29124]">
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} className={cn("material-symbols-rounded text-xs", s <= Math.round(rating) ? "fill-1" : "fill-0 opacity-20")}>star</span>
          ))}
       </div>
       <span>{rating}</span>
       <span className="opacity-40">({count} رأي)</span>
    </div>
  );
}



