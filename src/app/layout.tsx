import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pendaftaran Event Badminton",
  description: "Portal resmi pendaftaran atlet dan pembayaran event kejuaraan badminton.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}