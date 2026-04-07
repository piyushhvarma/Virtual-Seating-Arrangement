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
  metadataBase: new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
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
  authors: [{ name: "MUJ Engineering" }],
  robots: "index, follow",
  icons: {
    icon: "/muj-icon.png?v=5",
    shortcut: "/muj-icon.png?v=5",
    apple: "/muj-icon.png?v=5",
  },
  openGraph: {
    title: "MUJ Seating Plan | Official Exam Portal",
    description: "Find your MUJ room and exact seat index instantly. Access live schedules for AIML, IT, and Core Engineering examinations.",
    siteName: "MUJ Exam Portal",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "MUJ Seating Portal Official Cover",
      },
    ],
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "MUJ Seating Plan | Official Exam Portal",
    description: "Find your MUJ room and exact seat instantly. Access live schedules securely.",
    images: ["/logo.png"],
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
