import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, DM_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

// Premium fonts
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["300", "400", "500"],
  display: "swap",
});


export const metadata: Metadata = {
  title: "MUJ AIML — Exam Seating Portal",
  description:
    "Find your exam seat for Manipal University Jaipur – Department of Artificial Intelligence and Machine Learning.",
  keywords: ["MUJ", "Manipal University Jaipur", "AIML", "Exam Seating", "MTE 2026"],
  openGraph: {
    title: "MUJ AIML — Exam Seating Portal",
    description: "Your seat. Your ticket. Instantly.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${dmSans.variable} ${dmMono.variable} antialiased font-dm`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
