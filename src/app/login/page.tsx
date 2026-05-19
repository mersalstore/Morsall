"use client"

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

function LoginContent() {
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "register") {
      setIsLogin(false);
    }
    
    // Handle NextAuth URL errors
    const urlError = searchParams.get("error");
    if (urlError) {
      if (urlError === "OAuthCallback" || urlError === "OAuthSignin" || urlError === "OAuthCreateAccount") {
        setError("حدث خطأ أثناء تسجيل الدخول بواسطة جوجل. ربما يكون البريد مسجلاً مسبقاً بطريقة أخرى. الرجاء استخدام البريد وكلمة المرور أو المحاولة مرة أخرى.");
      } else if (urlError === "CredentialsSignin") {
        setError("بيانات الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور.");
      } else if (urlError === "AccessDenied") {
        setError("تم رفض الوصول. لا تملك الصلاحيات الكافية.");
      } else {
        setError(`حدث خطأ أثناء تسجيل الدخول (${urlError}). يرجى المحاولة مرة أخرى.`);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const result = await signIn("credentials", { 
          email, 
          password, 
          redirect: false 
        });
        
        if (result?.error) {
          // Use the actual error from NextAuth if it's not a generic one
          const errorMsg = result.error === "CredentialsSignin" 
            ? "بيانات الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور."
            : result.error;
          setError(errorMsg);
        } else { 
          router.push("/"); 
          router.refresh(); 
        }
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) setError(data.error || "فشل إنشاء الحساب. يرجى المحاولة لاحقاً.");
        else await signIn("credentials", { email, password, callbackUrl: "/" });
      }
    } catch (err) {
      setError("حدث خطأ في النظام. يرجى المحاولة مرة أخرى.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8 font-sans rtl selection:bg-[#C5A021] selection:text-white" dir="rtl">
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
      >
        {/* ── Brand Sidebar ── */}
        <div className="bg-[#0F172A] p-10 md:p-16 hidden lg:flex flex-col justify-between relative overflow-hidden order-2">
           <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#011419] to-[#01090C] z-0" />
           
           {/* Abstract decorative shapes */}
           <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#C5A021]/20 blur-[80px] rounded-full" />
           <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-500/10 blur-[80px] rounded-full" />
           
           <div className="relative z-10 w-full flex items-center justify-start">
              <Link href="/" className="inline-block transition-transform hover:scale-105 duration-300">
                 <div className="w-24 h-24 relative">
                    <Image src="/logo-navbar-final.png" alt="مرسال" fill className="object-contain" />
                 </div>
              </Link>
           </div>

           <div className="relative z-10 space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                 {isLogin ? "مرحباً بك في منصة مرسال" : "انضم إلى منصة مرسال"}
              </h2>
              <p className="text-lg text-gray-300 max-w-sm leading-relaxed">
                 {isLogin 
                   ? "الوجهة الرائدة للتسوق الإلكتروني، حيث نضمن لك تجربة تسوق موثوقة وسريعة." 
                   : "أنشئ حسابك الآن وابدأ في استكشاف آلاف المنتجات بأسعار تنافسية وخدمة عملاء استثنائية."}
              </p>
           </div>

           <div className="relative z-10">
              <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/10">
                 <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                 <span className="text-sm text-gray-200 font-medium">الأنظمة تعمل بكفاءة 100%</span>
              </div>
           </div>
        </div>

        {/* ── Auth Form Area ── */}
        <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center relative z-10 order-1 bg-white">
            <AnimatePresence mode="wait">
              <motion.div 
                key={isLogin ? "login" : "signup"}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md mx-auto"
              >
                <div className="mb-10 text-right">
                   <h1 className="text-3xl font-bold text-gray-900 mb-3">
                      {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
                   </h1>
                   <p className="text-gray-500 text-sm">
                      {isLogin ? "أدخل بياناتك للمتابعة إلى حسابك" : "الرجاء إدخال بياناتك لإنشاء حساب جديد"}
                   </p>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 text-red-600 text-sm font-medium p-4 rounded-xl border border-red-100 mb-6 flex items-center gap-3"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                     </svg>
                     {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                   {!isLogin && (
                     <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 block">الاسم الكامل</label>
                        <input 
                           value={name} 
                           onChange={(e) => setName(e.target.value)} 
                           required 
                           type="text" 
                           placeholder="أحمد محمد" 
                           className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C5A021] focus:border-transparent transition-all" 
                        />
                     </div>
                   )}
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
                   <div className="space-y-2">
                      <div className="flex justify-between items-center">
                         <label className="text-sm font-semibold text-gray-700">كلمة المرور</label>
                         {isLogin && <Link href="/forgot-password" className="text-xs font-medium text-[#C5A021] hover:text-[#0F172A] transition-colors">هل نسيت كلمة المرور؟</Link>}
                      </div>
                      <input 
                         value={password} 
                         onChange={(e) => setPassword(e.target.value)} 
                         required 
                         type="password" 
                         placeholder="••••••••" 
                         dir="ltr"
                         className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C5A021] focus:border-transparent transition-all text-right" 
                      />
                   </div>

                   <div className="pt-4">
                      <button 
                         disabled={loading} 
                         type="submit" 
                         className="w-full bg-[#0F172A] hover:bg-[#032a35] text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-[#0F172A]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                         {loading ? (
                           <>
                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                             جاري المعالجة...
                           </>
                         ) : (isLogin ? "تسجيل الدخول" : "إنشاء حساب")}
                      </button>
                   </div>
                </form>

                <div className="relative my-8 text-center">
                   <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                   <span className="relative bg-white px-4 text-xs font-medium text-gray-400">أو المتابعة باستخدام</span>
                </div>

                <div className="w-full">
                    <button 
                      type="button"
                      onClick={() => signIn("google", { callbackUrl: "/" })}
                      className="w-full py-3.5 px-4 bg-white border border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700 shadow-sm"
                    >
                       <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} height={20} /> 
                       <span>حساب جوجل</span>
                    </button>
                 </div>

                <p className="text-center text-sm font-medium mt-10 text-gray-600">
                   {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
                   <button onClick={() => setIsLogin(!isLogin)} className="mr-2 text-[#C5A021] font-bold hover:underline transition-colors">
                      {isLogin ? "إنشاء حساب جديد" : "تسجيل الدخول"}
                   </button>
                </p>
              </motion.div>
            </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#C5A021] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
