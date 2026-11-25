import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { createSolosmartpayCheckout } from "@/lib/solosmartpay";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
  }

  const rows = await sql`
    SELECT r.*, e.name AS event_name, e.code AS event_code, e.category_type
    FROM registrations r
    JOIN events e ON r.event_id = e.id
    WHERE r.user_id = ${session.userId}
    ORDER BY r.created_at DESC
  `;

  return NextResponse.json({ registrations: rows });
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const { event_id, partner_name, partner_club } = await req.json();
    if (!event_id) {
      return NextResponse.json({ error: "Golongan pertandingan wajib dipilih." }, { status: 400 });
    }

    const [users, events] = await Promise.all([
      sql`SELECT * FROM users WHERE id = ${session.userId}`,
      sql`SELECT * FROM events WHERE id = ${event_id} AND is_active = TRUE`,
    ]);

    if (users.length === 0 || events.length === 0) {
      return NextResponse.json({ error: "Data peserta atau event tidak valid." }, { status: 404 });
    }

    const user = users[0];
    const event = events[0];

    if (event.category_type === "Ganda" && !partner_name?.trim()) {
      return NextResponse.json(
        { error: "Untuk kategori Ganda, nama pasangan wajib diisi." },
        { status: 400 }
      );
    }

    const alreadyPaid = await sql`
      SELECT id FROM registrations
      WHERE user_id = ${user.id} AND event_id = ${event.id} AND payment_status = 'PAID'
    `;
    if (alreadyPaid.length > 0) {
      return NextResponse.json(
        { error: "Anda sudah terdaftar dan lunas pada golongan ini." },
        { status: 409 }
      );
    }

    // Maks 50 karakter sesuai batas field reference Solosmartpay
    const refId = `BDM-${event.code}-${Date.now()}-${user.id}`.slice(0, 50);
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");

    const checkout = await createSolosmartpayCheckout({
      reference: refId,
      amount: event.price,
      redirectUrl: `${appUrl}/dashboard?payment=returned&ref=${refId}`,
    });

    const inserted = await sql`
      INSERT INTO registrations (
        user_id, event_id, partner_name, partner_club,
        ref_id, amount, payment_status, payment_method, qr_url, pay_url
      ) VALUES (
        ${user.id}, ${event.id}, ${partner_name || null}, ${partner_club || null},
        ${refId}, ${event.price}, 'PENDING', 'SOLOSMARTPAY', ${checkout.qrUrl}, ${checkout.checkoutUrl}
      )
      RETURNING *
    `;

    return NextResponse.json(
      {
        message: "Tagihan pembayaran berhasil dibuat.",
        registration: inserted[0],
        checkout_url: checkout.checkoutUrl,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Registration POST Error:", err);
    const message = err instanceof Error ? err.message : "Gagal membuat pendaftaran.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}