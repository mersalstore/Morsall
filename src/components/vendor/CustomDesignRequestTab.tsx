"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Clock, CheckCircle, XCircle, MessageCircle, Crown, Plus } from "lucide-react";
import { cn } from "../../lib/utils";

interface CustomRequest {
  id: string;
  description: string;
  requirements: any;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  adminNotes?: string | null;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export default function CustomDesignRequestTab({ vixcellWhatsapp }: { vixcellWhatsapp?: string }) {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [tier, setTier] = useState<string>("FREEMIUM");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [description, setDescription] = useState("");
  const [colors, setColors] = useState("");
  const [references, setReferences] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/design-requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(Array.isArray(data.requests) ? data.requests : []);
        setTier(data.tier || "FREEMIUM");
      }
    } catch {}
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 10) {
      alert("الوصف يجب أن يكون 10 أحرف على الأقل");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/vendor/design-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          requirements: { colors, references },
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setDescription("");
        setColors("");
        setReferences("");
        fetchRequests();
      } else {
        const data = await res.json();
        alert(data.error || "حدث خطأ");
      }
    } catch {
      alert("حدث خطأ");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#C5A021] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (tier !== "CUSTOM_DESIGN") {
    return (
      <div className="max-w-3xl mx-auto py-16" dir="rtl">
        <div className="bg-gradient-to-br from-purple-900 via-[#0F172A] to-indigo-900 text-white rounded-[3rem] p-12 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/20 blur-3xl rounded-full" />
          <div className="relative z-10 space-y-6">
            <div className="w-24 h-24 mx-auto rounded-[2rem] bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <Crown size={48} className="text-white" />
            </div>
            <h2 className="text-3xl font-black">تصميم مخصص بفريق Vixcell</h2>
            <p className="text-white/60 font-bold max-w-md mx-auto leading-relaxed">
              هذه الميزة متاحة فقط لباقة Custom Design. اشترك للحصول على فريق متخصص يصمم متجرك كما تتخيله،
              مع تواصل مباشر ومتابعة كاملة.
            </p>
            <a
              href="/vendor/dashboard?tab=subscription"
              className="inline-block bg-purple-500 hover:bg-purple-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-2xl transition-all"
            >
              ترقية إلى Custom Design
            </a>
          </div>
        </div>
      </div>
    );
  }

  const statusBadge = (status: CustomRequest["status"]) => {
    const map = {
      PENDING: { label: "بانتظار المراجعة", cls: "bg-amber-100 text-amber-700", Icon: Clock },
      IN_PROGRESS: { label: "قيد التنفيذ", cls: "bg-blue-100 text-blue-700", Icon: Sparkles },
      COMPLETED: { label: "تم الإنجاز", cls: "bg-green-100 text-green-700", Icon: CheckCircle },
      CANCELLED: { label: "تم الإلغاء", cls: "bg-red-100 text-red-700", Icon: XCircle },
    } as const;
    const def = map[status] ?? map.PENDING;
    const Icon = def.Icon;
    return (
      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 w-fit", def.cls)}>
        <Icon size={12} /> {def.label}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white rounded-[2.5rem] p-8 relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-purple-500/20 blur-3xl rounded-full" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
              <Sparkles size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black">طلبات التصميم المخصص</h2>
              <p className="text-white/60 text-sm font-bold">تواصل مباشر مع فريق Vixcell لتصميم متجرك</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {vixcellWhatsapp && (
              <a
                href={`https://wa.me/${vixcellWhatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all"
              >
                <MessageCircle size={16} /> واتساب الفريق
              </a>
            )}
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#C5A021] hover:bg-[#C5A021]/90 text-white px-5 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all shadow-xl"
            >
              <Plus size={16} /> طلب تصميم جديد
            </button>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 p-16 text-center">
          <Sparkles size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="font-black text-gray-400">لم تقدم أي طلب تصميم بعد</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 bg-[#C5A021] text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-[#0F172A] transition-all"
          >
            ابدأ أول طلب
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {statusBadge(req.status)}
                    <p className="text-[10px] font-black text-gray-400">
                      {new Date(req.createdAt).toLocaleDateString("ar-EG")}
                    </p>
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
                      <p className="text-[10px] font-black text-indigo-500 uppercase mb-1">رد الفريق</p>
                      <p className="text-xs font-bold text-indigo-900">{req.adminNotes}</p>
                    </div>
                  )}
                </div>
                {req.price > 0 && (
                  <div className="text-left shrink-0">
                    <p className="text-[10px] font-black text-gray-400">السعر</p>
                    <p className="text-lg font-black text-[#C5A021]">{req.price.toLocaleString()} ج.س</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* New Request Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-black text-[#0F172A] mb-2">طلب تصميم جديد</h3>
              <p className="text-xs text-gray-400 mb-6">
                صف ما تريده بالتفصيل وسنرد عليك خلال 24 ساعة.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                    وصف الطلب
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="أريد متجراً بطابع عصري، صفحة رئيسية بفيديو، أقسام ديناميكية..."
                    className="w-full h-32 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#C5A021] resize-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                    الألوان المطلوبة (اختياري)
                  </label>
                  <input
                    type="text"
                    value={colors}
                    onChange={(e) => setColors(e.target.value)}
                    placeholder="مثل: ذهبي، أسود، رمادي فاتح"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#C5A021]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                    مراجع / مواقع تعجبك (اختياري)
                  </label>
                  <input
                    type="text"
                    value={references}
                    onChange={(e) => setReferences(e.target.value)}
                    placeholder="روابط مواقع أو متاجر تشبه ما تريد"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#C5A021]"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-[#C5A021] text-white py-3 rounded-xl font-black text-sm hover:bg-[#0F172A] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={14} /> إرسال الطلب
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 bg-gray-100 text-gray-600 py-3 rounded-xl font-black text-sm hover:bg-gray-200 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
