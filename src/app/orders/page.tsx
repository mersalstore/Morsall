"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");

  useEffect(() => {
    if (status === "authenticated") {
      fetchOrders();
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [status]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("فشل جلب الطلبات");
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = activeTab === "current" 
    ? orders.filter(o => !["تم التوصيل", "ملغي"].includes(o.status)) 
    : orders.filter(o => ["تم التوصيل", "ملغي"].includes(o.status));

  if (status === "loading") return <div className="min-h-screen bg-muted/10 pt-44 text-center font-black text-[#C5A021]">جاري تحميل السجلات السيادية...</div>;

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen pt-44 flex flex-col items-center justify-center px-6 text-center space-y-8 bg-muted/10">
         <div className="w-24 h-24 bg-red-50 text-[#CB2E26] rounded-full flex items-center justify-center shadow-inner">
            <span className="material-symbols-rounded text-5xl">lock_person</span>
         </div>
         <div className="space-y-4">
            <h1 className="text-3xl font-black text-[#0F172A]">الوصول مقيد 🔐</h1>
            <p className="text-gray-400 font-bold max-w-sm mx-auto">لعرض سجل مشترياتك وطلباتك السيادية، يجب عليك تسجيل الدخول أولاً.</p>
         </div>
         <Link href="/login?callbackUrl=/orders" className="bg-[#C5A021] text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:scale-105 transition-all">تسجيل الدخول</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-44 pb-32 px-6 lg:px-12 bg-muted/10" dir="rtl">
      <div className="max-w-[1200px] mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="space-y-4">
              <h1 className="text-5xl font-black text-[#0F172A] tracking-tighter">مذكرات <span className="text-[#C5A021]">السيادة</span></h1>
              <p className="text-gray-400 font-bold">تتبع مشترياتك وإدارة طلباتك المفعلة عبر منصة مرسال.</p>
           </div>
           
           <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <button 
                onClick={() => setActiveTab("current")}
                className={cn(
                  "px-8 py-3 text-xs font-black rounded-xl transition-all",
                  activeTab === "current" ? "bg-[#0F172A] text-white shadow-xl" : "text-gray-400 hover:text-[#0F172A]"
                )}
              >
                 الطلبات النشطة
              </button>
              <button 
                onClick={() => setActiveTab("history")}
                className={cn(
                  "px-8 py-3 text-xs font-black rounded-xl transition-all",
                  activeTab === "history" ? "bg-[#0F172A] text-white shadow-xl" : "text-gray-400 hover:text-[#0F172A]"
                )}
              >
                 سجل المشتريات
              </button>
           </div>
        </div>

        {/* Content Section */}
        <div className="space-y-8">
           {isLoading ? (
             <div className="space-y-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white h-64 rounded-[3rem] border border-gray-100 animate-pulse" />
                ))}
             </div>
           ) : error ? (
             <div className="bg-red-50 p-12 rounded-[3rem] border border-red-100 text-center space-y-4">
                <span className="material-symbols-rounded text-red-500 text-5xl">warning</span>
                <p className="text-red-700 font-black">{error}</p>
                <button onClick={fetchOrders} className="bg-red-500 text-white px-8 py-3 rounded-xl font-bold text-xs">إعادة المحاولة</button>
             </div>
           ) : filteredOrders.length === 0 ? (
             <div className="bg-white p-24 rounded-[3.5rem] border border-gray-100 text-center space-y-8 shadow-sm">
                <div className="w-32 h-32 bg-muted/30 rounded-full flex items-center justify-center mx-auto">
                   <span className="material-symbols-rounded text-7xl text-gray-200">shopping_bag</span>
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-black text-[#0F172A]">لا توجد سجلات {activeTab === "current" ? "نشطة" : "سابقة"}</h3>
                   <p className="text-gray-400 font-bold">لم تكتمل المراسلات لهذا النطاق بعد.</p>
                </div>
                <Link href="/shop" className="inline-block bg-[#C5A021] text-white px-16 py-5 rounded-3xl font-black text-xs shadow-xl shadow-[#C5A021]/20 hover:bg-[#0F172A] transition-all">اكتشف العالم الآن</Link>
             </div>
           ) : (
             filteredOrders.map(order => (
               <div key={order.id} className="bg-white rounded-[3.5rem] border border-gray-100 shadow-4xl hover:shadow-elite-xl transition-all duration-500 overflow-hidden group">
                  {/* Order Progress Header */}
                  <div className="bg-[#F8F9FA] px-10 py-8 flex flex-wrap items-center justify-between gap-8 border-b border-gray-50">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                           <span className="material-symbols-rounded text-[#C5A021] text-3xl">terminal</span>
                        </div>
                        <div className="space-y-1">
                           <h4 className="text-xl font-black text-[#0F172A] tracking-tight uppercase">OrderID: {order.id.slice(-6)}</h4>
                           <span className="text-[10px] font-black text-[#C5A021] uppercase tracking-[0.4em]">{format(new Date(order.createdAt), "do MMMM yyyy", { locale: ar })}</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className={cn(
                          "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                          order.status === "تم التوصيل" ? "bg-green-50 text-green-500" : "bg-[#C5A021]/5 text-[#C5A021]"
                        )}>
                           {order.status}
                        </span>
                        <div className="text-left">
                           <p className="text-[10px] font-black text-gray-300 uppercase underline decoration-[#CB2E26] decoration-2 underline-offset-4">الإجمالي المستحق</p>
                           <p className="text-xl font-black text-[#CB2E26] mt-1">{order.totalAmount.toLocaleString()} ج.س</p>
                        </div>
                     </div>
                  </div>

                  {/* Items List */}
                  <div className="p-10 space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex gap-6 items-center p-6 bg-muted/20 rounded-[2.5rem] hover:bg-[#C5A021]/5 transition-colors group/item">
                             <div className="w-24 h-24 relative bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-50 group-hover/item:scale-105 transition-transform">
                                <Image src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1557683316-973673baf926"} alt={item.product?.title} fill className="object-cover" />
                             </div>
                             <div className="flex flex-col space-y-1">
                                <p className="text-[10px] font-black text-[#C5A021] uppercase tracking-widest">{item.vendor?.storeName || "متجر مرسال"}</p>
                                <h5 className="text-sm font-black text-[#0F172A] line-clamp-1">{item.product?.title}</h5>
                                <div className="flex items-center gap-4 mt-1">
                                   <span className="text-xs font-bold text-gray-400">الكمية: {item.quantity}</span>
                                   <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                                   <span className="text-xs font-black text-[#CB2E26]">{item.priceAtTime.toLocaleString()} ج.س</span>
                                </div>
                             </div>
                          </div>
                        ))}
                     </div>

                     {/* Action Buttons */}
                     <div className="pt-8 border-t border-gray-50 flex flex-wrap justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                           <span className="material-symbols-rounded text-gray-400">location_on</span>
                           <span className="text-xs font-bold text-gray-400">{order.city}, {order.street}</span>
                        </div>
                        <div className="flex gap-4">
                           <button className="px-10 py-5 rounded-[2rem] border-4 border-gray-50 text-[10px] font-black text-gray-300 hover:border-[#C5A021] hover:text-[#C5A021] transition-all">تفاصيل المعاملة</button>
                           {activeTab === "current" && (
                             <Link href={`/delivery?track=${order.id}`} className="px-12 py-5 rounded-[2rem] bg-[#C5A021] text-white text-[10px] font-black shadow-xl shadow-[#C5A021]/20 hover:bg-[#0F172A] transition-all flex items-center gap-3">
                                تتبع الشحنة <span className="material-symbols-rounded text-sm">trending_flat</span>
                             </Link>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}

