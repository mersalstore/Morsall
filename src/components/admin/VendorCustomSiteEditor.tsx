"use client";

import React, { useEffect, useState } from "react";
import { Code2, Save, Eye, EyeOff, Store, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VendorRow {
  id: string;
  storeName: string;
  slug: string | null;
  status: string;
  hasCustomSite: boolean;
}

export default function VendorCustomSiteEditor({
  showToast,
}: {
  showToast?: (msg: string, type?: "success" | "error" | "info") => void;
}) {
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [selected, setSelected] = useState<VendorRow | null>(null);
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingOne, setLoadingOne] = useState(false);
  const [tab, setTab] = useState<"html" | "css">("html");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/vendor-custom-site");
        if (res.status === 403) { setForbidden(true); setLoading(false); return; }
        if (res.ok) {
          const data = await res.json();
          setVendors(Array.isArray(data.vendors) ? data.vendors : []);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const openVendor = async (v: VendorRow) => {
    setSelected(v);
    setLoadingOne(true);
    try {
      const res = await fetch(`/api/admin/vendor-custom-site?vendorId=${v.id}`);
      if (res.ok) {
        const data = await res.json();
        setHtml(data.vendor?.customSite?.html || "");
        setCss(data.vendor?.customSite?.css || "");
        setEnabled(!!data.vendor?.customSite?.enabled);
      }
    } catch {}
    setLoadingOne(false);
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/vendor-custom-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: selected.id, html, css, enabled }),
      });
      if (res.ok) {
        showToast?.("تم حفظ موقع التاجر بنجاح ✨", "success");
        setVendors(prev => prev.map(v => v.id === selected.id ? { ...v, hasCustomSite: enabled } : v));
      } else {
        const d = await res.json().catch(() => ({}));
        showToast?.(`فشل الحفظ: ${d.error || res.status}`, "error");
      }
    } catch (e: any) {
      showToast?.(`خطأ: ${e?.message || "تعذّر الاتصال"}`, "error");
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-20 text-center font-black text-gray-400">جاري التحميل...</div>;
  }

  if (forbidden) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center" dir="rtl">
        <div className="w-20 h-20 rounded-[2rem] bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-2xl font-black text-[#0F172A] mb-2">هذه الصفحة مخصصة لفريق Vixcell فقط</h2>
        <p className="text-gray-400 font-bold text-sm">محرر مواقع التجار متاح حصرياً لحساب فريق التطوير.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#C5A021] text-white flex items-center justify-center">
          <Code2 size={26} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#0F172A]">محرر مواقع التجار (Vixcell)</h2>
          <p className="text-gray-400 text-xs font-bold">احقن كود الموقع المخصص الذي صممته لكل تاجر باقة Custom Design</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Vendor list */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 p-3 space-y-1 max-h-[70vh] overflow-y-auto">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 py-2">تجار Custom Design</p>
          {vendors.length === 0 ? (
            <p className="text-xs text-gray-400 font-bold p-4 text-center">لا يوجد تجار في هذه الباقة بعد</p>
          ) : vendors.map(v => (
            <button
              key={v.id}
              onClick={() => openVendor(v)}
              className={cn(
                "w-full text-right px-3 py-3 rounded-xl transition-all flex items-center justify-between gap-2",
                selected?.id === v.id ? "bg-[#C5A021]/10 border border-[#C5A021]/30" : "hover:bg-gray-50 border border-transparent"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Store size={14} className="text-[#C5A021] shrink-0" />
                <span className="text-xs font-black text-[#0F172A] truncate">{v.storeName}</span>
              </div>
              {v.hasCustomSite && <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" title="موقع مفعّل" />}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="lg:col-span-3">
          {!selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-20 text-center">
              <Code2 size={48} className="text-gray-200 mx-auto mb-4" />
              <p className="font-black text-gray-400">اختر تاجراً من القائمة لتحرير موقعه</p>
            </div>
          ) : loadingOne ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#C5A021] mx-auto" />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-black text-[#0F172A]">{selected.storeName}</span>
                  {selected.slug && (
                    <a href={`/store/${selected.slug}`} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] font-black text-blue-600 hover:underline flex items-center gap-1">
                      معاينة <ExternalLink size={11} />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEnabled(e => !e)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all",
                      enabled ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {enabled ? <Eye size={14} /> : <EyeOff size={14} />}
                    {enabled ? "الموقع المخصص مفعّل" : "معطّل (يظهر المتجر الافتراضي)"}
                  </button>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="flex items-center gap-1.5 bg-[#0F172A] hover:bg-[#C5A021] text-white px-4 py-2 rounded-xl text-xs font-black transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    حفظ
                  </button>
                </div>
              </div>

              {/* HTML / CSS tabs */}
              <div className="flex border-b border-gray-100">
                <button onClick={() => setTab("html")} className={cn("px-5 py-2.5 text-xs font-black transition-all", tab === "html" ? "text-[#C5A021] border-b-2 border-[#C5A021]" : "text-gray-400")}>HTML</button>
                <button onClick={() => setTab("css")} className={cn("px-5 py-2.5 text-xs font-black transition-all", tab === "css" ? "text-[#C5A021] border-b-2 border-[#C5A021]" : "text-gray-400")}>CSS</button>
              </div>

              {tab === "html" ? (
                <textarea
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  spellCheck={false}
                  dir="ltr"
                  placeholder="<!-- الصق هنا كود HTML الكامل للموقع الذي صممته للتاجر -->"
                  className="w-full h-[55vh] p-4 font-mono text-xs outline-none resize-none text-left bg-[#0F172A] text-green-300"
                />
              ) : (
                <textarea
                  value={css}
                  onChange={(e) => setCss(e.target.value)}
                  spellCheck={false}
                  dir="ltr"
                  placeholder="/* CSS مخصص — يُحقن داخل <style> */"
                  className="w-full h-[55vh] p-4 font-mono text-xs outline-none resize-none text-left bg-[#0F172A] text-sky-300"
                />
              )}

              <div className="p-3 bg-amber-50 border-t border-amber-100 text-[10px] font-bold text-amber-700">
                ⚠️ هذا الكود يُحقن مباشرة في صفحة متجر التاجر. تأكد من صحته. يظهر فقط لتجار باقة Custom Design عند التفعيل.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
