"use client"

import { motion } from "framer-motion";

const signals = [
  {
    icon: "local_shipping",
    title: "توصيل لكل السودان",
    desc: "شحن سريع وآمن للولايات",
    color: "bg-[#C5A021]/10",
    iconColor: "text-[#C5A021]"
  },
  {
    icon: "verified_user",
    title: "موردون موثوقين",
    desc: "تجار معتمدين من مرسال",
    color: "bg-[#F29124]/10",
    iconColor: "text-[#F29124]"
  },
  {
    icon: "payments",
    title: "دفع آمن",
    desc: "تعدد في خيارات الدفع",
    color: "bg-[#C5A021]/10",
    iconColor: "text-[#C5A021]"
  },
  {
    icon: "support_agent",
    title: "دعم 24/7",
    desc: "متواجدون دائماً لخدمتك",
    color: "bg-[#F29124]/10",
    iconColor: "text-[#F29124]"
  }
];

export default function TrustSignals() {
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="responsive-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {signals.map((signal, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-6 group hover:translate-x-[-8px] transition-transform duration-500 cursor-default"
            >
              <div className={`w-16 h-16 rounded-[1.5rem] ${signal.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                <span className={`material-symbols-rounded text-3xl ${signal.iconColor}`}>{signal.icon}</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-[#011216] leading-none">{signal.title}</h4>
                <p className="text-xs font-bold text-[#011216]/30 uppercase tracking-wider">{signal.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
