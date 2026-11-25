import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      full_name,
      email,
      password,
      phone,
      nik,
      birth_date,
      gender,
      club_name,
      address,
      photo_base64,
    } = body;

    if (
      !full_name || !email || !password || !phone || !nik ||
      !birth_date || !gender || !address || !photo_base64
    ) {
      return NextResponse.json(
        { error: "Semua data diri atlet dan foto diri wajib dilengkapi." },
        { status: 400 }
      );
    }

    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`;
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan login." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const inserted = await sql`
      INSERT INTO users (
        full_name, email, password_hash, phone, nik,
        birth_date, gender, club_name, address, photo_base64
      ) VALUES (
        ${full_name}, ${email.toLowerCase()}, ${passwordHash}, ${phone}, ${nik},
        ${birth_date}, ${gender}, ${club_name || "Mandiri"}, ${address}, ${photo_base64}
      )
      RETURNING id, full_name, email
    `;

    const user = inserted[0];
    await createSession({
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
    });

    return NextResponse.json({ message: "Akun berhasil dibuat", user }, { status: 201 });
  } catch (err) {
    console.error("Register Error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}