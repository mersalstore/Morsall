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
  showToast?: (message: string, type?: "success" | "error" | "info") => void;
  onRefresh?: () => void;

  ordersDateRange?: string;
  setOrdersDateRange?: (val: string) => void;
  ordersCustomFrom?: string;
  setOrdersCustomFrom?: (val: string) => void;
  ordersCustomTo?: string;
  setOrdersCustomTo?: (val: string) => void;
  ordersStatusFilter?: string;
  setOrdersStatusFilter?: (val: string) => void;
  onCustomDateApply?: () => void;
}

export default function OrdersTable({
  orders, onEdit, onPrint, onPrintBulk, classes, ORDER_STATUSES, defaultStatusFilter,
  drivers = [], onAssignDriver, branches = [], onAssignBranch, showToast, onRefresh,
  ordersDateRange, setOrdersDateRange, ordersCustomFrom, setOrdersCustomFrom,
  ordersCustomTo, setOrdersCustomTo, ordersStatusFilter, setOrdersStatusFilter, onCustomDateApply
}: OrdersTableProps) {

  const [orderSearch, setOrderSearch] = useState("");
  const [localStatusFilter, setLocalStatusFilter] = useState("الكل");
  const oStatusFilter = ordersStatusFilter !== undefined ? ordersStatusFilter : localStatusFilter;
  const setOStatusFilter = (val: string) => {
    if (setOrdersStatusFilter) {
      setOrdersStatusFilter(val);
      if (onRefresh) {
        setTimeout(() => onRefresh(), 50);
      }
    } else {
      setLocalStatusFilter(val);
    }
  };
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [routingMode, setRoutingMode] = useState<"DRIVER" | "BRANCH">("DRIVER");
  const [activeQuickDriverId, setActiveQuickDriverId] = useState<string>("");
  const [activeQuickBranchId, setActiveQuickBranchId] = useState<string>("");
  const [quickBarcode, setQuickBarcode] = useState<string>("");
  const [assigningLoading, setAssigningLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Odoo style states
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [isDirectMode, setIsDirectMode] = useState(false);
  const [isEditableMode, setIsEditableMode] = useState(true);
  const [groupBy, setGroupBy] = useState<"none" | "status" | "city" | "sender">("none");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Dropdown states for Filters, GroupBy, Favorites
  const [activeDropdown, setActiveDropdown] = useState<"filters" | "groupby" | "favorites" | null>(null);

  // Sync defaultStatusFilter from overview click
  useEffect(() => {
    if (defaultStatusFilter) setOStatusFilter(defaultStatusFilter);
  }, [defaultStatusFilter]);

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone?.includes(orderSearch) ||
      o.trackingNumber?.toLowerCase().includes(orderSearch.toLowerCase());
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

  // Grouping logic
  const groupedOrders = React.useMemo(() => {
    if (groupBy === "none") return null;
    const groups: Record<string, any[]> = {};
    filteredOrders.forEach(o => {
      let key = "";
      if (groupBy === "status") {
        key = ORDER_STATUSES[o.status]?.label || o.status;
      } else if (groupBy === "city") {
        key = o.city || "غير محدد";
      } else if (groupBy === "sender") {
        const firstVendor = o.items?.[0]?.vendor || o.orderItems?.[0]?.vendor;
        key = o.storeName || o.vendorName || firstVendor?.storeName || "متجر مرسال";
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(o);
    });
    return groups;
  }, [filteredOrders, groupBy, ORDER_STATUSES]);

  const toggleGroup = (key: string) => {
    const next = new Set(collapsedGroups);
    if (next.has(key)) next.delete(key); else next.add(key);
    setCollapsedGroups(next);
  };

  const getRequiredAction = (status: string) => {
    switch (status) {
      case "AWAITING_PICKUP": return "تجهيز واستلام";
      case "READY_FOR_SHIPPING": return "جاهز للشحن";
      case "CONFIRMED": return "تأكيد الطلب";
      case "PROCESSING": return "فرز وتجهيز";
      case "PENDING_PICKUP": return "تحميل الشحنة";
      case "AT_BRANCH": return "فرز بالفرع";
      case "SHIPPED": return "توصيل للعميل";
      case "DELIVERED": return "تسليم وتحصيل";
      case "CANCELLED": return "إرجاع شحنة";
      case "RETURNED": return "مرتجع للمستودع";
      default: return "توصيل";
    }
  };

  const getMerchantStatus = (status: string) => {
    switch (status) {
      case "DELIVERED": return "تم التوصيل";
      case "SHIPPED": return "جاري التوصيل";
      case "PROCESSING": return "قيد المعالجة";
      case "AT_BRANCH": return "في الفرع";
      case "CANCELLED": return "ملغي";
      case "RETURNED": return "مرتجع";
      default: return "قيد المراجعة";
    }
  };

  const handleQuickAssignBarcode = async (val: string) => {
    if (!val) return;
    const matchedDriver = drivers.find(d => 
      d.id.toLowerCase() === val.toLowerCase() || 
      d.phone?.includes(val) || 
      d.name.toLowerCase().includes(val.toLowerCase()) ||
      (val.toLowerCase().startsWith("drv-") && d.id.toLowerCase().endsWith(val.toLowerCase().replace("drv-", "")))
    );

    if (matchedDriver) {
      setActiveQuickDriverId(matchedDriver.id);
      setRoutingMode("DRIVER");
      showToast?.(`تم تعيين السائق النشط للتوجيه المباشر: ${matchedDriver.name} خ`, "success");
      return;
    }

    const matchedBranch = branches.find(b => 
      b.id.toLowerCase() === val.toLowerCase() || 
      b.name.toLowerCase().includes(val.toLowerCase())
    );

    if (matchedBranch) {
      setActiveQuickBranchId(matchedBranch.id);
      setRoutingMode("BRANCH");
      showToast?.(`تم تعيين الفرع النشط للتوجيه المباشر: ${matchedBranch.name} خ`, "success");
      return;
    }

    const matchedOrder = orders.find(o => 
      o.id.toLowerCase() === val.toLowerCase() || 
      o.trackingNumber?.toLowerCase() === val.toLowerCase() ||
      o.id.toLowerCase().endsWith(val.toLowerCase().replace('#', ''))
    );

    if (matchedOrder) {
      // المسح يعلّم على الطلب فقط (يضيفه للتحديد) — بدون تعيين فوري أو فتح الطلب.
      // التعيين يتم بضغطة واحدة على زر "تعيين المحدد" بعد مسح كل الطلبات.
      const shortId = matchedOrder.id.slice(-6).toUpperCase();
      const next = new Set(selectedIds);
      if (next.has(matchedOrder.id)) {
        showToast?.(`الطلب #${shortId} معلّم بالفعل (${next.size})`, "info");
      } else {
        next.add(matchedOrder.id);
        setSelectedIds(next);
        showToast?.(`✓ تم تعليم الطلب #${shortId} (${next.size} محدد)`, "success");
      }
    } else {
      showToast?.("لم يتم العثور على طلب أو سائق أو فرع بهذا الباركود", "error");
    }
  };

  const handleAssignSelectedToActive = async () => {
    if (routingMode === "DRIVER") {
      if (!activeQuickDriverId) {
        showToast?.("الرجاء اختيار السائق أولاً خ", "error");
        return;
      }
      if (selectedIds.size === 0) {
        showToast?.("الرجاء تحديد طلب واحد على الأقل خ", "error");
        return;
      }

      setAssigningLoading(true);
      if (onAssignDriver) {
        for (const id of Array.from(selectedIds)) {
          await onAssignDriver(id, activeQuickDriverId);
        }
        showToast?.(`تم تعيين جميع الطلبات المحددة (${selectedIds.size}) للسائق بنجاح! خ`, "success");
      }
      setAssigningLoading(false);
    } else {
      if (!activeQuickBranchId) {
        showToast?.("الرجاء اختيار الفرع أولاً خ", "error");
        return;
      }
      if (selectedIds.size === 0) {
        showToast?.("الرجاء تحديد طلب واحد على الأقل خ", "error");
        return;
      }

      setAssigningLoading(true);
      if (onAssignBranch) {
        for (const id of Array.from(selectedIds)) {
          await onAssignBranch(id, activeQuickBranchId);
        }
        showToast?.(`تم توجيه جميع الطلبات المحددة (${selectedIds.size}) للفرع بنجاح! خ`, "success");
      }
      setAssigningLoading(false);
    }
  };

  const handleBulkAssignDriver = async (driverId: string) => {
    setAssigningLoading(true);
    try {
      const updates = Array.from(selectedIds).map(id => ({
        id,
        driverId,
        status: "SHIPPED"
      }));
      const res = await fetch("/api/admin/orders/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates })
      });
      if (res.ok) {
        showToast?.(`تم تعيين ${selectedIds.size} طلبات للسائق بنجاح! خ`, "success");
        setSelectedIds(new Set());
        onRefresh?.();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast?.(`فشل التعيين الجماعي: ${err.error || "خطأ غير معروف"}`, "error");
      }
    } catch (error: any) {
      showToast?.(`خطأ في الاتصال: ${error.message}`, "error");
    } finally {
      setAssigningLoading(false);
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (!newStatus) return;
    setAssigningLoading(true);
    try {
      const updates = Array.from(selectedIds).map(id => ({ id, status: newStatus }));
      const res = await fetch("/api/admin/orders/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates })
      });
      if (res.ok) {
        const statusLabel = ORDER_STATUSES[newStatus]?.label || newStatus;
        showToast?.(`✅ تم تحديث حالة ${selectedIds.size} طلب إلى "${statusLabel}" بنجاح`, "success");
        setSelectedIds(new Set());
        onRefresh?.();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast?.(`فشل تغيير الحالة الجماعي: ${err.error || "خطأ غير معروف"}`, "error");
      }
    } catch (error: any) {
      showToast?.(`خطأ في الاتصال: ${error.message}`, "error");
    } finally {
      setAssigningLoading(false);
    }
  };

  const handleBulkAssignBranch = async (branchId: string) => {
    setAssigningLoading(true);
    try {
      const updates = Array.from(selectedIds).map(id => ({
        id,
        branchId,
        status: "AT_BRANCH"
      }));
      const res = await fetch("/api/admin/orders/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates })
      });
      if (res.ok) {
        showToast?.(`تم تحويل ${selectedIds.size} طلبات للفرع بنجاح! خ`, "success");
        setSelectedIds(new Set());
        onRefresh?.();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast?.(`فشل التحويل الجماعي: ${err.error || "خطأ غير معروف"}`, "error");
      }
    } catch (error: any) {
      showToast?.(`خطأ في الاتصال: ${error.message}`, "error");
    } finally {
      setAssigningLoading(false);
    }
  };

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
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

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

  // Close dropdowns on click outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdown(null);
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <div className="space-y-6 md:space-y-8 font-sans" dir="rtl">
      
      {/* Odoo Style Header Section */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-4">
        
        {/* Top Header: Title and Search Input */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight">الطلبيات النشطة</h3>
              <select 
                value={oStatusFilter} 
                onChange={e => setOStatusFilter(e.target.value)} 
                className="mt-1 bg-transparent text-[#C5A021] text-xs font-black outline-none border-b border-transparent hover:border-[#C5A021] cursor-pointer pb-0.5"
              >
                <option value="الكل">افتراضي (جميع الحالات)</option>
                {Object.keys(ORDER_STATUSES).map(key => (
                  <option key={key} value={key} className="text-slate-800 font-bold">{ORDER_STATUSES[key].label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Odoo Search Bar */}
          <div className="relative w-full md:w-96 flex items-center bg-[#F1F5F9] rounded-2xl border border-slate-200/50 focus-within:bg-white focus-within:border-[#C5A021] focus-within:ring-4 focus-within:ring-[#C5A021]/15 transition-all">
            <span className="material-symbols-rounded text-slate-400 mr-4">search</span>
            <input
              type="text"
              value={orderSearch}
              onChange={e => setOrderSearch(e.target.value)}
              placeholder="البحث بالرقم، العميل، الهاتف، التتبع..."
              className="w-full bg-transparent border-0 outline-none text-xs font-black text-slate-800 pr-2 pl-4 py-3.5 placeholder:text-slate-400"
            />
            <span className="material-symbols-rounded text-slate-400 ml-4 cursor-pointer hover:text-slate-600">settings</span>
          </div>
        </div>
        {/* Date Filter */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-wrap gap-3 items-center">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">الفترة:</span>
          {[
            { key: "today", label: "اليوم" },
            { key: "week",  label: "آخر 7 أيام" },
            { key: "month", label: "آخر 30 يوم" },
            { key: "all",   label: "الكل" },
            { key: "custom", label: "مخصص" },
          ].map(r => (
            <button
              key={r.key}
              onClick={() => {
                if (setOrdersDateRange) {
                  setOrdersDateRange(r.key);
                  if (r.key !== "custom" && onRefresh) {
                    setTimeout(() => onRefresh(), 50);
                  }
                }
              }}
              className={cn(
                "px-4 py-2 rounded-2xl text-xs font-black transition-all",
                ordersDateRange === r.key ? "bg-[#C5A021] text-white" : "bg-white text-slate-400 hover:bg-slate-100 border border-slate-200/50"
              )}
            >{r.label}</button>
          ))}
          {ordersDateRange === "custom" && (
            <div className="flex items-center gap-2 mr-2">
              <input
                type="date"
                value={ordersCustomFrom || ""}
                onChange={e => setOrdersCustomFrom && setOrdersCustomFrom(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
              />
              <span className="text-slate-400">←</span>
              <input
                type="date"
                value={ordersCustomTo || ""}
                onChange={e => setOrdersCustomTo && setOrdersCustomTo(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
              />
              <button
                onClick={() => onCustomDateApply && onCustomDateApply()}
                className="bg-[#C5A021] text-white px-4 py-2 rounded-xl text-xs font-black"
              >
                تطبيق
              </button>
            </div>
          )}
        </div>

        {/* Filter Controls & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
          
          {/* View switcher & Filters */}
          <div className="flex items-center gap-3 flex-wrap text-xs">
            {/* View Mode Icons */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode("list")} 
                className={cn("p-2 rounded-lg transition-all", viewMode === "list" ? "bg-white text-[#0F172A] shadow-sm" : "text-slate-400 hover:text-slate-600")}
              >
                <span className="material-symbols-rounded text-base block">view_list</span>
              </button>
              <button 
                onClick={() => setViewMode("card")} 
                className={cn("p-2 rounded-lg transition-all", viewMode === "card" ? "bg-white text-[#0F172A] shadow-sm" : "text-slate-400 hover:text-slate-600")}
              >
                <span className="material-symbols-rounded text-base block">grid_view</span>
              </button>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={isDirectMode} 
                  onChange={e => setIsDirectMode(e.target.checked)} 
                  className="w-3.5 h-3.5 rounded accent-[#C5A021]" 
                />
                <span className="font-bold text-slate-600">مباشر</span>
              </label>
              <div className="w-px h-4 bg-slate-200" />
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={isEditableMode} 
                  onChange={e => setIsEditableMode(e.target.checked)} 
                  className="w-3.5 h-3.5 rounded accent-[#C5A021]" 
                />
                <span className="font-bold text-slate-600">قابل للتعديل</span>
              </label>
            </div>

            {/* Dropdown Filters (Favorites, GroupBy, Filters) */}
            <div className="flex items-center gap-2 relative">
              
              {/* Group By Dropdown */}
              <div className="relative" onClick={e => e.stopPropagation()}>
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === "groupby" ? null : "groupby")}
                  className={cn("flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all", groupBy !== "none" && "border-[#C5A021]/50 text-[#C5A021] bg-[#C5A021]/5")}
                >
                  <span className="material-symbols-rounded text-base">group_work</span>
                  <span>تجميع حسب: {groupBy === "status" ? "الحالة" : groupBy === "city" ? "المدينة" : groupBy === "sender" ? "المرسل" : "بدون"}</span>
                  <span className="material-symbols-rounded text-xs">keyboard_arrow_down</span>
                </button>
                {activeDropdown === "groupby" && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-30 py-2">
                    <button onClick={() => { setGroupBy("none"); setActiveDropdown(null); }} className={cn("w-full text-right px-4 py-2 hover:bg-slate-50 font-bold", groupBy === "none" && "text-[#C5A021]")}>بدون تجميع</button>
                    <button onClick={() => { setGroupBy("status"); setActiveDropdown(null); }} className={cn("w-full text-right px-4 py-2 hover:bg-slate-50 font-bold", groupBy === "status" && "text-[#C5A021]")}>الحالة</button>
                    <button onClick={() => { setGroupBy("city"); setActiveDropdown(null); }} className={cn("w-full text-right px-4 py-2 hover:bg-slate-50 font-bold", groupBy === "city" && "text-[#C5A021]")}>المدينة</button>
                    <button onClick={() => { setGroupBy("sender"); setActiveDropdown(null); }} className={cn("w-full text-right px-4 py-2 hover:bg-slate-50 font-bold", groupBy === "sender" && "text-[#C5A021]")}>المرسل</button>
                  </div>
                )}
              </div>

              {/* Status Filters Dropdown */}
              <div className="relative" onClick={e => e.stopPropagation()}>
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === "filters" ? null : "filters")}
                  className={cn("flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all", oStatusFilter !== "الكل" && "border-[#C5A021]/50 text-[#C5A021] bg-[#C5A021]/5")}
                >
                  <span className="material-symbols-rounded text-base">filter_alt</span>
                  <span>الفلاتر: {oStatusFilter === "الكل" ? "الكل" : ORDER_STATUSES[oStatusFilter]?.label}</span>
                  <span className="material-symbols-rounded text-xs">keyboard_arrow_down</span>
                </button>
                {activeDropdown === "filters" && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl z-30 py-2 max-h-72 overflow-y-auto">
                    <button onClick={() => { setOStatusFilter("الكل"); setActiveDropdown(null); }} className={cn("w-full text-right px-4 py-2 hover:bg-slate-50 font-bold", oStatusFilter === "الكل" && "text-[#C5A021]")}>جميع الحالات (الكل)</button>
                    {Object.keys(ORDER_STATUSES).map(key => (
                      <button 
                        key={key} 
                        onClick={() => { setOStatusFilter(key); setActiveDropdown(null); }} 
                        className={cn("w-full text-right px-4 py-2 hover:bg-slate-50 font-bold", oStatusFilter === key && "text-[#C5A021]")}
                      >
                        {ORDER_STATUSES[key].label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Favorites Dropdown */}
              <div className="relative" onClick={e => e.stopPropagation()}>
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === "favorites" ? null : "favorites")}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  <span className="material-symbols-rounded text-base text-amber-400">star</span>
                  <span>المفضلات</span>
                  <span className="material-symbols-rounded text-xs">keyboard_arrow_down</span>
                </button>
                {activeDropdown === "favorites" && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-30 py-2">
                    <p className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">تفضيلاتي</p>
                    <button className="w-full text-right px-4 py-2 hover:bg-slate-50 font-bold text-slate-700">شحنات الخرطوم</button>
                    <button className="w-full text-right px-4 py-2 hover:bg-slate-50 font-bold text-slate-700">الطلبات العاجلة</button>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Action Buttons: Create Order & Quick Order */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                showToast?.("يمكنك إنشاء طلب جديد من خلال تبويب المزامنة أو لوحة التحكم خ", "info");
              }}
              className="flex items-center gap-1.5 bg-[#C5A021] text-white px-5 py-2.5 rounded-xl font-black text-xs hover:bg-[#0F172A] transition-all shadow-md shadow-[#C5A021]/15"
            >
              <span className="material-symbols-rounded text-sm">add</span>
              إنشاء
            </button>
            <button 
              onClick={() => {
                const scannerInput = document.getElementById("barcode-scanner-input");
                if (scannerInput) {
                  scannerInput.focus();
                  showToast?.("يرجى البدء في مسح الباركود للطلب السريع! خ", "info");
                }
              }}
              className="flex items-center gap-1.5 bg-[#0F172A] text-white px-4 py-2.5 rounded-xl font-black text-xs hover:bg-[#C5A021] transition-all shadow-md shadow-[#0F172A]/10"
            >
              <span className="material-symbols-rounded text-sm text-[#C5A021]">bolt</span>
              طلبية سريعة
            </button>
          </div>

        </div>

      </div>

      {/* Barcode Quick Assignment Banner */}
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
                id="barcode-scanner-input"
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

      <div className={cn(classes.card, "border border-slate-100 shadow-sm overflow-hidden")}>
        
        {/* Table Toolbar & Grouping Info */}
        <div className="p-5 md:p-6 flex items-center justify-between gap-4 flex-wrap bg-slate-50/50 border-b border-slate-100">
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
                <div className="flex items-center gap-2 bg-[#C5A021]/5 border border-[#C5A021]/20 px-3 py-1.5 rounded-2xl shrink-0">
                  <span className="text-[10px] font-black text-[#C5A021]">الإجراءات الجماعية:</span>
                  
                  {/* Bulk Assign Driver */}
                  <select
                    disabled={assigningLoading}
                    onChange={async (e) => {
                      const dId = e.target.value;
                      if (!dId) return;
                      if (confirm(`هل أنت متأكد من تعيين ${selectedIds.size} طلبات للمندوب المختار؟`)) {
                        await handleBulkAssignDriver(dId);
                      }
                      e.target.value = "";
                    }}
                    className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-[10px] font-black outline-none text-slate-800 focus:border-[#C5A021] cursor-pointer"
                  >
                    <option value="">🚙 تعيين مندوب للمحددة...</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>

                  {/* Bulk Assign Branch */}
                  <select
                    disabled={assigningLoading}
                    onChange={async (e) => {
                      const bId = e.target.value;
                      if (!bId) return;
                      if (confirm(`هل أنت متأكد من تحويل ${selectedIds.size} طلبات للفرع المختار؟`)) {
                        await handleBulkAssignBranch(bId);
                      }
                      e.target.value = "";
                    }}
                    className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-[10px] font-black outline-none text-slate-800 focus:border-[#C5A021] cursor-pointer"
                  >
                    <option value="">🏢 تحويل فرع للمحددة...</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>

                  {/* Bulk Status Change */}
                  <select
                    disabled={assigningLoading}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      if (!newStatus) return;
                      const statusLabel = ORDER_STATUSES[newStatus]?.label || newStatus;
                      if (confirm(`هل أنت متأكد من تغيير حالة ${selectedIds.size} طلب إلى "${statusLabel}"؟`)) {
                        await handleBulkStatusChange(newStatus);
                      }
                      e.target.value = "";
                    }}
                    className="bg-[#C5A021]/10 border border-[#C5A021]/30 rounded-xl px-2.5 py-1.5 text-[10px] font-black outline-none text-[#0F172A] focus:border-[#C5A021] cursor-pointer"
                  >
                    <option value="">🔄 تغيير الحالة الجماعي...</option>
                    {Object.keys(ORDER_STATUSES).map(key => (
                      <option key={key} value={key}>{ORDER_STATUSES[key].label}</option>
                    ))}
                  </select>
                </div>

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

        {/* ── VIEW MODES ── */}

        {/* VIEW MODE 1: Odoo Cards (Bento style grid) */}
        {viewMode === "card" && (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50/30">
            {filteredOrders.map(order => {
              const firstVendor = order.items?.[0]?.vendor || order.orderItems?.[0]?.vendor;
              const senderName = order.storeName || order.vendorName || firstVendor?.storeName || "متجر مرسال";
              return (
                <div key={order.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition-all relative group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(order.id)} 
                        onChange={() => toggleOne(order.id)}
                        className="w-4 h-4 rounded-full border border-[#C5A021] text-[#C5A021] accent-[#C5A021]" 
                      />
                      <span className="font-mono text-[10px] font-black text-[#C5A021] bg-[#C5A021]/5 px-2.5 py-1 rounded-xl">
                        #{order.id?.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                      order.status === "DELIVERED" ? "bg-green-50 text-green-600 border-green-100" :
                      order.status === "CANCELLED" ? "bg-red-50 text-red-600 border-red-100 font-black" :
                      order.status === "RETURNED" ? "bg-rose-50 text-rose-600 border-rose-100 font-black" :
                      ORDER_STATUSES[order.status]?.cls === "badge-active" ? "bg-green-50 text-green-600 border-green-100" : 
                      "bg-orange-50 text-orange-500 border border-orange-100"
                    )}>
                      {ORDER_STATUSES[order.status]?.label || order.status}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">المرسل (التاجر):</span>
                      <span className="text-xs font-black text-teal-600">{senderName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">المستقبل (العميل):</span>
                      <span className="text-xs font-black text-slate-800">{order.customerName || order.customer?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">الهاتف والوجهة:</span>
                      <span className="text-xs font-bold text-slate-500">{order.city} | <span dir="ltr">{order.phone}</span></span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-50 pt-2 mt-2">
                      <span className="text-[10px] text-slate-400 font-bold">القيمة:</span>
                      <span className="text-sm font-black text-[#0F172A]">{order.totalAmount?.toLocaleString()} ج.س</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-2 border-t border-slate-100">
                    <button onClick={() => onEdit(order)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-[#C5A021] hover:text-white font-bold text-[10px] transition-all">
                      <span className="material-symbols-rounded text-sm">edit</span>
                      تعديل
                    </button>
                    <button onClick={() => onPrint(order)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#0F172A] text-white hover:bg-[#C5A021] font-bold text-[10px] transition-all">
                      <span className="material-symbols-rounded text-sm">print</span>
                      البوليصة
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW MODE 2: Odoo Table (desktop) */}
        {viewMode === "list" && (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[1250px]">
              
              {/* Odoo Style Table Header */}
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-black">
                  <th className="px-4 py-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      checked={allSelected} 
                      onChange={toggleAll} 
                      className="w-5 h-5 rounded-full border-2 border-[#C5A021] text-[#C5A021] cursor-pointer accent-[#C5A021]" 
                    />
                  </th>
                  <th className="px-4 py-4 w-12 text-center">ملاحظة</th>
                  <th className="px-4 py-4">التسلسل</th>
                  <th className="px-4 py-4">الإجراء المطلوب</th>
                  <th className="px-4 py-4">رقم المرجع</th>
                  <th className="px-4 py-4">الحالة</th>
                  <th className="px-4 py-4">حالة التاجر</th>
                  <th className="px-4 py-4">المرسل</th>
                  <th className="px-4 py-4">اسم المرسل إليه</th>
                  <th className="px-4 py-4">المدينة</th>
                  <th className="px-4 py-4">الهاتف</th>
                  <th className="px-4 py-4">القيمة</th>
                  <th className="px-4 py-4 text-center">إجراءات</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs">
                
                {/* ── Grouped Rows Rendering ── */}
                {groupBy !== "none" && groupedOrders && (
                  Object.keys(groupedOrders).map(groupKey => {
                    const groupRows = groupedOrders[groupKey];
                    const isCollapsed = collapsedGroups.has(groupKey);
                    return (
                      <React.Fragment key={groupKey}>
                        
                        {/* Group Header Row */}
                        <tr 
                          onClick={() => toggleGroup(groupKey)}
                          className="bg-slate-50 hover:bg-slate-100/80 cursor-pointer select-none border-y border-slate-200/50"
                        >
                          <td colSpan={13} className="px-4 py-3.5 font-black text-slate-700">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-rounded text-lg text-[#C5A021] transition-transform duration-200" style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                                keyboard_arrow_left
                              </span>
                              <span>{groupKey}</span>
                              <span className="text-[10px] text-slate-400 font-bold bg-slate-200/60 px-2 py-0.5 rounded-md">
                                {groupRows.length} طلبات
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* Group Rows (only if not collapsed) */}
                        {!isCollapsed && groupRows.map((order) => {
                          const firstVendor = order.items?.[0]?.vendor || order.orderItems?.[0]?.vendor;
                          const senderName = order.storeName || order.vendorName || firstVendor?.storeName || "متجر مرسال";
                          return (
                            <tr key={order.id} className={cn("hover:bg-slate-50/50 transition-colors", selectedIds.has(order.id) && "bg-[#C5A021]/5")}>
                              {/* Checkbox */}
                              <td className="px-4 py-4 text-center">
                                <input 
                                  type="checkbox" 
                                  checked={selectedIds.has(order.id)} 
                                  onChange={() => toggleOne(order.id)}
                                  className="w-5 h-5 rounded-full border-2 border-[#C5A021] text-[#C5A021] cursor-pointer accent-[#C5A021]" 
                                />
                              </td>
                              
                              {/* Notes icon */}
                              <td className="px-4 py-4 text-center">
                                {order.notes ? (
                                  <span className="material-symbols-rounded text-amber-500 cursor-pointer text-base" title={order.notes}>
                                    description
                                  </span>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>

                              {/* Sequence */}
                              <td className="px-4 py-4 font-mono font-black text-[#C5A021] tracking-wider">
                                #{order.id?.slice(-8).toUpperCase()}
                              </td>

                              {/* Required Action */}
                              <td className="px-4 py-4 font-bold text-slate-500">
                                {getRequiredAction(order.status)}
                              </td>

                              {/* Reference Number */}
                              <td className="px-4 py-4 text-slate-600 font-bold font-mono">
                                {order.customerReference || order.trackingNumber || "-"}
                              </td>

                              {/* Status Badge */}
                              <td className="px-4 py-4">
                                <div className="flex flex-col items-center gap-1">
                                  <span className={cn(
                                    "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border block text-center w-28",
                                    order.status === "DELIVERED" ? "bg-green-50 text-green-600 border-green-100" :
                                    order.status === "CANCELLED" ? "bg-red-50 text-red-600 border-red-100 font-black" :
                                    order.status === "RETURNED" ? "bg-rose-50 text-rose-600 border-rose-100 font-black" :
                                    ORDER_STATUSES[order.status]?.cls === "badge-active" ? "bg-green-50 text-green-600 border-green-100" : 
                                    "bg-orange-50 text-orange-500 border border-orange-100"
                                  )}>
                                    {ORDER_STATUSES[order.status]?.label || order.status}
                                  </span>
                                  {order.attemptCounter > 0 && (
                                    <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                                      المحاولات: {order.attemptCounter}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Merchant Status */}
                              <td className="px-4 py-4 font-bold text-slate-600">
                                {getMerchantStatus(order.status)}
                              </td>

                              {/* Sender (Vendor) */}
                              <td className="px-4 py-4 font-black text-teal-600">
                                {senderName}
                              </td>

                              {/* Receiver Name */}
                              <td className="px-4 py-4 font-black text-slate-800">
                                {order.customerName || order.customer?.name || "-"}
                              </td>

                              {/* City */}
                              <td className="px-4 py-4 font-bold text-slate-600">
                                {order.city}
                              </td>

                              {/* Phone */}
                              <td className="px-4 py-4 font-bold text-slate-500" dir="ltr">
                                {order.phone}
                              </td>

                              {/* Value */}
                              <td className="px-4 py-4 font-black text-slate-800 whitespace-nowrap">
                                {order.totalAmount?.toLocaleString()} <span className="text-[10px] text-[#C5A021]">ج.س</span>
                              </td>

                              {/* Actions */}
                              <td className="px-4 py-4">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button onClick={() => copyOrderDetails(order)} className={cn("w-8 h-8 rounded-lg bg-white border text-slate-500 flex items-center justify-center transition-all",
                                    copiedId === order.id ? "bg-green-50 border-green-200 text-green-600" : "border-slate-200 hover:bg-[#C5A021] hover:text-white"
                                  )} title="نسخ">
                                    <span className="material-symbols-rounded text-sm">{copiedId === order.id ? "check_circle" : "content_copy"}</span>
                                  </button>
                                  <button onClick={() => onEdit(order)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-[#C5A021] flex items-center justify-center hover:bg-[#C5A021] hover:text-white transition-all" title="تعديل">
                                    <span className="material-symbols-rounded text-sm">edit</span>
                                  </button>
                                  <button onClick={() => onPrint(order)} className="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center hover:bg-[#C5A021] hover:text-white transition-all" title="طباعة">
                                    <span className="material-symbols-rounded text-sm">print</span>
                                  </button>
                                </div>
                              </td>

                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })
                )}

                {/* ── Ungrouped Rows Rendering ── */}
                {groupBy === "none" && filteredOrders.map((order) => {
                  const firstVendor = order.items?.[0]?.vendor || order.orderItems?.[0]?.vendor;
                  const senderName = order.storeName || order.vendorName || firstVendor?.storeName || "متجر مرسال";
                  return (
                    <tr key={order.id} className={cn("hover:bg-slate-50/50 transition-colors", selectedIds.has(order.id) && "bg-[#C5A021]/5")}>
                      {/* Checkbox */}
                      <td className="px-4 py-8 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(order.id)} 
                          onChange={() => toggleOne(order.id)}
                          className="w-5 h-5 rounded-full border-2 border-[#C5A021] text-[#C5A021] cursor-pointer accent-[#C5A021]" 
                        />
                      </td>
                      
                      {/* Notes icon */}
                      <td className="px-4 py-8 text-center">
                        {order.notes ? (
                          <span className="material-symbols-rounded text-amber-500 cursor-pointer text-base" title={order.notes}>
                            description
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Sequence */}
                      <td className="px-4 py-8 font-mono font-black text-[#C5A021] tracking-wider">
                        #{order.id?.slice(-8).toUpperCase()}
                      </td>

                      {/* Required Action */}
                      <td className="px-4 py-8 font-bold text-slate-500">
                        {getRequiredAction(order.status)}
                      </td>

                      {/* Reference Number */}
                      <td className="px-4 py-8 text-slate-600 font-bold font-mono">
                        {order.customerReference || order.trackingNumber || "-"}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-8">
                        <div className="flex flex-col items-center gap-1">
                          <span className={cn(
                            "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border block text-center w-28",
                            order.status === "DELIVERED" ? "bg-green-50 text-green-600 border-green-100" :
                            order.status === "CANCELLED" ? "bg-red-50 text-red-600 border-red-100 font-black" :
                            order.status === "RETURNED" ? "bg-rose-50 text-rose-600 border-rose-100 font-black" :
                            ORDER_STATUSES[order.status]?.cls === "badge-active" ? "bg-green-50 text-green-600 border-green-100" : 
                            "bg-orange-50 text-orange-500 border border-orange-100"
                          )}>
                            {ORDER_STATUSES[order.status]?.label || order.status}
                          </span>
                          {order.attemptCounter > 0 && (
                            <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                              المحاولات: {order.attemptCounter}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Merchant Status */}
                      <td className="px-4 py-8 font-bold text-slate-600">
                        {getMerchantStatus(order.status)}
                      </td>

                      {/* Sender (Vendor) */}
                      <td className="px-4 py-8 font-black text-teal-600">
                        {senderName}
                      </td>

                      {/* Receiver Name */}
                      <td className="px-4 py-8 font-black text-slate-800">
                        {order.customerName || order.customer?.name || "-"}
                      </td>

                      {/* City */}
                      <td className="px-4 py-8 font-bold text-slate-600">
                        {order.city}
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-8 font-bold text-slate-500" dir="ltr">
                        {order.phone}
                      </td>

                      {/* Value */}
                      <td className="px-4 py-8 font-black text-slate-800 whitespace-nowrap">
                        {order.totalAmount?.toLocaleString()} <span className="text-[10px] text-[#C5A021]">ج.س</span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-8">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => copyOrderDetails(order)} className={cn("w-8 h-8 rounded-lg bg-white border text-slate-500 flex items-center justify-center transition-all",
                            copiedId === order.id ? "bg-green-50 border-green-200 text-green-600" : "border-slate-200 hover:bg-[#C5A021] hover:text-white"
                          )} title="نسخ">
                            <span className="material-symbols-rounded text-sm">{copiedId === order.id ? "check_circle" : "content_copy"}</span>
                          </button>
                          <button onClick={() => onEdit(order)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-[#C5A021] flex items-center justify-center hover:bg-[#C5A021] hover:text-white transition-all" title="تعديل">
                            <span className="material-symbols-rounded text-sm">edit</span>
                          </button>
                          <button onClick={() => onPrint(order)} className="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center hover:bg-[#C5A021] hover:text-white transition-all" title="طباعة">
                            <span className="material-symbols-rounded text-sm">print</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={13} className="py-40 text-center text-slate-300">
                      <span className="material-symbols-rounded text-[100px] opacity-20 block mx-auto">order_approve</span>
                      <p className="font-black text-lg uppercase tracking-[0.3em] text-slate-400 mt-4">لا توجد طلبات مطابقة</p>
                    </td>
                  </tr>
                )}

              </tbody>

            </table>
          </div>
        )}

      </div>

    </div>
  );
}
