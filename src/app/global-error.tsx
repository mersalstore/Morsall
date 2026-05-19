"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCcw, Home, AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFB]">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden text-center relative border border-gray-100">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500" />
            
            <div className="p-10 space-y-6">
              <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2rem] mx-auto flex items-center justify-center shadow-inner">
                <AlertTriangle size={48} strokeWidth={1.5} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">عذراً، حدث خطأ فادح!</h2>
                <p className="text-gray-500 text-sm font-bold leading-relaxed">
                  حدث خطأ غير متوقع في النظام. فريقنا يعمل على إصلاح المشكلة حالياً.
                </p>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  onClick={() => reset()}
                  className="w-full flex items-center justify-center gap-2 bg-[#0F172A] text-white py-4 rounded-2xl font-black text-sm hover:bg-[#C5A021] transition-all shadow-xl shadow-[#0F172A]/20"
                >
                  <RefreshCcw size={18} />
                  إعادة تحميل الصفحة
                </button>
                <Link 
                  href="/"
                  className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-500 py-4 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all border border-gray-100"
                >
                  <Home size={18} />
                  العودة للرئيسية
                </Link>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
