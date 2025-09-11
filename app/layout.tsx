import type { Metadata } from "next";
import "../src/app/globals.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Travel Agency",
  description: "Discover and book unforgettable tours worldwide.",
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <Toaster position="top-right" />
        <Header />
        <main className="flex-1 py-12">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

