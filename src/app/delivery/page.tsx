"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function DeliveryLanding() {
  const [driverId, setDriverId] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (driverId.trim()) {
      router.push(`/delivery/${driverId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="relative w-48 h-20 mx-auto">
          <Image src="/logo-navbar-final.png" alt="Mersal" fill className="object-contain" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-black">بوابة المناديب</h1>
          <p className="text-white/60 font-bold text-sm">أهلاً بك في نظام مرسال للتوصيل. يرجى إدخال رقم التعريف الخاص بك للمتابعة.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 pt-6">
          <div className="relative">
            <input
              type="text"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              placeholder="رقم تعريف المندوب (Driver ID)"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-center text-xl font-black focus:border-[#F29124] outline-none transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#F29124] text-[#0F172A] py-4 rounded-2xl font-black text-lg hover:brightness-110 transition-all shadow-xl shadow-[#F29124]/20"
          >
            تسجيل الدخول للمهام
          </button>
        </form>

        <div className="pt-10">
          <Link href="/" className="text-white/40 hover:text-white transition-colors text-xs font-bold underline">
            العودة للمتجر الرئيسي
          </Link>
        </div>
      </div>
    </div>
  );
}
