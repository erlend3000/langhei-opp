import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Langhei Opp – Resultater og statistikk",
  description:
    "Alle resultater fra Langhei Opp motbakkeløp, arrangert av Gjeving IL siden 2013.",
  metadataBase: new URL("https://langheiopp.no"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Langhei Opp – Resultater og statistikk",
    description:
      "Alle resultater fra Langhei Opp motbakkeløp, arrangert av Gjeving IL siden 2013.",
    url: "https://langheiopp.no",
    siteName: "Langhei Opp",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Langhei Opp – Gjeving IL 100 år",
      },
    ],
    locale: "nb_NO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Langhei Opp – Resultater og statistikk",
    description:
      "Alle resultater fra Langhei Opp motbakkeløp, arrangert av Gjeving IL siden 2013.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="no"
      className={`${bebasNeue.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
