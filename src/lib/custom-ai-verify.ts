import { createWorker } from "tesseract.js";

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
  };
  flags: string[];
  suggestion: "APPROVE" | "REVIEW" | "REJECT";
}

// Arabic number mapping (Eastern Arabic to Western)
const EASTERN_ARABIC_NUMBERS: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
};

function normalizeArabicNumbers(text: string): string {
  let result = text;
  for (const [eastern, western] of Object.entries(EASTERN_ARABIC_NUMBERS)) {
    result = result.replace(new RegExp(eastern, "g"), western);
  }
  return result;
}

function extractNumbers(text: string): number[] {
  const normalized = normalizeArabicNumbers(text);
  const patterns = [
    ...normalized.matchAll(/(\d{1,3}(?:[,\s]\d{3})*(?:\.\d+)?)/g),
  ];
  return patterns
    .map((m) => parseFloat(m[1].replace(/[,\s]/g, "")))
    .filter((n) => !isNaN(n) && n > 0);
}

function findClosestAmount(numbers: number[], target: number): number | null {
  const threshold = target * 0.02;
  for (const num of numbers) {
    if (Math.abs(num - target) <= threshold) {
      return num;
    }
  }
  for (const num of numbers) {
    if (Math.abs(num - target) <= target * 0.05) {
      return num;
    }
  }
  return null;
}

function extractNameCandidates(text: string): string[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const candidates: string[] = [];

  for (const line of lines) {
    const cleaned = line.replace(/[^\w\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g, " ").trim();
    const words = cleaned.split(/\s+/).filter((w) => w.length > 2);
    if (words.length >= 2 && words.length <= 6) {
      candidates.push(cleaned);
    }
  }

  return candidates;
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function nameMatchScore(name1: string, name2: string): number {
  const n1 = normalizeName(name1);
  const n2 = normalizeName(name2);

  if (n1 === n2) return 100;
  if (n1.includes(n2) || n2.includes(n1)) return 90;

  const words1 = n1.split(/\s+/);
  const words2 = n2.split(/\s+/);
  const common = words1.filter((w) => w.length > 2 && words2.includes(w));
  const maxLen = Math.max(words1.length, words2.length);
  if (maxLen === 0) return 0;

  return Math.round((common.length / maxLen) * 100);
}

export async function verifyTransfer(
  imageUrl: string,
  orderAmount: number,
  customerName: string,
  expectedAccounts: Array<{ accountName?: string; accountNumber?: string; bankName?: string }>
): Promise<AnalysisResult> {
  let imageBuffer: Buffer | null = null;

  try {
    if (imageUrl.startsWith("http")) {
      const res = await fetch(imageUrl);
      const arrayBuffer = await res.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    } else {
      const fs = await import("fs");
      const path = await import("path");
      const fullPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
      const possiblePaths = [
        path.join(process.cwd(), "public", fullPath),
        path.join(process.cwd(), fullPath),
        imageUrl,
      ];
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          imageBuffer = fs.readFileSync(p);
          break;
        }
      }
    }
  } catch (e) {
    console.error("Image fetch error:", e);
  }

  if (!imageBuffer) {
    return {
      ocrText: "",
      confidence: 0,
      details: {
        amountFound: false,
        amountInReceipt: null,
        amountMatch: false,
        senderNameFound: false,
        senderNameInReceipt: null,
        senderNameMatchesCustomer: false,
        accountNameFound: false,
        accountNumberFound: false,
      },
      flags: ["⚠️ تعذر تحميل صورة الإيصال"],
      suggestion: "REJECT",
    };
  }

  // Local OCR with tesseract.js (runs entirely offline)
  let ocrText = "";
  try {
    const worker = await createWorker("ara+eng", 1, {
      logger: () => {},
    });

    const { data } = await worker.recognize(imageBuffer);
    ocrText = data.text || "";
    await worker.terminate();

    if (!ocrText || ocrText.trim().length < 5) {
      const worker2 = await createWorker("ara", 1, { logger: () => {} });
      const { data: data2 } = await worker2.recognize(imageBuffer);
      ocrText = data2.text || "";
      await worker2.terminate();
    }
  } catch (ocrErr) {
    console.error("Tesseract OCR Error:", ocrErr);
  }

  if (!ocrText || ocrText.trim().length < 3) {
    return {
      ocrText: "",
      confidence: 0,
      details: {
        amountFound: false,
        amountInReceipt: null,
        amountMatch: false,
        senderNameFound: false,
        senderNameInReceipt: null,
        senderNameMatchesCustomer: false,
        accountNameFound: false,
        accountNumberFound: false,
      },
      flags: ["⚠️ لم يتم استخراج أي نص من الصورة - يرجى رفع صورة أوضح"],
      suggestion: "REJECT",
    };
  }

  // ========== CUSTOM ANALYSIS ENGINE ==========
  const details = {
    amountFound: false,
    amountInReceipt: null as number | null,
    amountMatch: false,
    senderNameFound: false,
    senderNameInReceipt: null as string | null,
    senderNameMatchesCustomer: false,
    accountNameFound: false,
    accountNumberFound: false,
  };

  const flags: string[] = [];
  let score = 0;
  const textLower = ocrText.toLowerCase();

  // 1. Amount Analysis
  const numbers = extractNumbers(ocrText);
  const matched = findClosestAmount(numbers, orderAmount);

  if (matched !== null) {
    details.amountFound = true;
    details.amountInReceipt = matched;
    const diffPercent = Math.abs(matched - orderAmount) / orderAmount;
    if (diffPercent <= 0.02) {
      details.amountMatch = true;
      score += 40;
      flags.push(`✅ المبلغ (${orderAmount.toLocaleString()} ج.س) متطابق تماماً مع الإيصال`);
    } else {
      score += 20;
      flags.push(`⚠️ المبلغ في الإيصال (${matched.toLocaleString()} ج.س) قريب من المطلوب (${orderAmount.toLocaleString()} ج.س)`);
    }
  } else {
    flags.push(`⚠️ المبلغ المطلوب (${orderAmount.toLocaleString()} ج.س) لم يُعثر عليه في الإيصال`);
  }

  // 2. Account Name Analysis
  const ocrClean = normalizeArabicNumbers(ocrText).replace(/[^\w\s\u0600-\u06FF]/g, " ");

  for (const account of expectedAccounts) {
    if (account.accountName) {
      const nameParts = account.accountName.toLowerCase().split(/\s+/).filter((p) => p.length > 2);
      const matchedParts = nameParts.filter((part) => textLower.includes(part));
      if (matchedParts.length >= Math.ceil(nameParts.length * 0.5)) {
        details.accountNameFound = true;
        break;
      }
    }
  }

  if (!details.accountNameFound) {
    const bn = expectedAccounts[0]?.accountName?.toLowerCase() || "";
    if (bn) {
      const parts = bn.split(/\s+/).filter((p) => p.length > 2);
      const matched = parts.filter((p) => textLower.includes(p));
      if (matched.length >= Math.ceil(parts.length * 0.5)) {
        details.accountNameFound = true;
      }
    }
  }

  if (details.accountNameFound) {
    score += 20;
    flags.push("✅ اسم الحساب المستفيد متطابق مع بيانات المنصة");
  } else {
    flags.push("⚠️ اسم الحساب المستفيد لم يتطابق - قد يكون التحويل لحساب شخصي");
  }

  // 3. Account Number Analysis
  for (const account of expectedAccounts) {
    if (account.accountNumber) {
      const numClean = account.accountNumber.replace(/[\s-]/g, "");
      const ocrCleanNum = ocrText.replace(/[\s-]/g, "");
      if (ocrCleanNum.includes(numClean)) {
        details.accountNumberFound = true;
        break;
      }
      const numDigits = numClean.replace(/\D/g, "");
      const ocrDigits = ocrCleanNum.replace(/\D/g, "");
      if (numDigits.length >= 6 && ocrDigits.includes(numDigits)) {
        details.accountNumberFound = true;
        break;
      }
    }
  }

  if (details.accountNumberFound) {
    score += 15;
    flags.push("✅ رقم الحساب متطابق");
  } else {
    flags.push("⚠️ رقم الحساب لم يُعثر عليه في الإيصال");
  }

  // 4. Sender Name Analysis (name of the person who made the transfer)
  const nameCandidates = extractNameCandidates(ocrText);

  if (customerName && nameCandidates.length > 0) {
    let bestScore = 0;
    let bestName = "";

    for (const candidate of nameCandidates) {
      const match = nameMatchScore(candidate, customerName);
      if (match > bestScore) {
        bestScore = match;
        bestName = candidate;
      }
    }

    // Also check against the order customer name in the OCR text directly
    const customerWords = customerName.split(/\s+/).filter((w) => w.length > 2);
    const directMatch = customerWords.filter((w) => textLower.includes(w.toLowerCase()));
    const directScore = customerWords.length > 0
      ? Math.round((directMatch.length / customerWords.length) * 100)
      : 0;

    const finalScore = Math.max(bestScore, directScore);

    if (finalScore >= 70) {
      details.senderNameFound = true;
      details.senderNameInReceipt = bestName || customerName;
      details.senderNameMatchesCustomer = true;
      score += 25;
      flags.push(`✅ اسم المُرسِل "${customerName}" متطابق مع اسم العميل`);

      if (finalScore >= 90) {
        flags.push("✅✅ تطابق تام لاسم المُرسِل");
      }
    } else if (finalScore >= 40) {
      details.senderNameFound = true;
      details.senderNameInReceipt = bestName || null;
      score += 10;
      flags.push(`⚠️ اسم المُرسِل متطابق جزئياً - "${customerName}"`);
    } else {
      flags.push(`⚠️ اسم المُرسِل "${customerName}" لم يُعثر عليه في الإيصال - قد يكون التحويل من شخص آخر`);
    }
  }

  // 5. Additional quality checks
  if (ocrText.length < 30) {
    score -= 10;
    flags.push("⚠️ النص المستخرج قصير جداً - الصورة قد تكون منخفضة الجودة");
  } else if (ocrText.length > 100) {
    score += 5;
  }

  const hasDate = /\d{2,4}[-/]\d{1,2}[-/]\d{1,4}/.test(ocrText);
  if (!hasDate) {
    flags.push("ℹ️ لم يتم العثور على تاريخ واضح في الإيصال");
  }

  // 6. Final confidence and suggestion
  const finalConfidence = Math.max(0, Math.min(100, score));

  let suggestion: "APPROVE" | "REVIEW" | "REJECT";
  if (finalConfidence >= 85) {
    suggestion = "APPROVE";
    flags.unshift("✅✅✅ تحليل ذكي: الإيصال صحيح ومعتمد تلقائياً - جميع البيانات متطابقة");
  } else if (finalConfidence >= 50) {
    suggestion = "REVIEW";
    flags.unshift("🔍 الإيصال يحتاج مراجعة يدوية");
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

// Helper to create the verification worker
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
