import { Poppins, Outfit, Playfair_Display, IBM_Plex_Mono } from "next/font/google";
import { PageTitleProvider } from "@/contexts/PageTitleContext";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Per-block editor fonts (Distinct Categories)
const fontModern = Outfit({
  variable: "--font-modern",
  subsets: ["latin"],
});

const fontSerif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const fontMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Pagelet",
  description: "A calmer place for your ideas.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${fontModern.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
        style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
      >
        <PageTitleProvider>
          {children}
        </PageTitleProvider>
      </body>
    </html>
  );
}
