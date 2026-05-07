export interface Product {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  category: string;
  categoryId: string;
  vendor: string;
  vendorLocation: string;
  image: string;
  badge?: string;
  discount?: number;
  rating: number;
  reviews: number;
  description: string;
  shortDescription?: string;
  specs: Record<string, string>;
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  otherOffers?: { vendor: string; price: number; rating: number }[];
  brand?: string;
  range?: string;
  type?: string;
  sku?: string;
  images?: string[];
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  ram?: string;
  storage?: string;
  screenSize?: string;
  bundleData?: any[];
  variations?: any[];
  productAttributes?: any[];
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "iphone-15-pm",
    title: "آبل آيفون 15 برو ماكس",
    price: 980000,
    oldPrice: 1150000,
    category: "موبايلات",
    categoryId: "electronics",
    vendor: "مرسال جادجتس",
    vendorLocation: "الخرطوم",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800",
    badge: "الأكثر مبيعاً",
    discount: 15,
    rating: 4.9,
    reviews: 458,
    description: "أقوى آيفون على الإطلاق، يتميز بتصميم من التيتانيوم القوي والخفيف، وكاميرا احترافية بدقة 48 ميجابكسل.",
    specs: {
      "المعالج": "A17 Pro chip",
      "الشاشة": "6.7-inch Super Retina XDR",
      "الكاميرا": "48MP Main | Ultra Wide | Telephoto",
      "البطارية": "تصل إلى 29 ساعة تشغيل فيديو"
    },
    colors: [
      { name: "تيتانيوم طبيعي", hex: "#A5A5A1" },
      { name: "أسود فلكي", hex: "#1D1D1F" },
      { name: "أزرق محيطي", hex: "#314455" }
    ],
    sizes: ["256GB", "512GB", "1TB"],
    otherOffers: [
      { vendor: "تكنو زون", price: 975000, rating: 4.7 },
      { vendor: "إلكترو مول", price: 990000, rating: 4.8 }
    ]
  },
  {
    id: "iphone-case-mersal",
    title: "غطاء حماية سيليكون أصلي (MagSafe)",
    price: 15000,
    category: "إكسسوارات",
    categoryId: "accessories",
    vendor: "مرسال جادجتس",
    vendorLocation: "الخرطوم",
    image: "https://via.placeholder.com/800x1000/F3F4F6/021D24?text=%D9%84%D8%A7+%D8%AA%D9%82%D8%AF%D8%AC+%D8%B5%D9%88%D8%B1%D8%A9",
    rating: 4.5,
    reviews: 12,
    description: "حماية فائقة لهاتفك مع ملمس ناعم ودعم للشحن اللاسلكي.",
    specs: { "المادة": "سيليكون", "التوافق": "iPhone 15 Series" }
  },
  {
    id: "iphone-charger-mersal",
    title: "رأس شاحن سريع 20 وات",
    price: 18000,
    category: "إكسسوارات",
    categoryId: "accessories",
    vendor: "مرسال جادجتس",
    vendorLocation: "الخرطوم",
    image: "https://images.unsplash.com/photo-1619130762460-6346597b4754?auto=format&fit=crop&q=80&w=400",
    rating: 4.7,
    reviews: 85,
    description: "شحن سريع وآمن لجهازك.",
    specs: { "القوة": "20W", "المنفذ": "USB-C" }
  },
  {
    id: "sony-wh1000xm5",
    title: "سماعات سوني WH-1000XM5",
    price: 185000,
    category: "إلكترونيات",
    categoryId: "electronics",
    vendor: "تكنو زون",
    vendorLocation: "الخرطوم",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800",
    badge: "جديد",
    rating: 4.8,
    reviews: 120,
    description: "رائدة في خاصية إلغاء الضجيج، توفر جودة صوت استثنائية وراحة طوال اليوم.",
    specs: {
      "نوع الاتصال": "لاسلكي / بلوتوث",
      "البطارية": "30 ساعة مع إلغاء الضجيج",
      "الوزن": "250 جرام"
    },
    otherOffers: [
        { vendor: "مبهورون جادجتس", price: 188000, rating: 4.9 }
    ]
  },
  {
    id: "rolex-oyster",
    title: "ساعة رولكس أويستر بربتشوال",
    price: 950000,
    category: "إكسسوارات",
    categoryId: "watches",
    vendor: "نخبة الساعات",
    vendorLocation: "الخرطوم",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
    badge: "نخبة",
    rating: 5.0,
    reviews: 42,
    description: "رمز للأناقة الخالدة، تتميز بالدقة العالية والمتانة المستوحاة من أعماق البحار.",
    specs: {
      "المادة": "فولاذ أويستر ستيل",
      "الحركة": "ميكانيكية ذاتية التعبئة",
      "المقاومة": "مقاومة للماء حتى 100 متر"
    }
  },
  {
    id: "macbook-pro-m3",
    title: "آبل ماك بوك برو 14 بوصة M3",
    price: 1450000,
    category: "إلكترونيات",
    categoryId: "electronics",
    vendor: "آبل سيستمز",
    vendorLocation: "الخرطوم",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800",
    badge: "قوة قصوى",
    rating: 4.9,
    reviews: 85,
    description: "أداء مذهل للمحترفين بفضل شريحة M3 المتطورة.",
    specs: {
      "المعالج": "Apple M3 Chip",
      "الذاكرة": "16GB Unified Memory",
      "التخزين": "512GB SSD"
    }
  }
];

export function getProductById(id: string) {
  return MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0];
}

export function getRelatedProducts(categoryId: string, excludeId: string) {
  return MOCK_PRODUCTS.filter(p => p.categoryId === categoryId && p.id !== excludeId).slice(0, 4);
}

export function getVendorUpsells(vendor: string, excludeId: string) {
  return MOCK_PRODUCTS.filter(p => p.vendor === vendor && p.id !== excludeId).slice(0, 2);
}
