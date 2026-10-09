import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
  variable: "--font-montserrat",
});

const TITLE = "Bioss Consulting | Strategia ICT e tecnologia per l'innovazione";
const DESCRIPTION =
  "Business Intelligence, Operational Support Systems e consulenza IT per leggere i flussi di processi, sistemi e macchine e trasformarli in KPI e azioni correttive. Certificati ISO 9001 e ISO 27001.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.biossconsulting.com"),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "Bioss Consulting",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    images: [{ url: "/og-bioss.jpg", width: 1200, height: 630, alt: "Bioss Consulting, consulenza per l'innovazione" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-bioss.jpg"],
  },
};

export const viewport: Viewport = { themeColor: "#F4F6F8", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="scroll-smooth">
      <body className={`${montserrat.variable} bg-surface font-sans text-ink antialiased`}>{children}</body>
    </html>
  );
}
