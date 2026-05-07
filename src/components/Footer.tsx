"use client"

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const COLS = [
  {
    title: "تعرف على مرسال",
    links: [
      { label: "من نحن",            href: "/about" },
      { label: "وظائف",             href: "/careers" },
      { label: "أخبار مرسال",       href: "/news" },
      { label: "شراكات استراتيجية", href: "/partners" },
    ],
  },
  {
    title: "اربح معنا",
    links: [
      { label: "ابدأ تجارتك — بع على مرسال", href: "/vendor/register" },
      { label: "برنامج التوصيل",   href: "/delivery-jobs" },
      { label: "المسوقون بالعمولة", href: "/affiliates" },
      { label: "استثمر في مرسال",  href: "/invest" },
    ],
  },
  {
    title: "طوق الدفع لدينا",
    links: [
      { label: "الدفع عند الاستلام", href: "/payment/cod" },
      { label: "التحويل البنكي",      href: "/payment/bank" },
      { label: "الدفع الإلكتروني",   href: "/payment/online" },
      { label: "مرسال ريوارد",        href: "/rewards" },
    ],
  },
  {
    title: "المساعدة",
    links: [
      { label: "مركز المساعدة",     href: "/faq" },
      { label: "إرجاع واسترداد",    href: "/returns" },
      { label: "تتبع طلبك",         href: "/track" },
      { label: "تواصل معنا",        href: "/contact" },
    ],
  },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/vendor")) return null;

  return (
    <footer dir="rtl" className="mt-12">

      {/* ── Back to top ── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="w-full bg-[#1A3340] hover:bg-[#F29124] text-white text-xs font-bold py-3 transition-colors"
      >
        العودة إلى أعلى الصفحة ↑
      </button>

      {/* ── Main footer ── */}
      <div className="bg-[#021D24] text-white pt-10 pb-6">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">

          {/* Footer Identity Block */}
          <div className="mb-8 border-b border-white/10 pb-8">
            <div className="relative w-full max-w-[500px] h-20 lg:h-24">
              <Image 
                src="/footer-identity.png" 
                alt="مرسال - MORSALL" 
                fill 
                className="object-contain object-right" 
              />
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {COLS.map(col => (
              <div key={col.title}>
                <h4 className="text-xs font-black text-white mb-4 uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map(l => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-xs text-white/40 hover:text-white transition-colors leading-relaxed">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">

            {/* Legal */}
            <div className="flex flex-wrap items-center gap-4 text-[10px] text-white/30 font-bold">
              <Link href="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
              <span>|</span>
              <Link href="/terms" className="hover:text-white transition-colors">شروط الاستخدام</Link>
              <span>|</span>
              <Link href="/cookies" className="hover:text-white transition-colors">سياسة الكوكيز</Link>
              <span>|</span>
              <span>© 2026 مرسال — جميع الحقوق محفوظة</span>
            </div>

            {/* Security badges */}
            <div className="flex items-center gap-2">
              {["lock", "verified_user", "shield", "payment"].map(ic => (
                <div key={ic} className="w-8 h-7 bg-white/5 rounded border border-white/10 flex items-center justify-center">
                  <span className="material-symbols-rounded text-[13px] text-[#C5A021]/60">{ic}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom band (like Amazon) ── */}
      <div className="bg-[#011116] text-center py-3">
        <p className="text-[10px] text-white/20 font-bold">
          Powered by Morsall Tech — Sudan's #1 E-Commerce Platform 🇸🇩
        </p>
      </div>
    </footer>
  );
}
