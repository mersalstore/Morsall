import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";


interface ItemDetailsModalProps {
  isOpen: boolean;
  type: "users" | "vendors";
  item: any;
  onClose: () => void;
}

export default function ItemDetailsModal({ isOpen, type, item, onClose }: ItemDetailsModalProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editSubscription, setEditSubscription] = useState(false);
  const [newExpiry, setNewExpiry] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isOpen && type === "vendors" && item?.id) {
      fetchProducts();
      if (item.subscriptionEndsAt) {
        setNewExpiry(new Date(item.subscriptionEndsAt).toISOString().split('T')[0]);
      }
    }
  }, [isOpen, item, type]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`/api/admin/inventory?vendorId=${item.id}`);
      if (res.ok) {
        setProducts(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch products:", e);
    }
    setLoadingProducts(false);
  };

  const handleUpdateSubscription = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/vendors`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          subscriptionEndsAt: new Date(newExpiry).toISOString()
        })
      });
      if (res.ok) {
        alert("تم تحديث الاشتراك بنجاح");
        setEditSubscription(false);
        // We might want to refresh the parent data here, but for now we just close
      }
    } catch (e) {
      alert("فشل تحديث الاشتراك");
    }
    setIsUpdating(false);
  };

  if (!isOpen || !item) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6" dir="rtl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }} 
          className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-2xl font-black text-[#0F172A]">
                {type === "users" ? "تفاصيل العميل" : "تفاصيل المتجر"}
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                ID: {item.id}
              </p>
            </div>
            <button onClick={onClose} className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
              <span className="material-symbols-rounded">close</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-right">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#C5A021] to-[#0F172A] text-white flex items-center justify-center font-black text-4xl shadow-xl border-4 border-white">
                {(item.name || item.storeName || "?")[0].toUpperCase()}
              </div>
              <div className="flex-grow">
                <h3 className="text-2xl font-black text-[#0F172A]">{item.name || item.storeName}</h3>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                  <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-[10px] font-black">{item.email || item.user?.email}</span>
                  <span className="bg-[#C5A021]/10 text-[#C5A021] px-3 py-1 rounded-lg text-[10px] font-black">{item.phone}</span>
                </div>
              </div>
            </div>

            {/* Stats/Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">الموقع / المدينة</span>
                <div className="flex items-center gap-2">
                   <span className="material-symbols-rounded text-[#C5A021] text-lg">location_on</span>
                   <span className="text-sm font-bold text-[#0F172A]">{item.location || item.city || "غير متوفر"}</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">تاريخ الانضمام</span>
                <div className="flex items-center gap-2">
                   <span className="material-symbols-rounded text-[#C5A021] text-lg">calendar_today</span>
                   <span className="text-sm font-bold text-[#0F172A]">{item.createdAt ? new Date(item.createdAt).toLocaleDateString("ar-EG") : "غير محدد"}</span>
                </div>
              </div>
            </div>

            {type === "vendors" && (
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-6">
                <span className="text-[10px] font-black text-[#C5A021] uppercase tracking-widest block border-b pb-2">بيانات العمل والتوثيق والعمولات</span>
                
                <div className="grid grid-cols-2 gap-6 text-right">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block mb-1">نموذج الشحن واللوجستيات</span>
                    <span className="text-xs font-black text-[#0F172A] bg-sky-50 text-[#C5A021] px-3 py-1.5 rounded-xl inline-block">
                      {item.shippingModel === "MERSAL_HANDLES" ? "تخزين وتعبئة وتوصيل مرسال" : "شحن وتوصيل مرسال"}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block mb-1">طريقة احتساب العمولات</span>
                    <span className="text-xs font-black text-[#0F172A] bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl inline-block">
                      {item.commissionType === "PERCENTAGE" ? "نسبة مئوية (%)" : "مبلغ ثابت"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block mb-1">قيمة العمولة لمرسال</span>
                    <span className="text-sm font-black text-[#0F172A] bg-[#0F172A]/5 px-3 py-1.5 rounded-xl inline-block">
                      {item.commissionRate}% {item.commissionType === "FIXED" && "ج.س"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block mb-1">الرسوم الثابتة / الدورية</span>
                    <span className="text-xs font-bold text-[#0F172A] leading-relaxed">
                      رسوم إضافية: <span className="font-black text-[#C5A021]">{item.fixedFee?.toLocaleString()} ج.س</span> <br/> 
                      اشتراك دوري: <span className="font-black text-purple-600">{item.subscriptionFee?.toLocaleString()} ج.س</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block mb-2">كشف الحساب البنكي المرفق</span>
                    {item.bankStatementUrl && item.bankStatementUrl !== "pending" && item.bankStatementUrl !== "placeholder_url" ? (
                      <a href={item.bankStatementUrl} target="_blank" rel="noreferrer" className="text-xs font-black text-[#C5A021] hover:underline flex items-center gap-1.5 bg-white p-3 rounded-xl border border-gray-100 justify-center">
                        <span className="material-symbols-rounded text-sm">download</span> تحميل المستند
                      </a>
                    ) : (
                      <span className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-xl border border-red-100 flex items-center justify-center gap-2">
                        <span className="material-symbols-rounded text-sm">warning</span> لم يرفع كشف حساب
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block mb-2">السجل التجاري المرفق</span>
                    {item.commercialRegUrl && item.commercialRegUrl !== "placeholder_url" ? (
                      <a href={item.commercialRegUrl} target="_blank" rel="noreferrer" className="text-xs font-black text-[#F29124] hover:underline flex items-center gap-1.5 bg-white p-3 rounded-xl border border-gray-100 justify-center">
                        <span className="material-symbols-rounded text-sm">verified_user</span> تحميل المستند
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 font-bold bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-center gap-2">
                        <span className="material-symbols-rounded text-sm">info</span> لم يرفع سجل تجاري
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {type === "vendors" && (
              <>
                {/* Subscription Section */}
                <div className="bg-[#0F172A] rounded-[2rem] p-6 text-white relative overflow-hidden">
                  <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-[#C5A021]/20 blur-3xl rounded-full" />
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">حالة الاشتراك</p>
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <h4 className="text-lg font-black">{item.plan?.name || "خطة احترافية"}</h4>
                      </div>
                      <p className="text-xs text-white/60 mt-2 font-bold">
                        ينتهي في: {item.subscriptionEndsAt ? new Date(item.subscriptionEndsAt).toLocaleDateString("ar-EG") : "غير محدد"}
                      </p>
                    </div>
                    
                    {!editSubscription ? (
                      <button 
                        onClick={() => setEditSubscription(true)}
                        className="bg-[#C5A021] hover:bg-[#C5A021]/80 text-white px-6 py-3 rounded-xl font-black text-xs transition-all shadow-lg"
                      >
                        تعديل الاشتراك
                      </button>
                    ) : (
                      <div className="flex flex-col gap-2 w-full md:w-auto">
                        <input 
                          type="date" 
                          value={newExpiry}
                          onChange={(e) => setNewExpiry(e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xs font-bold outline-none text-white"
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={handleUpdateSubscription}
                            disabled={isUpdating}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-black text-xs transition-all disabled:opacity-50"
                          >
                            {isUpdating ? "جاري..." : "حفظ"}
                          </button>
                          <button 
                            onClick={() => setEditSubscription(false)}
                            className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-black text-xs transition-all"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Products List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-black text-[#0F172A] flex items-center gap-2">
                      <span className="w-6 h-1.5 bg-[#F29124] rounded-full" />
                      منتجات المتجر ({products.length})
                    </h4>
                  </div>
                  
                  {loadingProducts ? (
                    <div className="py-10 flex justify-center">
                      <div className="w-8 h-8 border-3 border-[#C5A021] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {products.map((p: any) => (
                        <div key={p.id} className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl relative overflow-hidden bg-white shrink-0 border border-gray-200">
                             <Image 
                               src={p.images?.split(',')[0] || "/placeholder.png"} 
                               alt={p.title} 
                               fill 
                               className="object-cover"
                             />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-black text-[#0F172A] truncate">{p.title}</p>
                            <p className="text-[10px] font-bold text-[#C5A021] mt-0.5">{p.price.toLocaleString()} ج.س</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-2xl p-10 text-center border-2 border-dashed border-gray-200">
                      <span className="material-symbols-rounded text-4xl text-gray-200 block mb-2">inventory_2</span>
                      <p className="text-xs font-bold text-gray-400">لا توجد منتجات لهذا المتجر بعد</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
               <span className={cn(
                 "w-3 h-3 rounded-full",
                 type === "users" ? (item.role === "BLOCKED" ? "bg-red-500" : "bg-green-500") : (item.status === "APPROVED" ? "bg-green-500" : "bg-orange-500")
               )} />
               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                 حالة الحساب: {type === "users" ? item.role : item.status}
               </span>
            </div>
            <button onClick={onClose} className="bg-white border border-gray-200 text-[#0F172A] px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all shadow-sm">
              إغلاق
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
