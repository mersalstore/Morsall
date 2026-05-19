"use client";

import React, { useState, useEffect } from "react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Printer, AlertTriangle, CheckCircle, Clock, Package, Eye, ChevronLeft, RefreshCw } from "lucide-react";

interface VendorWMSTabProps {
  products: any[];
}

export default function VendorWMSTab({ products }: VendorWMSTabProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New request form state
  const [selectedItems, setSelectedItems] = useState<{ productId: string; expectedQty: number }[]>([]);
  const [currentProduct, setCurrentProduct] = useState("");
  const [currentQty, setCurrentQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/supply-requests");
      if (res.ok) {
        setRequests(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAddItem = () => {
    if (!currentProduct) return;
    const existing = selectedItems.find(i => i.productId === currentProduct);
    if (existing) {
      setSelectedItems(prev => prev.map(i => i.productId === currentProduct ? { ...i, expectedQty: i.expectedQty + currentQty } : i));
    } else {
      setSelectedItems(prev => [...prev, { productId: currentProduct, expectedQty: currentQty }]);
    }
    setCurrentQty(1);
  };

  const handleRemoveItem = (prodId: string) => {
    setSelectedItems(prev => prev.filter(i => i.productId !== prodId));
  };

  const handleSubmitRequest = async () => {
    if (selectedItems.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/vendor/supply-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: selectedItems }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setSelectedItems([]);
        fetchRequests();
      } else {
        const err = await res.json();
        alert(err.error || "فشل إرسال طلب التوريد");
      }
    } catch (err) {
      alert("حدث خطأ أثناء الاتصال بالخادم");
    }
    setSubmitting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1 w-fit">
            <Clock size={12} className="animate-pulse" />
            قيد الانتظار (WMS)
          </span>
        );
      case "RECEIVED":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-green-50 text-green-600 border border-green-100 flex items-center gap-1 w-fit">
            <CheckCircle size={12} />
            تم الاستلام والفرز
          </span>
        );
      case "AWAITING_VENDOR_RESOLUTION":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1 w-fit">
            <AlertTriangle size={12} className="animate-bounce" />
            تحت الانتظار (وجود عجز/تلف)
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-gray-50 text-gray-500 border border-gray-100 w-fit">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-[#0F172A]">طلبات التوريد (WMS)</h3>
          <p className="text-xs text-gray-400 font-bold mt-1">تتبع شحناتك الموردة إلى المستودع المركزي</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#C5A021] text-white px-6 py-3 rounded-xl font-black text-xs shadow-lg shadow-[#C5A021]/20 hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus size={16} />
          إنشاء طلب توريد جديد
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-20 rounded-3xl border border-gray-100 flex flex-col items-center justify-center">
          <RefreshCw className="animate-spin text-[#C5A021] mb-3" size={32} />
          <p className="font-bold text-gray-400 text-xs">جاري تحميل طلبات التوريد...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-gray-100 text-center space-y-4">
          <div className="w-16 h-16 bg-[#C5A021]/5 rounded-full flex items-center justify-center mx-auto">
            <Package size={28} className="text-[#C5A021]" />
          </div>
          <h4 className="font-black text-[#0F172A] text-base">لا توجد طلبات توريد سابقة</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
            عندما تقوم بتوريد كميات جديدة من منتجاتك للمخزن المركزي، قم بإنشاء طلب توريد هنا ليتم مراجعته وفرزه في WMS.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 border-b text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">رقم الطلب</th>
                  <th className="px-6 py-4">تاريخ الإنشاء</th>
                  <th className="px-6 py-4">إجمالي القطع</th>
                  <th className="px-6 py-4">حالة الاستلام بالفرز</th>
                  <th className="px-6 py-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-black text-[#C5A021]">
                      #{req.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-bold">
                      {new Date(req.createdAt).toLocaleDateString("ar-EG")} {new Date(req.createdAt).toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-black text-[#0F172A]">
                      {req.totalItems} قطعة
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="px-3 py-1.5 bg-gray-50 hover:bg-[#C5A021]/10 hover:text-[#C5A021] text-gray-500 rounded-lg transition-all font-bold text-[10px] flex items-center gap-1.5"
                        >
                          <Eye size={12} />
                          التفاصيل
                        </button>
                        <button
                          onClick={() => {
                            const printWindow = window.open("", "_blank");
                            if (!printWindow) return;
                            const html = `
                              <html dir="rtl">
                                <head>
                                  <title>إذن تسليم شحنة #${req.id.slice(-6).toUpperCase()}</title>
                                  <style>
                                    body { font-family: 'system-ui', sans-serif; padding: 40px; color: #333; }
                                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 20px; }
                                    .title { font-size: 24px; font-weight: bold; }
                                    .meta { margin-top: 20px; font-size: 14px; line-height: 1.8; }
                                    table { w-full border-collapse: collapse; margin-top: 30px; width: 100%; }
                                    th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
                                    th { bg-color: #f5f5f5; }
                                    .signatures { display: flex; justify-content: space-between; margin-top: 80px; }
                                    .sig-box { text-align: center; width: 45%; border-top: 1px dashed #000; padding-top: 10px; font-weight: bold; }
                                  </style>
                                </head>
                                <body onload="window.print()">
                                  <div class="header">
                                    <div class="title">إذن تسليم شحنة توريد WMS</div>
                                    <div style="font-weight: bold;">رقم الطلب: #${req.id.slice(-6).toUpperCase()}</div>
                                  </div>
                                  <div class="meta">
                                    <strong>تاريخ الطلب:</strong> ${new Date(req.createdAt).toLocaleDateString("ar-EG")}<br/>
                                    <strong>الحالة:</strong> ${req.status === "RECEIVED" ? "تم استلامها وفرزها بالكامل" : "قيد المعاينة والفرز"}<br/>
                                    <strong>إجمالي القطع المتوقعة:</strong> ${req.totalItems} قطعة
                                  </div>
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>المنتج</th>
                                        <th>الكمية المطلوبة</th>
                                        <th>الكمية المستلمة فعلياً</th>
                                        <th>الكمية التالفة</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      ${req.items.map((it: any) => `
                                        <tr>
                                          <td>${it.product?.title || "—"}</td>
                                          <td>${it.expectedQty} قطعة</td>
                                          <td>${it.receivedQty !== null ? `${it.receivedQty} قطعة` : "—"}</td>
                                          <td>${it.damagedQty !== null ? `${it.damagedQty} قطعة` : "—"}</td>
                                        </tr>
                                      `).join("")}
                                    </tbody>
                                  </table>
                                  <div class="signatures">
                                    <div class="sig-box">توقيع مسؤول المستودع (WMS Officer)</div>
                                    <div class="sig-box">توقيع مندوب المورد / التاجر</div>
                                  </div>
                                </body>
                              </html>
                            `;
                            printWindow.document.write(html);
                            printWindow.document.close();
                          }}
                          className="px-3 py-1.5 bg-gray-50 hover:bg-[#0F172A]/10 hover:text-[#0F172A] text-gray-500 rounded-lg transition-all font-bold text-[10px] flex items-center gap-1.5"
                        >
                          <Printer size={12} />
                          طباعة الإذن
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Slide-over / Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[600] flex items-center justify-end p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRequest(null)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white h-screen shadow-2xl flex flex-col z-10"
            >
              <div className="p-6 bg-[#0F172A] text-white shrink-0 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black">طلب توريد #{selectedRequest.id.slice(-6).toUpperCase()}</h3>
                  <p className="text-white/60 text-[10px] font-bold mt-1">تاريخ الطلب: {new Date(selectedRequest.createdAt).toLocaleDateString("ar-EG")}</p>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all text-white"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>

              <div className="flex-grow p-6 overflow-y-auto space-y-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">حالة الشحنة بالفرز</p>
                  {getStatusBadge(selectedRequest.status)}
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">تفاصيل القطع الموردة</p>
                  {selectedRequest.items.map((it: any) => (
                    <div key={it.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2">
                      <p className="font-black text-[#0F172A] text-xs">{it.product?.title}</p>
                      <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-gray-500">
                        <div>
                          <p className="text-gray-400 text-[8px]">الكمية المتوقعة</p>
                          <p className="font-black text-[#0F172A] mt-0.5 text-xs">{it.expectedQty} قطعة</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-[8px]">المستلمة فعلياً</p>
                          <p className="font-black text-green-600 mt-0.5 text-xs">{it.receivedQty ?? "—"} قطعة</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-[8px]">التالفة</p>
                          <p className="font-black text-rose-500 mt-0.5 text-xs">{it.damagedQty ?? "—"} قطعة</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create New Request Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 bg-[#C5A021] text-white shrink-0 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black">إنشاء طلب توريد جديد لمخزونك</h3>
                  <p className="text-white/60 text-[10px] font-bold mt-1">اختر المنتجات والكميات الموردة للمستودع</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all text-white"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>

              <div className="flex-grow p-6 overflow-y-auto space-y-6">
                {/* Product picker */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-grow min-w-0 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">اختر منتج من متجرك</label>
                    <select
                      value={currentProduct}
                      onChange={e => setCurrentProduct(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-[#0F172A] outline-none focus:border-[#C5A021]"
                    >
                      <option value="">-- اختر منتج --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.title} (المخزون الحالي: {p.stock})</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full md:w-32 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الكمية الموردة</label>
                    <input
                      type="number"
                      min={1}
                      value={currentQty}
                      onChange={e => setCurrentQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-black text-[#0F172A] text-center outline-none focus:border-[#C5A021]"
                    />
                  </div>
                  <button
                    onClick={handleAddItem}
                    type="button"
                    className="w-full md:w-auto bg-[#0F172A] text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-[#C5A021] transition-all flex items-center justify-center gap-1.5"
                  >
                    أضف للطلب
                  </button>
                </div>

                {/* Selected products list */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">قائمة المنتجات المضافة للطلب</p>
                  {selectedItems.length === 0 ? (
                    <p className="text-center text-gray-300 font-bold py-6 text-xs">يرجى إضافة منتج واحد على الأقل للطلب.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedItems.map(item => {
                        const product = products.find(p => p.id === item.productId);
                        return (
                          <div key={item.productId} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                            <div>
                              <p className="font-black text-[#0F172A] text-xs">{product?.title || "منتج غير معروف"}</p>
                              <p className="text-[9px] text-[#C5A021] font-bold mt-1">الكمية المتوقعة: {item.expectedQty} قطعة</p>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.productId)}
                              className="text-xs font-bold text-rose-500 hover:underline"
                            >
                              إزالة
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 flex items-center justify-between shrink-0">
                <p className="text-xs font-bold text-gray-400">عدد الأصناف: <span className="font-black text-[#C5A021]">{selectedItems.length}</span></p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-xs"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSubmitRequest}
                    disabled={selectedItems.length === 0 || submitting}
                    className="px-8 py-2.5 bg-[#C5A021] text-white rounded-xl font-black text-xs shadow-lg shadow-[#C5A021]/20 hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {submitting ? "جاري الإرسال..." : "✅ إرسال طلب التوريد"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
