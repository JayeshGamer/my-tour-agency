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
  other: {
    "color-scheme": "light only",
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
        <meta name="color-scheme" content="light only" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="robots" content="noindex" data-rh="true" />
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Complete browser extension isolation */
            :root {
              color-scheme: light only !important;
            }
            
            /* Hide all DarkReader elements */
            .darkreader,
            [class*="darkreader"],
            style[class*="darkreader"] {
              display: none !important;
              visibility: hidden !important;
            }
            
            /* Normalize extension-modified styles */
            svg[data-darkreader-inline-stroke],
            svg[data-darkreader-inline-fill] {
              stroke: currentColor !important;
              fill: currentColor !important;
            }
            
            /* Prevent layout shifts during hydration */
            body {
              visibility: visible !important;
              opacity: 1 !important;
            }
            
            /* Disable all transitions during initial load */
            *, *::before, *::after {
              transition-duration: 0s !important;
              animation-duration: 0s !important;
              animation-delay: 0s !important;
            }
            
            /* Re-enable transitions after hydration */
            .hydrated *, .hydrated *::before, .hydrated *::after {
              transition-duration: initial !important;
              animation-duration: initial !important;
              animation-delay: initial !important;
            }
          `
        }} />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{
          __html: `
            // Complete hydration protection
            (function() {
              'use strict';
              
              if (typeof window !== 'undefined') {
                // Disable console errors that don't help users
                const originalError = console.error;
                const originalWarn = console.warn;
                
                console.error = function(...args) {
                  const msg = String(args[0] || '');
                  if (msg.includes('Hydration') || 
                      msg.includes('server rendered HTML') ||
                      msg.includes('darkreader') ||
                      msg.includes('TSS:') ||
                      msg.includes('Content Script')) {
                    return; // Silently ignore extension-related errors
                  }
                  return originalError.apply(this, args);
                };
                
                console.warn = function(...args) {
                  const msg = String(args[0] || '');
                  if (msg.includes('darkreader') || 
                      msg.includes('validateDOMNesting')) {
                    return;
                  }
                  return originalWarn.apply(this, args);
                };
                
                // Mark body as hydrated after React finishes
                window.addEventListener('load', function() {
                  setTimeout(function() {
                    document.body.classList.add('hydrated');
                  }, 200);
                });
              }
            })();
          `
        }} />

        <HydrationSafe
          fallback={<div className="h-16 bg-white border-b border-gray-200" />}
        >
          <Header />
        </HydrationSafe>

        <main className="flex-1 py-12">
          <HydrationSafe>
            {children}
          </HydrationSafe>
        </main>

        <HydrationSafe
          fallback={<div className="h-20 bg-gray-900" />}
        >
          <Footer />
        </HydrationSafe>

        <HydrationSafe>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#fff",
                color: "#000",
              },
            }}
          />
        </HydrationSafe>
      </body>
    </html>
  );
}
