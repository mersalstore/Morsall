"use client"

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Decrement timer
  useEffect(() => {
    if (timer > 0 && !success) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, success]);

  // If email is missing, redirect to register
  useEffect(() => {
    if (!email) {
      router.push("/login?tab=register");
    }
  }, [email, router]);

  // Handle digit inputs
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only keep last digit
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) return; // Must be exactly 6 digits

    const digits = pastedData.split("");
    setCode(digits);
    // Focus last input
    inputRefs.current[5]?.focus();
  };

  // Submit code
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const verificationCode = code.join("");
    if (verificationCode.length < 6) {
      setError("الرجاء إدخال رمز التحقق كاملاً المكون من 6 أرقام");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل التحقق من الرمز. يرجى المحاولة لاحقاً.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/login?verified=true&email=${encodeURIComponent(email)}`);
        }, 2000);
      }
    } catch (err) {
      setError("حدث خطأ في النظام. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  // Auto submit when all digits are filled
  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit();
    }
  }, [code]);

  // Resend code
  const handleResend = async () => {
    if (timer > 0) return;

    setResending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "VERIFY" }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل إعادة إرسال الرمز. يرجى المحاولة لاحقاً.");
      } else {
        setTimer(60);
        setCode(Array(6).fill(""));
        inputRefs.current[0]?.focus();
        // Temporary feedback alert
        alert("تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني.");
      }
    } catch (err) {
      setError("حدث خطأ في النظام. يرجى المحاولة مرة أخرى.");
    } finally {
      setResending(false);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">تفعيل حسابك</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            لقد أرسلنا رمز تفعيل مكون من 6 أرقام إلى:
            <br />
            <span className="font-semibold text-gray-800 dir-ltr inline-block mt-1">{email}</span>
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

        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 text-green-700 text-sm font-semibold p-4 rounded-xl border border-green-100 mb-6 flex items-center gap-3 justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 animate-bounce" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>تم تفعيل الحساب بنجاح! جاري تحويلك...</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2 md:gap-3 dir-ltr" dir="ltr">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={loading || success}
                className="w-12 h-14 text-center text-xl font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A021] focus:border-transparent transition-all disabled:opacity-50 text-gray-900"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || success || code.some(d => d === "")}
            className="w-full bg-[#0F172A] hover:bg-[#032a35] text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-[#0F172A]/20 transition-all active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري التحقق...
              </>
            ) : "تأكيد الرمز"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <p className="text-gray-500 mb-2">لم يصلك الرمز؟</p>
          {timer > 0 ? (
            <span className="text-gray-400 font-medium">
              يمكنك إعادة إرسال الرمز خلال <span className="font-semibold text-gray-700">{timer}</span> ثانية
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending || success}
              className="text-[#C5A021] font-bold hover:underline transition-colors disabled:opacity-50"
            >
              {resending ? "جاري الإرسال..." : "إعادة إرسال الرمز"}
            </button>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <Link href="/login" className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors">
            العودة إلى صفحة تسجيل الدخول
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#C5A021] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
