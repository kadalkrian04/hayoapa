import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
    }

    const users = await sql`
      SELECT id, full_name, email, password_hash FROM users WHERE email = ${email.toLowerCase()}
    `;
    if (users.length === 0) {
      return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
    }

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
    }

    await createSession({
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
    });

    return NextResponse.json({ message: "Login berhasil" });
  } catch (err) {
    console.error("Login Error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}