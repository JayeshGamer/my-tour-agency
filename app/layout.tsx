import type { Metadata } from "next";
import "../src/app/globals.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export const metadata: Metadata = {
  title: "Travel Agency",
  description: "Discover and book unforgettable tours worldwide.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <Header />
        <main className="container py-8 flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

