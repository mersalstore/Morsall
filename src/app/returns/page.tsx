import PageHeader from "@/components/PageHeader";

export default function ReturnsPage() {
  const steps = [
    { title: "تقديم الطلب", desc: "ادخل على حسابك وافتح تفاصيل الطلب الذي ترغب في إرجاعه.", icon: "edit_document" },
    { title: "المراجعة", desc: "سيقوم فريقنا بمراجعة طلبك خلال 24 ساعة للتأكد من استيفاء الشروط.", icon: "policy" },
    { title: "الاستلام", desc: "سنرسل مندوبنا لاستلام المنتج من باب منزلك مجاناً.", icon: "local_shipping" },
    { title: "استرداد المبلغ", desc: "بعد استلام المنتج وفحصه، سيتم تحويل المبلغ إلى حسابك فوراً.", icon: "payments" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="سياسة الإرجاع" 
        subtitle="Sovereign Guarantee" 
        icon="keyboard_return" 
      />
      
      <div className="responsive-container py-24 max-w-5xl">
        <div className="space-y-24">
          {/* Main Policy */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
             <div className="space-y-8">
                <h2 className="text-4xl font-black text-primary tracking-tighter">حقك محفوظ مع مرسال</h2>
                <p className="text-primary/60 text-lg leading-relaxed">
                   نحن في مرسال نثق بجودة المنتجات التي يقدمها شركاؤنا، ولكننا نعلم أن الأمور قد لا تسير دائماً كما هو مخطط لها. لذا، وضعنا سياسة إرجاع مرنة تضمن حقك في المقام الأول.
                </p>
                <div className="p-8 bg-accent/5 rounded-[2.5rem] border border-accent/10">
                   <h4 className="text-[#C5A021] font-black text-sm mb-2 flex items-center gap-2">
                      <span className="material-symbols-rounded">verified</span>
                      ضمان مرسال الـ 7 أيام
                   </h4>
                   <p className="text-xs text-primary/60 font-bold leading-relaxed">
                      يمكنك إرجاع أي منتج خلال 7 أيام من تاريخ الاستلام دون إبداء أسباب، بشرط أن يكون المنتج في عبوته الأصلية ولم يتم استخدامه.
                   </p>
                </div>
             </div>
             <div className="bg-muted p-12 rounded-[3rem] border border-border/10">
                <h3 className="text-xl font-black text-primary mb-8">شروط الإرجاع</h3>
                <ul className="space-y-6">
                   {[
                     "يجب أن يكون المنتج بحالته الأصلية ومع كافة ملحقاته.",
                     "يجب إرفاق فاتورة الشراء الأصلية.",
                     "لا يمكن إرجاع المنتجات الشخصية (مثل العطور المفتوحة أو الملابس الداخلية).",
                     "في حال وجود عيب مصنعي، الإرجاع مجاني بالكامل.",
                   ].map((item, i) => (
                     <li key={i} className="flex gap-4 items-start">
                        <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                           <span className="material-symbols-rounded text-[14px] text-primary">check</span>
                        </span>
                        <p className="text-sm text-primary/60 font-bold">{item}</p>
                     </li>
                   ))}
                </ul>
             </div>
          </section>

          {/* Process Steps */}
          <section className="space-y-16">
             <div className="text-center">
                <h2 className="text-3xl font-black text-primary tracking-tighter mb-4">كيف تعمل عملية الإرجاع؟</h2>
                <p className="text-primary/50 text-sm font-bold">خطوات بسيطة وشفافة لاستعادة حقك</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {steps.map((step, i) => (
                  <div key={i} className="relative text-center group">
                     {i < steps.length - 1 && (
                       <div className="hidden md:block absolute top-12 left-[-20%] w-[40%] h-[2px] bg-border/20 z-0" />
                     )}
                     <div className="relative z-10 w-24 h-24 bg-white border border-border/10 rounded-[2rem] shadow-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-accent transition-colors">
                        <span className="material-symbols-rounded text-3xl text-accent group-hover:text-white transition-colors">{step.icon}</span>
                        <span className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-black text-xs shadow-lg">{i+1}</span>
                     </div>
                     <h4 className="text-sm font-black text-primary mb-2">{step.title}</h4>
                     <p className="text-[10px] text-primary/40 font-bold leading-relaxed px-4">{step.desc}</p>
                  </div>
                ))}
             </div>
          </section>

          {/* Contact Support CTA */}
          <section className="bg-[#0F172A] p-12 md:p-20 rounded-[4rem] text-center text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full" />
             <div className="relative z-10 space-y-8">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter">هل تواجه مشكلة في الإرجاع؟</h2>
                <p className="text-white/40 text-sm md:text-lg max-w-2xl mx-auto font-bold">
                   فريق دعم النخبة لدينا مستعد لمساعدتك وتسهيل كافة الإجراءات. لا تتردد في التواصل معنا.
                </p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                   <button className="btn-primary bg-accent hover:bg-accent/80 border-none px-12 py-5 text-black">تواصل مع الدعم</button>
                   <p className="text-xs font-black text-white/20 uppercase tracking-widest">متوفرون 24/7 لخدمتكم</p>
                </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
