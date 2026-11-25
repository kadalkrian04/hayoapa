import crypto from "crypto";

export interface CreateSolosmartpayParams {
  reference: string;
  amount: number;
  redirectUrl: string;
}

export async function createSolosmartpayCheckout(params: CreateSolosmartpayParams) {
  const baseUrl = (process.env.SOLOSMARTPAY_API_URL || "https://api.solosmartpay.com").replace(/\/$/, "");
  const apiToken = process.env.SOLOSMARTPAY_API_TOKEN;

  if (!apiToken) {
    throw new Error("SOLOSMARTPAY_API_TOKEN belum diisi di Environment Variables Vercel.");
  }

  const response = await fetch(`${baseUrl}/v1/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
      Accept: "application/json",
    },
    body: JSON.stringify({
      amount: params.amount,
      method: "all",
      reference: params.reference,
      redirect_url: params.redirectUrl,
    }),
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || result.error || "Gagal membuat tagihan di Solosmartpay.");
  }

  // Ambil checkout_url & qr_url (menyesuaikan struktur respons data Solosmartpay)
  const data = result.data || result;
  return {
    checkoutUrl: data.checkout_url || data.pay_url || "",
    qrUrl: data.qr_url || data.qr_link || "",
    paymentId: data.id || "",
  };
}

export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.SOLOSMARTPAY_WEBHOOK_SECRET;
  if (!secret) return true; // Lewati jika secret belum dipasang saat testing awal
  if (!signatureHeader) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const cleanSig = signatureHeader.replace(/^sha256=/, "").trim();
  return cleanSig === expected;
}