import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { Toaster } from "react-hot-toast";
import HydrationSafe from "@/components/ui/HydrationSafe";

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
      <head>
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        {/* Theme initialization script */}
        <script dangerouslySetInnerHTML={{
          __html: `(() => {
            try {
              const stored = localStorage.getItem('theme');
              // Default to light theme
              const isDark = stored === 'dark';
              if (isDark) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) { /* ignore */ }
          })();`
        }} />
      </head>
      <body className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <HydrationSafe>
          <Header />
          <main className="min-h-screen pt-20">
            {children}
          </main>
          <Footer />
          <Toaster position="top-right" />
        </HydrationSafe>
      </body>
    </html>
  );
}
