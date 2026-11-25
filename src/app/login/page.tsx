"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogIn, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login gagal.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Gangguan koneksi server.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-emerald-700 via-emerald-600 to-lime-500 px-4 pb-16 pt-6">
      {/* Glow Kuning Halus */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-yellow-300/25 blur-3xl" />

      {/* Floating Pill Navbar */}
      <header className="relative z-20 mx-auto max-w-4xl">
        <nav className="flex items-center justify-between rounded-full border border-white/15 bg-emerald-950/85 px-3 py-2 shadow-xl backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2.5 pl-2">
            <img
              src="/logo-pbsi.png"
              alt="Logo PBSI"
              className="h-8 w-8 rounded-full bg-white p-0.5 object-contain"
            />
            <span className="text-sm font-bold tracking-tight text-white">
              PBSI Event
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold text-emerald-100 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Beranda
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

      {/* Card Login */}
      <div className="relative z-10 mx-auto mt-12 w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-white/30 bg-white p-7 shadow-2xl md:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 p-2 shadow-sm">
              <img
                src="/logo-pbsi.png"
                alt="PBSI"
                className="h-full w-full object-contain"
              />
            </div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
              Login Peserta Atlet
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Masuk untuk daftar golongan & cek nomor registrasi event
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-emerald-900">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="atlet@email.com"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-emerald-900">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4 text-yellow-300" />
              )}
              {loading ? "Memproses..." : "Masuk ke Dashboard"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Belum punya akun atlet?{" "}
            <Link
              href="/register"
              className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}