"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Check, X, AlertCircle, Search,
  Clock, ShieldCheck, Eye, ExternalLink, FileText, Phone, Mail, MapPin, User, Sparkles, Crown, Store
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
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-all"
                  >
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
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-[#0F172A] flex items-center gap-2">
                        <ShieldCheck size={16} className="text-[#C5A021]" />
                        تحليل الذكاء الاصطناعي
                      </span>
                      <span
                        className={cn(
                          "text-sm font-black",
                          selectedReq.aiConfidence >= 70 ? "text-green-600" : "text-amber-600",
                        )}
                      >
                        {selectedReq.aiConfidence.toFixed(1)}% ثقة
                      </span>
                    </div>
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
