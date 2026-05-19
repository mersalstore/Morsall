import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Product } from "@/lib/mockData/products";

interface RelatedUpsellProps {
  mainProduct: Product;
  upsellProducts: Product[];
}

export default function RelatedUpsell({ mainProduct, upsellProducts }: RelatedUpsellProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => upsellProducts.map(p => p.id));
  
  // Update selection if upsellProducts changes externally
  useEffect(() => {
    setSelectedIds(upsellProducts.map(p => p.id));
  }, [upsellProducts]);

  const selectedItems = upsellProducts.filter(p => selectedIds.includes(p.id));
  const totalPrice = mainProduct.price + selectedItems.reduce((acc, curr) => acc + curr.price, 0);
  const totalSavings = selectedItems.length > 0 ? Math.floor(totalPrice * 0.05) : 0; // 5% bundle discount simulation
  const finalPrice = totalPrice - totalSavings;

  const toggleItem = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  if (upsellProducts.length === 0) return null;

  return (
    <div className="bg-white rounded-[3rem] p-8 md:p-14 border-4 border-white shadow-2xl space-y-12 relative overflow-hidden" dir="rtl">
      {/* Decorative Brand Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A021]/10 rounded-bl-[5rem] -mr-10 -mt-10 blur-3xl" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-8 border-gray-100 gap-4 relative z-10">
         <div className="space-y-1">
            <h4 className="text-3xl font-black text-[#0F172A] tracking-tighter">اشتري باقة <span className="text-[#C5A021]">{mainProduct.vendor}</span> ووفر أكثر</h4>
            <p className="text-gray-400 text-sm font-bold">كل القطع يتم شحنها معاً من نفس المتجر في طرد واحد</p>
         </div>
         <span className="bg-[#CB2E26] text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-500/20">
            خصم الباقة الحصري %5
         </span>
      </div>

      <div className="flex flex-wrap items-center gap-8 md:gap-12 relative z-10">
         <UpsellCard image={mainProduct.image} active title="المنتج الأساسي" />
         
         {upsellProducts.map((item, idx) => (
           <div key={item.id} className="flex items-center gap-8 md:gap-12">
              <span className="text-4xl text-gray-200 font-black">+</span>
              <UpsellCard 
                image={item.image} 
                active={selectedIds.includes(item.id)} 
                onClick={() => toggleItem(item.id)}
                title={item.title}
              />
           </div>
         ))}

         <div className="flex flex-col gap-5 mr-auto pt-10 xl:pt-0 border-t md:border-t-0 md:border-r border-gray-100 md:pr-14 mt-10 md:mt-0 w-full md:w-auto">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">إجمالي سعر الباقة</span>
               <div className="flex items-end gap-3 text-[#CB2E26]">
                  <span className="text-5xl md:text-6xl font-black tracking-tighter leading-none">{finalPrice.toLocaleString()}</span>
                  <span className="text-sm font-black uppercase tracking-widest mb-2 font-heading">ج.س</span>
               </div>
               {totalSavings > 0 && (
                 <p className="text-green-600 text-[11px] font-black mt-2 bg-green-50 px-3 py-1 rounded-full inline-block">توفير حقيقي: {totalSavings.toLocaleString()} ج.س</p>
               )}
            </div>
            <button className="bg-[#0F172A] text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-[#C5A021] transition-all active:scale-95 border-b-4 border-black/20 flex items-center justify-center gap-3">
               أضف الباقة للسلة <span className="material-symbols-rounded">auto_awesome</span>
            </button>
         </div>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-gray-50">
         {upsellProducts.map((item) => (
           <label key={item.id} className="flex items-center gap-5 cursor-pointer group p-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
              <div className={cn(
                "w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all",
                selectedIds.includes(item.id) ? "bg-[#C5A021] border-[#C5A021]" : "bg-white border-gray-200 group-hover:border-[#C5A021]"
              )}>
                <input type="checkbox" className="hidden" checked={selectedIds.includes(item.id)} onChange={() => toggleItem(item.id)} />
                <span className="material-symbols-rounded text-white text-lg">check</span>
              </div>
              <div className="flex flex-col">
                 <span className={cn("text-xs font-black transition-all", selectedIds.includes(item.id) ? "text-[#0F172A]" : "text-gray-400")}>
                    {item.title}
                 </span>
                 <span className="text-[10px] text-[#C5A021] font-black">{item.price.toLocaleString()} ج.س</span>
              </div>
           </label>
         ))}
      </div>
    </div>
  );
}

function UpsellCard({ image, active, onClick, title }: { image: string, active?: boolean, onClick?: () => void, title?: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
       <div 
         onClick={onClick}
         className={cn(
           "relative w-28 h-28 md:w-36 md:h-36 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border-4 transition-all duration-700 cursor-pointer shadow-xl",
           active ? "border-[#C5A021] scale-110 shadow-[#C5A021]/20" : "border-transparent opacity-30 grayscale hover:opacity-100 hover:grayscale-0"
         )}
       >
         <Image src={image} alt="Upsell" fill className="object-cover" />
         {active && (
           <div className="absolute inset-0 bg-[#C5A021]/5 z-10" />
         )}
       </div>
       {title && <span className="text-[9px] font-black text-gray-300 max-w-[80px] text-center truncate">{title}</span>}
    </div>
  );
}
