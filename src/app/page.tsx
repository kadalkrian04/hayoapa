import { Suspense } from "react";
import Link from "next/link";
import { sql } from "@/lib/db";
import { Trophy, UserPlus, LogIn, CheckCircle2, CreditCard, BadgeCheck } from "lucide-react";

interface EventItem {
  id: number;
  code: string;
  name: string;
  category_type: string;
  gender_req: string;
  price: number;
  quota: number;
  registered_count: number;
}

async function EventListTable() {
  const events = (await sql`
    SELECT e.*,
      (SELECT COUNT(*)::int FROM registrations r WHERE r.event_id = e.id AND r.payment_status = 'PAID') AS registered_count
    FROM events e
    WHERE e.is_active = TRUE
    ORDER BY e.id ASC
  `) as EventItem[];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase text-slate-600">
          <tr>
            <th className="px-4 py-3.5">Kode</th>
            <th className="px-4 py-3.5">Golongan Pertandingan</th>
            <th className="px-4 py-3.5">Tipe</th>
            <th className="px-4 py-3.5">Biaya Pendaftaran</th>
            <th className="px-4 py-3.5">Peserta Lunas</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {events.map((ev) => (
            <tr key={ev.id} className="hover:bg-blue-50/40">
              <td className="px-4 py-3.5 font-mono font-bold text-blue-700">
                {ev.code}
              </td>
              <td className="px-4 py-3.5 font-semibold text-slate-900">
                {ev.name}
              </td>
              <td className="px-4 py-3.5">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    ev.category_type === "Ganda"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {ev.category_type}
                </span>
              </td>
              <td className="px-4 py-3.5 font-bold text-slate-900">
                Rp {ev.price.toLocaleString("id-ID")}
              </td>
              <td className="px-4 py-3.5 text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {ev.registered_count} / {ev.quota}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <Link href="/" className="flex items-center gap-2 font-bold text-blue-700 text-lg">
            <Trophy className="h-6 w-6 text-blue-600" />
            <span>Badminton Open</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4" />
              Daftar Atlet
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center md:py-20">
          <span className="inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-wider">
            Pendaftaran Online Resmi
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-5xl">
            Kejuaraan Badminton Terbuka
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-blue-100 md:text-base">
            Buat akun atlet, pilih golongan pertandingan, selesaikan pembayaran secara otomatis, dan dapatkan Nomor Registrasi Event langsung di dashboard Anda.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow-sm hover:bg-blue-50"
            >
              Buat Akun Atlet Sekarang
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20"
            >
              Masuk Dashboard Peserta
            </Link>
          </div>
        </div>
      </section>

      {/* Alur Pendaftaran */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <UserPlus className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-bold text-slate-900">1. Buat Akun & Data Diri</h3>
            <p className="mt-1 text-sm text-slate-600">
              Lengkapi biodata atlet, NIK, klub, dan upload foto diri resmi.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-bold text-slate-900">2. Pilih Golongan & Bayar</h3>
            <p className="mt-1 text-sm text-slate-600">
              Pilih kategori Tunggal/Ganda lalu bayar via QRIS, VA, atau E-Wallet.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-bold text-slate-900">3. Terdaftar & Nomor Event</h3>
            <p className="mt-1 text-sm text-slate-600">
              Setelah lunas, nomor registrasi & riwayat pembayaran otomatis aktif.
            </p>
          </div>
        </div>
      </section>

      {/* Daftar 10 Golongan Pertandingan */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
            Daftar Golongan Pertandingan
          </h2>
          <p className="text-sm text-slate-600">
            Pilih golongan yang sesuai saat sudah masuk ke akun atlet.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Suspense
            fallback={
              <div className="p-8 text-center text-sm text-slate-500">
                Memuat daftar golongan pertandingan...
              </div>
            }
          >
            <EventListTable />
          </Suspense>
        </div>
      </section>
    </div>
  );
}