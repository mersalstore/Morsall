import "./globals.css";
import { Suspense } from "react";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata = {
  title: "مرسال | اتسوّق بثقة — نوصّل لبابك في السودان",
  description: "مرسال منصة التجارة الإلكترونية الأولى في السودان — آلاف المنتجات، توصيل سريع، ودفع آمن.",
  keywords: ["مرسال", "تسوق", "السودان", "توصيل", "الخرطوم", "منتجات", "متجر إلكتروني"],
  authors: [{ name: "فريق مرسال" }],
  openGraph: {
    title: "مرسال | ابدأ تجارتك أو اتسوّق الآن",
    description: "آلاف المنتجات من موردين موثوقين — توصيل لكل أنحاء السودان.",
    url: "https://morsall.com",
    siteName: "مرسال",
    locale: "ar_SD",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/logo-navbar-final.png", sizes: "32x32" },
      { url: "/logo-navbar-final.png", sizes: "192x192" },
    ],
    shortcut: "/logo-navbar-final.png",
    apple: "/logo-navbar-final.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* JF Flat — الخط العربي الرسمي للمنصة */}
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        <script dangerouslySetInnerHTML={{ __html: `console.error = function() {}; console.warn = function() {};` }} />
      </head>
      <body>
        <Providers>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          
          <div className="flex flex-col min-h-screen">
             {/* Breadcrumbs — only shown on inner pages, has its own top padding */}
             <Breadcrumbs />
             
             <main className="flex-grow">
                {children}
             </main>

             <Footer />
          </div>
          
          {/* Scroll to top button */}
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}

