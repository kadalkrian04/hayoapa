"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  RefreshCw,
  Loader2,
  BadgeCheck,
  Sparkles,
  User,
} from "lucide-react";

interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  nik: string;
  birth_date: string;
  gender: string;
  club_name: string;
  address: string;
  photo_base64: string;
}

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

interface RegistrationItem {
  id: number;
  event_id: number;
  event_name: string;
  event_code: string;
  category_type: string;
  partner_name: string | null;
  partner_club: string | null;
  ref_id: string;
  registration_number: string | null;
  amount: number;
  payment_status: "PENDING" | "PAID" | "EXPIRED" | "FAILED";
  pay_url: string | null;
  paid_at: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Modal pilih event
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [partnerName, setPartnerName] = useState("");
  const [partnerClub, setPartnerClub] = useState("");

  const loadData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      try {
        const [meRes, evRes, regRes] = await Promise.all([
          fetch("/api/auth/me", { cache: "no-store" }),
          fetch("/api/events", { cache: "no-store" }),
          fetch("/api/registrations", { cache: "no-store" }),
        ]);

        if (meRes.status === 401) {
          router.push("/login");
          return;
        }

        const meData = await meRes.json();
        const evData = await evRes.json();
        const regData = await regRes.json();

        setUser(meData.user || null);
        setEvents(evData.events || []);
        setRegistrations(regData.registrations || []);
      } catch {
        setError("Gagal memuat data dashboard.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleRegisterEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: selectedEvent.id,
          partner_name: selectedEvent.category_type === "Ganda" ? partnerName : null,
          partner_club: selectedEvent.category_type === "Ganda" ? partnerClub : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal membuat tagihan pendaftaran.");
        setSubmitting(false);
        return;
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setSelectedEvent(null);
        setPartnerName("");
        setPartnerClub("");
        await loadData();
        setSubmitting(false);
      }
    } catch {
      setError("Terjadi gangguan saat menghubungi payment gateway.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-b from-emerald-700 via-emerald-600 to-lime-500 text-white">
        <Loader2 className="h-9 w-9 animate-spin text-yellow-300" />
        <p className="text-sm font-semibold">Memuat Dashboard Atlet...</p>
      </div>
    );
  }

  const paidRegistrations = registrations.filter((r) => r.payment_status === "PAID");

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Banner Gradien Hijau-Kuning PBSI */}
      <div className="relative overflow-hidden bg-gradient-to-b from-emerald-700 via-emerald-600 to-lime-500 pb-20 pt-6 text-white">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-yellow-300/25 blur-3xl" />

        {/* Floating Pill Navbar */}
        <header className="relative z-20 mx-auto max-w-5xl px-4">
          <nav className="flex items-center justify-between rounded-full border border-white/15 bg-emerald-950/85 px-3 py-2 shadow-xl backdrop-blur-md">
            <Link href="/" className="flex items-center gap-2.5 pl-2">
              <img
                src="/logo-pbsi.png"
                alt="Logo PBSI"
                className="h-8 w-8 rounded-full bg-white p-0.5 object-contain"
              />
              <span className="text-sm font-bold tracking-tight text-white">
                Dashboard Atlet
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-50 transition hover:bg-white/20"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh Status</span>
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400 px-3.5 py-1.5 text-xs font-bold text-emerald-950 transition hover:bg-yellow-300"
              >
                <LogOut className="h-3.5 w-3.5" />
                Keluar
              </button>
            </div>
          </nav>
        </header>

        {/* Profil Atlet Ringkas di Header */}
        {user && (
          <div className="relative z-10 mx-auto mt-8 max-w-5xl px-4">
            <div className="flex flex-col items-start gap-4 rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-md sm:flex-row sm:items-center">
              <img
                src={user.photo_base64}
                alt={user.full_name}
                className="h-20 w-20 rounded-full border-4 border-yellow-400 bg-white object-cover shadow-lg"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-extrabold text-white">{user.full_name}</h1>
                  <span className="rounded-full bg-yellow-400 px-2.5 py-0.5 text-xs font-extrabold text-emerald-950">
                    {user.gender}
                  </span>
                </div>
                <p className="mt-1 text-sm text-emerald-50">
                  NIK: <span className="font-mono font-semibold">{user.nik}</span> • Klub:{" "}
                  <span className="font-semibold">{user.club_name || "Mandiri"}</span>
                </p>
                <p className="text-xs text-emerald-100/90">
                  {user.email} • {user.phone}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-950/50 px-4 py-2.5 text-xs">
                <User className="h-4 w-4 text-yellow-300" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-emerald-200">
                    Event Lunas
                  </p>
                  <p className="text-base font-extrabold text-yellow-300">
                    {paidRegistrations.length} Golongan
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Konten Utama */}
      <main className="relative z-10 mx-auto -mt-10 max-w-5xl space-y-8 px-4">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {/* Kartu Nomor Registrasi Event (Khusus yang sudah LUNAS) */}
        {paidRegistrations.length > 0 && (
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
              <BadgeCheck className="h-5 w-5 text-emerald-600" />
              Kartu Nomor Registrasi Event Anda
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {paidRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="overflow-hidden rounded-3xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 via-white to-yellow-50 p-5 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-0.5 text-[11px] font-bold text-white">
                      <Sparkles className="h-3 w-3 text-yellow-300" /> TERDAFTAR RESMI
                    </span>
                    <span className="rounded-lg bg-emerald-100 px-2.5 py-0.5 font-mono text-xs font-extrabold text-emerald-800">
                      {reg.event_code}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-extrabold text-slate-900">
                    {reg.event_name}
                  </h3>
                  {reg.partner_name && (
                    <p className="mt-0.5 text-sm text-slate-700">
                      Pasangan: <span className="font-bold">{reg.partner_name}</span>{" "}
                      {reg.partner_club ? `(${reg.partner_club})` : ""}
                    </p>
                  )}
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-white p-3.5 shadow-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Nomor Registrasi Event
                    </p>
                    <p className="mt-0.5 font-mono text-xl font-black text-emerald-700">
                      {reg.registration_number}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pilih Golongan Pertandingan */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Pendaftaran Pertandingan
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              Pilih Golongan Pertandingan
            </h2>
            <p className="text-xs text-slate-500">
              Pilih golongan yang ingin diikuti lalu selesaikan pembayaran via Solosmartpay.
            </p>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => {
              const isPaid = registrations.some(
                (r) => r.event_id === ev.id && r.payment_status === "PAID"
              );
              return (
                <div
                  key={ev.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/30"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-emerald-100 px-2.5 py-0.5 font-mono text-xs font-extrabold text-emerald-800">
                        {ev.code}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          ev.category_type === "Ganda"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {ev.category_type}
                      </span>
                    </div>
                    <h3 className="mt-2.5 font-bold text-slate-900">{ev.name}</h3>
                    <p className="mt-1 text-base font-extrabold text-emerald-700">
                      Rp {ev.price.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="mt-4">
                    {isPaid ? (
                      <div className="flex w-full items-center justify-center gap-1.5 rounded-full bg-emerald-100 py-2 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="h-4 w-4" /> Sudah Terdaftar
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedEvent(ev);
                          setPartnerName("");
                          setPartnerClub("");
                          setError("");
                        }}
                        className="w-full rounded-full bg-emerald-600 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
                      >
                        Daftar Golongan Ini
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Riwayat Pembayaran */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 md:px-6">
            <h2 className="text-lg font-extrabold text-slate-900">
              Riwayat Pembayaran
            </h2>
            <p className="text-xs text-slate-500">
              Semua status transaksi pendaftaran event Anda tersimpan otomatis di sini.
            </p>
          </div>

          {registrations.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Belum ada riwayat pendaftaran atau pembayaran.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-emerald-100 bg-emerald-50/70 text-xs font-bold uppercase tracking-wider text-emerald-900">
                  <tr>
                    <th className="px-5 py-3.5">Tanggal</th>
                    <th className="px-5 py-3.5">Golongan</th>
                    <th className="px-5 py-3.5">Nominal</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">No. Registrasi / Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5 text-xs text-slate-600">
                        {new Date(reg.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{reg.event_name}</div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {reg.ref_id}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        Rp {reg.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="px-5 py-3.5">
                        {reg.payment_status === "PAID" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" /> LUNAS
                          </span>
                        )}
                        {reg.payment_status === "PENDING" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                            <Clock className="h-3.5 w-3.5" /> MENUNGGU BAYAR
                          </span>
                        )}
                        {(reg.payment_status === "EXPIRED" ||
                          reg.payment_status === "FAILED") && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                            <XCircle className="h-3.5 w-3.5" /> {reg.payment_status}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {reg.payment_status === "PAID" ? (
                          <span className="font-mono text-xs font-black text-emerald-700">
                            {reg.registration_number}
                          </span>
                        ) : reg.payment_status === "PENDING" && reg.pay_url ? (
                          <a
                            href={reg.pay_url}
                            className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400 px-3.5 py-1.5 text-xs font-extrabold text-emerald-950 shadow-xs transition hover:bg-yellow-300"
                          >
                            Bayar Sekarang <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Modal Konfirmasi Pendaftaran & Pembayaran */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <img
                src="/logo-pbsi.png"
                alt="PBSI"
                className="h-10 w-10 object-contain"
              />
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Konfirmasi Pendaftaran
                </h3>
                <p className="text-xs text-slate-500">
                  Pembayaran otomatis via Solosmartpay
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-semibold text-emerald-800">
                Golongan Dipilih ({selectedEvent.code})
              </p>
              <p className="text-base font-extrabold text-slate-900">
                {selectedEvent.name}
              </p>
              <p className="mt-1 text-lg font-black text-emerald-700">
                Rp {selectedEvent.price.toLocaleString("id-ID")}
              </p>
            </div>

            <form onSubmit={handleRegisterEvent} className="mt-4 space-y-3">
              {selectedEvent.category_type === "Ganda" && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-emerald-950">
                      Nama Lengkap Pasangan (Wajib untuk Ganda) *
                    </label>
                    <input
                      type="text"
                      required
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="Masukkan nama partner ganda"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-emerald-950">
                      Klub Pasangan (Opsional)
                    </label>
                    <input
                      type="text"
                      value={partnerClub}
                      onChange={(e) => setPartnerClub(e.target.value)}
                      placeholder="Contoh: PB Djarum / Mandiri"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 rounded-full border border-slate-300 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-yellow-400 py-2.5 text-sm font-extrabold text-emerald-950 shadow-sm transition hover:bg-yellow-300 disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  {submitting ? "Memproses..." : "Lanjut Bayar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}