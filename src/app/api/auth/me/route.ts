import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await sql`
    SELECT id, full_name, email, phone, nik, birth_date, gender, club_name, address, photo_base64, created_at
    FROM users WHERE id = ${session.userId}
  `;

  if (users.length === 0) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ user: users[0] });
}