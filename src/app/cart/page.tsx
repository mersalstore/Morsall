"use client"

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/CartContext";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cart, removeItem, updateQty, subtotal } = useCart();
  const router = useRouter();

  const shipping = cart.length > 0 ? 5000 : 0;
  const total    = subtotal + shipping;
  const isEmpty  = cart.length === 0;

  return (
    <div className="min-h-screen bg-[#F3F4F6]" dir="rtl">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
          <nav className="text-xs text-gray-400 font-bold flex items-center gap-2 mb-1">
            <Link href="/" className="hover:text-[#C5A021]">الرئيسية</Link>
            <span>/</span>
            <span className="text-[#0F172A]">السلة</span>
          </nav>
          <h1 className="text-xl font-black text-[#0F172A]">سلة التسوق</h1>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 lg:px-6 py-6">

        {isEmpty ? (
          /* Empty */
          <div className="bg-white rounded-lg border border-gray-200 p-16 text-center shadow-sm">
            <span className="material-symbols-rounded text-7xl text-gray-200 block mb-4">shopping_cart_off</span>
            <h2 className="text-2xl font-black text-[#0F172A] mb-2">سلتك فارغة</h2>
            <p className="text-gray-400 text-sm mb-6">ابدأ التسوق وأضف منتجاتك المفضلة</p>
            <Link href="/shop" className="inline-flex items-center gap-2 bg-[#F29124] text-white px-8 py-3 rounded font-black text-sm hover:bg-[#D97B10] transition-colors">
              <span className="material-symbols-rounded text-base">storefront</span>
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Cart Items */}
            <div className="lg:col-span-8 space-y-3">

              {/* Delivery notice */}
              <div className="bg-[#E8F5E9] border border-green-200 rounded-lg p-3 flex items-center gap-2 text-sm text-green-800 font-bold">
                <span className="material-symbols-rounded text-green-600">local_shipping</span>
                توصيل داخل الخرطوم 24 ساعة 🚀
              </div>

              {/* Items */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y">
                {cart.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                    <div className="relative w-24 h-24 rounded border overflow-hidden flex-shrink-0 bg-gray-100">
                      {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" />}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs text-[#C5A021] font-bold mb-1">{item.vendor}</p>
                      <p className="font-black text-[#0F172A] leading-snug mb-1">{item.title}</p>
                      
                      {/* Variations Display */}
                      {item.selectedOptions && Object.entries(item.selectedOptions).map(([name, val]) => (
                        <p key={name} className="text-[10px] text-gray-400 font-bold">
                          {name}: <span className="text-[#0F172A]">{val}</span>
                        </p>
                      ))}
                      
                      <p className="text-lg font-black text-[#B12704] mt-1">{item.price.toLocaleString()} ج.س</p>
                      <div className="flex items-center gap-4 mt-2">
                        <button onClick={() => removeItem(item.id, item.variationId)} className="text-xs text-[#C5A021] hover:underline font-bold flex items-center gap-1">
                          <span className="material-symbols-rounded text-sm">delete</span>
                          حذف
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => updateQty(item.id, -1, item.variationId)} className="w-8 h-8 border border-gray-300 rounded text-lg font-bold hover:bg-gray-100 transition-colors flex items-center justify-center">−</button>
                      <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, 1, item.variationId)}  className="w-8 h-8 border border-gray-300 rounded text-lg font-bold hover:bg-gray-100 transition-colors flex items-center justify-center">+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-sm">
                <Link href="/shop" className="text-[#C5A021] font-bold hover:underline flex items-center gap-1">
                  <span className="material-symbols-rounded text-base">arrow_forward</span>
                  متابعة التسوق
                </Link>
                <p className="font-black text-[#0F172A]">
                  إجمالي المنتجات ({cart.length}): <span className="text-[#B12704]">{subtotal.toLocaleString()} ج.س</span>
                </p>
              </div>
            </div>

            {/* Summary Sidebar */}
            <aside className="lg:col-span-4">
              <div className="sticky top-28 space-y-4">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                  <h3 className="font-black text-[#0F172A] text-lg mb-4">ملخص الطلب</h3>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between text-gray-500">
                      <span className="font-bold">{subtotal.toLocaleString()} ج.س</span>
                      <span>المنتجات ({cart.length})</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span className="font-bold">{shipping.toLocaleString()} ج.س</span>
                      <span>الشحن</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-black text-[#0F172A]">
                      <span className="text-xl">{total.toLocaleString()} ج.س</span>
                      <span>الإجمالي</span>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/checkout")}
                    className="w-full bg-[#F29124] hover:bg-[#D97B10] text-white py-3 rounded font-black text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-rounded text-base">shopping_cart_checkout</span>
                    اطلب الآن
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                    <span className="material-symbols-rounded text-sm text-green-500">verified</span>
                    شراء آمن ومضمون مع مرسال
                  </p>
                </div>

                {/* Promo code */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-xs font-bold text-gray-500 mb-2">هل لديك كود خصم؟</p>
                  <div className="flex gap-2">
                    <input type="text" placeholder="أدخل الكود..." className="flex-grow border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-[#C5A021] text-right" />
                    <button className="bg-[#0F172A] text-white px-4 py-2 rounded text-xs font-bold hover:bg-[#1A3340] transition-colors">تطبيق</button>
                  </div>
                </div>
              </div>
            </aside>

          </div>
        )}
      </main>
    </div>
  );
}
