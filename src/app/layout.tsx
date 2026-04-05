import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, DM_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
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
  title: "MUJ Seating Plan | AIML Exam Portal",
  description:
    "Check your MUJ seating plan instantly. Official exam seating arrangement for Manipal University Jaipur (Dept. of Artificial Intelligence and Machine Learning).",
  keywords: [
    "muj seating plan",
    "muj exam seating",
    "manipal university jaipur seating list",
    "muj aiml seating",
    "muj mid term seating",
    "muj exam portal",
    "muj seating arrangement"
  ],
  authors: [{ name: "MUJ AIML" }],
  robots: "index, follow",
  openGraph: {
    title: "MUJ Seating Plan | Exam Portal",
    description: "Find your MUJ exam room and seat number instantly.",
    type: "website",
    locale: "en_IN",
  },
  verification: {
    google: "TVYOMFr3wJQ8k1GfeW--_Yq_dJWr-Cxlfwn4BJiq1Xk",
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
        <Analytics />
      </body>
    </html>
  );
}
