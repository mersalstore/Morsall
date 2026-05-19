import PageHeader from "@/components/PageHeader";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="اتفاقية الخدمة" 
        subtitle="Mersal Terms of Sovereignty" 
        icon="gavel" 
      />
      <div className="responsive-container py-24 max-w-4xl">
         <article className="prose prose-lg max-w-none text-primary/80 prose-headings:text-primary prose-a:text-[#C5A021]">
            <h2>قبول الشروط</h2>
            <p>
               دخولك إلى منصة "مرسال" (Mersal Elite Market) واستخدامك لخدماتها يعني موافقتك الكاملة والخالصة على جميع البنود والشروط المذكورة هنا. تُعتبر هذه الشروط عقداً مُلزماً بينك وبين إدارة المنصة.
            </p>
            
            <h2>شروط استخدام المنصة</h2>
            <p>
               يُمنع منعاً باتاً استخدام المنصة لأي أغراض غير قانونية أو لانتهاك حقوق الملكية الفكرية الخاصة بمرسال أو أي طرف ثالث. تحتفظ مرسال بالحق في إنهاء الحسابات التي تنتهك هذا الميثاق فوراً ودون إشعار مسبق.
            </p>

            <h2>العلاقة مع المتاجر الكبرى</h2>
            <p>
               نحن في مرسال نعمل بنظام وساطة شديد الدقة. جميع المتاجر في المنصة هم كيانات مسجلة ومعتمدة. تلتزم المنصة بتسهيل عملية الشراء بأعلى درجات الأمان الممكنة، في حين يتحمل المتجر النهائي مسؤولية جودة وتوصيل المنتج حسب المواصفات.
            </p>

            <h2>المعاملات المالية</h2>
            <p>
               جميع الأسعار المعروضة في المنصة نهائية ولا تخضع للتفاوض، وتشمل كافة الرسوم المتعلقة بعمليات التشفير والدفع الآمن. في حال الاسترجاع، سيتم تحويل المبالغ لنفس الحساب المستخدم في عملية الشراء خلال 14 يوم عمل.
            </p>

            <div className="mt-16 p-8 bg-muted rounded-[2rem] border border-border/10 text-center">
               <span className="material-symbols-rounded text-3xl text-accent mb-4">verified_user</span>
               <p className="text-sm font-bold text-primary/60">بتسجيلك في النظام، أنت توافق على الخضوع لقوانين التجارة الإلكترونية المعمول بها.</p>
            </div>
         </article>
      </div>
    </div>
  );
}
