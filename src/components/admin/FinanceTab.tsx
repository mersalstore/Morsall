"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowDownToLine, 
  Coins, 
  CheckSquare, 
  Square,
  AlertTriangle,
  Loader2,
  FileSpreadsheet,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function FinanceTab() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<{ vendors: any[], drivers: any[] }>({ vendors: [], drivers: [] });
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'settlements' | 'history'>('withdrawals');
  const [settleModal, setSettleModal] = useState<{ type: 'VENDOR' | 'DRIVER', item: any } | null>(null);
  
  // Reconciliation states
  const [settleAmount, setSettleAmount] = useState("");
  const [unsettledOrders, setUnsettledOrders] = useState<any[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [actualCash, setActualCash] = useState("");
  const [settleNotes, setSettleNotes] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => { 
    fetchAllData(); 
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [wRes, sRes, hRes] = await Promise.all([
        fetch("/api/admin/withdrawals"),
        fetch("/api/admin/settlements"),
        fetch("/api/admin/settlements?history=1")
      ]);
      if (wRes.ok) setWithdrawals(await wRes.json());
      if (sRes.ok) setSettlements(await sRes.json());
      if (hRes.ok) setHistory(await hRes.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  // Fetch driver's unsettled orders when driver modal is opened
  useEffect(() => {
    if (settleModal && settleModal.type === 'DRIVER') {
      setLoadingOrders(true);
      setUnsettledOrders([]);
      setSelectedOrderIds(new Set());
      setActualCash("");
      setSettleNotes("");

      fetch(`/api/admin/settlements?driverId=${settleModal.item.id}`)
        .then(r => r.json())
        .then(data => {
          setUnsettledOrders(data);
          // Select all by default to make it easy for accountant
          setSelectedOrderIds(new Set(data.map((o: any) => o.id)));
          const total = data.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
          setSettleAmount(String(total));
          setActualCash(String(total));
        })
        .catch(err => console.error("Error fetching driver orders:", err))
        .finally(() => setLoadingOrders(false));
    } else if (settleModal && settleModal.type === 'VENDOR') {
      setSettleAmount(String(settleModal.item.walletBalance));
    }
  }, [settleModal]);

  // Recalculate theoretical cash when selected orders change
  useEffect(() => {
    if (settleModal && settleModal.type === 'DRIVER' && unsettledOrders.length > 0) {
      const total = unsettledOrders
        .filter(o => selectedOrderIds.has(o.id))
        .reduce((sum: number, o: any) => sum + o.totalAmount, 0);
      setSettleAmount(String(total));
      setActualCash(String(total));
    }
  }, [selectedOrderIds]);

  const handleAction = async (id: string, status: string) => {
    if (!confirm(`هل أنت متأكد من ${status === 'APPROVED' ? 'الموافقة على' : 'رفض'} هذا الطلب؟`)) return;
    await fetch("/api/admin/withdrawals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    });
    fetchAllData();
  };

  const handleConfirmSettlement = async () => {
    if (!settleModal) return;
    
    if (settleModal.type === 'VENDOR') {
      const amt = Number(settleAmount);
      if (isNaN(amt) || amt <= 0) {
        alert("الرجاء إدخال مبلغ صحيح");
        return;
      }
      if (amt > settleModal.item.walletBalance) {
        alert("المبلغ المدخل أكبر من المستحقات الحالية");
        return;
      }

      await fetch("/api/admin/settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: 'VENDOR', id: settleModal.item.id, amount: amt })
      });
    } else {
      // Driver Reconciliation
      const theoretical = parseFloat(settleAmount);
      const actual = parseFloat(actualCash);

      if (isNaN(actual) || actual < 0) {
        alert("يرجى إدخال مبلغ التحصيل الفعلي بشكل صحيح");
        return;
      }

      if (selectedOrderIds.size === 0) {
        alert("يجب اختيار شحنة واحدة على الأقل لإتمام التسوية");
        return;
      }

      await fetch("/api/admin/settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: 'DRIVER_RECONCILIATION',
          id: settleModal.item.id,
          amount: theoretical,
          actualCash: actual,
          orderIds: Array.from(selectedOrderIds),
          notes: settleNotes || `تسوية عهدة لعدد ${selectedOrderIds.size} شحنة سلمها المندوب.`
        })
      });
    }

    setSettleModal(null);
    setSettleAmount("");
    setActualCash("");
    setSettleNotes("");
    fetchAllData();
  };

  const toggleSelectOrder = (id: string) => {
    const next = new Set(selectedOrderIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedOrderIds(next);
  };

  if (loading) return <div className="p-20 text-center font-black text-gray-400">جاري تحميل البيانات المالية...</div>;

  const totalDifference = parseFloat(settleAmount) - (parseFloat(actualCash) || 0);

  return (
    <div className="space-y-10 text-right" dir="rtl">
      
      {/* Settlement Modal */}
      {settleModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-sm" dir="rtl">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-8 md:p-10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <h3 className="text-xl font-black text-[#0F172A] mb-4 flex items-center gap-2">
              <Coins className="text-[#C5A021]" size={24} />
              تسوية وتصفية عهدة {settleModal.type === 'VENDOR' ? 'المورد' : 'المندوب'}
            </h3>
            
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-wrap justify-between gap-4 mb-6 text-xs">
              <div>
                <p className="text-slate-400">الاسم والبيانات:</p>
                <p className="font-black text-[#0F172A] mt-1">{settleModal.type === 'VENDOR' ? settleModal.item.storeName : settleModal.item.name}</p>
              </div>
              <div>
                <p className="text-slate-400">الرصيد العام الحالي بالنظام:</p>
                <p className="font-black text-red-500 mt-1">{(settleModal.type === 'VENDOR' ? settleModal.item.walletBalance : settleModal.item.balance).toLocaleString()} ج.س</p>
              </div>
            </div>

            {settleModal.type === 'VENDOR' ? (
              // Vendor Flat Balance Settlement
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2">المبلغ المراد تسويته (دفعه للمورد):</label>
                  <input
                    type="number"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    placeholder="أدخل المبلغ..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#C5A021] text-slate-800"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setSettleAmount(String(settleModal.item.walletBalance))}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-black px-3 py-1.5 rounded-xl transition-all"
                    >
                      الحد الأقصى (تصفير الحساب)
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Driver Order-based Cash Reconciliation
              <div className="space-y-6">
                
                {/* 1. Orders Selection for Settlement */}
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2">اختر الشحنات المسلمة المراد تصفيتها:</label>
                  
                  {loadingOrders ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      <Loader2 className="animate-spin mx-auto mb-2 text-[#C5A021]" size={20} />
                      جاري تحميل عهدة الشحنات للمندوب...
                    </div>
                  ) : unsettledOrders.length === 0 ? (
                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-center text-orange-600 text-xs">
                      لا توجد أي شحنات COD مسلمة غير مصفاة لهذا المندوب حالياً!
                    </div>
                  ) : (
                    <div className="border border-slate-100 rounded-2xl max-h-60 overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
                      {unsettledOrders.map((order) => {
                        const isSelected = selectedOrderIds.has(order.id);
                        return (
                          <div 
                            key={order.id}
                            onClick={() => toggleSelectOrder(order.id)}
                            className={cn(
                              "flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 transition-all text-xs",
                              isSelected && "bg-[#C5A021]/5"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              {isSelected ? (
                                <CheckSquare className="text-[#C5A021]" size={18} />
                              ) : (
                                <Square className="text-slate-300" size={18} />
                              )}
                              <div>
                                <p className="font-black text-slate-800">طلب #{order.id.slice(-6).toUpperCase()}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">المستلم: {order.customerName}</p>
                              </div>
                            </div>
                            <div className="text-left">
                              <p className="font-black text-[#0F172A]">{order.totalAmount.toLocaleString()} ج.س</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">{order.city}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Reconciliation Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-1.5">الكاش النظري المطلوب (إجمالي المختار):</label>
                    <input
                      type="text"
                      disabled
                      value={`${parseFloat(settleAmount).toLocaleString()} ج.س`}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-black text-[#0F172A] outline-none cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-1.5">الكاش الفعلي المستلم من المندوب *:</label>
                    <input
                      type="number"
                      value={actualCash}
                      onChange={(e) => setActualCash(e.target.value)}
                      placeholder="أدخل الكاش المستلم فعلياً..."
                      className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs font-black outline-none focus:border-[#C5A021] text-slate-800"
                    />
                  </div>
                </div>

                {/* 3. Discrepancy / Variance Display */}
                {parseFloat(settleAmount) > 0 && (
                  <div className={cn(
                    "p-4 rounded-2xl border text-xs font-black flex items-center justify-between",
                    totalDifference === 0 
                      ? "bg-green-50 border-green-100 text-green-700" 
                      : "bg-red-50 border-red-100 text-red-600 animate-pulse"
                  )}>
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} />
                      <span>{totalDifference === 0 ? "تسوية متطابقة تماماً (بدون فروقات)" : "تنبيه: يوجد فرق في المبلغ المصفى!"}</span>
                    </div>
                    <span dir="ltr">الفرق: {totalDifference.toLocaleString()} ج.س</span>
                  </div>
                )}

                {/* 4. Settlement Notes */}
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1.5">ملاحظات التسوية والمحاسبة:</label>
                  <textarea
                    value={settleNotes}
                    onChange={(e) => setSettleNotes(e.target.value)}
                    placeholder="ملاحظات العجز أو الزيادة، أو إيصال التوريد..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold outline-none focus:border-[#C5A021] text-slate-800 h-20 resize-none"
                  />
                </div>

              </div>
            )}

            <div className="flex gap-3 mt-8 border-t border-slate-100 pt-6">
              <button
                onClick={handleConfirmSettlement}
                className="flex-1 bg-[#0F172A] hover:bg-[#C5A021] text-white hover:text-slate-900 py-4 rounded-2xl font-black text-xs transition-all shadow-md"
              >
                تأكيد واعتماد التسوية
              </button>
              <button
                onClick={() => { 
                  setSettleModal(null); 
                  setSettleAmount(""); 
                  setActualCash("");
                  setSettleNotes("");
                }}
                className="w-28 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-xs hover:bg-slate-200 transition-all"
              >
                إلغاء
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Hero Header Area */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#0F172A] to-[#020617] p-12 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-3xl relative overflow-hidden">
         <div className="relative z-10">
            <h2 className="text-3xl font-black mb-4 flex items-center gap-4">
               <ArrowDownToLine className="text-[#C5A021]" size={32} />
               الإدارة المالية وتصفية العهد
            </h2>
            <p className="text-white/50 text-sm font-medium">تسوية مستحقات المتاجر وتصفية عهد المناديب اليومية بناءً على الشحنات المسلَّمة والتحصيل الفعلي.</p>
         </div>
         <div className="flex flex-wrap gap-3 relative z-10">
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={cn("px-6 py-3.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 backdrop-blur-md border",
                activeTab === 'withdrawals' 
                  ? "bg-[#C5A021] text-slate-900 border-transparent shadow-xl shadow-[#C5A021]/20 font-black" 
                  : "bg-white/10 text-white/70 border-white/10 hover:bg-white/20"
              )}
            >
              <CreditCard size={16} />
              طلبات السحب ({withdrawals.length})
            </button>
            <button
              onClick={() => setActiveTab('settlements')}
              className={cn("px-6 py-3.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 backdrop-blur-md border",
                activeTab === 'settlements' 
                  ? "bg-[#C5A021] text-slate-900 border-transparent shadow-xl shadow-[#C5A021]/20 font-black" 
                  : "bg-white/10 text-white/70 border-white/10 hover:bg-white/20"
              )}
            >
              <CheckCircle2 size={16} />
              تسوية وتصفية العهد
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn("px-6 py-3.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 backdrop-blur-md border",
                activeTab === 'history' 
                  ? "bg-[#C5A021] text-slate-900 border-transparent shadow-xl shadow-[#C5A021]/20 font-black" 
                  : "bg-white/10 text-white/70 border-white/10 hover:bg-white/20"
              )}
            >
              <History size={16} />
              سجل التسويات والتدقيق ({history.length})
            </button>
         </div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A021]/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* Main Tab Interfaces */}
      {activeTab === 'withdrawals' && (
        <div className={cn("bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden")}>
          <table className="w-full text-right" dir="rtl">
            <thead>
              <tr className="bg-[#0F172A] text-white/40 text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/5">
                <th className="px-10 py-6">المورد / المتجر</th>
                <th className="px-10 py-6">المبلغ</th>
                <th className="px-10 py-6">طريقة السحب</th>
                <th className="px-10 py-6">الحالة</th>
                <th className="px-10 py-6">التاريخ</th>
                <th className="px-10 py-6">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {withdrawals.map((w: any) => (
                <tr key={w.id} className="hover:bg-gray-50/80 transition-all group">
                  <td className="px-10 py-6">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-[#C5A021]">
                           {w.vendor?.storeName?.[0] || "V"}
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#0F172A]">{w.vendor?.storeName}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{w.vendor?.user?.name}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-10 py-6 text-sm font-black text-[#0F172A]">{w.amount.toLocaleString()} ج.س</td>
                  <td className="px-10 py-6">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[#C5A021] uppercase tracking-widest">{w.method}</span>
                        <span className="text-[10px] text-gray-400 font-bold mt-0.5">{w.details || "لا توجد تفاصيل"}</span>
                     </div>
                  </td>
                  <td className="px-10 py-6">
                     <span className={cn(
                       "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit",
                       w.status === 'PENDING' ? "bg-amber-50 text-amber-500" :
                       w.status === 'APPROVED' ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"
                     )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", 
                           w.status === 'PENDING' ? "bg-amber-500 animate-pulse" :
                           w.status === 'APPROVED' ? "bg-green-500" : "bg-red-500"
                        )} />
                        {w.status === 'PENDING' ? "قيد الانتظار" : w.status === 'APPROVED' ? "تم التحويل" : "مرفوض"}
                     </span>
                  </td>
                  <td className="px-10 py-6 text-[10px] font-bold text-gray-400">{new Date(w.createdAt).toLocaleDateString('ar-EG')}</td>
                  <td className="px-10 py-6">
                     {w.status === 'PENDING' && (
                       <div className="flex gap-2">
                          <button onClick={() => handleAction(w.id, 'APPROVED')} className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-sm" title="موافقة"><CheckCircle2 size={18} /></button>
                          <button onClick={() => handleAction(w.id, 'REJECTED')} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm" title="رفض"><XCircle size={18} /></button>
                       </div>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {withdrawals.length === 0 && (
            <div className="p-20 text-center">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                  <CreditCard size={40} />
               </div>
               <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">لا توجد طلبات سحب حالياً</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settlements' && (
        <div className="space-y-10">
          
          {/* Vendors Settlements */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-8 bg-[#0F172A] text-white flex items-center justify-between">
              <h3 className="font-black text-base flex items-center gap-2">
                <span className="material-symbols-rounded text-[#C5A021]">storefront</span>
                مستحقات الموردين (المتاجر)
              </h3>
            </div>
            <table className="w-full text-right" dir="rtl">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] border-b border-gray-100">
                  <th className="px-10 py-6">المتجر</th>
                  <th className="px-10 py-6">المالك / الهاتف</th>
                  <th className="px-10 py-6">الرصيد المستحق</th>
                  <th className="px-10 py-6">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {settlements.vendors.map((v: any) => (
                  <tr key={v.id} className="hover:bg-gray-50/80 transition-all">
                    <td className="px-10 py-6 font-black text-sm text-[#0F172A]">{v.storeName}</td>
                    <td className="px-10 py-6">
                      <p className="text-xs font-bold text-[#0F172A]">{v.user?.name || "—"}</p>
                      <p className="text-[10px] text-gray-400 font-bold direction-ltr text-right">{v.phone || v.user?.phone || "—"}</p>
                    </td>
                    <td className="px-10 py-6">
                      <span className={cn("font-black text-sm", v.walletBalance > 0 ? "text-red-500" : "text-gray-400")}>
                        {v.walletBalance.toLocaleString()} ج.س
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <button
                        disabled={v.walletBalance <= 0}
                        onClick={() => { setSettleModal({ type: 'VENDOR', item: v }); }}
                        className={cn("px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-md",
                          v.walletBalance > 0 
                            ? "bg-[#0F172A] hover:bg-[#C5A021] text-white hover:text-slate-900 shadow-slate-200/50" 
                            : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                        )}
                      >
                        تسوية الحساب
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {settlements.vendors.length === 0 && (
              <div className="p-12 text-center text-gray-400 font-bold text-xs">لا يوجد موردين حالياً</div>
            )}
          </div>

          {/* Drivers Settlements (Order-based collection) */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-8 bg-[#0F172A] text-white flex items-center justify-between">
              <h3 className="font-black text-base flex items-center gap-2">
                <span className="material-symbols-rounded text-[#C5A021]">local_shipping</span>
                مستحقات وتصفية عهد مناديب التوصيل
              </h3>
            </div>
            <table className="w-full text-right" dir="rtl">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] border-b border-gray-100">
                  <th className="px-10 py-6">المندوب</th>
                  <th className="px-10 py-6">الهاتف / المركبة</th>
                  <th className="px-10 py-6">رصيد السحب العام</th>
                  <th className="px-10 py-6">كاش العهدة المعلقة (COD)</th>
                  <th className="px-10 py-6">الإجراءات المحاسبية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {settlements.drivers.map((d: any) => (
                  <tr key={d.id} className="hover:bg-gray-50/80 transition-all">
                    <td className="px-10 py-6 font-black text-sm text-[#0F172A]">{d.name}</td>
                    <td className="px-10 py-6">
                      <p className="text-xs font-bold text-gray-600 direction-ltr text-right">{d.phone}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{d.vehicleType}</p>
                    </td>
                    <td className="px-10 py-6">
                      <span className={cn("font-black text-xs", d.balance > 0 ? "text-[#C5A021]" : "text-gray-400")}>
                        {d.balance.toLocaleString()} ج.س
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <span className={cn("font-black text-sm", d.unsettledCash > 0 ? "text-red-500" : "text-slate-400")}>
                        {d.unsettledCash.toLocaleString()} ج.س
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <button
                        onClick={() => { setSettleModal({ type: 'DRIVER', item: d }); }}
                        className="bg-[#0F172A] hover:bg-[#C5A021] text-white hover:text-slate-900 px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-md shadow-slate-200"
                      >
                        تصفية عهدة الكاش ↗
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {settlements.drivers.length === 0 && (
              <div className="p-12 text-center text-gray-400 font-bold text-xs">لا يوجد مناديب توصيل حالياً</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8 bg-[#0F172A] text-white">
            <h3 className="font-black text-base flex items-center gap-2">
              <History className="text-[#C5A021]" size={20} />
              سجل عمليات تصفية وتسوية عهد المناديب (Audit Trail)
            </h3>
          </div>
          <table className="w-full text-right" dir="rtl">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] border-b border-gray-100">
                <th className="px-10 py-6">كود التسوية</th>
                <th className="px-10 py-6">المندوب</th>
                <th className="px-10 py-6">الكاش النظري</th>
                <th className="px-10 py-6">الكاش الفعلي</th>
                <th className="px-10 py-6">الفروقات</th>
                <th className="px-10 py-6">حالة التسوية</th>
                <th className="px-10 py-6">ملاحظات المحاسب</th>
                <th className="px-10 py-6">تاريخ العملية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {history.map((h: any) => (
                <tr key={h.id} className="hover:bg-gray-50/80 transition-all">
                  <td className="px-10 py-6 font-mono font-bold text-slate-400">#{h.id.slice(-6).toUpperCase()}</td>
                  <td className="px-10 py-6 font-black text-[#0F172A]">
                    {settlements.drivers.find(d => d.id === h.driverId)?.name || "مندوب غير معروف"}
                  </td>
                  <td className="px-10 py-6 font-bold text-slate-700">{h.totalCash.toLocaleString()} ج.س</td>
                  <td className="px-10 py-6 font-black text-slate-800">{h.actualCash.toLocaleString()} ج.س</td>
                  <td className="px-10 py-6 font-bold text-red-500">{h.difference.toLocaleString()} ج.س</td>
                  <td className="px-10 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-black tracking-widest inline-block border",
                      h.status === 'SETTLED' 
                        ? "bg-green-50 text-green-600 border-green-100" 
                        : "bg-red-50 text-red-500 border-red-100"
                    )}>
                      {h.status === 'SETTLED' ? "مصفى بالكامل" : "يوجد عجز"}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-slate-500 max-w-xs truncate">{h.notes}</td>
                  <td className="px-10 py-6 text-[10px] text-slate-400 font-bold">
                    {new Date(h.createdAt).toLocaleString('ar-EG')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && (
            <div className="p-20 text-center text-slate-400 font-bold text-xs">لا يوجد تاريخ تسويات مسجل بعد</div>
          )}
        </div>
      )}

    </div>
  );
}

