import PageHeader from "@/components/PageHeader";

export default function FAQPage() {
  const faqs = [
    {
      q: "كيف يمكنني تتبع طلبيتى؟",
      a: "يمكنك تتتبع حالة الطلب من خلال الذهاب إلى لوحة تحكم حسابك واختيار 'الطلبات'. ستتمكن من رؤية مسار الشحنة من وقت اعتمادها وحتى وصولها إلى باب منزلك."
    },
    {
      q: "ما هي سياسة الاسترجاع في مرسال؟",
      a: "نقدم ضمان سيادة مرسال للاسترجاع المجاني خلال 7 أيام من تاريخ الاستلام، بشرط أن يكون المنتج بحالته الأصلية ومرفقاً معه فاتورة الشراء الأصلية."
    },
    {
      q: "هل المنتجات المعروضة أصلية 100%؟",
      a: "مرسال هي منصة النخبة، وعليه فإننا نضمن أصالة كافة المنتجات المعروضة بموجب عقود حصرية وتدقيق صارم لكافة المتاجر المعتمدة لدينا."
    },
    {
      q: "كيف يمكنني الانضمام كصاحب متجر على منصة مرسال؟",
      a: "نرحب بالشركاء المتميزين. يمكنك تقديم طلب الانضمام عبر صفحة 'كن بائعاً معنا' في أسفل الموقع. سيقوم فريقنا بمراجعة طلبك والتواصل معك في غضون 48 ساعة."
    },
    {
      q: "ما هي خيارات الدفع المتاحة؟",
      a: "نقبل الدفع عند الاستلام (COD)، والتحويلات البنكية المباشرة عبر تطبيقات البنوك السودانية، بالإضافة إلى خيارات الدفع الإلكتروني عبر بطاقات الخصم المحلية."
    },
    {
      q: "كم تستغرق عملية التوصيل؟",
      a: "يستغرق التوصيل داخل ولاية الخرطوم عادة من 24 إلى 48 ساعة. أما الولايات الأخرى، فتستغرق من 3 إلى 5 أيام عمل حسب بعد المنطقة."
    },
    {
      q: "هل يمكنني تعديل طلبي بعد تأكيده؟",
      a: "نعم، يمكنك تعديل طلبك طالما لم يتم شحنه بعد. يرجى التواصل مع خدمة العملاء فوراً عبر الواتساب أو الهاتف لإجراء التعديلات المطلوبة."
    },
    {
      q: "ماذا أفعل إذا استلمت منتجاً تالفاً؟",
      a: "في حال وجود أي تلف أو عيب مصنعي، يرجى إبلاغنا خلال 24 ساعة من الاستلام. سنقوم باستبدال المنتج فوراً أو استعادة المبلغ دون أي تكاليف إضافية عليك."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="مركز المساعدة" 
        subtitle="Sovereign Knowledge Base" 
        icon="help_center" 
      />
      <div className="responsive-container py-24 max-w-4xl">
         <div className="space-y-12">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-black text-primary tracking-tighter mb-4">الأسئلة الأكثر شيوعاً</h2>
               <p className="text-primary/50 text-sm font-bold">إجابات شاملة لاستفسارات النخبة في منصة مرسال</p>
            </div>
            
            <div className="space-y-6">
               {faqs.map((faq, index) => (
                 <div key={index} className="bg-muted p-8 rounded-[2rem] border border-border/10 hover:border-[#1089A4]/30 transition-all group">
                    <h3 className="text-lg font-black text-primary mb-4 flex items-center gap-4">
                       <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#F29124] shadow-sm font-inter">Q{index + 1}</span>
                       {faq.q}
                    </h3>
                    <p className="text-primary/60 leading-relaxed pr-14 border-r-2 border-[#1089A4]/20 mr-4">
                       {faq.a}
                    </p>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
