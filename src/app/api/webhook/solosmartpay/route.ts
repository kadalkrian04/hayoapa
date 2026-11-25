import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/solosmartpay";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature =
      req.headers.get("x-solosmartpay-signature") ||
      req.headers.get("x-signature") ||
      req.headers.get("signature");

    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event || payload.type;
    const data = payload.data || payload;

    // Respon cepat untuk tombol Test Webhook
    if (eventType === "webhook.test") {
      return NextResponse.json({ ok: true, message: "Webhook connected" });
    }

    const reference = data.reference;
    const paidAmount = Number(data.amount || 0);

    if (!reference) {
      return NextResponse.json({ error: "Reference tidak ditemukan" }, { status: 400 });
    }

    const regs = await sql`
      SELECT r.*, e.code AS event_code
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.ref_id = ${reference}
    `;

    if (regs.length === 0) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    const reg = regs[0];

    if (eventType === "payment.paid" || data.status === "paid" || data.status === "PAID") {
      if (reg.payment_status === "PAID") {
        return NextResponse.json({ ok: true, message: "Sudah diproses sebelumnya" });
      }

      // Cocokkan nominal pembayaran
      if (paidAmount > 0 && paidAmount < reg.amount) {
        return NextResponse.json({ error: "Nominal pembayaran tidak sesuai" }, { status: 400 });
      }

      // Generate Nomor Registrasi Event unik per golongan
      const countRes = await sql`
        SELECT COUNT(*)::int AS total
        FROM registrations
        WHERE event_id = ${reg.event_id} AND payment_status = 'PAID'
      `;
      const nextSeq = String((countRes[0]?.total || 0) + 1).padStart(4, "0");
      const year = new Date().getFullYear();
      const registrationNumber = `BDM-${year}-${reg.event_code}-${nextSeq}`;

      await sql`
        UPDATE registrations
        SET
          payment_status = 'PAID',
          registration_number = ${registrationNumber},
          paid_at = CURRENT_TIMESTAMP
        WHERE id = ${reg.id}
      `;

      return NextResponse.json({
        ok: true,
        registration_number: registrationNumber,
      });
    }

    if (eventType === "payment.expired" || eventType === "payment.failed") {
      const nextStatus = eventType === "payment.expired" ? "EXPIRED" : "FAILED";
      await sql`
        UPDATE registrations
        SET payment_status = ${nextStatus}
        WHERE id = ${reg.id} AND payment_status = 'PENDING'
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Solosmartpay Webhook Error:", err);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}