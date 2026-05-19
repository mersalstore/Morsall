"use client";

import React, { useState, useEffect } from "react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Search, Clock, CheckCircle2, AlertTriangle, Printer, RefreshCw, 
  ChevronLeft, Eye, Calculator, Save, AlertOctagon, HelpCircle
} from "lucide-react";

interface WarehouseTabProps {
  classes: any;
}

export default function WarehouseTab({ classes }: WarehouseTabProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Review/Processing modal state
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [itemsData, setItemsData] = useState<Record<string, { receivedQty: number; damagedQty: number }>>({});
  
  // Smart count calculator state
  const [calcItemIndex, setCalcItemIndex] = useState<string | null>(null);
  const [calcBoxes, setCalcBoxes] = useState(1);
  const [calcUnitsPerBox, setCalcUnitsPerBox] = useState(12);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/supply-requests");
      if (res.ok) {
        setRequests(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleOpenReview = (req: any) => {
    setSelectedRequest(req);
    const initialData: Record<string, { receivedQty: number; damagedQty: number }> = {};
    req.items.forEach((it: any) => {
      initialData[it.id] = {
        receivedQty: it.receivedQty ?? it.expectedQty,
        damagedQty: it.damagedQty ?? 0
      };
    });
    setItemsData(initialData);
  };

  const handleUpdateItemQty = (itemId: string, field: "receivedQty" | "damagedQty", val: number) => {
    setItemsData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: Math.max(0, val)
      }
    }));
  };

  const handleApplyCalculator = () => {
    if (calcItemIndex) {
      const total = calcBoxes * calcUnitsPerBox;
      handleUpdateItemQty(calcItemIndex, "receivedQty", total);
      setCalcItemIndex(null);
    }
  };

  const handleSaveResolution = async (status: "RECEIVED" | "AWAITING_VENDOR_RESOLUTION") => {
    if (!selectedRequest) return;
    
    // Prepare formatted items payload
    const itemsPayload = selectedRequest.items.map((it: any) => ({
      id: it.id,
      productId: it.productId,
      receivedQty: itemsData[it.id]?.receivedQty ?? it.expectedQty,
      damagedQty: itemsData[it.id]?.damagedQty ?? 0
    }));

    try {
      const res = await fetch("/api/admin/supply-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedRequest.id,
          status,
          items: itemsPayload
        })
      });

      if (res.ok) {
        setSelectedRequest(null);
        fetchRequests();
      } else {
        const err = await res.json();
        alert(err.error || "فشل تحديث الشحنة");
      }
    } catch (err) {
      alert("حدث خطأ أثناء التحديث");
    }
  };

  const filteredRequests = requests.filter(req => {
    const term = searchTerm.toLowerCase();
    return (
      req.id.toLowerCase().includes(term) ||
      req.vendor?.storeName.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="px-3 py-1.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1 w-fit">
            <Clock size={12} className="animate-pulse" />
            في انتظار الفرز
          </span>
        );
      case "RECEIVED":
        return (
          <span className="px-3 py-1.5 rounded-full text-[10px] font-black bg-green-50 text-green-600 border border-green-100 flex items-center gap-1 w-fit">
            <CheckCircle2 size={12} />
            مكتمل ومفروز
          </span>
        );
      case "AWAITING_VENDOR_RESOLUTION":
        return (
          <span className="px-3 py-1.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1 w-fit">
            <AlertTriangle size={12} className="animate-bounce" />
            عجز / تلفيات قيد الحل
          </span>
        );
      default:
        return (
          <span className="px-3 py-1.5 rounded-full text-[10px] font-black bg-gray-50 text-gray-500 border border-gray-100 w-fit">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-[#0F172A]">إدارة المستودعات (WMS)</h3>
          <p className="text-xs text-slate-400 font-bold mt-1">فرز واستلام البضائع، حساب التالف والفرز الباركودي لزيادة دقة المخزون</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchRequests} 
            className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:text-[#C5A021] hover:bg-slate-50 shadow-sm transition-all"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 w-full md:w-96 focus-within:bg-white focus-within:border-[#C5A021] transition-all">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالرمز أو اسم المورد..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none font-bold text-xs w-full text-slate-800"
          />
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <RefreshCw className="animate-spin text-[#C5A021] mb-3" size={32} />
            <p className="font-bold text-slate-400 text-xs">جاري تحميل الشحنات الموردة...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <Package size={48} className="text-slate-300 mx-auto" />
            <h4 className="font-black text-slate-800 text-base">لا توجد طلبات توريد حالياً</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              ستظهر هنا الشحنات التي يرسلها الموردون لتأكيد استلامها وفرزها بمحاضر رسمية.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#0F172A] text-white/70 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 rounded-r-2xl">رقم الطلب</th>
                  <th className="px-6 py-4">المورد (المتجر)</th>
                  <th className="px-6 py-4">تاريخ التوريد</th>
                  <th className="px-6 py-4">إجمالي القطع</th>
                  <th className="px-6 py-4">حالة الفرز والاستلام</th>
                  <th className="px-6 py-4 rounded-l-2xl text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-black text-[#C5A021]">
                      #{req.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-800">
                      {req.vendor?.storeName || "مورد محذوف"}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-bold">
                      {new Date(req.createdAt).toLocaleDateString("ar-EG")} {new Date(req.createdAt).toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-800">
                      {req.totalItems} قطعة
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {req.status === "PENDING" || req.status === "AWAITING_VENDOR_RESOLUTION" ? (
                          <button
                            onClick={() => handleOpenReview(req)}
                            className="px-4 py-2 bg-gradient-to-r from-[#C5A021] to-[#A9841B] text-white rounded-xl font-black text-[10px] shadow-md shadow-[#C5A021]/10 hover:brightness-105 transition-all flex items-center gap-1.5"
                          >
                            <Save size={12} />
                            فرز واستلام
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenReview(req)}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl font-bold text-[10px] flex items-center gap-1.5"
                          >
                            <Eye size={12} />
                            عرض المحضر
                          </button>
                        )}

                        <button
                          onClick={() => {
                            const printWindow = window.open("", "_blank");
                            if (!printWindow) return;
                            const html = `
                              <html dir="rtl">
                                <head>
                                  <title>محضر استلام بضائع WMS #${req.id.slice(-6).toUpperCase()}</title>
                                  <style>
                                    body { font-family: 'system-ui', sans-serif; padding: 40px; color: #333; }
                                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px double #000; padding-bottom: 20px; }
                                    .title { font-size: 26px; font-weight: bold; }
                                    .meta { margin-top: 25px; font-size: 14px; line-height: 1.8; }
                                    table { w-full border-collapse: collapse; margin-top: 30px; width: 100%; }
                                    th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
                                    th { bg-color: #f5f5f5; }
                                    .signatures { display: flex; justify-content: space-between; margin-top: 80px; }
                                    .sig-box { text-align: center; width: 45%; border-top: 1px dashed #000; padding-top: 10px; font-weight: bold; }
                                  </style>
                                </head>
                                <body onload="window.print()">
                                  <div class="header">
                                    <div class="title">محضر فحص واستلام بضائع (WMS Verification)</div>
                                    <div style="font-weight: bold;">رقم المحضر: #${req.id.slice(-6).toUpperCase()}</div>
                                  </div>
                                  <div class="meta">
                                    <strong>اسم المورد:</strong> ${req.vendor?.storeName || "—"}<br/>
                                    <strong>تاريخ المحضر:</strong> ${new Date(req.createdAt).toLocaleDateString("ar-EG")}<br/>
                                    <strong>حالة الاستلام:</strong> ${req.status === "RECEIVED" ? "تمت المطابقة والاستلام للمخازن بنجاح" : req.status === "AWAITING_VENDOR_RESOLUTION" ? "تم تعليق الشحنة جزئياً لوجود عجز/تلفيات" : "قيد المعاينة والفرز"}<br/>
                                    <strong>إجمالي الشحنة المتوقعة:</strong> ${req.totalItems} قطعة
                                  </div>
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>المنتج</th>
                                        <th>الكمية الموردة</th>
                                        <th>الكمية المستلمة فعلياً</th>
                                        <th>العجز والتالف</th>
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
                                    <div class="sig-box">أمين المخزن والمستودعات (WMS Agent)</div>
                                    <div class="sig-box">المشرف اللوجستي / المندوب الناقل</div>
                                  </div>
                                </body>
                              </html>
                            `;
                            printWindow.document.write(html);
                            printWindow.document.close();
                          }}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-[#0F172A]/10 hover:text-[#0F172A] text-slate-500 rounded-xl font-bold text-[10px] flex items-center gap-1.5"
                          title="طباعة محضر استلام رسمي"
                        >
                          <Printer size={12} />
                          طباعة المحضر
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal Slide Over */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[600] flex items-center justify-end p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRequest(null)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-white h-screen shadow-2xl flex flex-col z-10"
            >
              <div className="p-6 bg-[#0F172A] text-white shrink-0 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black">فرز واستلام شحنة #{selectedRequest.id.slice(-6).toUpperCase()}</h3>
                  <p className="text-white/60 text-[10px] font-bold mt-1">المورد: {selectedRequest.vendor?.storeName}</p>
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
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">حالة الشحنة الحالية</p>
                  {getStatusBadge(selectedRequest.status)}
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">تفاصيل القطع الواردة وحساب التالف</p>
                  {selectedRequest.items.map((it: any) => {
                    const isReadOnly = selectedRequest.status === "RECEIVED";
                    return (
                      <div key={it.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-black text-slate-800 text-xs">{it.product?.title}</p>
                          <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black bg-slate-200 text-slate-600 whitespace-nowrap">
                            متوقع: {it.expectedQty} قطعة
                          </span>
                        </div>

                        {!isReadOnly ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-slate-400 flex items-center justify-between">
                                <span>الكمية السليمة المستلمة فعلياً</span>
                                <button
                                  type="button"
                                  onClick={() => setCalcItemIndex(it.id)}
                                  className="text-[9px] text-[#C5A021] font-black hover:underline flex items-center gap-0.5"
                                >
                                  <Calculator size={10} />
                                  حاسبة الصناديق الذكية
                                </button>
                              </label>
                              <input
                                type="number"
                                value={itemsData[it.id]?.receivedQty ?? it.expectedQty}
                                onChange={e => handleUpdateItemQty(it.id, "receivedQty", parseInt(e.target.value) || 0)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-slate-800 outline-none focus:border-[#C5A021]"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-rose-500">الكمية التالفة</label>
                              <input
                                type="number"
                                value={itemsData[it.id]?.damagedQty ?? 0}
                                onChange={e => handleUpdateItemQty(it.id, "damagedQty", parseInt(e.target.value) || 0)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-rose-600 outline-none focus:border-[#C5A021]"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2 text-xs font-bold text-slate-500">
                            <div>
                              <p className="text-[8px] text-slate-400">الكمية الموردة</p>
                              <p className="font-black text-slate-800 mt-0.5">{it.expectedQty} قطعة</p>
                            </div>
                            <div>
                              <p className="text-[8px] text-slate-400">المستلمة فعلياً</p>
                              <p className="font-black text-green-600 mt-0.5">{it.receivedQty ?? "—"} قطعة</p>
                            </div>
                            <div>
                              <p className="text-[8px] text-slate-400">التالفة</p>
                              <p className="font-black text-rose-500 mt-0.5">{it.damagedQty ?? "—"} قطعة</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedRequest.status !== "RECEIVED" && (
                <div className="p-6 border-t bg-slate-50 shrink-0 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => handleSaveResolution("AWAITING_VENDOR_RESOLUTION")}
                    className="w-full sm:w-auto bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white px-6 py-3.5 rounded-xl font-black text-xs transition-all border border-rose-500/10 flex items-center justify-center gap-1.5"
                  >
                    <AlertOctagon size={14} />
                    تعليق الشحنة لوجود عجز/تلفيات
                  </button>
                  <button
                    onClick={() => handleSaveResolution("RECEIVED")}
                    className="w-full sm:flex-grow bg-gradient-to-r from-[#C5A021] to-[#A9841B] text-white px-8 py-3.5 rounded-xl font-black text-xs hover:brightness-105 transition-all shadow-xl shadow-[#C5A021]/15 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    إتمام الاستلام والفرز وإدخال المنتجات للمخزون
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Smart count calculator popup */}
      <AnimatePresence>
        {calcItemIndex && (
          <div className="fixed inset-0 z-[700] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCalcItemIndex(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-4 z-10 border border-slate-100"
            >
              <div className="flex items-center gap-2 text-[#C5A021]">
                <Calculator size={20} />
                <h4 className="font-black text-[#0F172A] text-sm">حاسبة الصناديق الذكية</h4>
              </div>
              <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                مثال: إذا كان لديك 10 صناديق (كراتين) وكل صندوق يحتوي على 24 قطعة، أدخل القيم بالأسفل لحساب الإجمالي تلقائياً.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400">عدد الصناديق (الكراتين)</label>
                  <input
                    type="number"
                    min={1}
                    value={calcBoxes}
                    onChange={e => setCalcBoxes(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-slate-800 text-center outline-none focus:border-[#C5A021]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400">القطع داخل الصندوق الواحد</label>
                  <input
                    type="number"
                    min={1}
                    value={calcUnitsPerBox}
                    onChange={e => setCalcUnitsPerBox(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-slate-800 text-center outline-none focus:border-[#C5A021]"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-black text-[#0F172A]">
                <span>الإجمالي المحسوب:</span>
                <span className="text-[#C5A021] text-base">{calcBoxes * calcUnitsPerBox} قطعة</span>
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <button
                  onClick={() => setCalcItemIndex(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleApplyCalculator}
                  className="px-5 py-2 bg-[#C5A021] text-white rounded-xl font-black shadow-lg shadow-[#C5A021]/15"
                >
                  تطبيق القيمة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
