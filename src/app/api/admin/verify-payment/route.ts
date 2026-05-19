import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";
import { prisma } from "@/lib/db";

// POST /api/admin/verify-payment
// Analyzes a payment screenshot using OCR and compares with expected account details
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();

  try {
    const { orderId, imageUrl } = await req.json();
    if (!orderId || !imageUrl) {
      return NextResponse.json({ error: "orderId و imageUrl مطلوبان" }, { status: 400 });
    }

    // Get order
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

    // Get bank account settings
    const settings = await prisma.settings.findUnique({ where: { id: "global" } });

    // Call OCR.space free API to extract text from image
    let ocrText = "";
    let ocrWords: string[] = [];
    
    try {
      const formData = new FormData();
      
      // If it's a URL, fetch the image first
      if (imageUrl.startsWith("http")) {
        formData.append("url", imageUrl);
      } else {
        formData.append("url", `https://morsall.com${imageUrl}`);
      }
      formData.append("apikey", "helloworld"); // Free OCR.space API key
      formData.append("language", "ara");
      formData.append("isOverlayRequired", "false");
      formData.append("OCREngine", "2");

      const ocrRes = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
      });
      
      if (ocrRes.ok) {
        const ocrData = await ocrRes.json();
        if (ocrData.ParsedResults?.[0]?.ParsedText) {
          ocrText = ocrData.ParsedResults[0].ParsedText;
          ocrWords = ocrText.toLowerCase().split(/\s+/).filter(Boolean);
        }
      }
    } catch (ocrErr) {
      console.error("OCR Error:", ocrErr);
    }

    // Parse expected account info from settings
    let expectedAccounts: any[] = [];
    try {
      if (settings?.bankAccounts) {
        const parsed = JSON.parse(settings.bankAccounts);
        if (Array.isArray(parsed)) {
          expectedAccounts = parsed;
        }
      }
    } catch {
      // bankAccounts might be plain text
      if (settings?.bankAccountNumber) {
        expectedAccounts = [{
          accountNumber: settings.bankAccountNumber,
          accountName: settings.bankAccountName,
          bankName: settings.bankName,
        }];
      }
    }

    // --- Analysis Logic ---
    const analysis = {
      ocrText,
      foundAmount: false,
      foundAccountName: false,
      foundAccountNumber: false,
      detectedAmount: null as number | null,
      confidence: 0,
      flags: [] as string[],
    };

    // 1. Check if order amount appears in OCR text
    const orderAmount = Math.round(order.totalAmount);
    const amountVariants = [
      orderAmount.toString(),
      orderAmount.toLocaleString(),
      (orderAmount / 1000).toFixed(3),
    ];
    
    for (const variant of amountVariants) {
      if (ocrText.includes(variant)) {
        analysis.foundAmount = true;
        analysis.detectedAmount = orderAmount;
        break;
      }
    }

    // Also try to find any number that's close to the order amount
    const numbers = ocrText.match(/[\d,،.]+/g) || [];
    for (const numStr of numbers) {
      const clean = numStr.replace(/[,،]/g, "");
      const num = parseFloat(clean);
      if (!isNaN(num) && Math.abs(num - orderAmount) < orderAmount * 0.05) {
        analysis.foundAmount = true;
        analysis.detectedAmount = num;
        break;
      }
    }

    // 2. Check for account details in OCR text
    for (const account of expectedAccounts) {
      if (account.accountNumber) {
        const accountNum = account.accountNumber.replace(/[\s-]/g, "");
        if (ocrText.replace(/[\s-]/g, "").includes(accountNum)) {
          analysis.foundAccountNumber = true;
        }
      }
      if (account.accountName) {
        const nameParts = account.accountName.toLowerCase().split(" ");
        const matchedParts = nameParts.filter((part: string) =>
          ocrText.toLowerCase().includes(part) && part.length > 2
        );
        if (matchedParts.length >= Math.ceil(nameParts.length * 0.5)) {
          analysis.foundAccountName = true;
        }
      }
    }

    // Also check legacy single account fields
    if (!analysis.foundAccountNumber && settings?.bankAccountNumber) {
      const num = settings.bankAccountNumber.replace(/[\s-]/g, "");
      if (ocrText.replace(/[\s-]/g, "").includes(num)) {
        analysis.foundAccountNumber = true;
      }
    }
    if (!analysis.foundAccountName && settings?.bankAccountName) {
      const nameParts = settings.bankAccountName.toLowerCase().split(" ");
      const matched = nameParts.filter((p: string) =>
        ocrText.toLowerCase().includes(p) && p.length > 2
      );
      if (matched.length >= Math.ceil(nameParts.length * 0.5)) {
        analysis.foundAccountName = true;
      }
    }

    // 3. Calculate confidence score
    let score = 0;
    if (analysis.foundAmount) { score += 50; }
    if (analysis.foundAccountName) { score += 25; }
    if (analysis.foundAccountNumber) { score += 25; }
    analysis.confidence = score;

    // 4. Generate flags
    if (!analysis.foundAmount) {
      analysis.flags.push(`⚠️ المبلغ المطلوب (${orderAmount.toLocaleString()} ج.س) لم يُعثر عليه في الإيصال`);
    }
    if (!analysis.foundAccountName) {
      analysis.flags.push("⚠️ اسم الحساب المستفيد لم يتطابق مع بيانات المنصة");
    }
    if (!analysis.foundAccountNumber) {
      analysis.flags.push("⚠️ رقم الحساب لم يُعثر عليه في الإيصال");
    }
    if (ocrText.length < 20) {
      analysis.flags.push("⚠️ لم يتم استخراج نص كافٍ من الصورة — قد تكون الصورة غير واضحة");
    }
    if (score >= 75) {
      analysis.flags.unshift("✅ الإيصال يبدو صحيحاً — يُنصح بالتحقق اليدوي للتأكيد النهائي");
    }

    // Auto-update paymentVerified if high confidence
    if (score >= 75) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentNote: `تحقق AI: ${score}% — ${analysis.flags.join(" | ")}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      confidence: score,
      analysis,
      suggestion: score >= 75 ? "APPROVE" : score >= 40 ? "REVIEW" : "REJECT",
      orderAmount,
      ocrText: ocrText.substring(0, 500), // Limit response size
    });

  } catch (error: any) {
    console.error("Verify Payment Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/verify-payment - Manual approve/reject payment
export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();

  try {
    const { orderId, verified, note } = await req.json();
    if (!orderId) return NextResponse.json({ error: "orderId مطلوب" }, { status: 400 });

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentVerified: verified,
        paymentNote: note || (verified ? "تم التحقق يدوياً" : "تم الرفض يدوياً"),
        ...(verified ? { status: "CONFIRMED" } : {}),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
