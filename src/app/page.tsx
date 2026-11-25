import { Suspense } from "react";
import Link from "next/link";
import { sql } from "@/lib/db";
import {
  UserPlus,
  LogIn,
  CheckCircle2,
  CreditCard,
  BadgeCheck,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Mail,
  MessageCircle,
} from "lucide-react";

interface EventItem {
  id: number;
  code: string;
  name: string;
  category_type: string;
  gender_req: string;
  price: number;
}

async function EventListTable() {
  const events = (await sql`
    SELECT id, code, name, category_type, gender_req, price
    FROM events
    WHERE is_active = TRUE
    ORDER BY id ASC
  `) as EventItem[];

  return (
    <div className="max-h-[460px] overflow-y-auto overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 z-10 border-b border-emerald-100 bg-emerald-50 text-xs font-bold uppercase tracking-wider text-emerald-900 shadow-xs">
          <tr>
            <th className="px-5 py-4">No.</th>
            <th className="px-5 py-4">Kode</th>
            <th className="px-5 py-4">Golongan Pertandingan</th>
            <th className="px-5 py-4">Kategori</th>
            <th className="px-5 py-4">Biaya Pendaftaran</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {events.map((ev, index) => (
            <tr key={ev.id} className="transition hover:bg-emerald-50/40">
              <td className="px-5 py-3.5 text-xs font-semibold text-slate-500">
                {index + 1}
              </td>
              <td className="px-5 py-3.5">
                <span className="inline-block rounded-lg bg-emerald-100 px-2.5 py-1 font-mono text-xs font-extrabold text-emerald-800">
                  {ev.code}
                </span>
              </td>
              <td className="px-5 py-3.5 font-semibold text-slate-900">
                {ev.name}
              </td>
              <td className="px-5 py-3.5">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    ev.category_type === "Ganda"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {ev.category_type}
                </span>
              </td>
              <td className="px-5 py-3.5 font-bold text-slate-900">
                Rp {ev.price.toLocaleString("id-ID")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function HomePage() {
  // Ganti nomor WhatsApp Admin di bawah ini (gunakan format 628xxx tanpa + atau 0 di depan)
  const waAdminNumber = "6281234567890";
  const waMessage = encodeURIComponent(
    "Halo Admin PBSI Jatim, saya ingin bertanya terkait pendaftaran event badminton."
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section dengan Gradien Hijau & Kuning PBSI */}
      <div className="relative overflow-hidden bg-gradient-to-b from-emerald-700 via-emerald-600 to-lime-500 pb-24 pt-6 text-white">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-yellow-300/25 blur-3xl" />

        {/* Floating Pill Navbar */}
        <header className="relative z-20 mx-auto max-w-4xl px-4">
          <nav className="flex items-center justify-between rounded-full border border-white/15 bg-emerald-950/85 px-3 py-2 shadow-xl backdrop-blur-md">
            <Link href="/" className="flex items-center gap-2.5 pl-2">
              <img
                src="/logo.png"
                alt="Logo PBSI"
                className="h-8 w-8 rounded-full bg-white p-0.5 object-contain"
              />
              <span className="text-sm font-bold tracking-tight text-white">
                PBSI JATIM Event
              </span>
            </Link>

            <div className="hidden items-center gap-6 text-xs font-medium text-emerald-100 md:flex">
              <a href="#alur" className="transition hover:text-yellow-300">
                Alur Daftar
              </a>
              <a href="#golongan" className="transition hover:text-yellow-300">
                Golongan
              </a>
              <a href="#kontak" className="transition hover:text-yellow-300">
                Kontak
              </a>
              <Link href="/dashboard" className="transition hover:text-yellow-300">
                Dashboard
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-emerald-100 transition hover:bg-white/10 hover:text-white"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-yellow-400 px-4 py-1.5 text-xs font-bold text-emerald-950 shadow-sm transition hover:bg-yellow-300"
              >
                Daftar Atlet
              </Link>
            </div>
          </nav>
        </header>

        {/* Konten Tengah Hero */}
        <section className="relative z-10 mx-auto mt-12 max-w-4xl px-4 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-300/40 bg-white/95 p-2 shadow-lg">
            <img
              src="/logo.png"
              alt="PBSI"
              className="h-full w-full object-contain"
            />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-6xl">
            Kejuaraan Badminton,{" "}
            <span className="border-b-2 border-dotted border-yellow-300 text-yellow-300">
              siap
            </span>
            <br />
            untuk diikuti.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-emerald-50 md:text-base">
            Portal pendaftaran resmi atlet badminton dengan sistem verifikasi
            pembayaran otomatis, pilihan lengkap 29 golongan pertandingan, dan
            penerbitan Nomor Registrasi Event instan.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-6 py-3 text-sm font-bold text-emerald-950 shadow-lg transition hover:bg-yellow-300"
            >
              <UserPlus className="h-4 w-4" />
              Buat Akun Atlet
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-950/90 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-950"
            >
              <LogIn className="h-4 w-4 text-yellow-300" />
              Panel Login Peserta
            </Link>
          </div>

          <p className="mt-4 text-xs font-medium text-emerald-100/90">
            Aktif instan • Pembayaran QRIS & VA Otomatis • Nomor Registrasi Resmi
          </p>
        </section>

        {/* Preview Window Mockup */}
        <div className="relative z-10 mx-auto mt-12 max-w-4xl px-4">
          <div className="overflow-hidden rounded-3xl border border-white/30 bg-white text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="rounded-full border border-slate-200 bg-white px-4 py-1 text-[11px] font-medium text-slate-500 shadow-xs">
                re-event-pbsi-jatim.vercel.app/dashboard
              </div>
              <Link
                href="/register"
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Mulai <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-yellow-50 p-6 text-center">
                <img
                  src="/logo.png"
                  alt="Logo PBSI"
                  className="h-14 w-14 object-contain"
                />
                <span className="mt-3 rounded-full bg-emerald-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Kartu Peserta Resmi
                </span>
                <h3 className="mt-3 text-lg font-extrabold text-slate-900">
                  Tunggal Pemula Putra
                </h3>
                <p className="mt-1 font-mono text-sm font-black text-emerald-700">
                  BDM-2026-TPA-0001
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-amber-800">
                  <Sparkles className="h-3.5 w-3.5" /> Status Pembayaran: LUNAS
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Keunggulan Sistem Pendaftaran
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                    <span className="block h-2.5 w-2.5 rounded-full bg-emerald-600" />
                    <p className="mt-2 text-xs font-bold text-slate-900">29 Golongan</p>
                    <p className="text-[11px] text-slate-500">Tunggal, Ganda & Veteran</p>
                  </div>
                  <div className="rounded-xl border border-yellow-200 bg-yellow-50/60 p-3">
                    <span className="block h-2.5 w-2.5 rounded-full bg-yellow-500" />
                    <p className="mt-2 text-xs font-bold text-slate-900">Auto Verifikasi</p>
                    <p className="text-[11px] text-slate-500">Solosmartpay</p>
                  </div>
                </div>
                <ul className="space-y-2 text-xs font-medium text-slate-600">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Data atlet & foto diri tersimpan aman di akun
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Nomor registrasi event terbit otomatis setelah lunas
                  </li>
                  <li className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    Riwayat pembayaran lengkap di dashboard peserta
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alur Pendaftaran */}
      <section id="alur" className="mx-auto max-w-5xl px-4 py-14">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-extrabold text-slate-900">
            Alur Pendaftaran Event
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Tiga langkah mudah untuk resmi terdaftar di kejuaraan.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <UserPlus className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-bold text-slate-900">1. Buat Akun Atlet</h3>
            <p className="mt-1.5 text-sm text-slate-600">
              Isi biodata lengkap, NIK, asal klub/PB, dan upload foto diri resmi.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 text-amber-700">
              <CreditCard className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-bold text-slate-900">2. Pilih Golongan & Bayar</h3>
            <p className="mt-1.5 text-sm text-slate-600">
              Pilih golongan Tunggal/Ganda dan bayar secara instan lewat payment gateway.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-bold text-slate-900">3. Nomor Registrasi Aktif</h3>
            <p className="mt-1.5 text-sm text-slate-600">
              Setelah lunas, nomor registrasi & riwayat pembayaran langsung muncul di akun.
            </p>
          </div>
        </div>
      </section>

      {/* Daftar 29 Golongan Pertandingan (Scrollable) */}
      <section id="golongan" className="mx-auto max-w-5xl px-4 pb-20">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Kategori Resmi
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Daftar Golongan Pertandingan
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Geser ke atas/bawah di dalam tabel untuk melihat seluruh 29 kategori.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
          >
            Daftar Sekarang <ArrowRight className="h-3.5 w-3.5" />
          </Link>
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

      {/* Footer Kontak Resmi PBSI Jatim */}
      <footer id="kontak" className="border-t border-emerald-800 bg-emerald-950 text-emerald-100">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="Logo PBSI"
                  className="h-11 w-11 rounded-full bg-white p-1 object-contain"
                />
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    PBSI Jawa Timur
                  </h3>
                  <p className="text-xs text-emerald-300">
                    Portal Resmi Pendaftaran Event Badminton
                  </p>
                </div>
              </div>
              <p className="max-w-md text-xs leading-relaxed text-emerald-200/80">
                Butuh bantuan terkait pendaftaran akun atlet, pemilihan golongan,
                atau kendala pembayaran? Hubungi panitia resmi kami melalui kontak
                di samping.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              <a
                href={`https://wa.me/${waAdminNumber}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-yellow-400 px-5 py-2.5 text-xs font-extrabold text-emerald-950 shadow-sm transition hover:bg-yellow-300"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Admin
              </a>
              <a
                href="mailto:sekum@pbsijatim.com"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-700 bg-emerald-900/70 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800"
              >
                <Mail className="h-4 w-4 text-yellow-300" />
                sekum@pbsijatim.com
              </a>
            </div>
          </div>

          <div className="mt-8 border-t border-emerald-900 pt-6 text-center text-xs text-emerald-400/80">
            © 2026 PBSI Jawa Timur. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}