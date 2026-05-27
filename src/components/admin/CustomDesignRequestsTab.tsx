"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, CheckCircle, XCircle, Edit2, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

type RequestStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

interface AdminCustomRequest {
  id: string;
  vendorId: string;
  description: string;
  requirements: any;
  status: RequestStatus;
  adminNotes?: string | null;
  price: number;
  createdAt: string;
  updatedAt: string;
  vendor?: {
    storeName: string;
    phone?: string | null;
    user?: { name?: string | null; email?: string | null };
  };
}

const STATUS_OPTIONS: Array<{ value: RequestStatus; label: string; cls: string; Icon: any }> = [
  { value: "PENDING", label: "بانتظار المراجعة", cls: "bg-amber-100 text-amber-700", Icon: Clock },
  { value: "IN_PROGRESS", label: "قيد التنفيذ", cls: "bg-blue-100 text-blue-700", Icon: Sparkles },
  { value: "COMPLETED", label: "تم الإنجاز", cls: "bg-green-100 text-green-700", Icon: CheckCircle },
  { value: "CANCELLED", label: "تم الإلغاء", cls: "bg-red-100 text-red-700", Icon: XCircle },
];

export default function CustomDesignRequestsTab({
  showToast,
}: {
  showToast?: (msg: string, type?: "success" | "error" | "info") => void;
}) {
  const [requests, setRequests] = useState<AdminCustomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminCustomRequest | null>(null);
  const [filter, setFilter] = useState<"ALL" | RequestStatus>("ALL");

  const [editStatus, setEditStatus] = useState<RequestStatus>("PENDING");
  const [editNotes, setEditNotes] = useState("");
  const [editPrice, setEditPrice] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/design-requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(Array.isArray(data.requests) ? data.requests : []);
      }
    } catch {}
    setLoading(false);
  };

  const openEdit = (r: AdminCustomRequest) => {
    setEditing(r);
    setEditStatus(r.status);
    setEditNotes(r.adminNotes ?? "");
    setEditPrice(r.price ?? 0);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/design-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          status: editStatus,
          adminNotes: editNotes,
          price: editPrice,
        }),
      });
      if (res.ok) {
        if (showToast) showToast("تم تحديث الطلب بنجاح", "success");
        setEditing(null);
        fetchRequests();
      } else if (showToast) {
        showToast("فشل التحديث", "error");
      }
    } catch {
      if (showToast) showToast("فشل التحديث", "error");
    }
    setSaving(false);
  };

  const filtered = requests.filter((r) => filter === "ALL" || r.status === filter);

  const statusBadge = (status: RequestStatus) => {
    const def = STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];
    const Icon = def.Icon;
    return (
      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 w-fit", def.cls)}>
        <Icon size={12} /> {def.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-20 text-center font-black text-gray-400">جاري تحميل طلبات التصميم...</div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-2xl">
          <Sparkles size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-[#0F172A]">طلبات التصميم المخصص</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
            Custom Design Requests (Vixcell)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {(["ALL", ...STATUS_OPTIONS.map((s) => s.value)] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black transition-all",
              filter === f
                ? "bg-purple-500 text-white shadow-lg"
                : "bg-white text-gray-400 border border-gray-100 hover:border-purple-300",
            )}
          >
            {f === "ALL"
              ? "الكل"
              : STATUS_OPTIONS.find((s) => s.value === f)?.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 p-16 text-center">
          <Sparkles size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="font-black text-gray-400">لا توجد طلبات</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((req) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    {statusBadge(req.status)}
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {req.vendor?.storeName ?? req.vendorId}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      • {req.vendor?.user?.email ?? req.vendor?.phone ?? "—"}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      • {new Date(req.createdAt).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#0F172A] leading-relaxed whitespace-pre-wrap">
                    {req.description}
                  </p>
                  {req.requirements && (req.requirements.colors || req.requirements.references) && (
                    <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                      {req.requirements.colors && (
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-[10px] font-black text-gray-400 uppercase">الألوان</p>
                          <p className="font-bold">{req.requirements.colors}</p>
                        </div>
                      )}
                      {req.requirements.references && (
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-[10px] font-black text-gray-400 uppercase">مراجع</p>
                          <p className="font-bold truncate">{req.requirements.references}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {req.adminNotes && (
                    <div className="bg-indigo-50 rounded-xl p-3 mt-3">
                      <p className="text-[10px] font-black text-indigo-500 uppercase mb-1">ملاحظات الإدارة</p>
                      <p className="text-xs font-bold text-indigo-900">{req.adminNotes}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  {req.price > 0 && (
                    <p className="text-lg font-black text-[#C5A021]">{req.price.toLocaleString()} ج.س</p>
                  )}
                  <button
                    onClick={() => openEdit(req)}
                    className="bg-purple-500 text-white px-4 py-2 rounded-xl font-black text-xs hover:bg-purple-600 transition-all flex items-center gap-2"
                  >
                    <Edit2 size={12} /> تعديل
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditing(null)} />
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full relative z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-[#0F172A]">تحديث الطلب</h3>
                <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                    الحالة
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUS_OPTIONS.map((opt) => {
                      const Icon = opt.Icon;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setEditStatus(opt.value)}
                          className={cn(
                            "p-3 rounded-xl border-2 text-xs font-black flex items-center justify-center gap-2 transition-all",
                            editStatus === opt.value
                              ? cn(opt.cls, "border-current")
                              : "border-gray-100 text-gray-400 hover:border-gray-300",
                          )}
                        >
                          <Icon size={12} /> {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                    ملاحظات للتاجر
                  </label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="رسالة للتاجر حول حالة طلبه..."
                    className="w-full h-24 bg-gray-50 border border-gray-100 rounded-2xl p-3 text-xs font-bold outline-none focus:border-purple-500 resize-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                    السعر (ج.س)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value) || 0)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-3 text-sm font-bold outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-purple-500 text-white py-3 rounded-xl font-black text-sm hover:bg-purple-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save size={14} /> حفظ
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="px-6 bg-gray-100 text-gray-600 py-3 rounded-xl font-black text-sm hover:bg-gray-200 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
