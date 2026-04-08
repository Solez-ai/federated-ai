import type { Metadata } from "next";
import { Inter, Orbitron, Playfair_Display } from "next/font/google";
import "./globals.css";
import CursorProvider from "@/components/CursorProvider";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Preloader from "@/components/Preloader";
import { SoundProvider } from "react-sounds";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const orbitron = Orbitron({ variable: "--font-orbitron", subsets: ["latin"], weight: ["400", "700", "900"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Privacy-Preserving AI — Interactive Research",
  description: "An Interactive Research Experience on Federated Learning and Differential Privacy",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${orbitron.variable} ${playfair.variable} antialiased bg-background text-white`}>
        <SoundProvider preload={["/sounds/click.mp3", "/sounds/intro-sound.mp3"]} initialEnabled={true}>
          <Preloader />
          <SmoothScroll>
            <CursorProvider />
            <Navbar />
            {children}
          </SmoothScroll>
        </SoundProvider>
      </body>
    </html>
  );
}
