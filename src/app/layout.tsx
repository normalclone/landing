import type { Metadata, Viewport } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { PageTransitionBee } from "../components/page-transition/PageTransitionBee";
import { FloatingThemeToggle } from "../components/theme-toggle/FloatingThemeToggle";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";

export const metadata: Metadata = {
  title: "Beexamine – Luyện thi thông minh • Xếp hạng minh bạch",
  description:
    "Beexamine: Luyện thi thông minh – Đánh giá năng lực chuẩn xác. Xếp hạng tổng minh bạch. CTA màu mật ong. Hỗ trợ Dark Mode.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" data-bs-theme="light" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <PageTransitionBee />
        <Header />
        {children}
        <Footer />
        <FloatingThemeToggle />
      </body>
    </html>
  );
}
