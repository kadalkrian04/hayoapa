import { NextResponse, connection } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  await connection();
  try {
    const events = await sql`
      SELECT e.*,
        (SELECT COUNT(*)::int FROM registrations r WHERE r.event_id = e.id AND r.payment_status = 'PAID') AS registered_count
      FROM events e
      WHERE e.is_active = TRUE
      ORDER BY e.id ASC
    `;
    return NextResponse.json({ events });
  } catch (err) {
    console.error("Events Error:", err);
    return NextResponse.json({ error: "Gagal memuat daftar event." }, { status: 500 });
  }
}