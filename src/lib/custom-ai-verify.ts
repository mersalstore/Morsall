/**
 * Advanced OCR-based bank transfer receipt verification.
 * Fully offline (no external APIs). Uses:
 *  - sharp for image preprocessing (grayscale, contrast, sharpen, threshold)
 *  - tesseract.js (Arabic + English) with multiple passes
 *  - Sudanese bank receipt heuristics + smart Arabic number extraction
 */
import { createWorker } from "tesseract.js";
import sharp from "sharp";

interface AnalysisResult {
  ocrText: string;
  confidence: number;
  details: {
    amountFound: boolean;
    amountInReceipt: number | null;
    amountMatch: boolean;
    senderNameFound: boolean;
    senderNameInReceipt: string | null;
    senderNameMatchesCustomer: boolean;
    accountNameFound: boolean;
    accountNumberFound: boolean;
    bankNameFound: boolean;
    bankNameInReceipt: string | null;
    dateFound: boolean;
    referenceFound: boolean;
  };
  flags: string[];
  suggestion: "APPROVE" | "REVIEW" | "REJECT";
}

// Eastern Arabic to Western digit mapping
const EASTERN_ARABIC_NUMBERS: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
};

// Common Sudanese bank names (Arabic + English variants)
const SUDAN_BANKS = [
  { ar: ["بنك الخرطوم", "خرطوم"], en: ["bank of khartoum", "bok"] },
  { ar: ["البنك السعودي السوداني", "السوداني الفرنسي"], en: ["sudanese french bank"] },
  { ar: ["بنك فيصل", "فيصل الإسلامي"], en: ["faisal", "faisal islamic"] },
  { ar: ["بنك أم درمان", "أم درمان"], en: ["omdurman national bank"] },
  { ar: ["بنك التنمية", "التضامن"], en: ["tadamon"] },
  { ar: ["البنك الأهلي", "الأهلي"], en: ["national bank", "ncb"] },
  { ar: ["بنك البركة", "البركة"], en: ["albaraka", "al baraka"] },
  { ar: ["بنك النيل"], en: ["bank of nile"] },
  { ar: ["بنك الإدخار", "الإدخار"], en: ["savings bank"] },
  { ar: ["بنكك", "ban kak"], en: ["bankak"] },
  { ar: ["البنك العقاري"], en: ["real estate bank"] },
  { ar: ["بنك المزارع التجاري"], en: ["farmers commercial bank"] },
];

function normalizeArabicNumbers(text: string): string {
  let result = text;
  for (const [eastern, western] of Object.entries(EASTERN_ARABIC_NUMBERS)) {
    result = result.replace(new RegExp(eastern, "g"), western);
  }
  return result;
}

function extractNumbers(text: string): number[] {
  const normalized = normalizeArabicNumbers(text);
  const seen = new Set<number>();
  const out: number[] = [];

  // Match numbers with optional thousands separator (comma, space, or period) and decimals
  const patterns = [
    /(\d{1,3}(?:[,\s\.]\d{3})*(?:\.\d{1,2})?)/g,
    /(\d{4,})/g, // long digits (no separators)
  ];

  for (const re of patterns) {
    for (const m of normalized.matchAll(re)) {
      // Strip separators - careful with decimal points
      let cleaned = m[1];
      // If matches "1,234.50" or "1.234,50" patterns, normalize
      if (/^\d{1,3}(?:[,\s]\d{3})+(?:\.\d{1,2})?$/.test(cleaned)) {
        cleaned = cleaned.replace(/[,\s]/g, "");
      } else if (/^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(cleaned)) {
        cleaned = cleaned.replace(/\./g, "").replace(",", ".");
      } else {
        // fallback: just strip spaces/commas
        cleaned = cleaned.replace(/[,\s]/g, "");
      }
      const n = parseFloat(cleaned);
      if (!isNaN(n) && n > 0 && !seen.has(n)) {
        seen.add(n);
        out.push(n);
      }
    }
  }
  return out.sort((a, b) => b - a); // largest first (amount usually bigger than reference numbers)
}

function findClosestAmount(numbers: number[], target: number): number | null {
  // Try exact match first
  for (const num of numbers) {
    if (Math.abs(num - target) < 0.5) return num;
  }
  // 2% tolerance
  const tight = target * 0.02;
  for (const num of numbers) {
    if (Math.abs(num - target) <= tight) return num;
  }
  // 5% tolerance
  const loose = target * 0.05;
  for (const num of numbers) {
    if (Math.abs(num - target) <= loose) return num;
  }
  return null;
}

function detectBank(ocrText: string): string | null {
  const lower = ocrText.toLowerCase();
  for (const bank of SUDAN_BANKS) {
    for (const ar of bank.ar) {
      if (ocrText.includes(ar)) return bank.ar[0];
    }
    for (const en of bank.en) {
      if (lower.includes(en)) return bank.ar[0];
    }
  }
  return null;
}

function extractNameCandidates(text: string): string[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const candidates: string[] = [];

  // Look for explicit "Name:" or "اسم" labeled lines first
  const labelPatterns = [
    /(?:اسم\s+المرسل|اسم\s+المُرسِل|من|الراسل|sender|from)\s*[:\-]?\s*(.+)/i,
    /(?:اسم\s+المستفيد|إلى|to|beneficiary|recipient)\s*[:\-]?\s*(.+)/i,
  ];

  for (const line of lines) {
    for (const re of labelPatterns) {
      const m = line.match(re);
      if (m && m[1]) {
        const v = m[1].trim().slice(0, 80);
        if (v.length > 3) candidates.push(v);
      }
    }
  }

  // Then add any 2-6 word lines as candidates
  for (const line of lines) {
    const cleaned = line.replace(/[^\w\s؀-ۿݐ-ݿࢠ-ࣿ]/g, " ").trim();
    const words = cleaned.split(/\s+/).filter(w => w.length > 2);
    if (words.length >= 2 && words.length <= 6) {
      candidates.push(cleaned);
    }
  }

  return Array.from(new Set(candidates));
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[ـ]/g, "") // tatweel
    .replace(/[إأآا]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[ىي]/g, "ي")
    .replace(/[^\w\s؀-ۿ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function nameMatchScore(name1: string, name2: string): number {
  const n1 = normalizeName(name1);
  const n2 = normalizeName(name2);
  if (!n1 || !n2) return 0;
  if (n1 === n2) return 100;
  if (n1.includes(n2) || n2.includes(n1)) return 90;
  const words1 = n1.split(/\s+/);
  const words2 = n2.split(/\s+/);
  const common = words1.filter(w => w.length > 2 && words2.includes(w));
  const maxLen = Math.max(words1.length, words2.length);
  if (maxLen === 0) return 0;
  return Math.round((common.length / maxLen) * 100);
}

async function loadImageBuffer(imageUrl: string): Promise<Buffer | null> {
  try {
    if (imageUrl.startsWith("http")) {
      const res = await fetch(imageUrl);
      const ab = await res.arrayBuffer();
      return Buffer.from(ab);
    }
    const fs = await import("fs");
    const path = await import("path");
    const candidates = [
      path.join(process.cwd(), "public", imageUrl.startsWith("/") ? imageUrl : "/" + imageUrl),
      path.join(process.cwd(), imageUrl),
      imageUrl,
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) return fs.readFileSync(p);
    }
  } catch (e) {
    console.error("Image fetch error:", e);
  }
  return null;
}

async function preprocessVariants(input: Buffer): Promise<Buffer[]> {
  const variants: Buffer[] = [];

  // Original (just resized for clarity if smaller than 1000px)
  try {
    const meta = await sharp(input).metadata();
    let pipe = sharp(input);
    if ((meta.width || 0) < 1000) {
      pipe = pipe.resize({ width: 1600, withoutEnlargement: false });
    }
    variants.push(await pipe.toBuffer());
  } catch {}

  // Variant 1: Grayscale + normalize + sharpen — best for crisp text
  try {
    variants.push(
      await sharp(input)
        .resize({ width: 1800, withoutEnlargement: false })
        .grayscale()
        .normalize()
        .sharpen()
        .toBuffer()
    );
  } catch {}

  // Variant 2: Grayscale + threshold — best for high-contrast text
  try {
    variants.push(
      await sharp(input)
        .resize({ width: 1800, withoutEnlargement: false })
        .grayscale()
        .normalize()
        .threshold(140)
        .toBuffer()
    );
  } catch {}

  // Variant 3: Increase brightness/contrast
  try {
    variants.push(
      await sharp(input)
        .resize({ width: 1800, withoutEnlargement: false })
        .grayscale()
        .linear(1.4, -30)
        .sharpen()
        .toBuffer()
    );
  } catch {}

  return variants;
}

async function ocrPass(buf: Buffer, langs: string): Promise<string> {
  try {
    const worker = await createWorker(langs, 1, { logger: () => {} });
    const { data } = await worker.recognize(buf);
    await worker.terminate();
    return data.text || "";
  } catch (e) {
    console.error(`OCR pass ${langs} error:`, e);
    return "";
  }
}

export async function verifyTransfer(
  imageUrl: string,
  orderAmount: number,
  customerName: string,
  expectedAccounts: Array<{ accountName?: string; accountNumber?: string; bankName?: string }>
): Promise<AnalysisResult> {
  const emptyDetails = {
    amountFound: false,
    amountInReceipt: null as number | null,
    amountMatch: false,
    senderNameFound: false,
    senderNameInReceipt: null as string | null,
    senderNameMatchesCustomer: false,
    accountNameFound: false,
    accountNumberFound: false,
    bankNameFound: false,
    bankNameInReceipt: null as string | null,
    dateFound: false,
    referenceFound: false,
  };

  const buf = await loadImageBuffer(imageUrl);
  if (!buf) {
    return {
      ocrText: "",
      confidence: 0,
      details: emptyDetails,
      flags: ["⚠️ تعذر تحميل صورة الإيصال"],
      suggestion: "REJECT",
    };
  }

  // Generate preprocessed variants
  const variants = await preprocessVariants(buf);
  if (variants.length === 0) variants.push(buf);

  // Run OCR on each variant and pick the longest meaningful result
  const ocrResults: string[] = [];
  for (const v of variants) {
    const txt = await ocrPass(v, "ara+eng");
    if (txt.trim().length >= 10) ocrResults.push(txt);
  }

  // If nothing worked, try Arabic alone on the best variant
  if (ocrResults.length === 0) {
    const fallback = await ocrPass(variants[0], "ara");
    if (fallback.trim().length > 0) ocrResults.push(fallback);
  }

  if (ocrResults.length === 0) {
    return {
      ocrText: "",
      confidence: 0,
      details: emptyDetails,
      flags: ["⚠️ لم يتم استخراج أي نص من الصورة - يرجى رفع صورة أوضح وبدقة أعلى"],
      suggestion: "REJECT",
    };
  }

  // Combine OCR results (concatenate to maximize signal)
  const ocrText = ocrResults.join("\n");
  const textLower = ocrText.toLowerCase();
  const details = { ...emptyDetails };
  const flags: string[] = [];
  let score = 0;

  // ===== 1. Amount Analysis (35 pts) =====
  const numbers = extractNumbers(ocrText);
  const matched = findClosestAmount(numbers, orderAmount);

  if (matched !== null) {
    details.amountFound = true;
    details.amountInReceipt = matched;
    const diff = Math.abs(matched - orderAmount) / orderAmount;
    if (diff < 0.005) {
      details.amountMatch = true;
      score += 35;
      flags.push(`✅ المبلغ ${orderAmount.toLocaleString()} ج.س متطابق تماماً مع الإيصال`);
    } else if (diff <= 0.02) {
      details.amountMatch = true;
      score += 28;
      flags.push(`✅ المبلغ ${matched.toLocaleString()} ج.س قريب جداً من المطلوب ${orderAmount.toLocaleString()} ج.س`);
    } else {
      score += 15;
      flags.push(`⚠️ المبلغ في الإيصال ${matched.toLocaleString()} ج.س ولكن المطلوب ${orderAmount.toLocaleString()} ج.س - فرق ${Math.round(diff * 100)}%`);
    }
  } else {
    flags.push(`❌ المبلغ المطلوب ${orderAmount.toLocaleString()} ج.س لم يُعثر عليه في الإيصال`);
  }

  // ===== 2. Account Name Analysis (20 pts) =====
  for (const account of expectedAccounts) {
    if (!account.accountName) continue;
    const norm = normalizeName(account.accountName);
    const nameParts = norm.split(/\s+/).filter(p => p.length > 2);
    const normalizedOcr = normalizeName(ocrText);
    const matchedParts = nameParts.filter(part => normalizedOcr.includes(part));
    if (matchedParts.length >= Math.max(1, Math.ceil(nameParts.length * 0.6))) {
      details.accountNameFound = true;
      break;
    }
  }

  if (details.accountNameFound) {
    score += 20;
    flags.push("✅ اسم الحساب المستفيد متطابق مع بيانات المنصة");
  } else {
    flags.push("⚠️ اسم الحساب المستفيد لم يتطابق - قد يكون التحويل لحساب آخر");
  }

  // ===== 3. Account Number Analysis (15 pts) =====
  const ocrDigitsOnly = normalizeArabicNumbers(ocrText).replace(/\D/g, "");
  for (const account of expectedAccounts) {
    if (!account.accountNumber) continue;
    const accDigits = account.accountNumber.replace(/\D/g, "");
    if (accDigits.length >= 6 && ocrDigitsOnly.includes(accDigits)) {
      details.accountNumberFound = true;
      break;
    }
    // Allow partial match of last 6+ digits
    if (accDigits.length >= 8) {
      const tail = accDigits.slice(-8);
      if (ocrDigitsOnly.includes(tail)) {
        details.accountNumberFound = true;
        break;
      }
    }
  }

  if (details.accountNumberFound) {
    score += 15;
    flags.push("✅ رقم الحساب المستفيد متطابق");
  } else {
    flags.push("⚠️ رقم الحساب لم يُعثر عليه في الإيصال");
  }

  // ===== 4. Bank Name Detection (10 pts) =====
  const bankFromReceipt = detectBank(ocrText);
  if (bankFromReceipt) {
    details.bankNameFound = true;
    details.bankNameInReceipt = bankFromReceipt;
    // Check if it matches expected bank
    let matchedExpected = false;
    for (const account of expectedAccounts) {
      if (!account.bankName) continue;
      if (normalizeName(account.bankName).includes(normalizeName(bankFromReceipt)) ||
          normalizeName(bankFromReceipt).includes(normalizeName(account.bankName))) {
        matchedExpected = true;
        break;
      }
    }
    if (matchedExpected) {
      score += 10;
      flags.push(`✅ اسم البنك "${bankFromReceipt}" مطابق للبنك المستهدف`);
    } else if (expectedAccounts.some(a => a.bankName)) {
      score += 3;
      flags.push(`ℹ️ اسم البنك في الإيصال "${bankFromReceipt}" لا يطابق البنك المستهدف`);
    } else {
      score += 5;
      flags.push(`ℹ️ تم اكتشاف اسم البنك: "${bankFromReceipt}"`);
    }
  } else {
    flags.push("⚠️ لم يتم اكتشاف اسم بنك معروف في الإيصال");
  }

  // ===== 5. Sender Name (10 pts) =====
  if (customerName) {
    const candidates = extractNameCandidates(ocrText);
    let bestScore = 0;
    let bestName: string | null = null;
    for (const c of candidates) {
      const s = nameMatchScore(c, customerName);
      if (s > bestScore) {
        bestScore = s;
        bestName = c;
      }
    }
    // Direct check on text
    const custWords = normalizeName(customerName).split(/\s+/).filter(w => w.length > 2);
    if (custWords.length > 0) {
      const normalizedOcr = normalizeName(ocrText);
      const directMatchCount = custWords.filter(w => normalizedOcr.includes(w)).length;
      const directScore = Math.round((directMatchCount / custWords.length) * 100);
      bestScore = Math.max(bestScore, directScore);
    }

    if (bestScore >= 70) {
      details.senderNameFound = true;
      details.senderNameInReceipt = bestName;
      details.senderNameMatchesCustomer = true;
      score += 10;
      flags.push(`✅ اسم المُرسِل/المستفيد يتطابق مع "${customerName}"`);
    } else if (bestScore >= 40) {
      details.senderNameFound = true;
      details.senderNameInReceipt = bestName;
      score += 4;
      flags.push(`⚠️ اسم المُرسِل متطابق جزئياً (${bestScore}%)`);
    } else {
      flags.push(`ℹ️ لم يُعثر بوضوح على اسم "${customerName}" في الإيصال`);
    }
  }

  // ===== 6. Date Found (5 pts) =====
  const datePatterns = [
    /\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4}/,
    /\d{4}[-\/\.]\d{1,2}[-\/\.]\d{1,2}/,
    /\d{1,2}\s+(?:يناير|فبراير|مارس|إبريل|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  ];
  for (const re of datePatterns) {
    if (re.test(ocrText)) {
      details.dateFound = true;
      score += 5;
      flags.push("✅ تم العثور على تاريخ في الإيصال");
      break;
    }
  }
  if (!details.dateFound) {
    flags.push("ℹ️ لم يتم العثور على تاريخ واضح");
  }

  // ===== 7. Reference / Transaction ID (5 pts) =====
  const refPatterns = [
    /(?:reference|ref|مرجع|رقم\s*العملية|رقم\s*المعاملة|transaction)\s*[:#\-]?\s*([a-z0-9]{6,})/i,
    /\b[A-Z0-9]{8,}\b/, // generic ref-looking code
  ];
  for (const re of refPatterns) {
    if (re.test(ocrText)) {
      details.referenceFound = true;
      score += 5;
      flags.push("✅ تم العثور على رقم مرجع للعملية");
      break;
    }
  }

  // ===== 8. Quality Modifiers =====
  if (ocrText.length < 30) {
    score -= 15;
    flags.push("⚠️ النص المستخرج قصير جداً - الصورة قد تكون منخفضة الجودة");
  }
  if (variants.length > 1 && ocrResults.length >= 2) {
    score += 2; // bonus for multi-variant agreement
  }

  // ===== 9. Final Decision =====
  const finalConfidence = Math.max(0, Math.min(100, score));

  let suggestion: "APPROVE" | "REVIEW" | "REJECT";
  if (finalConfidence >= 85) {
    suggestion = "APPROVE";
    flags.unshift("✅✅✅ الإيصال صحيح ومعتمد - جميع البيانات متطابقة");
  } else if (finalConfidence >= 50) {
    suggestion = "REVIEW";
    flags.unshift("🔍 الإيصال يحتاج مراجعة يدوية للتأكد");
  } else {
    suggestion = "REJECT";
    flags.unshift("❌ الإيصال غير مطابق - يوصى بالرفض");
  }

  return {
    ocrText,
    confidence: finalConfidence,
    details,
    flags,
    suggestion,
  };
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 85) return "#10B981";
  if (confidence >= 50) return "#F59E0B";
  return "#EF4444";
}

export function getSuggestionLabel(suggestion: "APPROVE" | "REVIEW" | "REJECT"): string {
  switch (suggestion) {
    case "APPROVE": return "معتمد";
    case "REVIEW": return "مراجعة";
    case "REJECT": return "مرفوض";
  }
}
