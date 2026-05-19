"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function DriverPortal() {
  const { driverId } = useParams();
  const [driver, setDriver] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  
  const timerRef = useRef<any>(null);

  const fetchOrders = async () => {
    try {
      const r = await fetch(`/api/delivery/orders?driverId=${driverId}`);
      if (!r.ok) throw new Error("فشل تحميل البيانات");
      const data = await r.json();
      setDriver(data.driver);
      setOrders(data.orders);
      setIsOnline(data.driver?.isOnline || false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [driverId]);

  const toggleDuty = async () => {
    try {
      const newStatus = !isOnline;
      setIsOnline(newStatus);
      await fetch(`/api/delivery/driver/${driverId}`, {
        method: "PATCH",
        body: JSON.stringify({ isOnline: newStatus })
      });
    } catch (err) {}
  };

  // ── GPS Tracking & Delivery Handling ──
  const startTracking = (orderId: string) => {
    if (activeOrderId === orderId) {
      // Stop tracking
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setActiveOrderId(null);
      setIsTracking(false);
      return;
    }

    // Start tracking
    setActiveOrderId(orderId);
    setIsTracking(true);

    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const res = await fetch("/api/delivery/tracking", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, lat: latitude, lng: longitude })
              });
              if (res.ok) {
                setLastUpdate(new Date());
              }
            } catch (err) {
              console.error("Location update failed:", err);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
          },
          { enableHighAccuracy: true }
        );
      } else {
        console.warn("Geolocation not supported by this browser.");
      }
    };

    // Run immediately and then every 10 seconds
    updateLocation();
    timerRef.current = setInterval(updateLocation, 10000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleMarkDelivered = async (orderId: string) => {
    if (!confirm("هل أنت متأكد من تسليم هذا الطلب للعميل؟")) return;

    try {
      setLoading(true);
      const res = await fetch("/api/delivery/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: "DELIVERED" })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "فشل تحديث حالة الطلب");
      }

      alert("تم تأكيد تسليم الطلب بنجاح وتحديث حسابك المالي.");
      
      // Stop tracking if this was the active tracking order
      if (activeOrderId === orderId) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setActiveOrderId(null);
        setIsTracking(false);
      }

      await fetchOrders();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };


  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center font-bold text-[#C5A021]">جاري التحميل...</div>;
  if (error) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center font-bold text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-10 font-black" dir="rtl">
      {/* Driver Header Card */}
      <header className="bg-[#0F172A] text-white p-8 shadow-2xl rounded-b-[3rem] relative overflow-hidden">
         <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#C5A021] flex items-center justify-center text-2xl shadow-lg shadow-[#C5A021]/20">
                     {driver?.name?.[0]}
                  </div>
                  <div>
                     <h1 className="text-xl leading-none mb-1">{driver?.name}</h1>
                     <p className="text-[10px] text-white/40 uppercase tracking-widest">{driver?.vehicleType} • {driver?.phone}</p>
                  </div>
               </div>
               <button 
                 onClick={toggleDuty}
                 className={cn(
                   "px-6 py-2.5 rounded-full text-[10px] transition-all border shadow-lg",
                   isOnline 
                    ? "bg-green-500/20 border-green-500 text-green-500 shadow-green-500/20" 
                    : "bg-red-500/20 border-red-500 text-red-500 shadow-red-500/20"
                 )}
               >
                 {isOnline ? "متصل - متاح" : "غير متصل - مشغول"}
               </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10">
                  <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">المحفظة الحالية</p>
                  <p className="text-xl text-[#F29124]">{driver?.balance?.toLocaleString() || 0} <span className="text-[10px]">SDG</span></p>
               </div>
               <div className="bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10">
                  <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">الطلبات المكتملة</p>
                  <p className="text-xl text-[#C5A021]">12</p>
               </div>
            </div>
         </div>
         <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#C5A021]/10 rounded-full blur-3xl" />
      </header>

      <main className="p-4 space-y-6 max-w-lg mx-auto -mt-6 relative z-20">
         {/* Live Status Banner */}
         {isTracking && (
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
             className="bg-[#F29124] p-4 rounded-3xl text-white flex items-center justify-between shadow-xl shadow-[#F29124]/20"
           >
              <div className="flex items-center gap-3">
                 <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                 <span className="text-xs">جاري بث موقعك للعميل الآن</span>
              </div>
              <p className="text-[10px] opacity-60">تحديث تلقائي</p>
           </motion.div>
         )}

         <div className="flex items-center justify-between px-2">
           <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-widest">المهام الجارية</h2>
           <span className="bg-white px-3 py-1 rounded-full text-[10px] text-gray-400 border border-gray-100 shadow-sm">{orders.length} طلب</span>
         </div>

         <div className="space-y-4">
           {orders.map((order) => (
             <div key={order.id} className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-gray-200/40 border border-gray-100 space-y-6">
                <div className="flex justify-between items-start">
                   <div>
                      <p className="text-[9px] text-gray-400 font-mono">ORDER #{order.id.slice(-6).toUpperCase()}</p>
                      <h3 className="text-lg text-[#0F172A] mt-1">{order.customerName}</h3>
                   </div>
                   <div className="text-left">
                      <p className="text-xs font-black text-[#C5A021]">{order.totalAmount.toLocaleString()} SDG</p>
                      <p className="text-[9px] text-gray-400 mt-1 uppercase">الدفع: {order.paymentMethod}</p>
                   </div>
                </div>

                <div className="space-y-3">
                   <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                         <span className="material-symbols-rounded text-lg">location_on</span>
                      </div>
                      <div className="min-w-0">
                         <p className="text-[10px] text-gray-400 mb-0.5">عنوان التوصيل</p>
                         <p className="text-xs text-[#0F172A] truncate">{order.city} - {order.district} - {order.street}</p>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                         <span className="material-symbols-rounded text-lg">phone_enabled</span>
                      </div>
                      <div>
                         <p className="text-[10px] text-gray-400 mb-0.5">رقم التواصل</p>
                         <a href={`tel:${order.phone}`} className="text-xs text-[#C5A021] font-black underline">{order.phone}</a>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                   <button 
                     onClick={() => startTracking(order.id)}
                     className={cn(
                       "flex flex-col items-center justify-center p-5 rounded-[1.5rem] border-2 transition-all",
                       activeOrderId === order.id 
                         ? "bg-[#F29124] border-[#F29124] text-white shadow-xl shadow-[#F29124]/20" 
                         : "bg-gray-50 border-transparent text-gray-400"
                     )}
                   >
                      <span className="material-symbols-rounded mb-1">{activeOrderId === order.id ? "share_location" : "near_me"}</span>
                      <span className="text-[10px]">{activeOrderId === order.id ? "إيقاف البث" : "بدء الرحلة"}</span>
                   </button>
                   <button 
                     onClick={() => handleMarkDelivered(order.id)}
                     className="flex flex-col items-center justify-center p-5 bg-[#0F172A] text-white rounded-[1.5rem] shadow-xl shadow-[#0F172A]/10"
                   >
                      <span className="material-symbols-rounded mb-1">task_alt</span>
                      <span className="text-[10px]">تأكيد التسليم</span>
                   </button>
                </div>

                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.city} ${order.district} ${order.street}`)}`}
                  target="_blank"
                  className="block text-center py-4 text-[10px] text-[#C5A021] hover:bg-gray-50 rounded-2xl transition-all border border-dashed border-gray-100"
                >
                  فتح في خرائط Google ↗
                </a>
             </div>
           ))}

           {orders.length === 0 && (
             <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <span className="material-symbols-rounded text-4xl text-gray-200">delivery_dining</span>
                </div>
                <p className="text-gray-400">لا توجد مهام نشطة حالياً</p>
                <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-widest">تأكد من وضعية "متصل" لاستلام طلبات</p>
             </div>
           )}
         </div>
      </main>
      
    </div>
  );
}
