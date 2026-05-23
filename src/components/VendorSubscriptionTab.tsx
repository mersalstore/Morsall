"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Crown, Sparkles, ShoppingBag, Check, ChevronLeft, Loader2,
  AlertTriangle, CreditCard, Upload, Zap, CheckCircle2, XCircle,
  Building2, Landmark
} from "lucide-react";

interface Plan {
  slug: string;
  name: string;
  price: number;
  durationDays: number;
  canUploadProducts: boolean;
  canUseBuilder: boolean;
  canCustomDesign: boolean;
  maxProducts: number;
  maxBlocks: number;
  features: string[];
  stripePriceId?: string;
  id?: string;
}

interface CurrentPlan {
  tier: string;
  planName: string;
  isActive: boolean;
  subscriptionEndsAt: string | null;
  canUploadProducts: boolean;
  canUseBuilder: boolean;
  canCustomDesign: boolean;
  maxProducts: number;
  maxBlocks: number;
}

interface BankAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions?: string;
  qrCode?: string;
}

export default function VendorSubscriptionTab() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [showPayment, setShowPayment] = useState<string | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [step, setStep] = useState<"plans" | "payment" | "result">("plans");

  useEffect(() => {
    async function load() {
      try {
        const [plansRes, planRes, settingsRes] = await Promise.all([
          fetch("/api/vendor/plans"),
          fetch("/api/vendor/plan"),
          fetch("/api/admin/settings/appearance"),
        ]);
        if (plansRes.ok) {
          const data = await plansRes.json();
          setPlans(data.plans);
        }
        if (planRes.ok) {
          const data = await planRes.json();
          setCurrentPlan(data);
        }
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          const s = data.settings;
          try {
            if (s?.bankAccounts) {
              const parsed = JSON.parse(s.bankAccounts);
              if (Array.isArray(parsed)) { setBankAccounts(parsed); setLoading(false); return; }
            }
          } catch {}
          if (s?.bankName || s?.bankAccountNumber) {
            setBankAccounts([{
              bankName: s.bankName || "",
              accountName: s.bankAccountName || "",
              accountNumber: s.bankAccountNumber || "",
              instructions: s.bankTransferInstructions || "",
            }]);
          }
        }
      } catch {
        setError("فشل تحميل الخطط");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubscribe = async (planSlug: string) => {
    if (planSlug === "freemium") return;
    const plan = plans.find(p => p.slug === planSlug);
    if (!plan) return;
    setSelectedPlan(plan);
    setShowPayment(planSlug);
    setStep("payment");
    setPaymentScreenshot(null);
    setVerifyResult(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPlan) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setPaymentScreenshot(data.url);
      }
    } catch {}
    setIsUploading(false);
  };

  const handleVerifyAndSubscribe = async () => {
    if (!paymentScreenshot || !selectedPlan) return;
    setIsVerifying(true);
    setError("");
    try {
      const res = await fetch("/api/vendor/subscribe-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planSlug: selectedPlan.slug,
          paymentScreenshot,
        }),
      });
      const data = await res.json();
      setVerifyResult(data);

      if (data.autoVerified) {
        setCurrentPlan(prev => prev ? {
          ...prev,
          tier: data.tier,
          planName: selectedPlan.name,
          isActive: true,
          subscriptionEndsAt: data.subscriptionEndsAt,
          canUploadProducts: true,
          canUseBuilder: true,
          canCustomDesign: selectedPlan.slug === "custom-design",
        } : prev);
      }
      setStep("result");
    } catch {
      setError("فشل الاتصال بالخادم");
    }
    setIsVerifying(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A021]" />
      </div>
    );
  }

  const currentTier = currentPlan?.tier || "FREEMIUM";
  const isBasic = currentTier === "FREEMIUM";
  const isPremium = currentTier === "PREMIUM_BUILDER";
  const isCustom = currentTier === "CUSTOM_DESIGN";

  const planIcons: Record<string, any> = {
    freemium: ShoppingBag,
    "premium-builder": Crown,
    "custom-design": Sparkles,
  };

  const planColors: Record<string, string> = {
    freemium: "from-gray-400 to-gray-500",
    "premium-builder": "from-[#C5A021] to-[#F29124]",
    "custom-design": "from-[#0F172A] to-[#1a2744]",
  };

  if (step === "payment" && selectedPlan && showPayment) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <button onClick={() => { setStep("plans"); setShowPayment(null); }} className="text-sm font-bold text-[#C5A021] hover:underline flex items-center gap-1">
          <ChevronLeft size={16} /> العودة للخطط
        </button>

        {/* Plan Summary */}
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1a2744] p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">الباقة المختارة</p>
            <h3 className="text-3xl font-black mt-2">{selectedPlan.name}</h3>
            <p className="text-4xl font-black text-[#C5A021] mt-4">{selectedPlan.price.toLocaleString()} <span className="text-sm">ج.س / شهرياً</span></p>
          </div>
          <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-[#C5A021]/10 rounded-full blur-[80px]" />
        </div>

        {/* Bank Accounts */}
        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 space-y-4">
          <h4 className="font-black text-[#0F172A] flex items-center gap-2">
            <Landmark size={20} className="text-[#C5A021]" />
            حسابات التحويل البنكي
          </h4>
          <p className="text-xs text-gray-400 font-bold">قم بتحويل المبلغ إلى أحد الحسابات التالية ثم ارفع صورة الإيصال</p>
          <div className="grid gap-4">
            {bankAccounts.map((acc, i) => (
              <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-[#C5A021]">
                  <Building2 size={16} />
                  <span className="font-black text-sm">{acc.bankName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400 font-bold">اسم الحساب</p>
                    <p className="font-black text-[#0F172A]">{acc.accountName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-bold">رقم الحساب</p>
                    <p className="font-black text-[#0F172A] direction-ltr text-left">{acc.accountNumber}</p>
                  </div>
                </div>
                {acc.instructions && (
                  <p className="text-[10px] text-gray-400 font-bold mt-1">{acc.instructions}</p>
                )}
              </div>
            ))}
            {bankAccounts.length === 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                <p className="text-amber-600 font-bold text-xs">لم يتم إضافة حسابات بنكية بعد، يرجى التواصل مع الإدارة</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Screenshot */}
        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 space-y-4">
          <h4 className="font-black text-[#0F172A] flex items-center gap-2">
            <Upload size={20} className="text-[#C5A021]" />
            رفع إيصال التحويل
          </h4>
          <p className="text-xs text-gray-400 font-bold">ارفع صورة الإيصال وسيقوم الذكاء الاصطناعي بتحليلها تلقائياً</p>

          <label className={cn(
            "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all",
            paymentScreenshot ? "border-green-400 bg-green-50" : "border-gray-300 bg-gray-50 hover:border-[#C5A021]"
          )}>
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-[#C5A021]" />
            ) : paymentScreenshot ? (
              <div className="relative w-full h-full">
                <Image src={paymentScreenshot} alt="الإيصال" fill className="object-contain p-2" />
                <div className="absolute top-2 right-2 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center">
                  <Check size={14} />
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Upload size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-400">اضغط لرفع صورة الإيصال</p>
                <p className="text-[9px] text-gray-300 mt-1">PNG, JPG - مقاس واضح</p>
              </div>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
          </label>

          {paymentScreenshot && (
            <button
              onClick={handleVerifyAndSubscribe}
              disabled={isVerifying}
              className="w-full py-4 bg-[#C5A021] text-white rounded-2xl font-black text-sm shadow-lg shadow-[#C5A021]/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isVerifying ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> جاري التحليل والتحقق...</>
              ) : (
                <><Zap size={18} /> تأكيد الاشتراك والتحقق بالذكاء الاصطناعي</>
              )}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-red-600 font-bold text-sm">{error}</p>
          </div>
        )}
      </div>
    );
  }

  if (step === "result" && verifyResult) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className={cn(
          "rounded-[2rem] p-10 text-center border-2",
          verifyResult.autoVerified ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
        )}>
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
            verifyResult.autoVerified ? "bg-green-100" : "bg-amber-100"
          )}>
            {verifyResult.autoVerified ? (
              <CheckCircle2 size={40} className="text-green-600" />
            ) : (
              <Clock size={40} className="text-amber-600" />
            )}
          </div>
          <h3 className={cn(
            "text-2xl font-black mb-2",
            verifyResult.autoVerified ? "text-green-700" : "text-amber-700"
          )}>
            {verifyResult.autoVerified ? "✅ تم تفعيل الاشتراك بنجاح!" : "📤 تم استلام طلب الاشتراك"}
          </h3>
          <p className="text-sm font-bold text-gray-500">{verifyResult.message}</p>

          {verifyResult.confidence !== undefined && (
            <div className="mt-4 bg-white rounded-2xl p-4 border border-gray-100 inline-block">
              <p className="text-[10px] font-black text-gray-400">نسبة تطابق AI</p>
              <p className={cn(
                "text-2xl font-black",
                verifyResult.confidence >= 85 ? "text-green-600" : verifyResult.confidence >= 50 ? "text-amber-600" : "text-red-600"
              )}>
                {verifyResult.confidence}%
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => { setStep("plans"); setShowPayment(null); setVerifyResult(null); }}
          className="w-full py-4 bg-[#0F172A] text-white rounded-2xl font-black text-sm hover:bg-[#C5A021] transition-all"
        >
          العودة للخطط
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-black text-[#0F172A]">الخطط والاشتراكات</h3>
        <p className="text-sm text-gray-400 font-bold mt-1">اختر الباقة المناسبة لمتجرك</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-red-600 font-bold text-sm">{error}</p>
        </div>
      )}

      {currentPlan && currentPlan.isActive && !isBasic && (
        <div className="bg-[#0F172A] p-6 md:p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="bg-white/10 px-3 py-1 rounded-full inline-flex items-center gap-2 border border-white/10 mb-4">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">نشط</span>
              </div>
              <p className="text-2xl font-black">{currentPlan.planName}</p>
              {currentPlan.subscriptionEndsAt && (
                <p className="text-white/60 text-xs font-bold mt-2">
                  ينتهي في: {new Date(currentPlan.subscriptionEndsAt).toLocaleDateString("ar-EG")}
                </p>
              )}
            </div>
            <div className="text-left">
              <p className="text-3xl font-black text-[#C5A021]">
                {isPremium ? "Premium" : "مخصص"}
              </p>
            </div>
          </div>
          <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-[#C5A021]/10 rounded-full blur-[80px]" />
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = planIcons[plan.slug] || ShoppingBag;
          const isCurrentPlan =
            (plan.slug === "freemium" && isBasic) ||
            (plan.slug === "premium-builder" && isPremium) ||
            (plan.slug === "custom-design" && isCustom);
          const isLoading = subscribing === plan.slug;

          return (
            <div
              key={plan.slug}
              className={cn(
                "bg-white border-2 rounded-3xl p-6 flex flex-col justify-between gap-6 transition-all hover:shadow-xl",
                isCurrentPlan
                  ? "border-[#C5A021] shadow-lg shadow-[#C5A021]/10"
                  : "border-gray-100 hover:border-[#C5A021]/30"
              )}
            >
              <div>
                <div className={cn(
                  "w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4",
                  planColors[plan.slug]
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-black text-[#0F172A] mb-1">{plan.name}</h4>
                <p className="text-3xl font-black text-[#C5A021] mb-4">
                  {plan.price === 0 ? "مجاني" : `${plan.price.toLocaleString()} ج.س`}
                  {plan.price > 0 && <span className="text-xs font-bold text-gray-400"> / شهرياً</span>}
                </p>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm font-bold text-gray-600">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                  <li className="flex items-center gap-2 text-sm font-bold text-gray-600">
                    <Check className={cn("w-4 h-4 shrink-0", plan.canUploadProducts ? "text-green-500" : "text-gray-300")} />
                    رفع المنتجات
                  </li>
                  <li className="flex items-center gap-2 text-sm font-bold text-gray-600">
                    <Check className={cn("w-4 h-4 shrink-0", plan.canUseBuilder ? "text-green-500" : "text-gray-300")} />
                    منشئ المواقع
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleSubscribe(plan.slug)}
                disabled={isCurrentPlan || isLoading || plan.slug === "freemium"}
                className={cn(
                  "w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2",
                  isCurrentPlan
                    ? "bg-gray-100 text-gray-400 cursor-default"
                    : "bg-[#0F172A] text-white hover:bg-[#C5A021] hover:scale-[1.02] active:scale-95",
                  isLoading && "opacity-50"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCurrentPlan ? (
                  "خطتك الحالية"
                ) : (
                  <>
                    اشترك الآن
                    <ChevronLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Clock icon for pending state
function Clock(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
