"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, Loader2, ArrowLeft, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string>("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    nik: "",
    birth_date: "",
    gender: "Putra",
    club_name: "",
    address: "",
    photo_base64: "",
  });

  // Kompresi foto otomatis agar ringan disimpan di NeonDB
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 600;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressed = canvas.toDataURL("image/jpeg", 0.75);
        setPhotoPreview(compressed);
        setForm((prev) => ({ ...prev, photo_base64: compressed }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.photo_base64) {
      setError("Foto diri atlet wajib diupload.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mendaftar akun.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi gangguan koneksi. Coba lagi.");
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
              href="/login"
              className="rounded-full bg-yellow-400 px-4 py-1.5 text-xs font-bold text-emerald-950 shadow-sm transition hover:bg-yellow-300"
            >
              Login
            </Link>
          </div>
        </nav>
      </header>

      {/* Card Register */}
      <div className="relative z-10 mx-auto mt-8 max-w-2xl">
        <div className="overflow-hidden rounded-3xl border border-white/30 bg-white p-6 shadow-2xl md:p-8">
          <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 p-2 shadow-xs">
              <img
                src="/logo-pbsi.png"
                alt="PBSI"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl">
                Registrasi Akun Atlet
              </h1>
              <p className="text-sm text-slate-500">
                Lengkapi data diri & foto diri resmi sebelum memilih golongan pertandingan.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Upload Foto Diri */}
            <div className="rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-4 text-center">
              {photoPreview ? (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={photoPreview}
                    alt="Preview Foto Atlet"
                    className="h-28 w-28 rounded-full border-4 border-yellow-400 object-cover shadow-md"
                  />
                  <label className="cursor-pointer rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-200">
                    Ganti Foto Diri
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center gap-2 py-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Upload className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-bold text-emerald-950">
                    Upload Foto Diri Atlet (Wajib)
                  </span>
                  <span className="text-xs text-slate-500">
                    Format JPG/PNG, otomatis dikompres agar cepat & ringan
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-emerald-950">
                  Nama Lengkap Atlet *
                </label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Sesuai KTP / KK"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-emerald-950">
                  NIK / Nomor KTP / KIA *
                </label>
                <input
                  type="text"
                  required
                  value={form.nik}
                  onChange={(e) => setForm({ ...form, nik: e.target.value })}
                  placeholder="16 digit NIK"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-emerald-950">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="atlet@email.com"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-emerald-950">
                  Password Akun *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-emerald-950">
                  No. WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-emerald-950">
                  Tanggal Lahir *
                </label>
                <input
                  type="date"
                  required
                  value={form.birth_date}
                  onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-emerald-950">
                  Jenis Kelamin *
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Putra">Putra</option>
                  <option value="Putri">Putri</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-emerald-950">
                Nama PB / Klub (Opsional)
              </label>
              <input
                type="text"
                value={form.club_name}
                onChange={(e) => setForm({ ...form, club_name: e.target.value })}
                placeholder="Contoh: PB Jaya Raya / Mandiri"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-emerald-950">
                Alamat Lengkap *
              </label>
              <textarea
                required
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Alamat domisili lengkap"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-yellow-400 py-3.5 text-sm font-extrabold text-emerald-950 shadow-md transition hover:bg-yellow-300 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {loading ? "Menyimpan Data..." : "Daftar & Masuk ke Dashboard"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}