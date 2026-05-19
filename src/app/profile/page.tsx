"use client"

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

type Tab = "orders" | "profile" | "security";

const STATUS_STYLE: Record<string, string> = {
  PENDING_APPROVAL: "bg-yellow-50 text-yellow-600 border-yellow-200",
  PROCESSING:       "bg-blue-50 text-blue-600 border-blue-200",
  SHIPPED:          "bg-purple-50 text-purple-600 border-purple-200",
  DELIVERED:        "bg-green-50 text-green-600 border-green-200",
  CANCELLED:        "bg-red-50 text-red-500 border-red-200",
};
const STATUS_LABEL: Record<string, string> = {
  PENDING_APPROVAL: "قيد المراجعة",
  PROCESSING:       "جاري التجهيز",
  SHIPPED:          "في الطريق",
  DELIVERED:        "تم التوصيل",
  CANCELLED:        "ملغي",
};

export default function ProfilePage() {
  const { data: session, update: updateSession, status } = useSession();
  const [tab, setTab]           = useState<Tab>("orders");
  const [orders, setOrders]     = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError]     = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving,  setIsSaving]  = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [formData, setFormData]   = useState({ name: "", phone: "" });

  /* ── Load user data ── */
  useEffect(() => {
    if (session?.user) {
      setFormData({
        name:  session.user.name  || "",
        phone: (session.user as any).phone || "",
      });
    }
  }, [session]);

  /* ── Load orders when tab changes ── */
  useEffect(() => {
    if (tab === "orders" && status === "authenticated" && orders.length === 0) {
      setOrdersLoading(true);
      fetch("/api/orders")
        .then(r => r.json())
        .then(d => { setOrders(Array.isArray(d) ? d : []); })
        .catch(() => setOrdersError("فشل تحميل الطلبات"))
        .finally(() => setOrdersLoading(false));
    }
  }, [tab, status]);

  /* ── Save profile ── */
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      await updateSession({ ...session, user: { ...session?.user, ...formData } });
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setIsSaving(false); }
  };

  /* ── Guards ── */
  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#C5A021] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!session) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="material-symbols-rounded text-[#C5A021] text-7xl">lock_person</span>
      <h1 className="text-3xl font-black text-[#0F172A]">يجب تسجيل الدخول أولاً</h1>
      <Link href="/login" className="bg-[#C5A021] text-white px-10 py-4 rounded-2xl font-bold">
        تسجيل الدخول
      </Link>
    </div>
  );

  const user = session.user as any;

  /* ── Active / done orders ── */
  const activeOrders = orders.filter(o => !["DELIVERED","CANCELLED"].includes(o.status));
  const doneOrders   = orders.filter(o =>  ["DELIVERED","CANCELLED"].includes(o.status));

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 px-4 md:px-8" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── Profile Card ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#C5A021]/20 shadow-lg">
              <Image src={user?.image || "/logo.png"} alt={user?.name || ""} fill className="object-cover" />
            </div>
            <div className="absolute -bottom-1 -left-1 w-8 h-8 bg-[#C5A021] rounded-full flex items-center justify-center shadow-md">
              <span className="material-symbols-rounded text-white text-sm">verified</span>
            </div>
          </div>
          <div className="flex-1 text-center md:text-right">
            <h1 className="text-2xl font-black text-[#0F172A]">{user?.name || "مستخدم مرسال"}</h1>
            <p className="text-sm text-gray-400 mt-1">{user?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
              <span className="bg-[#C5A021]/10 text-[#C5A021] text-xs font-bold px-3 py-1 rounded-full">
                {orders.length} طلب
              </span>
              <span className="bg-green-50 text-green-600 text-xs font-bold px-3 py-1 rounded-full">
                عميل نشط
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors font-semibold mt-2 md:mt-0"
          >
            <span className="material-symbols-rounded text-base">logout</span>
            خروج
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm w-fit">
          {([
            { id: "orders",  label: "طلباتي",       icon: "shopping_bag" },
            { id: "profile", label: "بياناتي",       icon: "person" },
            { id: "security",label: "الأمان",        icon: "lock" },
          ] as { id: Tab; label: string; icon: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t.id
                  ? "bg-[#0F172A] text-white shadow-md"
                  : "text-gray-400 hover:text-[#0F172A]"
              }`}
            >
              <span className="material-symbols-rounded text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════ ORDERS TAB ══════════ */}
        {tab === "orders" && (
          <div className="space-y-6">
            {ordersLoading && (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="bg-white h-32 rounded-2xl border border-gray-100 animate-pulse" />)}
              </div>
            )}

            {ordersError && (
              <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-100 text-center font-bold">
                {ordersError}
              </div>
            )}

            {!ordersLoading && !ordersError && orders.length === 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center space-y-4">
                <span className="material-symbols-rounded text-gray-200 text-7xl">shopping_bag</span>
                <h3 className="text-xl font-black text-[#0F172A]">لا يوجد طلبات بعد</h3>
                <p className="text-gray-400 text-sm">ابدأ التسوق واستكشف آلاف المنتجات</p>
                <Link href="/shop" className="inline-block mt-4 bg-[#C5A021] text-white px-10 py-3 rounded-xl font-bold text-sm hover:bg-[#0F172A] transition-colors">
                  تسوق الآن
                </Link>
              </div>
            )}

            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#C5A021] rounded-full animate-pulse" />
                  الطلبات الجارية ({activeOrders.length})
                </h2>
                {activeOrders.map(order => <OrderCard key={order.id} order={order} />)}
              </div>
            )}

            {/* Done Orders */}
            {doneOrders.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2">
                  <span className="material-symbols-rounded text-gray-400 text-lg">history</span>
                  سجل المشتريات ({doneOrders.length})
                </h2>
                {doneOrders.map(order => <OrderCard key={order.id} order={order} />)}
              </div>
            )}
          </div>
        )}

        {/* ══════════ PROFILE TAB ══════════ */}
        {tab === "profile" && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-[#0F172A]">بياناتي الشخصية</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 text-sm font-bold text-[#C5A021] hover:text-[#0F172A] transition-colors"
                >
                  <span className="material-symbols-rounded text-base">edit</span>
                  تعديل
                </button>
              )}
            </div>

            {saved && (
              <div className="bg-green-50 text-green-600 text-sm font-bold p-4 rounded-xl border border-green-100 flex items-center gap-2">
                <span className="material-symbols-rounded">check_circle</span>
                تم حفظ البيانات بنجاح
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="الاسم الكامل" icon="person">
                {isEditing
                  ? <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="profile-input" placeholder="اكتب اسمك" />
                  : <p className="profile-value">{formData.name || "—"}</p>
                }
              </Field>

              <Field label="رقم الهاتف" icon="phone">
                {isEditing
                  ? <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                      type="tel" dir="ltr" className="profile-input text-right" placeholder="+249..." />
                  : <p className="profile-value" dir="ltr">{formData.phone || "—"}</p>
                }
              </Field>

              <Field label="البريد الإلكتروني" icon="mail">
                <p className="profile-value text-gray-400">{user?.email}</p>
              </Field>

              <Field label="طريقة الدخول" icon="key">
                <p className="profile-value">
                  {user?.image?.includes("google") ? "حساب جوجل" : "بريد + كلمة مرور"}
                </p>
              </Field>
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-[#0F172A] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#C5A021] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSaving
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />جاري الحفظ...</>
                    : <><span className="material-symbols-rounded text-base">save</span>حفظ التغييرات</>
                  }
                </button>
                <button
                  onClick={() => { setIsEditing(false); setFormData({ name: user?.name || "", phone: user?.phone || "" }); }}
                  className="px-6 py-3.5 rounded-xl font-bold text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════ SECURITY TAB ══════════ */}
        {tab === "security" && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-4">
              <h2 className="text-xl font-black text-[#0F172A]">أمان الحساب</h2>
              <div className="divide-y divide-gray-50">
                <InfoRow label="حالة الحساب" value="نشط ومحمي" badge="green" />
                <InfoRow label="نوع الجلسة" value="JWT مشفّر" />
                <InfoRow label="آخر دخول" value={user?.name ? "اليوم" : "—"} />
              </div>
            </div>

            <div className="bg-red-50 rounded-3xl border border-red-100 p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-rounded text-red-500">warning</span>
                <h3 className="text-base font-black text-red-600">منطقة الخطر</h3>
              </div>
              <p className="text-sm text-red-400">حذف الحساب سيؤدي لفقدان جميع بياناتك وطلباتك نهائياً.</p>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full py-3 rounded-xl border-2 border-red-200 text-red-500 font-bold text-sm hover:bg-red-500 hover:text-white transition-all"
              >
                تسجيل الخروج الآن
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .profile-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #0F172A;
          outline: none;
          transition: border-color 0.2s;
          text-align: right;
        }
        .profile-input:focus { border-color: #C5A021; background: white; }
        .profile-value {
          padding: 0.75rem 1rem;
          background: #f9fafb;
          border: 2px solid #f3f4f6;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #0F172A;
        }
      `}</style>
    </div>
  );
}

/* ── Sub-components ── */
function OrderCard({ order }: { order: any }) {
  const [open, setOpen] = useState(false);
  const images: string[] = (() => {
    try { return JSON.parse(order.items?.[0]?.product?.images || "[]"); } catch { return []; }
  })();
  const thumb = images[0] || null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex flex-wrap items-center justify-between gap-4 p-5 text-right hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 relative shrink-0">
            {thumb
              ? <Image src={thumb} alt="" fill className="object-cover" />
              : <span className="material-symbols-rounded text-gray-300 text-3xl absolute inset-0 flex items-center justify-center">shopping_bag</span>
            }
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-bold">
              {order.createdAt ? format(new Date(order.createdAt), "d MMMM yyyy", { locale: ar }) : ""}
            </p>
            <p className="text-sm font-black text-[#0F172A] mt-0.5">
              {order.items?.length || 0} منتج{order.items?.length > 1 ? "ات" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_STYLE[order.status] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
            {STATUS_LABEL[order.status] || order.status}
          </span>
          <span className="text-base font-black text-[#0F172A]">
            {order.totalAmount?.toLocaleString()} ج.س
          </span>
          <span className={`material-symbols-rounded text-gray-400 text-sm transition-transform ${open ? "rotate-180" : ""}`}>
            expand_more
          </span>
        </div>
      </button>

      {/* Expanded items */}
      {open && (
        <div className="border-t border-gray-50 p-5 space-y-4 bg-gray-50/50">
          {order.items?.map((item: any, i: number) => {
            const imgs: string[] = (() => {
              try { return JSON.parse(item.product?.images || "[]"); } catch { return []; }
            })();
            return (
              <div key={i} className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 relative shrink-0">
                  {imgs[0]
                    ? <Image src={imgs[0]} alt="" fill className="object-cover" />
                    : <span className="material-symbols-rounded text-gray-300 text-xl absolute inset-0 flex items-center justify-center">image</span>
                  }
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm font-bold text-[#0F172A] line-clamp-1">{item.product?.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.vendor?.storeName} · الكمية: {item.quantity}</p>
                </div>
                <p className="text-sm font-black text-[#C5A021] shrink-0">{item.priceAtTime?.toLocaleString()} ج.س</p>
              </div>
            );
          })}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="material-symbols-rounded text-sm">location_on</span>
              {order.city}، {order.street}
            </div>
            {!["DELIVERED","CANCELLED"].includes(order.status) && (
              <Link
                href={`/track?id=${order.id}`}
                className="flex items-center gap-2 bg-[#C5A021] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#0F172A] transition-colors"
              >
                <span className="material-symbols-rounded text-sm">local_shipping</span>
                تتبع الشحنة
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
        <span className="material-symbols-rounded text-sm text-[#C5A021]">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

function InfoRow({ label, value, badge }: { label: string; value: string; badge?: string }) {
  return (
    <div className="flex justify-between items-center py-4">
      <span className="text-sm font-bold text-gray-400">{label}</span>
      {badge === "green"
        ? <span className="bg-green-50 text-green-600 text-xs font-bold px-3 py-1 rounded-full border border-green-100">{value}</span>
        : <span className="text-sm font-bold text-[#0F172A]">{value}</span>
      }
    </div>
  );
}
