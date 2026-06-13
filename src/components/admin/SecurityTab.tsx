"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, AlertCircle, Info, 
  Search, Ban, RefreshCw, Clock, Filter, User, Check, X, Shield, 
  Lock, Unlock, ArrowDown, Activity
} from "lucide-react";

export default function SecurityTab({ showToast }: { showToast?: (msg: string, type?: "success" | "error" | "info") => void }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [blockedIps, setBlockedIps] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ byType: [], bySeverity: [], topIps: [] });
  const [totalCount, setTotalCount] = useState(0);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);

  // Filtering states
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [limit, setLimit] = useState(100);

  // Manual block form states
  const [ipToBlock, setIpToBlock] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockDuration, setBlockDuration] = useState("24"); // Hours, "0" = permanent

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch security data
  const fetchData = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        limit: String(limit),
        type: typeFilter,
        severity: severityFilter,
      });
      if (search.trim()) q.append("search", search.trim());

      const res = await fetch(`/api/admin/security-logs?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setBlockedIps(data.blockedIps || []);
        setStats(data.stats || { byType: [], bySeverity: [], topIps: [] });
        setTotalCount(data.totalCount || 0);
        setRecentAlerts(data.recentAlerts || []);
      }
    } catch (err) {
      console.error("Failed to load security logs", err);
      showToast?.("فشل تحميل بيانات الأمان والـ Logs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter, severityFilter, limit]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  // Perform PATCH actions
  const handleAction = async (payload: any, message: string) => {
    setActionLoading(payload.action + (payload.logId || payload.ip || ""));
    try {
      const res = await fetch("/api/admin/security-logs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast?.(message, "success");
        fetchData();
      } else {
        const data = await res.json();
        showToast?.(data.error || "فشل تنفيذ العملية", "error");
      }
    } catch (err) {
      showToast?.("خطأ في الاتصال بالسيرفر", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Resolve a Log Event
  const resolveLog = (logId: string) => {
    handleAction({ action: "RESOLVE", logId }, "تم تحديد التنبيه كمحلول ✅");
  };

  // Block an IP address manually
  const blockIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipToBlock.trim()) return;

    const ttlHours = blockDuration === "0" ? undefined : parseInt(blockDuration);
    handleAction({
      action: "BLOCK_IP",
      ip: ipToBlock.trim(),
      reason: blockReason.trim() || "حظر يدوي بواسطة المدير",
      ttlHours,
    }, `تم حظر عنوان الـ IP (${ipToBlock.trim()}) بنجاح 🚫`);

    setIpToBlock("");
    setBlockReason("");
  };

  // Unblock an IP address
  const unblockIp = (ip: string) => {
    handleAction({ action: "UNBLOCK_IP", ip }, `تم إلغاء حظر الـ IP (${ip}) بنجاح 🔓`);
  };

  // Styling helpers
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-500/10 text-red-500 border border-red-500/20";
      case "ALERT":
        return "bg-orange-500/10 text-orange-500 border border-orange-500/20";
      case "WARN":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <AlertCircle size={14} className="animate-pulse" />;
      case "ALERT":
        return <AlertTriangle size={14} />;
      case "WARN":
        return <Info size={14} />;
      default:
        return <Shield size={14} />;
    }
  };

  // Aggregation Stats calculation
  const totalAttacksCount = stats.byType
    .filter((s: any) => ["SQL_INJECTION_ATTEMPT", "XSS_ATTEMPT", "RATE_LIMIT", "FILE_UPLOAD_ABUSE"].includes(s.type))
    .reduce((sum: number, curr: any) => sum + curr.count, 0);

  const criticalAlertsCount = stats.bySeverity
    .filter((s: any) => ["CRITICAL", "ALERT"].includes(s.severity))
    .reduce((sum: number, curr: any) => sum + curr.count, 0);

  return (
    <div className="space-y-12" dir="rtl">
      
      {/* ── Top Header Banner ── */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[2rem] bg-[#0F172A] text-[#C5A021] flex items-center justify-center shadow-lg shadow-[#0F172A]/10">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-[#0F172A] flex items-center gap-3">
              الأمان ونظام جدار الحماية (Firewall)
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
            </h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Platform Threat Logs & Intrusion Prevention</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchData}
            disabled={loading}
            className="p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 text-gray-600 transition-all flex items-center justify-center disabled:opacity-50"
            title="تحديث البيانات"
          >
            <RefreshCw size={18} className={loading ? "animate-spin text-[#C5A021]" : ""} />
          </button>
          <div className="bg-green-50 text-green-700 border border-green-200 px-6 py-3.5 rounded-2xl font-black text-xs flex items-center gap-2">
            <ShieldCheck size={16} />
            حالة النظام: آمن ونشط 🟢
          </div>
        </div>
      </div>

      {/* ── Metric Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">إجمالي الأنشطة</p>
            <h3 className="text-2xl font-black text-[#0F172A] mt-1">{totalCount.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">محاولات صد الهجمات</p>
            <h3 className="text-2xl font-black text-orange-600 mt-1">{totalAttacksCount.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">التنبيهات الحرجة</p>
            <h3 className="text-2xl font-black text-red-600 mt-1">{criticalAlertsCount.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Ban size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الـ IPs المحظورة حالياً</p>
            <h3 className="text-2xl font-black text-purple-600 mt-1">{blockedIps.length}</h3>
          </div>
        </div>

      </div>

      {/* ── Left Column: Firewall Blocking & Management  ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Right Column (Size 8): Filtered Security Logs Table */}
        <div className="xl:col-span-8 bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-2xl space-y-6 overflow-hidden">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-50">
            <div>
              <h3 className="text-xl font-black text-[#0F172A]">سجل الأنشطة والعمليات المشبوهة</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Real-time threat monitoring</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400">عدد النتائج: {logs.length}</span>
            </div>
          </div>

          {/* Filters Bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 bg-gray-50 p-4 rounded-3xl border border-gray-100">
            <div className="flex-1 min-w-[200px] relative">
              <input 
                type="text" 
                placeholder="ابحث بالبريد الإلكتروني، الرسالة أو الرابط..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 focus:border-[#C5A021] rounded-2xl pr-10 pl-4 py-3 text-xs font-bold outline-none transition-all"
              />
              <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="min-w-[140px]">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full bg-white border border-gray-200 focus:border-[#C5A021] rounded-2xl px-4 py-3 text-xs font-bold outline-none transition-all bg-no-repeat"
              >
                <option value="ALL">جميع الأنشطة</option>
                <option value="LOGIN_FAIL">فشل تسجيل الدخول 🔑</option>
                <option value="LOGIN_SUCCESS">نجاح تسجيل الدخول 🟢</option>
                <option value="PAYMENT_FAIL">فشل عمليات الدفع 💳</option>
                <option value="PAYMENT_SUCCESS">نجاح عمليات الدفع 💰</option>
                <option value="SQL_INJECTION_ATTEMPT">محاولة اختراق SQL ⚠️</option>
                <option value="XSS_ATTEMPT">محاولة اختراق XSS ⚠️</option>
                <option value="RATE_LIMIT">تجاوز الحد (Spam) 🚫</option>
                <option value="UNAUTHORIZED_ACCESS">دخول غير مصرح 🔒</option>
                <option value="FAKE_RECEIPT">إيصال تحويل مزور 🧾</option>
                <option value="FILE_UPLOAD_ABUSE">إساءة رفع الملفات 📁</option>
                <option value="ADMIN_ACTION">عمليات المشرفين 👔</option>
              </select>
            </div>

            <div className="min-w-[120px]">
              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                className="w-full bg-white border border-gray-200 focus:border-[#C5A021] rounded-2xl px-4 py-3 text-xs font-bold outline-none transition-all bg-no-repeat"
              >
                <option value="ALL">جميع المستويات</option>
                <option value="CRITICAL">حرج (Critical)</option>
                <option value="ALERT">تنبيه (Alert)</option>
                <option value="WARN">تحذير (Warning)</option>
                <option value="INFO">عادي (Info)</option>
              </select>
            </div>

            <button type="submit" className="bg-[#0F172A] hover:bg-[#C5A021] text-white px-6 py-3 rounded-2xl text-xs font-black transition-all">
              تصفية
            </button>
          </form>

          {/* Table Container */}
          <div className="overflow-x-auto border border-gray-100 rounded-3xl">
            {loading ? (
              <div className="py-24 text-center font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-3">
                <RefreshCw className="animate-spin text-[#C5A021]" size={20} />
                جاري تحميل سجل الأمان...
              </div>
            ) : logs.length === 0 ? (
              <div className="py-24 text-center font-black text-gray-400 tracking-wider">
                لا توجد سجلات مطابقة لمعايير البحث 🛡️
              </div>
            ) : (
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0F172A] text-white/60 text-[10px] font-black uppercase tracking-wider border-b border-white/10">
                    <th className="p-4 rounded-r-3xl">الحدث والمستوى</th>
                    <th className="p-4">عنوان الـ IP والتوقيت</th>
                    <th className="p-4">التفاصيل والرسالة</th>
                    <th className="p-4 rounded-l-3xl text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((log: any) => {
                    const isIPBlockedAlready = blockedIps.some(b => b.ip === log.ip);
                    const isLoadingThis = actionLoading === ("RESOLVE" + log.id) || actionLoading === ("BLOCK_IP" + log.ip);
                    
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 whitespace-nowrap space-y-1.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${getSeverityStyle(log.severity)}`}>
                            {getSeverityIcon(log.severity)}
                            {log.severity}
                          </span>
                          <div className="font-black text-slate-800">{log.type}</div>
                        </td>
                        <td className="p-4 whitespace-nowrap space-y-1">
                          <div className="font-mono font-black text-[#C5A021]">{log.ip || "unknown"}</div>
                          <div className="text-[10px] text-gray-400 font-bold">
                            {new Date(log.createdAt).toLocaleString("ar-SD", { hour12: true })}
                          </div>
                        </td>
                        <td className="p-4 max-w-xs md:max-w-md">
                          <div className="font-black text-slate-800 line-clamp-2">{log.message || "—"}</div>
                          <div className="text-[10px] text-gray-400 mt-1 font-mono truncate">
                            {log.method} {log.endpoint}
                          </div>
                          {log.userEmail && (
                            <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-slate-600 bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5">
                              <User size={10} />
                              {log.userEmail}
                            </div>
                          )}
                        </td>
                        <td className="p-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Resolve button */}
                            {!log.resolved ? (
                              <button
                                onClick={() => resolveLog(log.id)}
                                disabled={isLoadingThis}
                                className="bg-green-500 hover:bg-green-600 text-white w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                                title="تحديد كمحلول"
                              >
                                <Check size={14} />
                              </button>
                            ) : (
                              <span className="text-green-500 font-bold text-[10px] flex items-center gap-1">
                                <ShieldCheck size={14} />
                                تم الحل
                              </span>
                            )}
                            
                            {/* Manual block shortcut */}
                            {log.ip && !isIPBlockedAlready && (
                              <button
                                onClick={() => handleAction({
                                  action: "BLOCK_IP",
                                  ip: log.ip,
                                  reason: `Blocked following threat log (${log.type})`,
                                  ttlHours: 24
                                }, `تم حظر الـ IP (${log.ip}) لمدة 24 ساعة 🚫`)}
                                disabled={isLoadingThis}
                                className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                                title="حظر الـ IP (24 ساعة)"
                              >
                                <Ban size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column (Size 4): Manual IP Firewall Block Form & Current IP Blacklist */}
        <div className="xl:col-span-4 space-y-8">
          
          {/* Manual Block Form Card */}
          <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-black text-[#0F172A] flex items-center gap-2">
                <Lock className="text-red-500" size={20} />
                حظر عنوان IP يدويًا
              </h3>
              <p className="text-xs text-gray-400 font-bold mt-1">Add IP Address to Firewall Blacklist</p>
            </div>

            <form onSubmit={blockIp} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">عنوان IP المُراد حظره</label>
                <input 
                  type="text"
                  required
                  placeholder="مثال: 192.168.1.10"
                  value={ipToBlock}
                  onChange={e => setIpToBlock(e.target.value)}
                  className="w-full bg-gray-50 border border-transparent focus:border-red-500 focus:bg-white rounded-2xl px-5 py-4 text-xs font-mono font-black outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">مدة الحظر</label>
                <select
                  value={blockDuration}
                  onChange={e => setBlockDuration(e.target.value)}
                  className="w-full bg-gray-50 border border-transparent focus:border-red-500 rounded-2xl px-5 py-4 text-xs font-black outline-none transition-all bg-no-repeat"
                >
                  <option value="1">ساعة واحدة</option>
                  <option value="6">6 ساعات</option>
                  <option value="24">24 ساعة (يوم كامل)</option>
                  <option value="168">7 أيام (أسبوع كامل)</option>
                  <option value="720">30 يوم (شهر كامل)</option>
                  <option value="0">حظر دائم (Permanent)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">سبب الحظر</label>
                <textarea 
                  placeholder="اكتب تفاصيل إضافية للسبب..."
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-50 border border-transparent focus:border-red-500 focus:bg-white rounded-2xl px-5 py-4 text-xs font-bold outline-none transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading !== null}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/10 active:scale-95 disabled:opacity-50"
              >
                <Ban size={14} />
                تفعيل الحظر على الجدار الناري
              </button>
            </form>
          </div>

          {/* Current IP Blacklist Card */}
          <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-black text-[#0F172A] flex items-center gap-2">
                <Unlock className="text-[#C5A021]" size={20} />
                قائمة الحظر النشطة
              </h3>
              <p className="text-xs text-gray-400 font-bold mt-1">Currently Blocked IPs in Database</p>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
              {blockedIps.length === 0 ? (
                <div className="py-8 text-center text-xs font-bold text-gray-400">
                  لا توجد عناوين IP محظورة حاليًا 🟢
                </div>
              ) : (
                blockedIps.map((b: any) => {
                  const isLoadingThis = actionLoading === ("UNBLOCK_IP" + b.ip);
                  return (
                    <div key={b.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex justify-between items-start gap-4 hover:border-gray-200 transition-colors">
                      <div className="space-y-1.5 min-w-0">
                        <div className="font-mono font-black text-xs text-[#0F172A] truncate">{b.ip}</div>
                        <p className="text-[10px] text-gray-400 font-bold leading-relaxed">{b.reason || "حظر يدوي"}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold text-gray-400">
                          <span className="flex items-center gap-1 bg-gray-200/50 rounded px-1.5 py-0.5">
                            <Clock size={10} />
                            {b.expiresAt 
                              ? `تنتهي: ${new Date(b.expiresAt).toLocaleDateString("ar-SD")}` 
                              : "حظر دائم"}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => unblockIp(b.ip)}
                        disabled={isLoadingThis}
                        className="bg-white hover:bg-green-500 hover:text-white border border-gray-200 hover:border-green-500 text-gray-600 w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 shrink-0"
                        title="إلغاء الحظر"
                      >
                        {isLoadingThis ? (
                          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Unlock size={12} />
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
