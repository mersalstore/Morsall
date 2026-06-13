"use client"

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

function ForgotPasswordContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً.");
      } else {
        // Redirect to reset password page with email param
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      setError("حدث خطأ في النظام. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8 font-sans rtl" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden"
      >
        {/* Sleek Golden Gradient Highlight */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#C5A021] to-[#E5C158]" />

        <div className="text-center mb-8 mt-2">
          <Link href="/" className="inline-block mb-6 transition-transform hover:scale-105 duration-300">
            <div className="w-20 h-20 relative mx-auto">
              <Image src="/logo.png" alt="مرسال" fill className="object-contain" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">استعادة كلمة المرور</h1>
          <p className="text-gray-500 text-sm leading-relaxed px-2">
            أدخل البريد الإلكتروني المرتبط بحسابك وسنرسل لك رمزاً لتغيير كلمة المرور.
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 text-red-600 text-sm font-medium p-4 rounded-xl border border-red-100 mb-6 flex items-center gap-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">البريد الإلكتروني</label>
            <input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              type="email" 
              placeholder="name@example.com" 
              dir="ltr"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C5A021] focus:border-transparent transition-all text-right" 
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F172A] hover:bg-[#032a35] text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-[#0F172A]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الإرسال...
                </>
              ) : "إرسال رمز الاستعادة"}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <Link href="/login" className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors">
            العودة إلى صفحة تسجيل الدخول
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#C5A021] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}
