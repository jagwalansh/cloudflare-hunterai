import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ClientLayout } from "@/components/layout/ClientLayout";
import "./globals.css";
import "./shell.css";

export const metadata: Metadata = {
  title: "HunterAI — AI-Powered Job Matching & Resume Intelligence",
  description: "Upload your resume, extract a universal skill profile, and get ranked role matches with fit scores, gap analysis, and auto-tailored applications.",
  metadataBase: new URL('https://hunterai.me'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "HunterAI — AI-Powered Job Matching & Resume Intelligence",
    description: "Upload your resume, extract a universal skill profile, and get ranked role matches with fit scores, gap analysis, and auto-tailored applications.",
    url: 'https://hunterai.me',
    siteName: 'HunterAI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "HunterAI — AI-Powered Job Matching & Resume Intelligence",
    description: "Upload your resume, extract a universal skill profile, and get ranked role matches with fit scores, gap analysis, and auto-tailored applications.",
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: ["AI resume", "job matching", "skill profile", "ATS score", "internship finder", "resume tailoring", "career intelligence"],
  authors: [{ name: "HunterAI" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-8KTHLB80TF"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-8KTHLB80TF');
          `}
        </Script>
        <Script id="json-ld" type="application/ld+json" strategy="beforeInteractive">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "HunterAI",
              "url": "https://hunterai.me",
              "description": "HunterAI turns resumes into live skill profiles, ranked role matches, and clearer applications.",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "creator": {
                "@type": "Organization",
                "name": "HunterAI"
              },
              "featureList": [
                "Universal skill profile extraction",
                "AI-powered role match scoring",
                "ATS score breakdown",
                "Auto-tailored resume generation",
                "Job alert notifications"
              ]
            }
          `}
        </Script>
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
