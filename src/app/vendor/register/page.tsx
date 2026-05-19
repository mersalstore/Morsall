"use client"

import { useState, useEffect } from "react";
import { CheckCircle2, User, Building2, Landmark, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function VendorRegister() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    storeName: "",
    storeCity: "الخرطوم",
    shippingModel: "MERSAL_HANDLES",
    subscriptionPlan: "BASIC",
    bankStatementUrl: "placeholder_url",
    commercialRegUrl: "",
  });

  // Auto-fill from session
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user?.name || prev.name,
        email: session.user?.email || prev.email,
        phone: (session.user as any)?.phone || prev.phone,
      }));
    }
  }, [session]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "bankStatementUrl" | "commercialRegUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(type);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل رفع الملف");

      setFormData(prev => ({ ...prev, [type]: data.url }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(null);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.email || !formData.phone)) return;
    if (step === 2 && !formData.storeName) return;
    setStep((s) => s + 1);
  };
  
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/vendor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // Refresh session to get vendor status immediately
        await update();
        router.push("/vendor/dashboard?status=pending");
      } else {
        const data = await res.json();
        setError(data.error || "فشل تسجيل البائع");
      }
    } catch (err) {
      setError("حدث خطأ تقني. حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center gap-6">
         <div className="w-16 h-16 border-4 border-[#C5A021] border-t-transparent rounded-full animate-spin" />
         <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C5A021]">جاري التحقق من الهوية السيادية...</span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center px-6">
         <div className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-4xl text-center space-y-10 border-8 border-white">
            <div className="w-24 h-24 bg-red-50 text-[#CB2E26] rounded-full flex items-center justify-center mx-auto shadow-inner">
               <span className="material-symbols-rounded text-5xl">lock_person</span>
            </div>
            <div className="space-y-4">
               <h1 className="text-3xl font-black text-[#0F172A]">مطلوب تسجيل الدخول 🔐</h1>
               <p className="text-gray-400 font-bold leading-relaxed">لبدء عملية تسجيل متجرك في مرسال، يجب أن تمتلك حساب مستخدم نشط أولاً لربط المتجر به.</p>
            </div>
            <Link 
              href={`/login?callbackUrl=/vendor/register`}
              className="block w-full bg-[#10B981] text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-[#10B981]/20 hover:scale-105 transition-all"
            >
               تسجيل الدخول الآن
            </Link>
            <p className="text-[10px] font-bold text-gray-300">ليس لديك حساب؟ <Link href="/login?tab=register" className="text-[#10B981] underline">اشترك الآن</Link></p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-24 md:py-44 px-4 md:px-6 flex items-center justify-center">
      <div className="max-w-xl w-full">
        
        {/* Progress System */}
        <div className="flex items-center justify-between mb-16 px-4">
           {[1, 2, 3, 4].map((s) => (
             <div key={s} className="flex flex-col items-center gap-3">
                <div className={cn(
                   "w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-black transition-all border-4 shadow-2xl relative",
                   step === s ? "bg-[#0F172A] text-white border-[#C5A021] scale-110" : 
                   step > s ? "bg-[#C5A021] text-white border-[#C5A021]" : "bg-white border-gray-100 text-[#0F172A]/20"
                )}>
                   {step > s ? <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" /> : <span className="text-sm md:text-xl">{s}</span>}
                </div>
                <span className={cn(
                   "text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] leading-none mt-2",
                   step === s ? "text-[#C5A021]" : "text-[#0F172A]/20"
                )}>
                   {s === 1 ? "الحساب" : s === 2 ? "المتجر" : s === 3 ? "الباقة" : "التوثيق"}
                </span>
             </div>
           ))}
        </div>

        <div className="bg-white rounded-[4rem] p-10 md:p-20 shadow-4xl border-white relative overflow-hidden ring-1 ring-black/5" dir="rtl">
          {/* Motta Accent */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#C5A021]/5 rounded-br-[5rem] pointer-events-none" />
          
          {error && (
            <div className="bg-red-50 text-[#CB2E26] p-8 rounded-[2.5rem] border-4 border-red-100 flex flex-col gap-6 animate-shake mb-12">
               <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest">
                  <span className="material-symbols-rounded text-2xl">error</span> {error}
               </div>
               {error.includes("مسجل كبائع بالفعل") && (
                 <Link 
                   href="/vendor/dashboard"
                   className="w-full bg-[#0F172A] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl hover:bg-[#C5A021] transition-all"
                 >
                    <span className="material-symbols-rounded text-lg">dashboard</span> توجه للوحة التحكم الآن
                 </Link>
               )}
            </div>
          )}

          <div className="animate-fade-in-up">
            {step === 1 && (
              <div className="space-y-8 text-right">
                <div className="text-center mb-16 space-y-3">
                  <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter">معلومات حساب المالك</h2>
                  <p className="text-[10px] font-black text-[#C5A021] uppercase tracking-[0.4em]">تأكيد الهوية الرقمية للتاجر</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="block text-[10px] font-black text-[#0F172A]/30 uppercase tracking-[0.3em] pr-4">الاسم المسجل</label>
                     <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} type="text" placeholder="أدخل اسمك كما في الهوية" className="input-modern" readOnly={!!session?.user?.name} />
                  </div>
                  <div className="space-y-2">
                     <label className="block text-[10px] font-black text-[#0F172A]/30 uppercase tracking-[0.3em] pr-4">البريد الموثق</label>
                     <input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} type="email" placeholder="example@mersal.com" className="input-modern opacity-50 bg-muted/30" readOnly />
                     <p className="text-[9px] text-[#C5A021] font-bold pr-4 mt-1">سيتم ربط المتجر بهذا الحساب تلقائياً ✨</p>
                  </div>
                  <div className="space-y-2">
                     <label className="block text-[10px] font-black text-[#0F172A]/30 uppercase tracking-[0.3em] pr-4">رقم الواتساب للتاجر</label>
                     <input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} type="tel" placeholder="09xxxx-xxxx" className="input-modern" />
                  </div>
                </div>
                <button 
                  onClick={nextStep}
                  disabled={!formData.name || !formData.email || !formData.phone}
                  className="w-full bg-[#0F172A] text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-[#C5A021] transition-all flex items-center justify-center gap-4 disabled:opacity-20"
                >
                  الخطوة التالية للمتجر <span className="material-symbols-rounded">trending_flat</span>
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 text-right">
                <div className="text-center mb-16 space-y-3">
                  <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter">هوية المتجر التجاري</h2>
                  <p className="text-[10px] font-black text-[#C5A021] uppercase tracking-[0.4em]">حدد بصمتك التجارية في السوق</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="block text-[10px] font-black text-[#0F172A]/30 uppercase tracking-[0.3em] pr-4">اسم المتجر</label>
                     <input value={formData.storeName} onChange={(e) => setFormData({...formData, storeName: e.target.value})} type="text" placeholder="مثلاً: عالم التكنولوجيا" className="input-modern" />
                  </div>
                  <div className="space-y-2">
                     <label className="block text-[10px] font-black text-[#0F172A]/30 uppercase tracking-[0.3em] pr-4">المقر الرئيسي</label>
                     <select value={formData.storeCity} onChange={(e) => setFormData({...formData, storeCity: e.target.value})} className="input-modern cursor-pointer">
                        <option>الخرطوم</option>
                        <option>أمدرمان</option>
                        <option>بحرى</option>
                        <option>بورتسودان</option>
                        <option>ود مدني</option>
                     </select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                     <button 
                        onClick={() => setFormData({...formData, shippingModel: "MERSAL_HANDLES"})}
                        className={cn("p-6 rounded-[2rem] border-4 text-right transition-all", formData.shippingModel === "MERSAL_HANDLES" ? "border-[#10B981] bg-sky-50 shadow-xl" : "border-gray-50 hover:border-gray-200")}
                     >
                        <h4 className="text-sm font-black text-[#0F172A] mb-2">تخزين مرسال</h4>
                        <p className="text-[10px] text-gray-400 font-bold">نقوم بكافة العمليات اللوجستية نيابة عنك.</p>
                     </button>
                     <button 
                        onClick={() => setFormData({...formData, shippingModel: "VENDOR_PACKS"})}
                        className={cn("p-6 rounded-[2rem] border-4 text-right transition-all", formData.shippingModel === "VENDOR_PACKS" ? "border-[#F29124] bg-orange-50 shadow-xl" : "border-gray-50 hover:border-gray-200")}
                     >
                        <h4 className="text-sm font-black text-[#0F172A] mb-2">شحن مرسال</h4>
                        <p className="text-[10px] text-gray-400 font-bold">أنت تغلف ونحن نستلم الطلب الجاهز.</p>
                     </button>
                  </div>
                </div>
                <div className="flex gap-4 pt-8">
                  <button onClick={prevStep} className="flex-1 py-6 text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-[#0F172A] transition-colors">السابق</button>
                  <button 
                    onClick={nextStep}
                    disabled={!formData.storeName}
                    className="flex-[2] bg-[#0F172A] text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-[#C5A021] transition-all disabled:opacity-20 flex items-center justify-center gap-4"
                  >
                    التالي: باقة الاشتراك <span className="material-symbols-rounded">gem</span>
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 text-right">
                <div className="text-center mb-16 space-y-3">
                  <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter">باقات اشتراك التجار</h2>
                  <p className="text-[10px] font-black text-[#C5A021] uppercase tracking-[0.4em]">اختر الخطة المثالية لمتجرك لمباشرة رفع المنتجات</p>
                </div>
                <div className="space-y-4">
                  {[
                    { id: "BASIC", name: "الباقة التجريبية (Free Trial)", price: "مجاناً", desc: "باقة تجربة مجانية لكافة خدمات مرسال الفاخرة لمدة 30 يوم", features: ["أولوية شحن متوسطة", "رفع منتجات غير محدود", "دعم فني عادي"] },
                    { id: "PRO", name: "الباقة الاحترافية (Pro)", price: "25,000 ج.س", desc: "مثالية للمحلات المتطورة والموردين الكبار", features: ["أولوية في تجهيز طلبات التوريد", "عمولات شحن تفضيلية", "تقارير وتحليلات مبيعات ذكية"] },
                    { id: "ELITE", name: "باقة النخبة الفاخرة (Elite)", price: "75,000 ج.س", desc: "للشركات الكبرى والمستوردين المهيمنين", features: ["مدير حساب مخصص 24/7", "تأكيد فوري لواردات WMS", "أولوية قصوى للشحن اللوجستي"] },
                  ].map((p) => (
                    <div key={p.id}
                      onClick={() => setFormData({...formData, subscriptionPlan: p.id})}
                      className={cn(
                        "p-6 rounded-[2rem] border-4 text-right transition-all cursor-pointer relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-4 hover:scale-[1.01]",
                        formData.subscriptionPlan === p.id ? "border-[#C5A021] bg-[#C5A021]/5 shadow-xl" : "border-gray-50 hover:border-gray-200 bg-white"
                      )}
                    >
                      <div className="space-y-2 min-w-0 flex-1">
                        <h4 className="text-base font-black text-[#0F172A] flex items-center gap-2">
                          {p.name}
                          {formData.subscriptionPlan === p.id && <span className="text-[#C5A021] text-xs">● نشطة</span>}
                        </h4>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed">{p.desc}</p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {p.features.map((f, i) => (
                            <span key={i} className="text-[9px] bg-slate-100 text-[#0F172A]/60 px-2 py-0.5 rounded-full font-bold">✓ {f}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-left shrink-0 self-end md:self-center">
                        <p className="text-2xl font-black text-[#C5A021]">{p.price}</p>
                        <p className="text-[9px] text-gray-400 font-bold mt-1">لكل 30 يوم</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 pt-8">
                  <button onClick={prevStep} className="flex-1 py-6 text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-[#0F172A] transition-colors">السابق</button>
                  <button 
                    onClick={nextStep}
                    className="flex-[2] bg-[#0F172A] text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-[#C5A021] transition-all flex items-center justify-center gap-4"
                  >
                    التالي: التوثيق <span className="material-symbols-rounded">verified</span>
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 text-right">
                <div className="text-center mb-16 space-y-3">
                  <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter">التوثيق والمصداقية</h2>
                  <p className="text-[10px] font-black text-[#CB2E26] uppercase tracking-[0.4em]">تحميل الأوراق الثبوتية للمتجر</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div 
                      onClick={() => document.getElementById('bank-upload')?.click()}
                      className={cn(
                        "p-10 border-4 border-dashed rounded-[3rem] text-center transition-all cursor-pointer group relative overflow-hidden",
                        formData.bankStatementUrl && formData.bankStatementUrl !== "placeholder_url" ? "border-[#10B981] bg-green-50" : "border-gray-100 bg-muted/10 hover:border-[#C5A021] hover:bg-sky-50"
                      )}
                    >
                      <input 
                        id="bank-upload" 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, "bankStatementUrl")} 
                        accept="image/*,.pdf"
                      />
                      {isUploading === "bankStatementUrl" ? (
                        <div className="w-10 h-10 border-4 border-[#C5A021] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      ) : (
                        <span className={cn(
                          "material-symbols-rounded text-4xl mb-4 block group-hover:scale-125 transition-transform",
                          formData.bankStatementUrl && formData.bankStatementUrl !== "placeholder_url" ? "text-[#10B981]" : "text-[#C5A021]"
                        )}>
                          {formData.bankStatementUrl && formData.bankStatementUrl !== "placeholder_url" ? "check_circle" : "cloud_upload"}
                        </span>
                      )}
                      <h4 className="text-[10px] font-black text-[#0F172A] uppercase tracking-widest">
                        {formData.bankStatementUrl && formData.bankStatementUrl !== "placeholder_url" ? "تم رفع كشف الحساب" : "كشف الحساب البنكي"}
                      </h4>
                    </div>

                    <div 
                      onClick={() => document.getElementById('comm-upload')?.click()}
                      className={cn(
                        "p-10 border-4 border-dashed rounded-[3rem] text-center transition-all cursor-pointer group relative overflow-hidden",
                        formData.commercialRegUrl ? "border-[#F29124] bg-orange-50" : "border-gray-100 bg-muted/10 hover:border-[#F29124] hover:bg-orange-50"
                      )}
                    >
                      <input 
                        id="comm-upload" 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, "commercialRegUrl")} 
                        accept="image/*,.pdf"
                      />
                      {isUploading === "commercialRegUrl" ? (
                        <div className="w-10 h-10 border-4 border-[#F29124] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      ) : (
                        <span className={cn(
                          "material-symbols-rounded text-4xl mb-4 block group-hover:scale-125 transition-transform",
                          formData.commercialRegUrl ? "text-[#F29124]" : "text-[#F29124]"
                        )}>
                          {formData.commercialRegUrl ? "verified" : "verified"}
                        </span>
                      )}
                      <h4 className="text-[10px] font-black text-[#0F172A] uppercase tracking-widest">
                        {formData.commercialRegUrl ? "تم رفع السجل التجاري" : "السجل التجاري"}
                      </h4>
                    </div>
                </div>
                <div className="flex gap-4 pt-12">
                  <button onClick={prevStep} className="flex-1 py-6 text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-[#0F172A] transition-colors">السابق</button>
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-[2] bg-[#CB2E26] text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-[#0F172A] transition-all disabled:opacity-50 flex items-center justify-center gap-4"
                  >
                    {isSubmitting ? "جاري الإرسال..." : "إرسال طلب الانضمام"} <span className="material-symbols-rounded">send</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center mt-12 text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">
           مرسال للنخبة <span className="text-[#10B981]">●</span> شركاء النجاح
        </p>
      </div>

      <style jsx global>{`
        .input-modern {
           width: 100%;
           padding: 1.5rem 2rem;
           background: #F8F9FA;
           border: 2px solid transparent;
           border-radius: 1.5rem;
           font-weight: 900;
           font-size: 0.9rem;
           color: #0F172A;
           transition: all 0.4s ease;
           outline: none;
        }
        .input-modern:focus {
           background: white;
           border-color: #C5A021;
           box-shadow: 0 20px 40px rgba(16, 137, 164, 0.05);
           transform: translateY(-2px);
        }
        @keyframes fade-in-up {
           from { opacity: 0; transform: translateY(20px); }
           to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease forwards; }
        .animate-shake { animation: shake 0.5s ease; }
        @keyframes shake {
           0%, 100% { transform: translateX(0); }
           25% { transform: translateX(-10px); }
           75% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
}

