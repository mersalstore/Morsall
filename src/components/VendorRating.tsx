"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function VendorRating({ vendorId }: { vendorId: string }) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!session) {
    return (
      <div className="bg-gray-50 p-6 rounded-[2.5rem] mt-8 text-center">
        <h3 className="font-black mb-2">قيم تجربتك مع هذا المتجر</h3>
        <p className="text-xs text-gray-500 mb-4 font-bold">يجب تسجيل الدخول لتتمكن من التقييم</p>
        <Link href="/login" className="inline-block bg-[#0F172A] text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-[#C5A021] transition-colors">
          تسجيل الدخول
        </Link>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0) return alert("الرجاء اختيار تقييم من 1 إلى 5 نجوم");
    setLoading(true);
    try {
      const res = await fetch("/api/vendor-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, rating, comment })
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        alert(data.error || "حدث خطأ أثناء إرسال التقييم");
      }
    } catch (err) {
      alert("حدث خطأ في الاتصال بالخادم");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="bg-green-50 text-green-600 p-6 rounded-[2.5rem] mt-8 text-center font-black border border-green-200">
        شكراً لتقييمك لهذا المتجر!
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 p-6 rounded-[2.5rem] mt-8 shadow-xl shadow-gray-200/20">
      <h3 className="font-black mb-4 text-[#0F172A]">قيم تجربتك مع هذا المتجر</h3>
      <div className="flex gap-2 mb-4" dir="ltr">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(star)}
            className="text-3xl transition-transform hover:scale-110 focus:outline-none"
          >
            <span 
              className={`material-symbols-rounded ${(hoveredRating || rating) >= star ? "text-yellow-400 fill-1" : "text-gray-200"}`}
              style={{ fontVariationSettings: (hoveredRating || rating) >= star ? "'FILL' 1" : "'FILL' 0" }}
            >
              star
            </span>
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="أضف تعليقك هنا (اختياري)..."
        className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:border-[#C5A021] text-sm resize-none mb-4 font-medium transition-colors"
        rows={3}
      />
      <button 
        onClick={handleSubmit} 
        disabled={loading || rating === 0}
        className="w-full bg-[#C5A021] text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#0F172A] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#C5A021]/20"
      >
        {loading ? "جاري الإرسال..." : "إرسال التقييم"}
      </button>
    </div>
  );
}
