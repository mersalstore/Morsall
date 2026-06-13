"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ReturnsTabProps {
  showToast?: (message: string, type?: "success" | "error" | "info") => void;
}

// Lifecycle of a return (مرتجع). Each status knows which transitions come next.
const STATUS_META: Record<
  string,
  { label: string; badge: string; next: { s: string; label: string; icon: string; cls: string }[] }
> = {
  REQUESTED: {
    label: "طلب إرجاع",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    next: [
      { s: "APPROVED", label: "موافقة", icon: "check", cls: "bg-blue-600 hover:bg-blue-700" },
      { s: "REJECTED", label: "رفض", icon: "close", cls: "bg-red-500 hover:bg-red-600" },
    ],
  },
  APPROVED: {
    label: "تمت الموافقة",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    next: [{ s: "RECEIVED", label: "تم استلام المرتجع", icon: "inventory_2", cls: "bg-indigo-600 hover:bg-indigo-700" }],
  },
  RECEIVED: {
    label: "تم استلام المرتجع",
    badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
    next: [{ s: "REFUNDED", label: "تم رد المبلغ", icon: "payments", cls: "bg-emerald-600 hover:bg-emerald-700" }],
  },
  REFUNDED: {
    label: "تم رد المبلغ",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    next: [],
  },
  REJECTED: {
    label: "مرفوض",
    badge: "bg-red-100 text-red-700 border-red-200",
    next: [],
  },
};

const FILTERS = ["ALL", "REQUESTED", "APPROVED", "RECEIVED", "REFUNDED", "REJECTED"];
const FILTER_LABELS: Record<string, string> = {
  ALL: "الكل",
  REQUESTED: "طلبات جديدة",
  APPROVED: "موافق عليها",
  RECEIVED: "تم استلامها",
  REFUNDED: "تم ردها",
  REJECTED: "مرفوضة",
};

export default function ReturnsTab({ showToast }: ReturnsTabProps) {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  // Create-return form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ orderId: "", reason: "", refundAmount: "", restock: true });
  const [creating, setCreating] = useState(false);

  const toast = (m: string, t?: "success" | "error" | "info") => (showToast ? showToast(m, t) : undefined);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/returns");
      const data = await res.json();
      setReturns(Array.isArray(data) ? data : []);
    } catch {
      toast("تعذر تحميل المرتجعات", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setSavingId(id);
    try {
      const res = await fetch("/api/admin/returns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, adminNote: notes[id] || undefined }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "فشل التحديث");
      }
      toast(`تم تحديث المرتجع إلى: ${STATUS_META[status]?.label || status} ✅`, "success");
      await load();
    } catch (e: any) {
      toast(e.message || "حدث خطأ أثناء التحديث", "error");
    } finally {
      setSavingId(null);
    }
  };

  const createReturn = async () => {
    if (!form.orderId.trim() || !form.reason.trim()) {
      toast("أدخل رقم الطلب وسبب الإرجاع", "error");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: form.orderId.trim(),
          reason: form.reason.trim(),
          refundAmount: form.refundAmount ? Number(form.refundAmount) : 0,
          restock: form.restock,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "فشل إنشاء المرتجع");
      }
      toast("تم إنشاء المرتجع بنجاح 📦", "success");
      setForm({ orderId: "", reason: "", refundAmount: "", restock: true });
      setShowForm(false);
      await load();
    } catch (e: any) {
      toast(e.message || "حدث خطأ", "error");
    } finally {
      setCreating(false);
    }
  };

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === "ALL" ? returns.length : returns.filter((r) => r.status === f).length;
    return acc;
  }, {} as Record<string, number>);

  const visible = filter === "ALL" ? returns : returns.filter((r) => r.status === filter);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#0F172A] flex items-center gap-2">
            <span className="material-symbols-rounded text-[#C5A021]">assignment_return</span>
            إدارة المرتجعات
          </h2>
          <p className="text-xs text-gray-400 font-bold mt-1">طلبات إرجاع الطلبات من العملاء ومعالجة استرداد المبالغ</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-[#C5A021] text-white px-5 py-2.5 rounded-xl font-black text-sm hover:bg-[#0F172A] transition-all"
        >
          <span className="material-symbols-rounded text-base">{showForm ? "close" : "add"}</span>
          {showForm ? "إغلاق النموذج" : "تسجيل مرتجع جديد"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">رقم الطلب</label>
              <input
                value={form.orderId}
                onChange={(e) => setForm((p) => ({ ...p, orderId: e.target.value }))}
                placeholder="مثال: W4BOFPOE أو رقم الطلب الكامل"
                className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-4 py-3 outline-none font-bold transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">قيمة الاسترداد (ج.س)</label>
              <input
                type="number"
                min="0"
                value={form.refundAmount}
                onChange={(e) => setForm((p) => ({ ...p, refundAmount: e.target.value }))}
                placeholder="0"
                className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-4 py-3 outline-none font-bold transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">سبب الإرجاع</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
              placeholder="منتج تالف، مقاس غير مناسب، إلخ..."
              rows={2}
              className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-2xl px-4 py-3 outline-none font-bold transition-all resize-none"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={form.restock}
                onChange={(e) => setForm((p) => ({ ...p, restock: e.target.checked }))}
                className="w-4 h-4 accent-[#C5A021]"
              />
              إعادة الكمية إلى المخزون عند الاستلام
            </label>
            <button
              onClick={createReturn}
              disabled={creating}
              className="bg-[#0F172A] text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-[#C5A021] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {creating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-rounded text-base">save</span>}
              حفظ المرتجع
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black transition-all border flex items-center gap-2",
              filter === f ? "bg-[#0F172A] text-white border-[#0F172A]" : "bg-white text-gray-500 border-gray-200 hover:border-[#C5A021]"
            )}
          >
            {FILTER_LABELS[f]}
            <span className={cn("px-1.5 py-0.5 rounded-md text-[10px]", filter === f ? "bg-white/20" : "bg-gray-100")}>{counts[f] || 0}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#C5A021] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <span className="material-symbols-rounded text-5xl mb-3 block">inbox</span>
          <p className="font-bold">لا توجد مرتجعات في هذا القسم</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visible.map((r) => {
            const meta = STATUS_META[r.status] || { label: r.status, badge: "bg-gray-100 text-gray-600 border-gray-200", next: [] };
            const items = r.items || [];
            return (
              <div key={r.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-[#0F172A]">
                      مرتجع <span className="font-mono text-[#C5A021]">#{r.id?.slice(-6).toUpperCase()}</span>
                    </p>
                    <p className="text-[11px] text-gray-400 font-bold mt-0.5">
                      الطلب #{r.order?.id?.slice(-8).toUpperCase() || "—"} · {new Date(r.createdAt).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                  <span className={cn("px-3 py-1 rounded-xl text-[11px] font-black border", meta.badge)}>{meta.label}</span>
                </div>

                <div className="bg-gray-50 rounded-2xl p-3 text-xs space-y-1">
                  <p className="font-bold text-[#0F172A]">{r.order?.customerName || "—"} <span className="text-gray-400" dir="ltr">{r.order?.phone || ""}</span></p>
                  <p className="text-gray-500">{r.order?.city || "—"}</p>
                  <p className="text-gray-700 font-bold mt-1.5"><span className="text-gray-400">السبب:</span> {r.reason}</p>
                </div>

                {items.length > 0 && (
                  <div className="space-y-1.5">
                    {items.map((it: any) => (
                      <div key={it.id} className="flex items-center justify-between text-xs bg-gray-50/60 rounded-xl px-3 py-2">
                        <span className="font-bold text-[#0F172A] truncate">{it.product?.title || "منتج"}</span>
                        <span className="text-gray-500 shrink-0">× {it.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-bold">قيمة الاسترداد</span>
                  <span className="font-black text-[#0F172A]">{(r.refundAmount || 0).toLocaleString()} ج.س</span>
                </div>
                {r.restock && (
                  <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <span className="material-symbols-rounded text-sm">inventory</span>
                    سيُعاد للمخزون عند الاستلام
                  </p>
                )}

                {meta.next.length > 0 ? (
                  <div className="space-y-2 pt-1 border-t border-gray-100">
                    <input
                      value={notes[r.id] || ""}
                      onChange={(e) => setNotes((p) => ({ ...p, [r.id]: e.target.value }))}
                      placeholder="ملاحظة الإدارة (اختياري)"
                      className="w-full bg-gray-50 border border-transparent focus:border-[#C5A021] rounded-xl px-3 py-2 text-xs font-bold outline-none transition-all"
                    />
                    <div className="flex gap-2">
                      {meta.next.map((n) => (
                        <button
                          key={n.s}
                          onClick={() => updateStatus(r.id, n.s)}
                          disabled={savingId === r.id}
                          className={cn("flex-1 text-white py-2.5 rounded-xl font-black text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5", n.cls)}
                        >
                          <span className="material-symbols-rounded text-sm">{n.icon}</span>
                          {n.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  r.adminNote && (
                    <p className="text-[11px] text-gray-500 bg-gray-50 rounded-xl px-3 py-2 border-t border-gray-100">
                      <span className="font-black text-gray-400">ملاحظة: </span>{r.adminNote}
                    </p>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
