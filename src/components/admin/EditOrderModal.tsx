"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface EditOrderModalProps {
  isOpen: boolean;
  order: any;
  onClose: () => void;
  onSuccess: () => void;
  ORDER_STATUSES: any;
}

export default function EditOrderModal({ isOpen, order, onClose, onSuccess, ORDER_STATUSES }: EditOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("PENDING");
  const [notes, setNotes] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [driverName, setDriverName] = useState("");

  useEffect(() => {
    if (order) {
      setStatus(order.status || "PENDING");
      setNotes(order.notes || "");
      setEstimatedDays(order.estimatedDays?.toString() || "");
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order.id,
          status,
          notes,
          estimatedDays: estimatedDays ? parseInt(estimatedDays) : undefined
        })
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert("فشل تحديث حالة الطلب");
      }
    } catch (err) {
      alert("حدث خطأ أثناء التحديث");
    }
    setLoading(false);
  };

  const currentStatus = ORDER_STATUSES[order.status];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" dir="rtl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#021D24]/60 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden max-h-[95vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-20">
            <div>
              <h2 className="text-xl font-black text-[#021D24]">
                إدارة الطلب <span className="text-[#1089A4] font-mono">#{order.id?.slice(-8).toUpperCase()}</span>
              </h2>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                {new Date(order.createdAt).toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
              <span className="material-symbols-rounded">close</span>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Customer Info */}
            <div className="bg-gray-50 rounded-3xl p-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">العميل</p>
                <p className="font-black text-[#021D24]">{order.customerName || order.customer?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 font-bold" dir="ltr">{order.phone}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">عنوان التوصيل</p>
                <p className="font-bold text-[#021D24] text-sm">{order.city} - {order.district}</p>
                <p className="text-xs text-gray-400">{order.street}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">القيمة الإجمالية</p>
                <p className="font-black text-[#1089A4] text-xl">{order.totalAmount?.toLocaleString()} <span className="text-xs">ج.س</span></p>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">طريقة الدفع</p>
                <p className="font-bold text-sm text-[#021D24]">{order.paymentMethod === "COD" ? "الدفع عند الاستلام" : "تحويل بنكي"}</p>
                <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-lg", order.paymentVerified ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-500")}>
                  {order.paymentVerified ? "✓ مدفوع" : "⏳ في الانتظار"}
                </span>
              </div>
            </div>

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">محتويات الطلب ({order.items.length} منتج)</p>
                <div className="space-y-2">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                      <div className="w-12 h-12 rounded-xl bg-white overflow-hidden border border-gray-100 shrink-0 flex items-center justify-center">
                        {item.product?.images ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.product.images.split(",")[0]} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <span className="material-symbols-rounded text-gray-300 text-xl">image</span>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-black text-[#021D24] text-sm truncate">{item.product?.title || "منتج"}</p>
                        <p className="text-xs text-gray-400">{item.vendor?.storeName || ""}</p>
                      </div>
                      <div className="text-left shrink-0">
                        <p className="font-black text-[#021D24] text-sm">{(item.priceAtTime * item.quantity).toLocaleString()} ج.س</p>
                        <p className="text-xs text-gray-400">{item.quantity} × {item.priceAtTime?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Change */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">تغيير حالة الطلب</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(ORDER_STATUSES).map(([key, s]: any) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStatus(key)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-2xl border transition-all text-right",
                      status === key ? "border-[#1089A4] bg-[#1089A4]/10" : "border-gray-100 bg-gray-50 hover:border-gray-200"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shrink-0", s.color || "from-gray-400 to-gray-600")}>
                      <span className="material-symbols-rounded text-base">{s.icon}</span>
                    </div>
                    <span className={cn("text-xs font-black leading-tight", status === key ? "text-[#1089A4]" : "text-gray-500")}>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">وقت التوصيل المتوقع (أيام)</label>
                <input
                  type="number" min="1" max="30"
                  value={estimatedDays}
                  onChange={e => setEstimatedDays(e.target.value)}
                  placeholder="مثل: 2"
                  className="w-full bg-gray-50 border border-transparent focus:border-[#1089A4] rounded-2xl px-4 py-3 outline-none font-bold transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ملاحظات داخلية</label>
                <input
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="ملاحظات للمندوب..."
                  className="w-full bg-gray-50 border border-transparent focus:border-[#1089A4] rounded-2xl px-4 py-3 outline-none font-bold transition-all"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 bg-gray-50 flex items-center gap-4 sticky bottom-0">
            <button onClick={onClose} className="flex-1 bg-white border border-gray-200 text-gray-600 py-4 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all">
              إلغاء
            </button>
            <button onClick={handleSubmit} disabled={loading} className="flex-[2] bg-[#1089A4] text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-[#1089A4]/20 hover:bg-[#021D24] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-rounded">save</span>}
              حفظ التعديلات
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
