import type { Metadata } from "next";
import Link from "next/link";
import { Hanken_Grotesk, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { profile } from "@/content/profile";
import "./globals.css";

const serif = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--font-serif" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: `${profile.name} — Portfolio`,
  description: profile.intro,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable} ${sans.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <header className="nav">
          <Link href="/" className="nav-mark">DW/</Link>
          <nav aria-label="Primary">
            <Link href="/#work">Work</Link>
            <Link href="/#experience">Experience</Link>
            <Link href="/#skills">Skills</Link>
            <Link href="/#more">More</Link>
            <Link href="/#about">About</Link>
            <a href={profile.links.github}>GitHub ↗</a>
          </nav>
        </header>
        <div id="main">{children}</div>
        <footer className="footer">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <span>Built with Next.js · content read live from GitHub · flip card from React Bits</span>
        </footer>
      </body>
    </html>
  );
}
