"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OrdersTableProps {
  orders: any[];
  onEdit: (order: any) => void;
  onPrint: (order: any) => void;
  onPrintBulk: (orders: any[]) => void;
  classes: any;

  ORDER_STATUSES: any;
  defaultStatusFilter?: string | null;
  drivers?: any[];
  onAssignDriver?: (orderId: string, driverId: string) => void;
  branches?: any[];
  onAssignBranch?: (orderId: string, branchId: string) => Promise<void>;
}

export default function OrdersTable({
  orders, onEdit, onPrint, onPrintBulk, classes, ORDER_STATUSES, defaultStatusFilter,
  drivers = [], onAssignDriver, branches = [], onAssignBranch
}: OrdersTableProps) {

  const [orderSearch, setOrderSearch] = useState("");
  const [oStatusFilter, setOStatusFilter] = useState(defaultStatusFilter || "الكل");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [routingMode, setRoutingMode] = useState<"DRIVER" | "BRANCH">("DRIVER");
  const [activeQuickDriverId, setActiveQuickDriverId] = useState<string>("");
  const [activeQuickBranchId, setActiveQuickBranchId] = useState<string>("");
  const [quickBarcode, setQuickBarcode] = useState<string>("");
  const [assigningLoading, setAssigningLoading] = useState<boolean>(false);

  // Sync defaultStatusFilter from overview click
  useEffect(() => {
    if (defaultStatusFilter) setOStatusFilter(defaultStatusFilter);
  }, [defaultStatusFilter]);

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone?.includes(orderSearch);
    const matchesStatus = oStatusFilter === "الكل" || o.status === oStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const allSelected = filteredOrders.length > 0 && filteredOrders.every(o => selectedIds.has(o.id));

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selectedIds);
      filteredOrders.forEach(o => next.delete(o.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      filteredOrders.forEach(o => next.add(o.id));
      setSelectedIds(next);
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const handleQuickAssignBarcode = async (val: string) => {
    if (!val) return;
    // Check if it matches a driver
    const matchedDriver = drivers.find(d => 
      d.id.toLowerCase() === val.toLowerCase() || 
      d.phone?.includes(val) || 
      d.name.toLowerCase().includes(val.toLowerCase()) ||
      (val.toLowerCase().startsWith("drv-") && d.id.toLowerCase().endsWith(val.toLowerCase().replace("drv-", "")))
    );

    if (matchedDriver) {
      setActiveQuickDriverId(matchedDriver.id);
      setRoutingMode("DRIVER");
      alert(`تم تعيين السائق النشط للتوجيه المباشر: ${matchedDriver.name}`);
      return;
    }

    // Check if it matches a branch
    const matchedBranch = branches.find(b => 
      b.id.toLowerCase() === val.toLowerCase() || 
      b.name.toLowerCase().includes(val.toLowerCase())
    );

    if (matchedBranch) {
      setActiveQuickBranchId(matchedBranch.id);
      setRoutingMode("BRANCH");
      alert(`تم تعيين الفرع النشط للتوجيه المباشر: ${matchedBranch.name}`);
      return;
    }

    // Check if it matches an order
    const matchedOrder = orders.find(o => 
      o.id.toLowerCase() === val.toLowerCase() || 
      o.trackingNumber?.toLowerCase() === val.toLowerCase() ||
      o.id.toLowerCase().endsWith(val.toLowerCase().replace('#', ''))
    );

    if (matchedOrder) {
      const next = new Set(selectedIds);
      next.add(matchedOrder.id);
      setSelectedIds(next);

      if (routingMode === "DRIVER") {
        if (activeQuickDriverId && onAssignDriver) {
          setAssigningLoading(true);
          try {
            await onAssignDriver(matchedOrder.id, activeQuickDriverId);
            alert(`تم تعيين الطلب #${matchedOrder.id.slice(-6).toUpperCase()} للسائق بنجاح!`);
          } catch (err) {
            console.error(err);
            alert("حدث خطأ أثناء التعيين");
          }
          setAssigningLoading(false);
        } else {
          alert(`تم تحديد الطلب #${matchedOrder.id.slice(-6).toUpperCase()} للطباعة`);
        }
      } else {
        if (activeQuickBranchId && onAssignBranch) {
          setAssigningLoading(true);
          try {
            await onAssignBranch(matchedOrder.id, activeQuickBranchId);
            alert(`تم توجيه الطلب #${matchedOrder.id.slice(-6).toUpperCase()} للفرع بنجاح!`);
          } catch (err) {
            console.error(err);
            alert("حدث خطأ أثناء التوجيه للفرع");
          }
          setAssigningLoading(false);
        } else {
          alert(`تم تحديد الطلب #${matchedOrder.id.slice(-6).toUpperCase()} للطباعة`);
        }
      }
    } else {
      alert("لم يتم العثور على طلب أو سائق أو فرع بهذا الباركود");
    }
  };

  const handleAssignSelectedToActive = async () => {
    if (routingMode === "DRIVER") {
      if (!activeQuickDriverId) {
        alert("الرجاء اختيار السائق أولاً");
        return;
      }
      if (selectedIds.size === 0) {
        alert("الرجاء تحديد طلب واحد على الأقل");
        return;
      }

      setAssigningLoading(true);
      if (onAssignDriver) {
        for (const id of Array.from(selectedIds)) {
          await onAssignDriver(id, activeQuickDriverId);
        }
        alert(`تم تعيين جميع الطلبات المحددة (${selectedIds.size}) للسائق بنجاح!`);
      }
      setAssigningLoading(false);
    } else {
      if (!activeQuickBranchId) {
        alert("الرجاء اختيار الفرع أولاً");
        return;
      }
      if (selectedIds.size === 0) {
        alert("الرجاء تحديد طلب واحد على الأقل");
        return;
      }

      setAssigningLoading(true);
      if (onAssignBranch) {
        for (const id of Array.from(selectedIds)) {
          await onAssignBranch(id, activeQuickBranchId);
        }
        alert(`تم توجيه جميع الطلبات المحددة (${selectedIds.size}) للفرع بنجاح!`);
      }
      setAssigningLoading(false);
    }
  };

  // Export selected (or all filtered) as CSV
  const exportCSV = () => {
    const toExport = filteredOrders.filter(o => selectedIds.size === 0 || selectedIds.has(o.id));
    const headers = ["رقم الطلب", "اسم العميل", "الهاتف", "المدينة", "المبلغ", "الحالة", "التاريخ"];
    const rows = toExport.map(o => [
      `#${o.id?.slice(-8).toUpperCase()}`,
      o.customerName || o.customer?.name || "",
      o.phone || "",
      o.city || "",
      o.totalAmount || 0,
      ORDER_STATUSES[o.status]?.label || o.status,
      new Date(o.createdAt).toLocaleDateString("ar-EG")
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyOrderDetails = (order: any) => {
    const text = `طلب #${order.id?.slice(-8).toUpperCase()}
العميل: ${order.customerName || order.customer?.name || ""}
الهاتف: ${order.phone || ""}
المدينة: ${order.city || ""}
المبلغ: ${order.totalAmount || 0} ج.س
`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(order.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Quick Assignment & Barcode Dispatch Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#C5A021] rounded-[2.5rem] p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full w-fit">
              <span className="w-2 h-2 bg-[#F29124] rounded-full animate-ping" />
              <span className="text-[10px] font-black tracking-widest uppercase text-[#F29124]">
                {routingMode === "DRIVER" ? "التوجيه اللوجستي السريع (سائق)" : "التوجيه اللوجستي السريع (فرع / مستودع)"}
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight">التوجيه والتعيين المباشر عبر الباركود</h3>
            <p className="text-xs text-white/70 max-w-xl leading-relaxed">
              اختر وضع التوجيه (سائق أو فرع)، ثم حدد الهدف من القائمة أو امسح الباركود الخاص به، وتابع بمسح باركود الشحنات لتعيينها له فوراً.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Mode Switcher */}
            <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/10 text-xs font-black">
              <button
                onClick={() => setRoutingMode("DRIVER")}
                className={cn("px-4 py-2 rounded-xl transition-all", routingMode === "DRIVER" ? "bg-[#F29124] text-white" : "text-white/60 hover:text-white")}
              >
                توجيه للمناديب
              </button>
              <button
                onClick={() => setRoutingMode("BRANCH")}
                className={cn("px-4 py-2 rounded-xl transition-all", routingMode === "BRANCH" ? "bg-[#F29124] text-white" : "text-white/60 hover:text-white")}
              >
                توجيه للفروع
              </button>
            </div>

            {/* Target Select */}
            <div className="w-full sm:w-64 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10">
              <label className="block text-[10px] font-bold text-white/60 px-2 mb-1">
                {routingMode === "DRIVER" ? "السائق النشط حالياً:" : "الفرع النشط حالياً:"}
              </label>
              {routingMode === "DRIVER" ? (
                <select
                  value={activeQuickDriverId}
                  onChange={(e) => setActiveQuickDriverId(e.target.value)}
                  className="w-full bg-transparent text-white text-xs font-black px-2 py-1 outline-none [&>option]:text-slate-800"
                >
                  <option value="">-- اختر سائق المحطة --</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>🚗 {d.name}</option>
                  ))}
                </select>
              ) : (
                <select
                  value={activeQuickBranchId}
                  onChange={(e) => setActiveQuickBranchId(e.target.value)}
                  className="w-full bg-transparent text-white text-xs font-black px-2 py-1 outline-none [&>option]:text-slate-800"
                >
                  <option value="">-- اختر فرع التوزيع --</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>🏢 {b.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Barcode Quick Scan Input */}
            <div className="w-full sm:w-72 relative">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-rounded text-[#F29124]">qr_code_scanner</span>
              <input
                placeholder="مسح باركود طلب أو سائق أو فرع..."
                value={quickBarcode}
                onChange={e => setQuickBarcode(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleQuickAssignBarcode(quickBarcode.trim());
                    setQuickBarcode("");
                  }
                }}
                className="w-full bg-white text-slate-800 pr-12 pl-4 py-4 rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-[#F29124]/30 shadow-lg placeholder:text-slate-400"
              />
            </div>

            {((routingMode === "DRIVER" && activeQuickDriverId) || (routingMode === "BRANCH" && activeQuickBranchId)) && selectedIds.size > 0 && (
              <button
                disabled={assigningLoading}
                onClick={handleAssignSelectedToActive}
                className="w-full sm:w-auto bg-[#F29124] hover:bg-white hover:text-[#0F172A] text-white px-6 py-4 rounded-2xl font-black text-xs transition-all shadow-xl shadow-[#F29124]/20 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {assigningLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-rounded text-base">bolt</span>
                    {routingMode === "DRIVER" 
                      ? `تعيين المحددة (${selectedIds.size}) للسائق` 
                      : `توجيه المحددة (${selectedIds.size}) للفرع`}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "جاري التجهيز",   count: orders.filter(o => o.status === "PROCESSING").length,   color: "from-indigo-400 to-indigo-600", icon: "inventory_2" },
          { label: "جاري التوصيل",   count: orders.filter(o => o.status === "SHIPPED").length,       color: "from-[#C5A021] to-[#A9841B]",   icon: "delivery_dining" },
          { label: "تم التسليم",      count: orders.filter(o => o.status === "DELIVERED").length,     color: "from-green-500 to-green-600",   icon: "verified" },
          { label: "ملغي / مرجع",    count: orders.filter(o => ["CANCELLED","RETURNED"].includes(o.status)).length, color: "from-red-500 to-red-600", icon: "cancel" },
        ].map((s, i) => (
          <div key={i} className={cn(classes.card, "p-5 md:p-8 flex items-center justify-between hover:scale-[1.03] shadow-sm border border-slate-100 cursor-pointer")}
            onClick={() => setOStatusFilter(i === 0 ? "PROCESSING" : i === 1 ? "SHIPPED" : i === 2 ? "DELIVERED" : "CANCELLED")}
          >
            <div>
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{s.label}</p>
              <p className="text-2xl md:text-3xl font-black text-[#0F172A]">{s.count}</p>
            </div>
            <div className={cn("w-11 h-11 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-xl", s.color)}>
              <span className="material-symbols-rounded text-xl md:text-2xl">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={cn(classes.card, "border border-slate-100 shadow-sm")}>
        {/* Toolbar */}
        <div className="p-5 md:p-8 flex flex-col gap-4 bg-slate-50/50 border-b border-slate-100">
          {/* Search + Status */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <span className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-rounded text-[#C5A021]">search</span>
              <input
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                placeholder="ابحث برقم الطلب أو اسم العميل..."
                className={cn(classes.input, "pr-14 py-4")}
              />
            </div>
            <div className="relative flex-grow md:max-w-xs">
              <span className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400">qr_code_scanner</span>
              <input
                placeholder="مسح الباركود لتحديد الطلب..."
                className={cn(classes.input, "pr-14 py-4 border-dashed border-[#C5A021]/50 bg-[#C5A021]/5")}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) {
                      // Find order by ID or Tracking number
                      const matched = orders.find(o => 
                        o.id.toLowerCase() === val.toLowerCase() || 
                        o.trackingNumber?.toLowerCase() === val.toLowerCase() ||
                        o.id.toLowerCase().endsWith(val.toLowerCase().replace('#', ''))
                      );
                      if (matched) {
                        const next = new Set(selectedIds);
                        next.add(matched.id);
                        setSelectedIds(next);
                        (e.target as HTMLInputElement).value = '';
                      } else {
                        alert('لم يتم العثور على طلب بهذا الباركود');
                      }
                    }
                  }
                }}
              />
            </div>
            <select value={oStatusFilter} onChange={e => setOStatusFilter(e.target.value)} className={cn(classes.input, "md:w-56 py-4")}>
              <option value="الكل">جميع الحالات</option>
              {Object.keys(ORDER_STATUSES).map(key => <option key={key} value={key}>{ORDER_STATUSES[key].label}</option>)}
            </select>
          </div>
          {/* Action Bar */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs font-black text-slate-400">
              {selectedIds.size > 0 ? `${selectedIds.size} طلب محدد` : `${filteredOrders.length} طلب`}
            </span>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-2xl font-black text-xs hover:bg-green-600 transition-all shadow-md shadow-green-500/10"
            >
              <span className="material-symbols-rounded text-base">download</span>
              {selectedIds.size > 0 ? `تصدير (${selectedIds.size})` : "تصدير الكل"} CSV
            </button>
            {selectedIds.size > 0 && (
              <>
                <button
                  onClick={() => onPrintBulk(filteredOrders.filter(o => selectedIds.has(o.id)))}
                  className="flex items-center gap-2 bg-[#0F172A] text-white px-4 py-2 rounded-2xl font-black text-xs hover:bg-[#C5A021] transition-all shadow-lg shadow-[#0F172A]/10"
                >
                  <span className="material-symbols-rounded text-base">print</span>
                  طباعة البوليصات ({selectedIds.size})
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-2xl font-black text-xs hover:bg-slate-200 transition-all border border-slate-200/50"
                >
                  إلغاء التحديد
                </button>
              </>
            )}

          </div>
        </div>

        {/* MOBILE: Card Layout */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredOrders.map((order) => (
            <div key={order.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={selectedIds.has(order.id)} onChange={() => toggleOne(order.id)}
                    className="w-4 h-4 rounded accent-[#C5A021]" />
                  <span className="font-mono text-xs font-black text-[#C5A021] bg-[#C5A021]/10 px-3 py-1 rounded-xl">
                    #{order.id?.slice(-8).toUpperCase()}
                  </span>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-xl text-[10px] font-black",
                  ORDER_STATUSES[order.status]?.cls === "badge-active" ? "bg-green-50 text-green-600 border border-green-100" : "bg-orange-50 text-orange-500 border border-orange-100"
                )}>
                  {ORDER_STATUSES[order.status]?.label || order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-[#0F172A] text-sm">{order.customerName || order.customer?.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5" dir="ltr">{order.phone}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#0F172A]">{order.totalAmount?.toLocaleString()} <span className="text-[10px] text-[#C5A021]">ج.س</span></p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{order.city}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEdit(order)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#C5A021]/10 text-[#C5A021] font-black text-xs hover:bg-[#C5A021] hover:text-white transition-all">
                  <span className="material-symbols-rounded text-base">edit_note</span>
                  تعديل الحالة
                </button>
                <button onClick={() => copyOrderDetails(order)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#0F172A]/10 text-[#0F172A] font-black text-xs hover:bg-[#C5A021] hover:text-white transition-all" title="نسخ البيانات">
                  <span className="material-symbols-rounded text-base">content_copy</span>
                </button>
              </div>
              <div className="flex gap-2">
                <select 
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-800"
                  onChange={(e) => {
                    if (e.target.value && onAssignDriver) onAssignDriver(order.id, e.target.value);
                  }}
                  value={order.driverId || ""}
                >
                  <option value="">تعيين لمندوب...</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
          ))}
          {filteredOrders.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-300">
              <span className="material-symbols-rounded text-[80px] opacity-20">order_approve</span>
              <p className="font-black text-sm uppercase tracking-widest mt-4 text-slate-400">لا توجد طلبات</p>
            </div>
          )}
        </div>

        {/* DESKTOP: Table Layout */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[1000px]">
            <thead>
              <tr className={classes.tableHeader}>
                <th className="px-6 py-6 rounded-tr-2xl w-12">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 rounded accent-[#C5A021]" />
                </th>
                <th className="px-8 py-6">رقم التتبع</th>
                <th className="px-8 py-6">تفاصيل العميل</th>
                <th className="px-8 py-6">طريقة الدفع</th>
                <th className="px-8 py-6">الوجهة</th>
                <th className="px-8 py-6">القيمة</th>
                <th className="px-8 py-6 text-center">الحالة</th>
                <th className="px-8 py-6 text-center rounded-tl-2xl">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className={cn(classes.tableRow, selectedIds.has(order.id) && "bg-[#C5A021]/5")}>
                  <td className="px-6 py-8">
                    <input type="checkbox" checked={selectedIds.has(order.id)} onChange={() => toggleOne(order.id)}
                      className="w-4 h-4 rounded accent-[#C5A021]" />
                  </td>
                  <td className="px-8 py-10 font-mono text-xs font-black text-[#C5A021] tracking-[0.2em]">
                    #{order.id?.slice(-8).toUpperCase()}
                  </td>
                  {/* Column 2: Customer Details */}
                  <td className="px-8 py-10">
                    <div className="flex flex-col">
                      <span className="font-black text-[#0F172A] text-sm leading-tight mb-1">{order.customerName || order.customer?.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-rounded text-[14px] text-slate-400">call</span>
                        <span className="text-[11px] font-bold text-slate-400" dir="ltr">{order.phone}</span>
                      </div>
                    </div>
                  </td>
                  {/* Column 3: Payment Method */}
                  <td className="px-8 py-10">
                    <div className="flex flex-col gap-1.5">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black w-fit border",
                        order.paymentMethod === "COD" 
                          ? "bg-amber-50 text-amber-700 border-amber-200" 
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      )}>
                        <span>{order.paymentMethod === "COD" ? "💵" : "🏦"}</span>
                        <span>{order.paymentMethod === "COD" ? "دفع عند الاستلام" : "تحويل بنكي / حول"}</span>
                      </span>
                      {order.paymentScreenshot && (
                        <a 
                          href={order.paymentScreenshot} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] text-[#C5A021] font-black flex items-center gap-1 hover:underline w-fit"
                        >
                          <span className="material-symbols-rounded text-[14px]">image</span>
                          مشاهدة إشعار الدفع
                        </a>
                      )}
                    </div>
                  </td>
                  {/* Column 4: Destination */}
                  <td className="px-8 py-10">
                    <span className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] border border-slate-200/50">
                      {order.city}
                    </span>
                  </td>
                  {/* Column 5: Value */}
                  <td className="px-8 py-10 font-black text-[#0F172A] text-lg whitespace-nowrap">
                    {order.totalAmount?.toLocaleString()}
                    <span className="text-[11px] text-[#C5A021] mr-2 font-black">ج.س</span>
                  </td>
                  {/* Column 6: Status */}
                  <td className="px-8 py-10 text-center">
                    <span className={cn(
                      "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest block mb-2",
                      ORDER_STATUSES[order.status]?.cls === "badge-active" ? "bg-green-50 text-green-600 border border-green-100" : "bg-orange-50 text-orange-500 border border-orange-100"
                    )}>
                      {ORDER_STATUSES[order.status]?.label || order.status}
                    </span>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-[10px] font-bold outline-none text-slate-800"
                      onChange={(e) => {
                        if (e.target.value && onAssignDriver) onAssignDriver(order.id, e.target.value);
                      }}
                      value={order.driverId || ""}
                    >
                      <option value="">لا يوجد سائق محدد</option>
                      {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </td>
                  {/* Column 7: Actions */}
                  <td className="px-8 py-10">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => copyOrderDetails(order)} className={cn("w-10 h-10 rounded-xl bg-white border text-slate-500 flex items-center justify-center transition-all shadow-sm",
                        copiedId === order.id ? "bg-green-50 border-green-200 text-green-600" : "border-slate-200 hover:bg-[#C5A021] hover:text-white hover:border-[#C5A021]"
                      )} title="نسخ البيانات">
                        <span className="material-symbols-rounded text-lg">{copiedId === order.id ? "check_circle" : "content_copy"}</span>
                      </button>
                      <button onClick={() => onEdit(order)} className="w-12 h-12 rounded-[1.2rem] bg-white border border-slate-200 text-[#C5A021] flex items-center justify-center hover:bg-[#C5A021] hover:text-white hover:border-[#C5A021] transition-all shadow-md shadow-slate-100/10" title="تعديل الحالة">
                        <span className="material-symbols-rounded text-xl">edit_note</span>
                      </button>
                      <button onClick={() => onPrint(order)} className="w-12 h-12 rounded-[1.2rem] bg-[#0F172A] text-white flex items-center justify-center hover:bg-[#C5A021] hover:text-white transition-all shadow-md shadow-slate-100/10" title="طباعة البوليصة">
                        <span className="material-symbols-rounded text-xl">print</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="py-40 flex flex-col items-center justify-center text-slate-300">
              <span className="material-symbols-rounded text-[100px] opacity-20">order_approve</span>
              <p className="font-black text-lg uppercase tracking-[0.3em] text-slate-400">لا توجد طلبات مطابقة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
