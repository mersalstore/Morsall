"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Check, X, AlertCircle, Search,
  Clock, ShieldCheck, Eye, ExternalLink, FileText, Phone, Mail, MapPin, User, Sparkles, Crown, Store,
  CheckSquare, Square, AlertTriangle, Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type TransactionStatus = "PENDING" | "APPROVED" | "REJECTED";
type RequestKind = "REGISTRATION" | "BANK_TRANSFER";

interface UnifiedRequest {
  id: string;
  kind: RequestKind;
  vendorId: string;
  vendor: {
    storeName: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    bankStatementUrl: string | null;
    commercialRegUrl: string | null;
    status: string;
    createdAt: string;
  };
  plan: {
    id: string;
    name: string;
    slug: string;
    price: number;
    durationDays: number;
    isTrial: boolean;
  } | null;
  status: TransactionStatus;
  method: string;
  screenshotUrl: string | null;
  aiConfidence: number | null;
  aiData: any;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const PLAN_BADGE: Record<string, { label: string; cls: string; icon: any }> = {
  freemium: { label: "تجريبية 14 يوم", cls: "bg-emerald-100 text-emerald-700", icon: Sparkles },
  "premium-builder": { label: "Premium Builder", cls: "bg-amber-100 text-amber-700", icon: Crown },
  "custom-design": { label: "Custom Design", cls: "bg-purple-100 text-purple-700", icon: Store },
};

export default function AdminSubscriptionRequests({
  showToast,
}: {
  showToast?: (msg: string, type?: "success" | "error" | "info") => void;
}) {
  const [requests, setRequests] = useState<UnifiedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | TransactionStatus>("ALL");
  const [kindFilter, setKindFilter] = useState<"ALL" | RequestKind>("ALL");
  const [search, setSearch] = useState("");
  const [selectedReq, setSelectedReq] = useState<UnifiedRequest | null>(null);
  const [rejectingReq, setRejectingReq] = useState<UnifiedRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [bulkReason, setBulkReason] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscription-transactions");
      if (res.ok) {
        const data = await res.json();
        const list: UnifiedRequest[] = data.all ?? [];
        setRequests(list);
      }
    } catch {}
    setLoading(false);
  };

  const handleAction = async (req: UnifiedRequest, action: "APPROVED" | "REJECTED", reason?: string) => {
    setActionLoading(req.id);
    try {
      const res = await fetch("/api/admin/subscription-transactions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: req.id, status: action, reason }),
      });
      if (res.ok) {
        const msg =
          action === "APPROVED" ? "✅ تم تفعيل الاشتراك بنجاح" : "❌ تم رفض الطلب";
        if (showToast) showToast(msg, "success");
        fetchRequests();
      } else if (showToast) {
        showToast("حدث خطأ", "error");
      }
    } catch {
      if (showToast) showToast("حدث خطأ", "error");
    }
    setActionLoading(null);
    setRejectingReq(null);
    setRejectReason("");
  };

  const handleBulk = async (action: "APPROVED" | "REJECTED", reason?: string) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/subscription-transactions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionIds: ids, status: action, reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const msg = action === "APPROVED"
          ? `✅ تم تفعيل ${data.succeeded ?? ids.length} اشتراك`
          : `❌ تم رفض ${data.succeeded ?? ids.length} طلب`;
        if (showToast) showToast(msg, "success");
        setSelectedIds(new Set());
        fetchRequests();
      } else if (showToast) {
        showToast("حدث خطأ في العملية المجمعة", "error");
      }
    } catch {
      if (showToast) showToast("حدث خطأ", "error");
    }
    setBulkLoading(false);
    setBulkAction(null);
    setBulkReason("");
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllPending = (pendingIds: string[]) => {
    setSelectedIds(prev => {
      if (pendingIds.every(id => prev.has(id)) && pendingIds.length > 0) {
        // Deselect all
        const next = new Set(prev);
        pendingIds.forEach(id => next.delete(id));
        return next;
      }
      // Select all pending
      const next = new Set(prev);
      pendingIds.forEach(id => next.add(id));
      return next;
    });
  };

  const filtered = requests.filter((r) => {
    if (filter !== "ALL" && r.status !== filter) return false;
    if (kindFilter !== "ALL" && r.kind !== kindFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const fields = [
        r.vendor.storeName,
        r.vendor.name,
        r.vendor.email,
        r.vendor.phone,
        r.plan?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!fields.includes(q)) return false;
    }
    return true;
  });

  const statusBadge = (status: TransactionStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black flex items-center gap-1 w-fit">
            <Clock size={12} />قيد المراجعة
          </span>
        );
      case "APPROVED":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black flex items-center gap-1 w-fit">
            <Check size={12} />تم التفعيل
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black flex items-center gap-1 w-fit">
            <X size={12} />مرفوض
          </span>
        );
    }
  };

  const planBadge = (slug?: string) => {
    if (!slug) return <span className="text-[10px] text-gray-400">—</span>;
    const def = PLAN_BADGE[slug] ?? { label: slug, cls: "bg-gray-100 text-gray-700", icon: CreditCard };
    const Icon = def.icon;
    return (
      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 w-fit", def.cls)}>
        <Icon size={12} />
        {def.label}
      </span>
    );
  };

  const kindBadge = (kind: RequestKind) => (
    <span
      className={cn(
        "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest",
        kind === "REGISTRATION" ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600",
      )}
    >
      {kind === "REGISTRATION" ? "تسجيل جديد" : "تحويل بنكي"}
    </span>
  );

  if (loading)
    return (
      <div className="p-20 text-center font-black text-gray-400">
        جاري تحميل طلبات الاشتراك...
      </div>
    );

  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-[#C5A021] to-[#F29124] text-white flex items-center justify-center shadow-2xl">
            <CreditCard size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-[#0F172A]">طلبات الاشتراكات</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
              Subscription & Registration Requests
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black transition-all",
              filter === f
                ? "bg-[#C5A021] text-white shadow-lg"
                : "bg-white text-gray-400 border border-gray-100 hover:border-[#C5A021]/30",
            )}
          >
            {f === "ALL"
              ? "كل الحالات"
              : f === "PENDING"
              ? "قيد المراجعة"
              : f === "APPROVED"
              ? "مفعلة"
              : "مرفوضة"}
          </button>
        ))}

        <div className="w-px h-6 bg-gray-200 mx-2" />

        {(["ALL", "REGISTRATION", "BANK_TRANSFER"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKindFilter(k)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black transition-all",
              kindFilter === k
                ? "bg-[#0F172A] text-white shadow-lg"
                : "bg-white text-gray-400 border border-gray-100 hover:border-[#0F172A]/30",
            )}
          >
            {k === "ALL" ? "كل الأنواع" : k === "REGISTRATION" ? "تسجيلات" : "تحويلات بنكية"}
          </button>
        ))}

        <div className="mr-auto relative">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث عن تاجر أو باقة..."
            className="bg-white border border-gray-100 rounded-xl pr-10 pl-4 py-2 text-xs font-bold outline-none focus:border-[#C5A021] w-56"
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "المجموع", value: totalCount, color: "from-gray-500 to-gray-700", Icon: CreditCard },
          { label: "قيد المراجعة", value: pendingCount, color: "from-amber-500 to-orange-500", Icon: Clock },
          { label: "مفعلة", value: approvedCount, color: "from-green-500 to-emerald-500", Icon: Check },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div
              className={cn(
                "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-3",
                s.color,
              )}
            >
              <s.Icon size={16} />
            </div>
            <p className="text-2xl font-black text-[#0F172A]">{s.value}</p>
            <p className="text-[10px] font-black text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bulk action bar (visible when any pending row is selected) */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-l from-[#0F172A] to-[#1a2744] text-white rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A021] flex items-center justify-center">
              <CheckSquare size={20} />
            </div>
            <div>
              <p className="text-sm font-black">{selectedIds.size} طلب محدد</p>
              <p className="text-[10px] text-white/60 font-bold">اختر إجراء جماعي</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={bulkLoading}
              onClick={() => handleBulk("APPROVED")}
              className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {bulkLoading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={14} />}
              قبول الكل
            </button>
            <button
              disabled={bulkLoading}
              onClick={() => setBulkAction("REJECTED")}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <X size={14} />
              رفض الكل
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-black text-xs transition-all"
            >
              إلغاء التحديد
            </button>
          </div>
        </motion.div>
      )}

      {/* Requests Table */}
      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <AlertCircle size={40} className="text-gray-200 mx-auto mb-4" />
            <p className="font-black text-gray-400">لا توجد طلبات مطابقة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 w-12">
                    {(() => {
                      const pendingIds = filtered.filter(r => r.status === "PENDING").map(r => r.id);
                      const allSelected = pendingIds.length > 0 && pendingIds.every(id => selectedIds.has(id));
                      return (
                        <button
                          onClick={() => toggleSelectAllPending(pendingIds)}
                          disabled={pendingIds.length === 0}
                          className="w-5 h-5 flex items-center justify-center text-[#C5A021] disabled:opacity-30"
                          title={allSelected ? "إلغاء تحديد الكل" : "اختيار كل الطلبات قيد المراجعة"}
                        >
                          {allSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                        </button>
                      );
                    })()}
                  </th>
                  <th className="text-right p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    التاجر
                  </th>
                  <th className="text-right p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    النوع
                  </th>
                  <th className="text-right p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    الباقة
                  </th>
                  <th className="text-right p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    السعر
                  </th>
                  <th className="text-right p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    تحليل AI
                  </th>
                  <th className="text-right p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    الحالة
                  </th>
                  <th className="text-right p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    التاريخ
                  </th>
                  <th className="text-center p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => (
                  <motion.tr
                    key={req.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "border-b border-gray-50 transition-all",
                      selectedIds.has(req.id) ? "bg-[#C5A021]/5" : "hover:bg-gray-50/50",
                    )}
                  >
                    <td className="p-4 w-12">
                      {req.status === "PENDING" ? (
                        <button
                          onClick={() => toggleSelect(req.id)}
                          className="w-5 h-5 flex items-center justify-center text-[#C5A021]"
                        >
                          {selectedIds.has(req.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                        </button>
                      ) : (
                        <span className="w-5 h-5 inline-block" />
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-black text-sm text-[#0F172A]">{req.vendor.storeName}</p>
                      <p className="text-[10px] text-gray-400 font-bold">
                        {req.vendor.name ?? req.vendor.email ?? req.vendor.phone ?? "—"}
                      </p>
                    </td>
                    <td className="p-4">{kindBadge(req.kind)}</td>
                    <td className="p-4">{planBadge(req.plan?.slug)}</td>
                    <td className="p-4">
                      <p className="font-black text-sm text-[#C5A021]">
                        {req.plan ? `${req.plan.price.toLocaleString()} ج.س` : "—"}
                      </p>
                    </td>
                    <td className="p-4">
                      {req.aiConfidence != null ? (
                        <div className="flex items-center gap-1.5">
                          <Brain size={12} className={cn(
                            req.aiConfidence >= 85 ? "text-green-500" :
                            req.aiConfidence >= 50 ? "text-amber-500" : "text-red-500"
                          )} />
                          <span className={cn(
                            "text-xs font-black",
                            req.aiConfidence >= 85 ? "text-green-600" :
                            req.aiConfidence >= 50 ? "text-amber-600" : "text-red-600"
                          )}>
                            {Math.round(req.aiConfidence)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-300">—</span>
                      )}
                    </td>
                    <td className="p-4">{statusBadge(req.status)}</td>
                    <td className="p-4">
                      <p className="text-xs font-bold text-gray-500">
                        {new Date(req.createdAt).toLocaleDateString("ar-EG")}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedReq(req)}
                          className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-all"
                          title="عرض كل التفاصيل"
                        >
                          <Eye size={14} />
                        </button>
                        {req.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleAction(req, "APPROVED")}
                              disabled={actionLoading === req.id}
                              className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all disabled:opacity-50"
                              title="قبول"
                            >
                              {actionLoading === req.id ? (
                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Check size={14} />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setRejectingReq(req);
                                setRejectReason("");
                              }}
                              disabled={actionLoading === req.id}
                              className="w-8 h-8 rounded-lg bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                              title="رفض"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedReq && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedReq(null)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full relative z-10 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-[#0F172A]">تفاصيل الطلب الكاملة</h3>
                  <div className="flex items-center gap-2 mt-2">
                    {kindBadge(selectedReq.kind)}
                    {statusBadge(selectedReq.status)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReq(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Vendor info */}
                <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    بيانات التاجر
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Store size={14} className="text-[#C5A021]" />
                      <span className="font-black text-[#0F172A]">{selectedReq.vendor.storeName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-[#C5A021]" />
                      <span className="font-bold">{selectedReq.vendor.name ?? "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-[#C5A021]" />
                      <span className="text-xs font-bold">{selectedReq.vendor.email ?? "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-[#C5A021]" />
                      <span className="text-xs font-bold" dir="ltr">
                        {selectedReq.vendor.phone ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <MapPin size={14} className="text-[#C5A021]" />
                      <span className="text-xs font-bold">{selectedReq.vendor.location ?? "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Plan info */}
                <div className="bg-gradient-to-br from-[#0F172A] to-[#1a2744] text-white rounded-2xl p-5 space-y-2">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                    الباقة المختارة
                  </p>
                  <div className="flex items-center gap-2">
                    {planBadge(selectedReq.plan?.slug)}
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
                    <div>
                      <p className="text-[10px] font-black text-white/40">الاسم</p>
                      <p className="text-sm font-black">{selectedReq.plan?.name ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/40">السعر</p>
                      <p className="text-sm font-black text-[#C5A021]">
                        {selectedReq.plan ? `${selectedReq.plan.price.toLocaleString()} ج.س` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/40">المدة</p>
                      <p className="text-sm font-black">{selectedReq.plan?.durationDays ?? "—"} يوم</p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      كشف الحساب البنكي
                    </p>
                    {selectedReq.vendor.bankStatementUrl &&
                    selectedReq.vendor.bankStatementUrl !== "pending" &&
                    selectedReq.vendor.bankStatementUrl !== "placeholder_url" ? (
                      <a
                        href={selectedReq.vendor.bankStatementUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-amber-50 text-amber-700 p-3 rounded-xl text-xs font-black hover:bg-amber-100 transition-all"
                      >
                        <FileText size={14} /> فتح المستند
                      </a>
                    ) : (
                      <p className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold text-center">
                        غير مرفق
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      السجل التجاري
                    </p>
                    {selectedReq.vendor.commercialRegUrl &&
                    selectedReq.vendor.commercialRegUrl !== "placeholder_url" ? (
                      <a
                        href={selectedReq.vendor.commercialRegUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-orange-50 text-orange-700 p-3 rounded-xl text-xs font-black hover:bg-orange-100 transition-all"
                      >
                        <FileText size={14} /> فتح المستند
                      </a>
                    ) : (
                      <p className="bg-gray-50 text-gray-400 p-3 rounded-xl text-xs font-bold text-center">
                        غير مرفق
                      </p>
                    )}
                  </div>
                </div>

                {/* Screenshot if any */}
                {selectedReq.screenshotUrl && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      صورة الإيصال
                    </p>
                    <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-gray-50 border border-gray-200">
                      <Image
                        src={selectedReq.screenshotUrl}
                        alt="إيصال التحويل"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <a
                      href={selectedReq.screenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-blue-600 hover:underline"
                    >
                      <ExternalLink size={12} /> فتح الصورة في نافذة جديدة
                    </a>
                  </div>
                )}

                {selectedReq.aiConfidence != null && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 space-y-3 border border-indigo-100">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-sm font-black text-[#0F172A] flex items-center gap-2">
                        <Brain size={16} className="text-indigo-600" />
                        تحليل الذكاء الاصطناعي للإيصال
                      </span>
                      <div className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-black flex items-center gap-2",
                        selectedReq.aiConfidence >= 85 ? "bg-green-100 text-green-700" :
                        selectedReq.aiConfidence >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                      )}>
                        <ShieldCheck size={14} />
                        {selectedReq.aiConfidence.toFixed(1)}% ثقة
                      </div>
                    </div>

                    {/* Comparison details */}
                    {selectedReq.aiData && (
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-indigo-100">
                        {selectedReq.aiData.expectedAmount != null && (
                          <div className="bg-white/60 rounded-xl p-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase">المبلغ المطلوب</p>
                            <p className="text-sm font-black text-[#0F172A]">
                              {Number(selectedReq.aiData.expectedAmount).toLocaleString()} ج.س
                            </p>
                          </div>
                        )}
                        {selectedReq.aiData.amountInReceipt != null && (
                          <div className="bg-white/60 rounded-xl p-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase">المبلغ في الإيصال</p>
                            <p className={cn(
                              "text-sm font-black",
                              selectedReq.aiData.details?.amountMatch ? "text-green-600" : "text-amber-600"
                            )}>
                              {Number(selectedReq.aiData.amountInReceipt).toLocaleString()} ج.س
                            </p>
                          </div>
                        )}
                        {selectedReq.aiData.details?.bankNameInReceipt && (
                          <div className="bg-white/60 rounded-xl p-3 col-span-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase">البنك المكتشف</p>
                            <p className="text-sm font-black text-[#0F172A]">
                              {selectedReq.aiData.details.bankNameInReceipt}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Flags list */}
                    {Array.isArray(selectedReq.aiData?.flags) && selectedReq.aiData.flags.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-indigo-100">
                        <p className="text-[10px] font-black text-gray-500 uppercase">تفاصيل التحليل:</p>
                        {selectedReq.aiData.flags.slice(0, 10).map((flag: string, i: number) => (
                          <p key={i} className="text-xs font-bold text-[#0F172A] leading-relaxed">
                            {flag}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Verdict */}
                    {selectedReq.aiData?.suggestion && (
                      <div className={cn(
                        "rounded-xl p-3 text-center text-xs font-black",
                        selectedReq.aiData.suggestion === "APPROVE" ? "bg-green-500 text-white" :
                        selectedReq.aiData.suggestion === "REVIEW" ? "bg-amber-500 text-white" : "bg-red-500 text-white"
                      )}>
                        توصية الذكاء الاصطناعي: {
                          selectedReq.aiData.suggestion === "APPROVE" ? "✅ معتمد" :
                          selectedReq.aiData.suggestion === "REVIEW" ? "🔍 مراجعة" : "❌ مرفوض"
                        }
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedReq.status === "PENDING" && (
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => {
                      handleAction(selectedReq, "APPROVED");
                      setSelectedReq(null);
                    }}
                    className="flex-1 bg-green-500 text-white py-3 rounded-xl font-black text-sm hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={16} /> قبول الطلب وتفعيل الاشتراك
                  </button>
                  <button
                    onClick={() => {
                      setRejectingReq(selectedReq);
                      setRejectReason("");
                      setSelectedReq(null);
                    }}
                    className="flex-1 bg-red-500 text-white py-3 rounded-xl font-black text-sm hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                  >
                    <X size={16} /> رفض مع ذكر السبب
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Rejection Modal */}
      <AnimatePresence>
        {bulkAction === "REJECTED" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => { setBulkAction(null); setBulkReason(""); }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full relative z-10"
            >
              <h3 className="text-xl font-black text-[#0F172A] mb-2 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} /> رفض {selectedIds.size} طلب
              </h3>
              <p className="text-xs text-gray-500 mb-5">
                سيتم رفض كل الطلبات المحدّدة بنفس السبب وإرساله للتاجر.
              </p>
              <textarea
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
                placeholder="اكتب سبب الرفض المشترك..."
                className="w-full h-32 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs font-bold outline-none focus:border-red-500 text-[#0F172A] mb-5 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (!bulkReason.trim()) {
                      if (showToast) showToast("الرجاء كتابة سبب الرفض", "error");
                      return;
                    }
                    handleBulk("REJECTED", bulkReason.trim());
                  }}
                  disabled={bulkLoading}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-black text-sm hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  {bulkLoading ? "جاري..." : `تأكيد رفض ${selectedIds.size} طلب`}
                </button>
                <button
                  onClick={() => { setBulkAction(null); setBulkReason(""); }}
                  className="w-24 bg-gray-100 text-gray-600 py-3 rounded-xl font-black text-sm hover:bg-gray-200 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rejection Modal */}
      <AnimatePresence>
        {rejectingReq && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setRejectingReq(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full relative z-10"
            >
              <h3 className="text-xl font-black text-[#0F172A] mb-2 flex items-center gap-2">
                <AlertCircle className="text-red-500" size={20} /> رفض طلب الاشتراك
              </h3>
              <p className="text-xs text-gray-500 mb-5">
                سيتم إرسال هذا السبب للتاجر لتوضيح قرار الرفض.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="اكتب سبب الرفض بالتفصيل..."
                className="w-full h-32 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs font-bold outline-none focus:border-red-500 text-[#0F172A] mb-5 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (!rejectReason.trim()) {
                      if (showToast) showToast("الرجاء كتابة سبب الرفض", "error");
                      return;
                    }
                    handleAction(rejectingReq, "REJECTED", rejectReason.trim());
                  }}
                  disabled={actionLoading === rejectingReq.id}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-black text-sm hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  {actionLoading === rejectingReq.id ? "جاري..." : "تأكيد الرفض"}
                </button>
                <button
                  onClick={() => setRejectingReq(null)}
                  className="w-24 bg-gray-100 text-gray-600 py-3 rounded-xl font-black text-sm hover:bg-gray-200 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
