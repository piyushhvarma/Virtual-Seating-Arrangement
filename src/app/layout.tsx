import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, DM_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { PostHogProvider } from "@/providers/PostHogProvider";
import PostHogPageView from "@/components/PostHogPageView";
import "./globals.css";
import Script from "next/script";

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
  title: "MUJ 3rd Year AIML | Exam Seating Portal",
  description:
    "Official 3rd Year AIML Exam Seating Portal for Manipal University Jaipur. Check your exact room and seat for ETE & PE exams instantly.",
  keywords: [
    "muj seating plan",
    "muj exam seating",
    "manipal university jaipur seating list",
    "muj aiml seating",
    "muj end term seating",
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
    title: "MUJ 3rd Year AIML - Official Seating Portal",
    description: "Dedicated exam seating portal for MUJ 3rd Year AIML students. Find your exact room and seat for ETE & PE exams instantly.",
    siteName: "MUJ 3rd Year AIML Portal",
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
    title: "MUJ 3rd Year AIML - Official Seating Portal",
    description: "Fast, secured, and dedicated seating portal for MUJ 3rd Year AIML students.",
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
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "wfsi425sxx");
          `}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <PostHogProvider>
            <PostHogPageView />
            {children}
          </PostHogProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
