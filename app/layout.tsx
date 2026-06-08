import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";
import { ClientLayout } from "./client-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BNK Finance Bank - Secure & Modern Banking",
  description: "BNK Finance Bank provides secure, innovative, and personalized banking solutions. Experience the future of finance today.",
  openGraph: {
    title: "BNK Finance Bank",
    description: "Secure, innovative, and personalized banking solutions.",
    url: "https://bnk-finance.com",
    siteName: "BNK Finance Bank",
    images: [
      {
        url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&q=80",
        width: 1200,
        height: 630,
        alt: "BNK Finance Bank",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BNK Finance Bank",
    description: "Secure, innovative, and personalized banking solutions.",
    images: ["https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&q=80"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏦</text></svg>" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/aquawolf04/font-awesome-pro@5cd1511/css/all.css"
        />
        <Script id="smartsupp-chat" strategy="afterInteractive">
          {`
            var _smartsupp = _smartsupp || {};
            _smartsupp.key = 'ff14809e5fee7f8eb4ecc56fc36eba761c7797d2';
            window.smartsupp||(function(d) {
              var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
              s=d.getElementsByTagName('script')[0];c=d.createElement('script');
              c.type='text/javascript';c.charset='utf-8';c.async=true;
              c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
            })(document);
          `}
        </Script>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}