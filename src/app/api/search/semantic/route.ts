import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { MOCK_PRODUCTS } from "@/lib/mockData/products";

// Initialize Gemini if API key is provided
const apiKey = process.env.GEMINI_API_KEY;
// Using GoogleGenAI according to the latest SDK specs
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    let keywords = q.toLowerCase();

    // 1. Semantic Understanding with Gemini
    if (ai) {
      const prompt = `
أنت محرك بحث ذكي لمتجر إلكتروني.
ابحث بناءً على طلب العميل واستخرج الكلمات المفتاحية الدقيقة أو فئات المنتجات التي يقصدها.
استخرج 2-3 كلمات مفتاحية (nouns) كحد أقصى. 
مهم جداً: أرجع فقط الكلمات المفتاحية مفصولة بمسافة وبدون أي كلام أو شروحات إضافية.
طلب العميل: "${q}"
      `;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      if (response.text) {
        keywords = response.text.trim().toLowerCase();
        // Fallback: If AI returns a long paragraph by mistake, just use the original query
        if (keywords.split(" ").length > 10) {
            keywords = q.toLowerCase();
        }
      }
    }

    // 2. Ultra-Fast In-Memory Search
    // We split the AI keywords or the original query and do a rapid filter
    const keywordArray = keywords.split(" ").filter(k => k.trim());

    const results = MOCK_PRODUCTS.filter((product) => {
      const textToSearch = `${product.title} ${product.description} ${product.category} ${product.brand || ''}`.toLowerCase();
      
      // Strict fallback: if no API key, do simple includes. If AI gave broad terms, match ANY.
      if (ai) {
          // If AI provided semantic terms, it's better if ANY of them match the product
          return keywordArray.some(kw => textToSearch.includes(kw));
      } else {
          // Normal search (all words must match)
          return keywordArray.every(kw => textToSearch.includes(kw));
      }
    }).map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      image: p.image,
      category: p.category
    })).slice(0, 5); // Return top 5 instant results

    return NextResponse.json({ results, ai_keywords: ai ? keywords : null });
  } catch (error) {
    console.error("Semantic search error:", error);
    // Silent fallback to standard search on error
    const basicResults = MOCK_PRODUCTS.filter(p => p.title.includes(q) || p.description.includes(q))
      .slice(0, 5)
      .map(p => ({ id: p.id, title: p.title, price: p.price, image: p.image, category: p.category }));
      
    return NextResponse.json({ results: basicResults });
  }
}
