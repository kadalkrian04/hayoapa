"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  LogOut,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  RefreshCw,
  Loader2,
  BadgeCheck,
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Modal pilih event
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [partnerName, setPartnerName] = useState("");
  const [partnerClub, setPartnerClub] = useState("");

  const loadData = useCallback(async () => {
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
    }
  }, [router]);

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

      // Langsung arahkan ke halaman checkout Solosmartpay
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const paidRegistrations = registrations.filter((r) => r.payment_status === "PAID");

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2 font-bold text-blue-700">
            <Trophy className="h-5 w-5 text-blue-600" />
            <span>Dashboard Atlet</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh Status
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
            >
              <LogOut className="h-3.5 w-3.5" /> Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 pt-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Profil Atlet */}
        {user && (
          <section className="flex flex-col items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
            <img
              src={user.photo_base64}
              alt={user.full_name}
              className="h-20 w-20 rounded-full border-2 border-blue-500 object-cover"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">{user.full_name}</h1>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                  {user.gender}
                </span>
              </div>
              <p className="text-sm text-slate-600">
                NIK: {user.nik} • Klub: {user.club_name || "Mandiri"}
              </p>
              <p className="text-xs text-slate-500">
                {user.email} • {user.phone}
              </p>
            </div>
          </section>
        )}

        {/* Kartu Nomor Registrasi Event (Khusus yang sudah LUNAS) */}
        {paidRegistrations.length > 0 && (
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <BadgeCheck className="h-5 w-5 text-emerald-600" />
              Kartu Nomor Registrasi Event Anda
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {paidRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="rounded-2xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                      TERDAFTAR RESMI
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {reg.event_code}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-extrabold text-slate-900">
                    {reg.event_name}
                  </h3>
                  {reg.partner_name && (
                    <p className="text-sm text-slate-700">
                      Pasangan: <span className="font-semibold">{reg.partner_name}</span>{" "}
                      {reg.partner_club ? `(${reg.partner_club})` : ""}
                    </p>
                  )}
                  <div className="mt-4 rounded-xl bg-white p-3 border border-emerald-200">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Nomor Registrasi Event
                    </p>
                    <p className="font-mono text-xl font-black text-emerald-700">
                      {reg.registration_number}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pilih Golongan Pertandingan */}
        <section className="space-y-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Pilih Golongan Pertandingan
            </h2>
            <p className="text-xs text-slate-500">
              Klik daftar pada golongan yang ingin diikuti untuk melakukan pembayaran.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => {
              const isPaid = registrations.some(
                (r) => r.event_id === ev.id && r.payment_status === "PAID"
              );
              return (
                <div
                  key={ev.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-700">
                        {ev.code}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          ev.category_type === "Ganda"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {ev.category_type}
                      </span>
                    </div>
                    <h3 className="mt-2 font-bold text-slate-900">{ev.name}</h3>
                    <p className="mt-1 text-base font-extrabold text-blue-600">
                      Rp {ev.price.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="mt-4">
                    {isPaid ? (
                      <div className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2 text-xs font-bold text-emerald-700">
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
                        className="w-full rounded-xl bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700"
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
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">Riwayat Pembayaran</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {registrations.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Belum ada riwayat pendaftaran atau pembayaran.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Golongan</th>
                      <th className="px-4 py-3">Nominal</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">No. Registrasi / Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {registrations.map((reg) => (
                      <tr key={reg.id}>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {new Date(reg.created_at).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{reg.event_name}</div>
                          <div className="font-mono text-[11px] text-slate-500">{reg.ref_id}</div>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          Rp {reg.amount.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3">
                          {reg.payment_status === "PAID" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" /> LUNAS
                            </span>
                          )}
                          {reg.payment_status === "PENDING" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                              <Clock className="h-3.5 w-3.5" /> MENUNGGU BAYAR
                            </span>
                          )}
                          {(reg.payment_status === "EXPIRED" || reg.payment_status === "FAILED") && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                              <XCircle className="h-3.5 w-3.5" /> {reg.payment_status}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {reg.payment_status === "PAID" ? (
                            <span className="font-mono text-xs font-bold text-emerald-700">
                              {reg.registration_number}
                            </span>
                          ) : reg.payment_status === "PENDING" && reg.pay_url ? (
                            <a
                              href={reg.pay_url}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
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
          </div>
        </section>
      </main>

      {/* Modal Konfirmasi Pendaftaran & Pembayaran */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">
              Konfirmasi Pendaftaran
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Golongan: <span className="font-bold text-slate-900">{selectedEvent.name}</span> ({selectedEvent.code})
            </p>
            <p className="mt-1 text-lg font-extrabold text-blue-600">
              Biaya: Rp {selectedEvent.price.toLocaleString("id-ID")}
            </p>

            <form onSubmit={handleRegisterEvent} className="mt-4 space-y-3">
              {selectedEvent.category_type === "Ganda" && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Nama Lengkap Pasangan (Wajib untuk Ganda) *
                    </label>
                    <input
                      type="text"
                      required
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="Masukkan nama partner ganda"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Klub Pasangan (Opsional)
                    </label>
                    <input
                      type="text"
                      value={partnerClub}
                      onChange={(e) => setPartnerClub(e.target.value)}
                      placeholder="Contoh: PB Djarum / Mandiri"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
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