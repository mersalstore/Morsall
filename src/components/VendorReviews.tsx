"use client"

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function VendorReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/vendor/reviews");
        if (res.ok) setReviews(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-[#0F172A]">تقييمات العملاء</h2>
          <p className="text-gray-400 font-bold">راقب آراء العملاء حول منتجاتك لتحسين الجودة.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 animate-spin material-symbols-rounded text-4xl text-gray-200">sync</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map(review => (
            <div key={review.id} className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                    {review.user?.image ? (
                      <img src={review.user.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-rounded text-gray-300">person</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-[#0F172A] text-xs">{review.user?.name || "عميل مجهول"}</h4>
                    <p className="text-[10px] text-gray-400 font-bold">{new Date(review.createdAt).toLocaleDateString("ar-EG")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={cn("material-symbols-rounded text-sm", i < review.rating ? "text-yellow-400" : "text-gray-200")}>star</span>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 italic text-gray-500 text-xs font-medium leading-relaxed">
                "{review.comment}"
              </div>
              <div className="flex items-center gap-3 pt-3 border-t">
                 <div className="relative w-10 h-10 rounded-lg overflow-hidden border">
                    <img src={review.product?.images?.split(',')[0]} alt="" className="w-full h-full object-cover" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">المنتج</span>
                    <span className="text-xs font-black text-[#0F172A] line-clamp-1">{review.product?.title}</span>
                 </div>
              </div>
            </div>
          ))}

          {reviews.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-3xl border border-dashed">
              <span className="material-symbols-rounded text-5xl text-gray-200 mb-3 block">rate_review</span>
              <p className="text-gray-400 font-black text-sm uppercase tracking-widest">لا توجد تقييمات بعد</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
