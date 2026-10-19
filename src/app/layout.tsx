import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { Analytics } from "@vercel/analytics/react";

const terminalMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-terminal-mono",
  display: "swap",
});

const SITE_URL = "https://yashmaheshwari.is-a.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lokeshwar Sikarwar | Software Developer — Fullstack , Backend",
    template: `%s | ${DATA.name}`,
  },
  description: DATA.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Yash Maheshwari | AI/ML Engineer — Agentic AI, RAG & Backend",
    description: DATA.description,
    url: SITE_URL,
    siteName: `${DATA.name}`,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Yash Maheshwari — AI/ML Engineer portfolio",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: "Yash Maheshwari | AI/ML Engineer — Agentic AI, RAG & Backend",
    card: "summary_large_image",
    images: ["/og-image.jpg"],
  },
  verification: {
    google: "",
    yandex: "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Content-Security-Policy" content="frame-ancestors 'none';" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased relative",
          terminalMono.variable
        )}
      >
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Yash Maheshwari",
              jobTitle: "AI/ML Engineer",
              alumniOf: "Manipal University Jaipur",
              sameAs: [
                "https://github.com/ApexYash11",
                "https://linkedin.com/in/yash-maheshwari-3b891a307",
                "https://x.com/YashMah11",
                "https://instagram.com/yash_maheshwari_11",
              ],
            }),
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="light">
          <TooltipProvider delayDuration={0}>
            <div className="absolute inset-0 top-0 left-0 right-0 h-[100px] overflow-hidden z-0">
              <FlickeringGrid
                className="h-full w-full"
                squareSize={2}
                gridGap={2}
                style={{
                  maskImage: "linear-gradient(to bottom, black, transparent)",
                  WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
                }}
              />
            </div>
            <div className="relative z-10 max-w-4xl mx-auto py-12 pb-24 sm:py-24 px-6">
              {children}
            </div>
            <Navbar />
            <Analytics />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
