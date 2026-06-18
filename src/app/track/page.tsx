"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTrackingData = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/orders/track?id=${id.trim()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل جلب بيانات التتبع");
      }
      setTrackingResult(data);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء البحث");
      setTrackingResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await fetchTrackingData(orderId);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      if (id) {
        setOrderId(id);
        fetchTrackingData(id);
      }
    }
  }, []);

  // Poll for live GPS tracking updates
  useEffect(() => {
    if (!trackingResult || (trackingResult.status !== "SHIPPED" && trackingResult.status !== "PACKING")) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/track?id=${trackingResult.id}`);
        if (res.ok) {
          const data = await res.json();
          setTrackingResult(data);
        }
      } catch (e) {
        console.error("Polled tracking update failed", e);
      }
    }, 15000); // 15 seconds poll

    return () => clearInterval(interval);
  }, [trackingResult]);

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
                {error && (
                  <p className="text-center text-xs font-bold text-red-500">{error}</p>
                )}
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
            <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 space-y-8">
               <div className="bg-[#0F172A] text-white p-12 rounded-[3rem] border border-white/5 relative overflow-hidden">
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

               {/* Live Map Tracking */}
               {trackingResult.trackingLat && trackingResult.trackingLng && (
                 <div className="bg-muted p-8 rounded-[3rem] border border-border/10 shadow-elite space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100">
                      <div>
                        <h4 className="text-lg font-black text-primary">الموقع المباشر للمندوب</h4>
                        <p className="text-[11px] text-[#C5A021] font-bold uppercase tracking-widest mt-0.5">تتبع المندوب على الخريطة في الوقت الفعلي</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 items-center">
                        {trackingResult.distanceRemaining && (
                          <div className="bg-[#F29124]/10 text-[#F29124] px-4 py-2 rounded-xl text-xs font-black">
                            المسافة: {trackingResult.distanceRemaining}
                          </div>
                        )}
                        <span className="bg-green-500/10 text-green-600 px-4 py-2 rounded-xl text-xs font-black animate-pulse flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                          بث مباشر نشط
                        </span>
                      </div>
                    </div>
                   
                   <div className="w-full h-80 rounded-[2rem] overflow-hidden border-2 border-border/15 shadow-inner relative">
                     <iframe
                       src={`https://maps.google.com/maps?q=${trackingResult.trackingLat},${trackingResult.trackingLng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                       className="w-full h-full border-none"
                       allowFullScreen
                       loading="lazy"
                     />
                   </div>

                   {trackingResult.driver && (
                     <div className="bg-white p-6 rounded-2xl border border-border/10 flex flex-col md:flex-row gap-4 items-center justify-between" dir="rtl">
                       <div className="flex items-center gap-4 w-full md:w-auto">
                         <div className="w-12 h-12 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-black text-lg">
                           {trackingResult.driver.name[0]}
                         </div>
                         <div>
                           <h5 className="font-bold text-sm text-primary">{trackingResult.driver.name}</h5>
                           <p className="text-[10px] text-primary/40 mt-0.5">{trackingResult.driver.vehicleType}</p>
                         </div>
                       </div>
                       <a
                         href={`tel:${trackingResult.driver.phone}`}
                         className="w-full md:w-auto text-center px-4 py-2.5 bg-[#C5A021] text-white hover:bg-[#b08e1c] rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                       >
                         <span className="material-symbols-rounded text-sm">phone_enabled</span>
                         اتصال بالمندوب
                       </a>
                     </div>
                   )}
                 </div>
               )}

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
