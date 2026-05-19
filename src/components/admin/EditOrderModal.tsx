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
  // الباب الخامس: صلاحيات - إذا كان التاجر يعدّل الحالة فقط 3 خيارات
  restrictedMode?: boolean;
}

export default function EditOrderModal({
  isOpen, order, onClose, onSuccess, ORDER_STATUSES, restrictedMode = false
}: EditOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("PENDING");
  const [notes, setNotes] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  // الباب الأول - المتطلب 5: تعديل العنوان المرن أثناء الشحن
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressData, setAddressData] = useState({ street: "", district: "", city: "" });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (order) {
      setStatus(order.status || "PENDING");
      setNotes(order.notes || "");
      setEstimatedDays(order.estimatedDays?.toString() || "");
      setAddressData({
        street: order.street || "",
        district: order.district || "",
        city: order.city || "",
      });
      setEditingAddress(false);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  // نسخ بيانات الطلب كاملاً
  const copyOrderData = () => {
    const text = `#${order.id?.slice(-8).toUpperCase()}
العميل: ${order.customerName || order.customer?.name || ""}
الهاتف: ${order.phone || ""}
المدينة: ${order.city || ""} - ${order.district || ""}
العنوان: ${order.street || ""}
المبلغ: ${order.totalAmount?.toLocaleString()} ج.س
طريقة الدفع: ${order.paymentMethod}
الحالة: ${ORDER_STATUSES[order.status]?.label || order.status}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: any = {
        id: order.id,
        status,
        notes,
        estimatedDays: estimatedDays ? parseInt(estimatedDays) : undefined,
      };
      // إرسال تعديلات العنوان إذا كان المستخدم يعدّل العنوان
      if (editingAddress) {
        payload.street = addressData.street;
        payload.district = addressData.district;
        payload.city = addressData.city;
        payload.status = "AT_BRANCH";
        payload.driverId = null;
      }

      const res = await fetch(`/api/admin/orders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        if (editingAddress) {
          alert("تم تعديل العنوان بنجاح. تمت إعادة الطلب إلى الفرع لإعادة التوجيه.");
        }
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

  // الباب الخامس: صلاحيات التاجر المحدودة (3 حالات فقط)
  const VENDOR_ALLOWED_STATUSES = [
    "ORDER_RECEIVED",
    "PROCESSING",
    "READY_FOR_SHIPPING",
    "ON_HOLD",
  ];

  const allowedStatuses = restrictedMode
    ? Object.entries(ORDER_STATUSES).filter(([k]) => VENDOR_ALLOWED_STATUSES.includes(k))
    : Object.entries(ORDER_STATUSES);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" dir="rtl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden max-h-[95vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-20">
            <div>
              <h2 className="text-xl font-black text-[#0F172A]">
                إدارة الطلب <span className="text-[#C5A021] font-mono">#{order.id?.slice(-8).toUpperCase()}</span>
              </h2>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                {new Date(order.createdAt).toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* زر نسخ بيانات الطلب - الباب الأول المتطلب 2 */}
              <button
                onClick={copyOrderData}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all border",
                  copied
                    ? "bg-green-50 text-green-600 border-green-200"
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-[#C5A021]/10 hover:text-[#C5A021] hover:border-[#C5A021]/20"
                )}
                title="نسخ بيانات الطلب كاملاً"
              >
                <span className="material-symbols-rounded text-sm">{copied ? "check_circle" : "content_copy"}</span>
                {copied ? "تم النسخ!" : "نسخ البيانات"}
              </button>
              <button onClick={onClose} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Customer Info */}
            <div className="bg-gray-50 rounded-3xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">العميل</p>
                <p className="font-black text-[#0F172A]">{order.customerName || order.customer?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 font-bold" dir="ltr">{order.phone}</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">عنوان التوصيل</p>
                  {/* زر تعديل العنوان المرن - الباب الأول المتطلب 5 */}
                  {!restrictedMode && (
                    <button
                      onClick={() => setEditingAddress(!editingAddress)}
                      className={cn(
                        "text-[9px] font-black flex items-center gap-1 px-2 py-0.5 rounded-lg transition-all",
                        editingAddress
                          ? "text-amber-600 bg-amber-50 border border-amber-200"
                          : "text-[#C5A021] hover:bg-[#C5A021]/5"
                      )}
                    >
                      <span className="material-symbols-rounded text-xs">{editingAddress ? "edit_off" : "edit_location"}</span>
                      {editingAddress ? "إلغاء التعديل" : "تعديل العنوان"}
                    </button>
                  )}
                </div>
                {editingAddress ? (
                  <div className="space-y-2 mt-2">
                    <input
                      value={addressData.city}
                      onChange={e => setAddressData(p => ({ ...p, city: e.target.value }))}
                      placeholder="المدينة"
                      className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-amber-400"
                    />
                    <input
                      value={addressData.district}
                      onChange={e => setAddressData(p => ({ ...p, district: e.target.value }))}
                      placeholder="الحي / المنطقة"
                      className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-amber-400"
                    />
                    <input
                      value={addressData.street}
                      onChange={e => setAddressData(p => ({ ...p, street: e.target.value }))}
                      placeholder="اسم الشارع"
                      className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-amber-400"
                    />
                    <p className="text-[9px] text-amber-600 font-bold">⚠️ سيعود الطلب للفرع تلقائياً لإعادة التوجيه</p>
                  </div>
                ) : (
                  <>
                    <p className="font-bold text-[#0F172A] text-sm">{order.city} - {order.district}</p>
                    <p className="text-xs text-gray-400">{order.street}</p>
                  </>
                )}
              </div>
            </div>

            {/* الحقل المالي المدمج */}
            <div className="bg-gradient-to-br from-slate-900 to-[#0F172A] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />
              <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-rounded text-[#C5A021]">account_balance_wallet</span>
                  <h3 className="text-sm font-black tracking-wider text-white">الحقل المالي المدمج</h3>
                </div>
                <span className="text-[10px] bg-white/10 backdrop-blur px-3 py-1 rounded-full font-bold text-white/80">موثق مالياً</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 pt-2">
                <div>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">إجمالي قيمة الطلب</p>
                  <p className="text-2xl font-black text-[#C5A021]">
                    {order.totalAmount?.toLocaleString()} <span className="text-xs text-white">ج.س</span>
                  </p>
                  <p className="text-[10px] text-white/50 mt-0.5">شاملة الشحن والضرائب</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">طريقة الدفع</p>
                  <p className="text-base font-black text-white mt-1">
                    {order.paymentMethod === "cod" ? "الدفع عند الاستلام (COD)" :
                     order.paymentMethod === "bank_transfer" ? "حوالة بنكية" :
                     order.paymentMethod === "prepaid" ? "دفع إلكتروني مسبق" : order.paymentMethod}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">حالة الدفع</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={cn(
                      "px-3 py-1 rounded-xl text-xs font-black shadow-lg",
                      order.paymentVerified ? "bg-green-500 text-white shadow-green-500/20" :
                      order.codCollected ? "bg-blue-500 text-white shadow-blue-500/20" :
                      order.paymentMethod === "cod" ? "bg-amber-500 text-white shadow-amber-500/20" :
                      "bg-orange-500 text-white shadow-orange-500/20"
                    )}>
                      {order.paymentVerified ? "✓ مدفوع (مؤكد)" :
                       order.codCollected ? "✓ مدفوع كاش" :
                       order.paymentMethod === "cod" ? "⏳ COD - عند الاستلام" :
                       "⏳ حوالة - بانتظار التأكيد"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* إيصال الدفع */}
            {order.paymentMethod !== "cod" && (
              <div className="bg-orange-50/50 rounded-3xl p-5 border border-orange-100 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-rounded text-sm">payments</span>
                    إشعار الدفع المرفق
                  </p>
                  {order.paymentScreenshot && (
                    <a href={order.paymentScreenshot} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] font-black text-[#C5A021] hover:underline flex items-center gap-1">
                      فتح في نافذة جديدة
                      <span className="material-symbols-rounded text-xs">open_in_new</span>
                    </a>
                  )}
                </div>
                {order.paymentScreenshot ? (
                  <div className="relative group overflow-hidden rounded-2xl border border-orange-200 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={order.paymentScreenshot} alt="إيصال التحويل" className="w-full h-auto max-h-[400px] object-contain" />
                  </div>
                ) : (
                  <div className="py-6 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mb-2">
                      <span className="material-symbols-rounded text-2xl">no_photography</span>
                    </div>
                    <p className="text-xs font-black text-orange-600">لم يتم إرفاق إيصال!</p>
                  </div>
                )}
              </div>
            )}

            {/* محتويات الطلب مع عرض السمات - الباب الخامس المتطلب 2 */}
            {order.items && order.items.length > 0 && (
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">محتويات الطلب ({order.items.length} منتج)</p>
                <div className="space-y-2">
                  {order.items.map((item: any, i: number) => {
                    // تحليل السمات من combination
                    let variationAttrs: Record<string, string> = {};
                    if (item.variation?.combination) {
                      try {
                        variationAttrs = typeof item.variation.combination === "string"
                          ? JSON.parse(item.variation.combination)
                          : item.variation.combination;
                      } catch { variationAttrs = {}; }
                    }
                    // دعم السمات القديمة (size / color)
                    if (item.size) variationAttrs["المقاس"] = item.size;
                    if (item.color) variationAttrs["اللون"] = item.color;

                    return (
                      <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl">
                        <div className="w-12 h-12 rounded-xl bg-white overflow-hidden border border-gray-100 shrink-0 flex items-center justify-center">
                          {item.product?.images ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.product.images.split(",")[0]} alt="" className="w-full h-full object-cover"
                              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          ) : (
                            <span className="material-symbols-rounded text-gray-300 text-xl">image</span>
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="font-black text-[#0F172A] text-sm truncate">{item.product?.title || "منتج"}</p>
                          <div className="flex items-center gap-1.5 flex-wrap mt-1">
                            {/* عرض السمات المحددة */}
                            {Object.entries(variationAttrs).map(([key, val]) => (
                              <span key={key} className="inline-flex items-center gap-0.5 bg-[#C5A021]/10 text-[#C5A021] text-[10px] px-2 py-0.5 rounded-lg font-black border border-[#C5A021]/20">
                                {key}: {val}
                              </span>
                            ))}
                            {item.variation?.sku && (
                              <span className="inline-flex items-center bg-gray-100 text-gray-600 text-[9px] px-2 py-0.5 rounded-lg font-bold">
                                SKU: {item.variation.sku}
                              </span>
                            )}
                            {item.product?.weight && (
                              <span className="inline-flex items-center gap-0.5 bg-sky-50 text-sky-700 text-[10px] px-1.5 py-0.5 rounded font-black border border-sky-100">
                                ⚖️ {item.product.weight} كجم
                              </span>
                            )}
                            {(item.product?.length || item.product?.width || item.product?.height) && (
                              <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 text-[10px] px-1.5 py-0.5 rounded font-black border border-amber-100">
                                📐 {item.product.length || 0}×{item.product.width || 0}×{item.product.height || 0} سم
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-left shrink-0">
                          <p className="font-black text-[#0F172A] text-sm">{(item.priceAtTime * item.quantity).toLocaleString()} ج.س</p>
                          <p className="text-xs text-gray-400">{item.quantity} × {item.priceAtTime?.toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* تغيير الحالة */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">تغيير حالة الطلب</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {allowedStatuses.map(([key, s]: any) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStatus(key)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-2xl border transition-all text-right",
                      status === key ? "border-[#C5A021] bg-[#C5A021]/10" : "border-gray-100 bg-gray-50 hover:border-gray-200"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shrink-0", s.color || "from-gray-400 to-gray-600")}>
                      <span className="material-symbols-rounded text-base">{s.icon}</span>
                    </div>
                    <span className={cn("text-xs font-black leading-tight", status === key ? "text-[#C5A021]" : "text-gray-500")}>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* الأيام والملاحظات - مخفية في الوضع المقيد */}
            {!restrictedMode && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">وقت التوصيل المتوقع (أيام)</label>
                  <input
                    type="number" min="1" max="30"
                    value={estimatedDays}
                    onChange={e => setEstimatedDays(e.target.value)}
                    placeholder="مثل: 2"
                    className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-4 py-3 outline-none font-bold transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ملاحظات داخلية</label>
                  <input
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="ملاحظات للمندوب..."
                    className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-4 py-3 outline-none font-bold transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 bg-gray-50 flex items-center gap-4 sticky bottom-0">
            <button onClick={onClose} className="flex-1 bg-white border border-gray-200 text-gray-600 py-4 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all">
              إلغاء
            </button>
            <button onClick={handleSubmit} disabled={loading} className="flex-[2] bg-[#C5A021] text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-[#C5A021]/20 hover:bg-[#0F172A] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-rounded">save</span>}
              حفظ التعديلات
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
