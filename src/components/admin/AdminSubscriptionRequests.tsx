"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Check, X, AlertCircle, Search, Filter,
  Clock, ShieldCheck, Eye, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type TransactionStatus = "PENDING" | "APPROVED" | "REJECTED";

interface SubscriptionTransaction {
  id: string;
  vendorId: string;
  vendor?: { name: string; email: string; phone: string };
  planId: string;
  plan?: { name: string; price: number; durationDays: number };
  method: string;
  status: TransactionStatus;
  screenshotUrl?: string;
  aiConfidence?: number;
  aiData?: any;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSubscriptionRequests({ showToast }: { showToast?: (msg: string, type?: "success" | "error" | "info") => void }) {
  const [transactions, setTransactions] = useState<SubscriptionTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | TransactionStatus>("ALL");
  const [search, setSearch] = useState("");
  const [selectedTx, setSelectedTx] = useState<SubscriptionTransaction | null>(null);

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscription-transactions");
      if (res.ok) {
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : data.transactions || []);
      }
    } catch {}
    setLoading(false);
  };

  const handleAction = async (id: string, action: "APPROVED" | "REJECTED") => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/subscription-transactions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: id, status: action }),
      });
      if (res.ok) {
        const msg = action === "APPROVED" ? "✅ تم تفعيل الاشتراك بنجاح" : "❌ تم رفض طلب الاشتراك";
        if (showToast) showToast(msg, "success");
        fetchTransactions();
      } else {
        if (showToast) showToast("حدث خطأ", "error");
      }
    } catch {}
    setActionLoading(null);
  };

  const filtered = transactions.filter(tx => {
    if (filter !== "ALL" && tx.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = tx.vendor?.name?.toLowerCase() || "";
      const plan = tx.plan?.name?.toLowerCase() || "";
      if (!name.includes(q) && !plan.includes(q)) return false;
    }
    return true;
  });

  const statusBadge = (status: TransactionStatus) => {
    switch (status) {
      case "PENDING":
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black flex items-center gap-1"><Clock size={12} />قيد المراجعة</span>;
      case "APPROVED":
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black flex items-center gap-1"><Check size={12} />تم التفعيل</span>;
      case "REJECTED":
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black flex items-center gap-1"><X size={12} />مرفوض</span>;
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-gray-400">جاري تحميل طلبات الاشتراك...</div>;

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-[#C5A021] to-[#F29124] text-white flex items-center justify-center shadow-2xl">
            <CreditCard size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-[#0F172A]">طلبات الاشتراك عبر الحوالات</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Bank Transfer Subscription Requests</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black transition-all",
              filter === f ? "bg-[#C5A021] text-white shadow-lg" : "bg-white text-gray-400 border border-gray-100 hover:border-[#C5A021]/30"
            )}
          >
            {f === "ALL" ? "الكل" : f === "PENDING" ? "قيد المراجعة" : f === "APPROVED" ? "مفعلة" : "مرفوضة"}
          </button>
        ))}
        <div className="mr-auto relative">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث عن مورد أو باقة..."
            className="bg-white border border-gray-100 rounded-xl pr-10 pl-4 py-2 text-xs font-bold outline-none focus:border-[#C5A021] w-56" />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "المجموع", value: transactions.length, color: "from-gray-500 to-gray-700" },
          { label: "قيد المراجعة", value: transactions.filter(t => t.status === "PENDING").length, color: "from-amber-500 to-orange-500" },
          { label: "مفعلة", value: transactions.filter(t => t.status === "APPROVED").length, color: "from-green-500 to-emerald-500" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-3", s.color)}>
              {i === 0 ? <CreditCard size={16} /> : i === 1 ? <Clock size={16} /> : <Check size={16} />}
            </div>
            <p className="text-2xl font-black text-[#0F172A]">{s.value}</p>
            <p className="text-[10px] font-black text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <AlertCircle size={40} className="text-gray-200 mx-auto mb-4" />
            <p className="font-black text-gray-400">لا توجد طلبات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-right p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">المورد</th>
                  <th className="text-right p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">الباقة</th>
                  <th className="text-right p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">المبلغ</th>
                  <th className="text-right p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">الذكاء الاصطناعي</th>
                  <th className="text-right p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">الحالة</th>
                  <th className="text-right p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">التاريخ</th>
                  <th className="text-center p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => (
                  <motion.tr key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-all">
                    <td className="p-4">
                      <p className="font-black text-sm text-[#0F172A]">{tx.vendor?.name || tx.vendorId}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{tx.vendor?.phone || tx.vendor?.email}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-sm">{tx.plan?.name || "—"}</p>
                      <p className="text-[10px] text-gray-400">{tx.plan?.durationDays || "—"} يوم</p>
                    </td>
                    <td className="p-4">
                      <p className="font-black text-sm text-[#C5A021]">{tx.plan?.price || "—"} ج.س</p>
                    </td>
                    <td className="p-4">
                      {tx.aiConfidence != null ? (
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={14} className={cn(tx.aiConfidence >= 70 ? "text-green-500" : "text-amber-500")} />
                          <span className={cn("text-xs font-black", tx.aiConfidence >= 70 ? "text-green-600" : "text-amber-600")}>
                            {tx.aiConfidence.toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-4">{statusBadge(tx.status)}</td>
                    <td className="p-4">
                      <p className="text-xs font-bold text-gray-500">{new Date(tx.createdAt).toLocaleDateString("ar-SA")}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {tx.screenshotUrl && (
                          <button onClick={() => setSelectedTx(tx)}
                            className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-all">
                            <Eye size={14} />
                          </button>
                        )}
                        {tx.status === "PENDING" && (
                          <>
                            <button onClick={() => handleAction(tx.id, "APPROVED")} disabled={actionLoading === tx.id}
                              className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all disabled:opacity-50">
                              {actionLoading === tx.id ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Check size={14} />}
                            </button>
                            <button onClick={() => handleAction(tx.id, "REJECTED")} disabled={actionLoading === tx.id}
                              className="w-8 h-8 rounded-lg bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50">
                              {actionLoading === tx.id ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <X size={14} />}
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
        {selectedTx && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTx(null)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full relative z-10"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-[#0F172A]">تفاصيل طلب الاشتراك</h3>
                <button onClick={() => setSelectedTx(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المورد</p>
                    <p className="font-black text-[#0F172A]">{selectedTx.vendor?.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الباقة</p>
                    <p className="font-black text-[#0F172A]">{selectedTx.plan?.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المبلغ</p>
                    <p className="font-black text-[#C5A021]">{selectedTx.plan?.price || "—"} ج.س</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المدة</p>
                    <p className="font-black text-[#0F172A]">{selectedTx.plan?.durationDays || "—"} يوم</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">تاريخ الطلب</p>
                    <p className="font-black text-sm">{new Date(selectedTx.createdAt).toLocaleDateString("ar-SA")}</p>
                  </div>
                  <div>{statusBadge(selectedTx.status)}</div>
                </div>

                {selectedTx.aiConfidence != null && (
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-[#0F172A] flex items-center gap-2">
                        <ShieldCheck size={16} className="text-[#C5A021]" />
                        تحليل الذكاء الاصطناعي
                      </span>
                      <span className={cn("text-sm font-black", selectedTx.aiConfidence >= 70 ? "text-green-600" : "text-amber-600")}>
                        {selectedTx.aiConfidence.toFixed(1)}% ثقة
                      </span>
                    </div>
                    {selectedTx.aiData && (
                      <div className="text-xs text-gray-500 space-y-1">
                        {Object.entries(selectedTx.aiData).map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span>{k}</span>
                            <span className="font-bold">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedTx.notes && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400">ملاحظات</p>
                    <p className="text-sm font-bold">{selectedTx.notes}</p>
                  </div>
                )}

                {selectedTx.screenshotUrl && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 mb-2">صورة الإيصال</p>
                    <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-gray-50 border border-gray-200">
                      <Image src={selectedTx.screenshotUrl} alt="إيصال التحويل" fill className="object-contain" />
                    </div>
                    <a href={selectedTx.screenshotUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-blue-600 hover:underline">
                      <ExternalLink size={12} /> فتح الصورة في نافذة جديدة
                    </a>
                  </div>
                )}
              </div>

              {selectedTx.status === "PENDING" && (
                <div className="flex gap-3 mt-8">
                  <button onClick={() => { handleAction(selectedTx.id, "APPROVED"); setSelectedTx(null); }}
                    className="flex-1 bg-green-500 text-white py-3 rounded-xl font-black text-sm hover:bg-green-600 transition-all flex items-center justify-center gap-2">
                    <Check size={16} /> تفعيل الاشتراك
                  </button>
                  <button onClick={() => { handleAction(selectedTx.id, "REJECTED"); setSelectedTx(null); }}
                    className="flex-1 bg-red-500 text-white py-3 rounded-xl font-black text-sm hover:bg-red-600 transition-all flex items-center justify-center gap-2">
                    <X size={16} /> رفض الطلب
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
