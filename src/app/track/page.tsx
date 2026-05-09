"use client"

import { useState } from "react";
import PageHeader from "@/components/PageHeader";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    setLoading(true);
    
    // Simulate API call for now
    setTimeout(() => {
      setTrackingResult({
        id: orderId,
        status: "SHIPPED",
        statusLabel: "جاري التوصيل",
        lastUpdate: "منذ ساعتين - الخرطوم، حي المعمورة",
        estimatedArrival: "اليوم قبل الساعة 6 مساءً",
        history: [
          { time: "09:00 AM", event: "خرجت الشحنة للتوصيل مع المندوب" },
          { time: "الأمس 04:30 PM", event: "وصلت الشحنة إلى مركز توزيع الخرطوم" },
          { time: "05 May 10:00 AM", event: "تم استلام الطلب وتجهيزه" },
        ]
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="تتبع شحنتك" 
        subtitle="Sovereign Tracking" 
        icon="location_on" 
      />
      
      <div className="responsive-container py-24 max-w-3xl">
        <div className="space-y-16">
          {/* Tracking Form */}
          <div className="bg-muted p-12 rounded-[3rem] border border-border/10 shadow-elite">
             <div className="text-center mb-10">
                <h2 className="text-2xl font-black text-primary mb-2">أدخل رقم الطلب</h2>
                <p className="text-primary/40 text-xs font-bold uppercase tracking-widest">ستجده في رسالة تأكيد الطلب</p>
             </div>
             
             <form onSubmit={handleTrack} className="space-y-6">
                <div className="relative">
                   <input 
                      type="text" 
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="MORS-12345678"
                      className="w-full bg-white border border-border/10 rounded-2xl px-8 py-6 text-lg font-black text-center outline-none focus:border-accent transition-all uppercase tracking-widest"
                   />
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                      <span className="material-symbols-rounded text-3xl">qr_code_scanner</span>
                   </div>
                </div>
                <button 
                   type="submit" 
                   disabled={loading}
                   className="btn-primary w-full py-6 text-lg shadow-elite-lg"
                >
                   {loading ? "جاري البحث..." : "تتبع الآن"}
                </button>
             </form>
          </div>

          {/* Results Display */}
          {trackingResult && (
            <div className="animate-in fade-in slide-in-from-bottom-12 duration-700">
               <div className="bg-[#021D24] text-white p-12 rounded-[3rem] border border-white/5 relative overflow-hidden mb-8">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full" />
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                     <div className="text-center md:text-right">
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">حالة الطلب الحالية</p>
                        <h3 className="text-3xl font-black text-accent">{trackingResult.statusLabel}</h3>
                     </div>
                     <div className="h-20 w-px bg-white/10 hidden md:block" />
                     <div className="text-center md:text-left">
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">الوصول المتوقع</p>
                        <h3 className="text-xl font-black">{trackingResult.estimatedArrival}</h3>
                     </div>
                  </div>
               </div>

               <div className="space-y-8 px-8">
                  <h4 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-3">
                     <span className="w-8 h-1 bg-accent rounded-full" />
                     سجل التتبع
                  </h4>
                  <div className="space-y-10 relative">
                     <div className="absolute right-[11px] top-2 bottom-2 w-0.5 bg-border/10" />
                     {trackingResult.history.map((item: any, i: number) => (
                       <div key={i} className="relative pr-12 group">
                          <div className={`absolute right-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-lg z-10 transition-colors ${i === 0 ? 'bg-accent' : 'bg-border/20'}`} />
                          <div>
                             <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest mb-1">{item.time}</p>
                             <p className={`text-sm font-bold ${i === 0 ? 'text-primary' : 'text-primary/60'}`}>{item.event}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
