import { Poppins, Outfit, Playfair_Display, IBM_Plex_Mono, Dancing_Script, Cinzel } from "next/font/google";
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

const fontCursive = Dancing_Script({
  variable: "--font-cursive",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fontRoyal = Cinzel({
  variable: "--font-royal",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
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
        className={`${poppins.variable} ${fontModern.variable} ${fontSerif.variable} ${fontMono.variable} ${fontCursive.variable} ${fontRoyal.variable} antialiased`}
        style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
      >
        <PageTitleProvider>
          {children}
        </PageTitleProvider>
      </body>
    </html>
  );
}
