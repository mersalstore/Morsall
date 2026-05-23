"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  ShieldCheck, 
  Check, 
  Info, 
  ArrowLeft 
} from "lucide-react";

const TRACKING_DATA_SAMPLES: Record<string, any> = {
  "MSL-9842-SD": {
    code: "MSL-9842-SD",
    origin: "بورتسودان (مركز التجميع البحري)",
    destination: "الخرطوم (مستودع بحري الرئيسي)",
    status: "in_transit",
    statusText: "قيد النقل - بين الولايات",
    currentLocation: "شندي - نقطة فحص المستندات والجمارك",
    eta: "24 مايو 2026 - 4:00 مساءً",
    percentage: 65,
    shipper: "الشركة السودانية للتقنية المحدودة",
    receiver: "محمد أحمد علي - الخرطوم",
    address: "حي المعمورة، شارع الستين، عمارة الياسمين",
    serviceType: "شحن وطني سريع مؤمن",
    paymentMethod: "تحويل مباشر (تطبيق بنكك) - مكتمل",
    weight: "2.5 كجم",
    shippingFee: "5,000 ج.س",
    packageItems: ["هاتف ذكي Morsall Nova S (عدد 1)", "حقيبة الظهر اللوجستية المصفحة (عدد 1)"],
    steps: [
      { name: "تم تسليم الشحنة لمركز التجميع بالميناء", date: "21 مايو 2026 - 09:30 ص", done: true },
      { name: "أكملت القافلة الفحص الجمركي وأوراق المرور", date: "22 مايو 2026 - 02:15 م", done: true },
      { name: "غادرت مركبات النقل الميناء باتجاه العاصمة", date: "23 مايو 2026 - 08:00 ص", done: true },
      { name: "وصول نقطة تفتيش شندي وفحص البيان اللوجستي", date: "23 مايو 2026 - 03:45 م", done: true, active: true },
      { name: "الوصول المتوقع لمركز فرز وتوزيع الخرطوم", date: "متوقع 24 مايو صباحاً", done: false },
      { name: "التسليم النهائي لموقع المستلم المعتمد", date: "متوقع 24 مايو مساءً", done: false }
    ]
  },
  "MSL-1025-SD": {
    code: "MSL-1025-SD",
    origin: "عطبرة (مركز الفرز الإقليمي)",
    destination: "أم درمان (حي الفتيحاب)",
    status: "delivered",
    statusText: "تم التسليم بنجاح",
    currentLocation: "أم درمان - مربع 5",
    eta: "تم التسليم في 22 مايو 2026 - 2:45 م",
    percentage: 100,
    shipper: "مجموعة المستقبل للإلكترونيات",
    receiver: "عبد الله عثمان النور - أم درمان",
    address: "حي الفتيحاب، مربع 5، شارع المدرسة",
    serviceType: "توصيل طرود سريع من الباب للباب",
    paymentMethod: "الدفع نقداً عند الاستلام (COD) - تم التحصيل",
    weight: "0.8 كجم",
    shippingFee: "3,500 ج.س",
    packageItems: ["سماعات لاسلكية عازلة للضوضاء Morsall Pulse Pro (عدد 1)"],
    steps: [
      { name: "استلام الطرد وتجهيزه بمستودع عطبرة", date: "20 مايو 2026 - 10:15 ص", done: true },
      { name: "شحن وتأمين البضاعة في وسيلة النقل البري", date: "21 مايو 2026 - 09:00 ص", done: true },
      { name: "الوصول لمركز توزيع أم درمان الرئيسي", date: "22 مايو 2026 - 08:30 ص", done: true },
      { name: "تسليم الطرد لمندوب التوصيل النهائي للمنزل", date: "22 مايو 2026 - 11:30 ص", done: true },
      { name: "تم تسليم الطلب للعميل واستلام التوقيع والتحصيل", date: "22 مايو 2026 - 02:45 م", done: true, active: true }
    ]
  }
};

export default function HomeShippingTracker() {
  const [trackingCode, setTrackingCode] = useState("MSL-9842-SD");
  const [trackingResult, setTrackingResult] = useState<any>(TRACKING_DATA_SAMPLES["MSL-9842-SD"]);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  const handleTrackingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTrackingLoading(true);
    setTrackingError("");
    setShowDetails(false);
    
    setTimeout(() => {
      const code = trackingCode.trim().toUpperCase();
      if (TRACKING_DATA_SAMPLES[code]) {
        setTrackingResult(TRACKING_DATA_SAMPLES[code]);
      } else {
        setTrackingError("لم يتم العثور على شحنة بهذا الرقم. يرجى تجربة الرموز التجريبية الموضحة بالأسفل.");
        setTrackingResult(null);
      }
      setIsTrackingLoading(false);
    }, 1000);
  };

  return (
    <section id="tracking" className="py-8 px-4 lg:px-8 max-w-[1600px] mx-auto w-full">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Tracking Form */}
          <div className="space-y-5 lg:border-l lg:border-slate-200 lg:pl-8">
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">نظام الاستعلام وتتبع الطرود</h3>
              <p className="text-xs text-slate-400 leading-relaxed">أدخل رقم بوليصة الشحن الخاص بمرسال لمتابعة مسار القافلة البرية المباشر وتحديثات التسليم.</p>
            </div>

            <form onSubmit={handleTrackingSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block">رقم بوليصة التتبع (الباركود)</label>
                <input 
                  type="text" 
                  placeholder="مثال: MSL-9842-SD" 
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-xs text-slate-800 placeholder:text-slate-400 font-bold focus:border-[#C5A021] focus:bg-white text-right focus:outline-none focus:ring-0"
                />
              </div>

              <button 
                type="submit" 
                disabled={isTrackingLoading}
                className="w-full py-2.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {isTrackingLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري جلب بيانات الشحنة...</span>
                  </>
                ) : (
                  <span>استعلام وتحديث الحالة</span>
                )}
              </button>
            </form>

            {/* Sample numbers */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-[10.5px] text-slate-500">
              <span className="font-bold block mb-1.5 text-slate-700">بيانات تجريبية صالحة للتتبع:</span>
              <div className="flex flex-col gap-y-1.5">
                <button onClick={() => { setTrackingCode("MSL-9842-SD"); }} className="underline text-[#C5A021] text-right font-bold hover:text-[#b08b1a]">MSL-9842-SD (بورتسودان ← الخرطوم)</button>
                <button onClick={() => { setTrackingCode("MSL-1025-SD"); }} className="underline text-[#C5A021] text-right font-bold hover:text-[#b08b1a]">MSL-1025-SD (عطبرة ← أم درمان)</button>
              </div>
            </div>

            {trackingError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-lg flex items-center gap-1.5">
                <Info className="w-4 h-4 shrink-0" />
                <span>{trackingError}</span>
              </div>
            )}
          </div>

          {/* Stepper Timeline & Order Details */}
          <div className="lg:col-span-2 flex flex-col justify-between min-h-[350px]">
            {trackingResult ? (
              <div className="space-y-6">
                {/* Status header summary */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded bg-[#C5A021]/10 flex items-center justify-center text-[#C5A021]">
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="text-right leading-none">
                      <span className="text-[8px] text-slate-400">رقم الشحنة</span>
                      <h4 className="text-sm font-black text-slate-800 mt-1">{trackingResult.code}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">الوضع الحالي:</span>
                    <span className="px-2.5 py-0.5 bg-[#C5A021]/10 border border-[#C5A021]/20 text-[#C5A021] font-bold text-[10px] rounded">
                      {trackingResult.statusText}
                    </span>
                  </div>
                </div>

                {/* Route points info grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400">نقطة المنشأ</span>
                    <span className="text-xs font-bold text-slate-700 mt-0.5 block">{trackingResult.origin}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400">نقطة الوصول</span>
                    <span className="text-xs font-bold text-slate-700 mt-0.5 block">{trackingResult.destination}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400">الموقع الحالي للناقل</span>
                    <span className="text-xs font-bold text-[#C5A021] mt-0.5 block">{trackingResult.currentLocation}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400">تاريخ الاستلام المتوقع</span>
                    <span className="text-xs font-bold text-slate-700 mt-0.5 block">{trackingResult.eta}</span>
                  </div>
                </div>

                {/* Detailed receipt button */}
                <div>
                  <button 
                    type="button"
                    onClick={() => setShowDetails(!showDetails)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <Info className="w-4 h-4 text-[#C5A021]" />
                    <span>{showDetails ? "إخفاء بوليصة وتفاصيل الطلب" : "عرض بوليصة وتفاصيل الطلب الكاملة"}</span>
                  </button>
                </div>

                {/* Shipment Details Box */}
                <AnimatePresence>
                  {showDetails && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 border border-slate-200 bg-slate-50 rounded-xl space-y-4 text-xs overflow-hidden"
                    >
                      <h4 className="font-black text-[#0F172A] border-b border-slate-200 pb-2 flex items-center justify-between">
                        <span>تفاصيل بوليصة الشحن الرسمية</span>
                        <span className="text-[10px] text-slate-400 font-bold">مرسال كارجو</span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 font-medium text-slate-600">
                        <div><span className="text-slate-400">الجهة الشاحنة:</span> <span className="font-bold text-slate-800">{trackingResult.shipper}</span></div>
                        <div><span className="text-slate-400">المستلم المعتمد:</span> <span className="font-bold text-slate-800">{trackingResult.receiver}</span></div>
                        <div className="md:col-span-2"><span className="text-slate-400">عنوان التسليم:</span> <span className="font-bold text-slate-800">{trackingResult.address}</span></div>
                        <div><span className="text-slate-400">نوع الخدمة:</span> <span className="font-bold text-slate-800">{trackingResult.serviceType}</span></div>
                        <div><span className="text-slate-400">طريقة التسوية المالية:</span> <span className="font-bold text-slate-800">{trackingResult.paymentMethod}</span></div>
                        <div><span className="text-slate-400">الوزن الإجمالي للطرود:</span> <span className="font-bold text-slate-800">{trackingResult.weight}</span></div>
                        <div><span className="text-slate-400">الرسوم المحصلة:</span> <span className="font-bold text-[#0F172A]">{trackingResult.shippingFee}</span></div>
                      </div>

                      <div className="border-t border-slate-200 pt-3">
                        <span className="text-[10px] text-slate-400 font-bold block mb-1.5">محتويات الطرد المسجلة:</span>
                        <ul className="list-disc list-inside space-y-1 text-slate-700 font-bold pl-2">
                          {trackingResult.packageItems.map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Vertical Timelines steps */}
                <div className="relative border-r-2 border-slate-100 mr-2 pr-6 py-2.5 space-y-6">
                  {trackingResult.steps.map((step: any, idx: number) => (
                    <div key={idx} className="relative flex flex-col items-start text-right">
                      
                      {/* Dot badge indicator */}
                      <div className={`absolute right-[-31px] top-0.5 w-3 h-3 rounded-full flex items-center justify-center border-2 ${
                        step.active 
                          ? "bg-white border-[#F29124] shadow-[0_0_0_3px_rgba(242,145,36,0.15)]" 
                          : step.done 
                          ? "bg-[#F29124] border-[#F29124]" 
                          : "bg-white border-slate-200"
                      }`}>
                        {step.done && !step.active && <Check className="w-1.5 h-1.5 text-white stroke-[3]" />}
                      </div>

                      <div className="space-y-0.5">
                        <h5 className={`text-xs font-bold ${step.active ? "text-[#F29124] text-sm" : step.done ? "text-slate-800" : "text-slate-400"}`}>
                          {step.name}
                        </h5>
                        <span className="text-[9px] text-slate-400 block">{step.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-20 space-y-3 bg-slate-50 border border-slate-100 rounded-xl">
                <Package className="w-12 h-12 text-slate-300" />
                <h4 className="font-bold text-xs text-slate-400">يرجى إدخال بوليصة الشحن لعرض حالة وتفاصيل مسار الطرد</h4>
              </div>
            )}

            <div className="border-t border-slate-100 pt-4 mt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 gap-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                شحن مؤمن عليه بالكامل ضد المخاطر المعتمدة
              </span>
              <span>تحديث تلقائي لحركة الشاحنات كل ساعة</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
