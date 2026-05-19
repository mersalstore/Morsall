"use client"

import { useWishlist } from "@/lib/WishlistContext";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import { useEffect, useState } from "react";

export default function ComparePage() {
  const { compareList, toggleCompare } = useWishlist();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    if (compareList.length > 0) {
      setLoading(true);
      fetch(`/api/products?ids=${compareList.join(',')}`)
        .then(res => res.json())
        .then(data => {
          // format products to match the needed structure
          const formatted = data.map((p: any) => {
            // Handle image: could be comma-separated string or array
            let rawImages = p.images || "";
            let imageList: string[] = [];
            if (Array.isArray(rawImages)) {
              imageList = rawImages;
            } else {
              imageList = rawImages.split(",").map((s: string) => s.trim()).filter(Boolean);
            }
            const firstImage = imageList[0] || "";

            return ({
            id: p.id,
            title: p.title,
            price: p.price,
            vendor: p.vendor?.storeName || "متجر",
            image: firstImage,
            category: p.category?.name || "عام",
            rating: 4.5,
            specs: {
              "SKU": p.sku || "N/A",
              "المخزون": p.stock > 0 ? "متوفر" : "نفذت الكمية",
              "الوصف": p.shortDescription || p.description || "لا يوجد وصف"
            }
          });});
          setProducts(formatted);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [compareList]);

  const allSpecs = Array.from(new Set(products.flatMap(p => Object.keys(p.specs || {}))));

  if (loading) {
    return <div className="min-h-screen pt-44 flex justify-center"><div className="w-10 h-10 border-4 border-[#C5A021] border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen pt-44 pb-20 px-6 flex flex-col items-center justify-center text-center space-y-8">
         <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center">
            <span className="material-symbols-rounded text-6xl text-gray-300">compare_arrows</span>
         </div>
         <div className="space-y-2">
            <h1 className="text-3xl font-black text-[#0F172A]">قائمة المقارنة فارغة</h1>
            <p className="text-gray-400 font-bold">أضف منتجات من المتجر لتقارن بينها وبين مواصفاتها</p>
         </div>
         <Link href="/shop" className="bg-[#C5A021] text-white px-10 py-4 rounded-2xl font-black text-sm hover:shadow-xl transition-all">
            ابدأ التسـوق
         </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-44 pb-20 px-6 lg:px-12 bg-muted/10">
      <div className="max-w-[1600px] mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-gray-100 pb-8">
           <div className="space-y-2">
              <h1 className="text-4xl font-black text-[#0F172A]">مقارنة <span className="text-[#C5A021]">المنتجات</span></h1>
              <p className="text-gray-400 text-sm font-bold">قارن بين المواصفات والأسعار لتختار الأفضل لك</p>
           </div>
           <span className="text-xs font-black bg-white px-4 py-2 rounded-xl border border-gray-100 text-[#C5A021]">
              {products.length} منتجات في المقارنة
           </span>
        </div>

        <div className="overflow-x-auto pb-10">
          <table className="w-full min-w-[800px] border-separate border-spacing-x-4">
            <thead>
              <tr className="align-top">
                <th className="w-48 text-right p-4 text-xs font-black text-gray-300 uppercase tracking-widest pt-10">المواصفات</th>
                {products.map(product => (
                  <th key={product.id} className="w-64 bg-white rounded-t-[2.5rem] p-6 border-x border-t border-gray-100 relative group">
                    <button 
                      onClick={() => toggleCompare(product.id)}
                      className="absolute top-4 left-4 w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    >
                       <span className="material-symbols-rounded text-base">close</span>
                    </button>
                    <div className="space-y-4">
                       <div className="aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                          {product.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-full h-full object-contain p-4"
                              onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300"; }}
                            />
                          ) : (
                            <span className="material-symbols-rounded text-5xl text-gray-200">image_not_supported</span>
                          )}
                       </div>
                       <div className="text-right space-y-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{product.category}</p>
                          <h3 className="text-sm font-black text-[#0F172A] line-clamp-2 h-10">{product.title}</h3>
                          <p className="text-lg font-black text-[#CB2E26]">{product.price.toLocaleString()} ج.س</p>
                       </div>
                       <button 
                         onClick={() => addItem({ ...product, quantity: 1 })}
                         className="w-full bg-[#C5A021] text-white py-3 rounded-xl text-[10px] font-black hover:bg-[#0D708E] transition-all"
                       >
                          أضف للسلة
                       </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white rounded-b-[2.5rem] border border-gray-100 shadow-sm">
              {/* Basic Info Rows */}
              <tr>
                 <td className="p-6 text-xs font-black text-gray-400 border-b border-gray-50">المتجر</td>
                 {products.map(p => (
                   <td key={p.id} className="p-6 border-b border-gray-50 text-sm font-black text-[#C5A021]">{p.vendor}</td>
                 ))}
              </tr>
              <tr>
                 <td className="p-6 text-xs font-black text-gray-400 border-b border-gray-50">التقييم</td>
                 {products.map(p => (
                   <td key={p.id} className="p-6 border-b border-gray-50">
                      <div className="flex items-center gap-1">
                         <span className="material-symbols-rounded text-[#F29124] text-sm fill-1">star</span>
                         <span className="text-sm font-black text-[#0F172A]">{p.rating}</span>
                      </div>
                   </td>
                 ))}
              </tr>
              
              {/* Dynamic Spec Rows */}
              {allSpecs.map(spec => (
                <tr key={spec}>
                   <td className="p-6 text-xs font-black text-gray-400 border-b border-gray-50 bg-gray-50/30">{spec}</td>
                   {products.map(p => (
                     <td key={p.id} className="p-6 border-b border-gray-50 text-sm font-bold text-gray-600">
                        {p.specs[spec] || "—"}
                     </td>
                   ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
