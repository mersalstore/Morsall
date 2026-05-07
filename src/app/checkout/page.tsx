"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const CITIES = ["الخرطوم", "أم درمان", "بحري", "الخرطوم بحري", "شندي", "مدني", "بورتسودان", "عطبرة", "كسلا", "الأبيض"];

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    name: session?.user?.name || "",
    phone: "",
    city: "الخرطوم",
    district: "",
    street: "",
    notes: "",
    paymentMethod: "COD",
    paymentScreenshot: "",
  });
  const [settings, setSettings] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shippingCost = 5000;
  const codFee = (form.paymentMethod === "COD" && settings?.codExtraFee) ? settings.codExtraFee : 0;
  const total = subtotal + shippingCost + codFee;

  useEffect(() => {
    // Fetch Settings
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Settings fetch error:", err));

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("morsall_saved_address");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setForm(prev => ({
            ...prev,
            phone: parsed.phone || prev.phone,
            city: parsed.city || prev.city,
            district: parsed.district || prev.district,
            street: parsed.street || prev.street,
          }));
        } catch (e) { }
      }
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setForm(prev => ({ ...prev, paymentScreenshot: data.url }));
      } else {
        setError(data.error || "فشل رفع الصورة");
      }
    } catch (err) {
      setError("خطأ في الاتصال أثناء رفع الصورة");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.paymentMethod === "BANK_TRANSFER" && !form.paymentScreenshot) {
      setError("يرجى رفع صورة إيصال التحويل لإكمال الطلب");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: session?.user?.email || "",
          city: form.city,
          district: form.district || form.city,
          street: form.street,
          notes: form.notes,
          paymentMethod: form.paymentMethod,
          paymentScreenshot: form.paymentScreenshot,
          subtotal,
          shippingCost,
          items: cart.map(item => ({
            productId: item.id,
            variationId: item.variationId || null,
            vendorId: item.vendorId || "unknown",
            quantity: item.quantity,
            price: item.price,
            size: item.size || null,
            color: item.color || null,
            selectedOptions: item.selectedOptions || null,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ — حاول تاني");
        setLoading(false);
        return;
      }

      // Save address for future
      if (typeof window !== "undefined") {
        localStorage.setItem("morsall_saved_address", JSON.stringify({
          phone: form.phone,
          city: form.city,
          district: form.district,
          street: form.street,
        }));
      }

      clearCart?.();
      setOrderId(data.orderId);
      setSubmitted(true);
    } catch (err) {
      setError("مشكلة في الاتصال — تحقق من الإنترنت");
    }
    setLoading(false);
  }

  // ── Success State ─────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4 pt-24" dir="rtl">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm max-w-lg w-full p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-rounded text-4xl text-green-600">check_circle</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#021D24] mb-2">ممتاز! طلبك قيد التجهيز الآن 🎉</h1>
            <p className="text-sm text-gray-500">سيتواصل فريق مرسال معك قريباً على رقم <strong>{form.phone}</strong></p>
          </div>
          {orderId && (
            <div className="bg-[#F3F4F6] rounded-lg p-4 text-right">
              <p className="text-xs text-gray-400 font-bold">رقم الطلب</p>
              <p className="font-black text-[#1089A4] text-lg font-mono">#{orderId.slice(-8).toUpperCase()}</p>
            </div>
          )}
          <div className="bg-gray-50 rounded-lg p-4 text-right space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-black text-[#021D24]">{total.toLocaleString()} ج.س</span>
              <span className="text-gray-400">الإجمالي</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">{form.city} — {form.street}</span>
              <span className="text-gray-400">العنوان</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">{form.paymentMethod === "COD" ? "💵 دفع عند الاستلام" : "🏦 تحويل بنكي"}</span>
              <span className="text-gray-400">طريقة الدفع</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/shop" className="flex-1 bg-[#F29124] hover:bg-[#D97B10] text-white py-3 rounded-lg font-black text-sm transition-colors">
              متابعة التسوق
            </Link>
            <Link href="/orders" className="flex-1 bg-[#021D24] text-white py-3 rounded-lg font-black text-sm hover:bg-[#1A3340] transition-colors">
              طلباتي
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Checkout Form ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F3F4F6]" dir="rtl">

      {/* Breadcrumb header */}
      <div className="bg-white border-b border-gray-200 pt-24 pb-4">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
          <nav className="text-xs text-gray-400 font-bold flex items-center gap-2 mb-2">
            <Link href="/" className="hover:text-[#1089A4]">الرئيسية</Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-[#1089A4]">السلة</Link>
            <span>/</span>
            <span className="text-[#021D24]">إتمام الطلب</span>
          </nav>
          <h1 className="text-xl font-black text-[#021D24]">احجز طلبك وانتظر التوصيل لبابك 📦</h1>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 lg:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left: Form ── */}
        <div className="lg:col-span-8 space-y-4">

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-sm text-red-700 font-bold">
              <span className="material-symbols-rounded">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Personal Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <h2 className="font-black text-[#021D24] mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#1089A4] text-white rounded text-xs flex items-center justify-center font-black">١</span>
                البيانات الشخصية
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">الاسم الكامل *</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="محمد أحمد..."
                    className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm font-bold text-right outline-none focus:border-[#1089A4] focus:ring-2 focus:ring-[#1089A4]/10 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">رقم الهاتف *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} required placeholder="09X XXXX XXXX" type="tel"
                    className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm font-bold text-right outline-none focus:border-[#1089A4] focus:ring-2 focus:ring-[#1089A4]/10 transition-all" dir="ltr" />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <h2 className="font-black text-[#021D24] mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#1089A4] text-white rounded text-xs flex items-center justify-center font-black">٢</span>
                عنوان التوصيل
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">المدينة *</label>
                  <select name="city" value={form.city} onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm font-bold text-right outline-none focus:border-[#1089A4] transition-all bg-white">
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">الحي / المنطقة</label>
                  <input name="district" value={form.district} onChange={handleChange} placeholder="شمبات، بحري..."
                    className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm font-bold text-right outline-none focus:border-[#1089A4] transition-all" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-gray-500 block mb-1">الشارع والعنوان التفصيلي *</label>
                  <input name="street" value={form.street} onChange={handleChange} required placeholder="شارع النيل، أمام البنك، بجانب المسجد..."
                    className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm font-bold text-right outline-none focus:border-[#1089A4] transition-all" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-gray-500 block mb-1">ملاحظات للمندوب (اختياري)</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="أي تفاصيل إضافية..."
                    className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm font-bold text-right outline-none focus:border-[#1089A4] transition-all resize-none" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <h2 className="font-black text-[#021D24] mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#1089A4] text-white rounded text-xs flex items-center justify-center font-black">٣</span>
                طريقة الدفع
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {[
                  { value: "COD", icon: "payments", label: "دفع عند الاستلام", sub: "ادفع لما المندوب يوصلك", disabled: settings?.codEnabled === false },
                  { value: "BANK_TRANSFER", icon: "account_balance", label: "تحويل بنكي", sub: "حوّل المبلغ وارفع الإيصال", disabled: settings?.bankTransferEnabled === false },
                ].filter(m => !m.disabled).map(m => (
                  <label key={m.value}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${form.paymentMethod === m.value ? "border-[#1089A4] bg-[#1089A4]/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="paymentMethod" value={m.value} checked={form.paymentMethod === m.value} onChange={handleChange} className="hidden" />
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${form.paymentMethod === m.value ? "bg-[#1089A4] text-white" : "bg-gray-100 text-gray-400"}`}>
                      <span className="material-symbols-rounded text-xl">{m.icon}</span>
                    </div>
                    <div>
                      <p className="font-black text-sm text-[#021D24]">{m.label}</p>
                      <p className="text-xs text-gray-400">{m.sub}</p>
                    </div>
                    {form.paymentMethod === m.value && (
                      <span className="material-symbols-rounded text-[#1089A4] text-xl mr-auto">radio_button_checked</span>
                    )}
                  </label>
                ))}
              </div>

              {/* Bank Transfer Details */}
              {form.paymentMethod === "BANK_TRANSFER" && settings && (
                <div className="bg-[#F3F4F6] rounded-xl p-5 border border-gray-200 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#1089A4]/10 text-[#1089A4] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-rounded text-lg">info</span>
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#021D24]">بيانات التحويل البنكي</p>
                      <p className="text-xs text-gray-500">يرجى تحويل مبلغ <strong className="text-[#1089A4]">{total.toLocaleString()} ج.س</strong> إلى الحساب التالي:</p>
                    </div>
                  </div>

                  {settings.bankAccounts ? (
                    <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm whitespace-pre-wrap text-sm font-bold text-[#021D24]">
                      {settings.bankAccounts}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">اسم البنك</p>
                        <p className="font-black text-sm text-[#021D24]">{settings.bankName || "بنك الخرطوم"}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">اسم الحساب</p>
                        <p className="font-black text-sm text-[#021D24]">{settings.bankAccountName || "شركة مرسال للتجارة"}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm sm:col-span-2 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">رقم الحساب / IBAN</p>
                          <p className="font-black text-lg text-[#1089A4] tracking-wider">{settings.bankAccountNumber || "XXXX-XXXX-XXXX"}</p>
                        </div>
                        <button type="button" onClick={() => navigator.clipboard.writeText(settings.bankAccountNumber)}
                          className="w-10 h-10 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                          <span className="material-symbols-rounded text-lg">content_copy</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <p className="text-xs font-black text-[#021D24] mb-3 flex items-center gap-2">
                      <span className="material-symbols-rounded text-base text-[#F29124]">upload_file</span>
                      ارفع صورة إيصال التحويل (سكرين شوت)
                    </p>
                    <label className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${form.paymentScreenshot ? "border-green-400 bg-green-50" : "border-gray-300 bg-white hover:border-[#1089A4] hover:bg-gray-50"}`}>
                      {uploading ? (
                        <div className="flex flex-col items-center">
                          <span className="w-8 h-8 border-3 border-[#1089A4] border-t-transparent rounded-full animate-spin mb-2" />
                          <p className="text-xs font-bold text-[#1089A4]">جاري الرفع...</p>
                        </div>
                      ) : form.paymentScreenshot ? (
                        <div className="flex flex-col items-center">
                          <span className="material-symbols-rounded text-3xl text-green-500 mb-1">check_circle</span>
                          <p className="text-xs font-bold text-green-600">تم رفع الإيصال بنجاح</p>
                          <button type="button" onClick={(e) => { e.preventDefault(); setForm(p => ({ ...p, paymentScreenshot: "" })) }} className="text-[10px] text-red-500 font-bold mt-1 underline">تغيير الصورة</button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="material-symbols-rounded text-3xl text-gray-300 mb-2">add_a_photo</span>
                          <p className="text-xs font-bold text-gray-500">اضغط هنا لرفع الإيصال</p>
                          <p className="text-[10px] text-gray-400 mt-1">PNG, JPG (حد أقصى 5MB)</p>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || cart.length === 0}
              className="w-full bg-[#F29124] hover:bg-[#D97B10] disabled:bg-gray-300 text-white py-4 rounded-lg font-black text-sm transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري تسجيل طلبك...
                </>
              ) : (
                <>
                  <span className="material-symbols-rounded">check_circle</span>
                  اطلب الآن والتوصيل لبابك
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Right: Order Summary ── */}
        <aside className="lg:col-span-4">
          <div className="sticky top-28">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-[#021D24] text-white p-4">
                <h3 className="font-black text-sm">ملخص الطلب ({cart.length} منتج)</h3>
              </div>
              <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <div className="relative w-12 h-12 rounded border overflow-hidden flex-shrink-0 bg-gray-100">
                      {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" />}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-bold text-[#021D24] truncate text-xs">{item.title}</p>
                      {item.selectedOptions && Object.entries(item.selectedOptions).map(([name, val]) => (
                        <p key={name} className="text-[10px] text-gray-400">
                          {name}: <span className="text-[#021D24]">{val}</span>
                        </p>
                      ))}
                      <p className="text-gray-400 text-xs">× {item.quantity}</p>
                    </div>
                    <span className="font-black text-[#1089A4] text-xs flex-shrink-0">
                      {(item.price * item.quantity).toLocaleString()} ج.س
                    </span>
                  </div>
                ))}
                {cart.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-4">السلة فارغة</p>
                )}
              </div>
              <div className="border-t border-gray-100 p-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span className="font-bold">{subtotal.toLocaleString()} ج.س</span>
                  <span>المنتجات</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span className="font-bold">{shippingCost.toLocaleString()} ج.س</span>
                  <span>الشحن</span>
                </div>
                {codFee > 0 && (
                  <div className="flex justify-between text-[#F29124] animate-in slide-in-from-right-4 duration-300">
                    <span className="font-bold">{codFee.toLocaleString()} ج.س</span>
                    <span>رسوم الدفع عند الاستلام</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-black text-[#021D24]">
                  <span className="text-lg">{total.toLocaleString()} ج.س</span>
                  <span>الإجمالي</span>
                </div>
              </div>
              <div className="p-4 pt-0 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-400">
                <span className="material-symbols-rounded text-base text-green-500">verified</span>
                شراء آمن ومضمون مع مرسال
              </div>
            </div>
          </div>
        </aside>

      </main>
    </div>
  );
}
