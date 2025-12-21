import type { Metadata } from "next";
import { Baloo_2 } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import { ToastProvider } from "../components/ToastProvider";
import { AuthProvider } from "../contexts/AuthContext";

const baloo2 = Baloo_2({
  variable: "--font-baloo-2",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Task Tracker - Смешарики",
  description: "Дружелюбный трекер задач в стиле Смешариков",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${baloo2.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <ToastProvider>
            <Header />
            <main className="container mx-auto px-4 py-8 max-w-7xl">
              {children}
            </main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
