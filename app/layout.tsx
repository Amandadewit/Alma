import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AppSidebar } from "@/components/app-sidebar"
import { ViewModeProvider } from "@/contexts/view-mode-context"

export const metadata: Metadata = {
  title: "Alma Insights - Portfolio Monitoring",
  description: "Private equity portfolio monitoring and analysis platform",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // Alma Refresh: "kobalt-light" (default), "volt-light" or "goud-light"
    <html lang="en" data-theme="goud-light" className="bg-bg">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Funnel+Display:wght@400..800&family=Funnel+Sans:ital,wght@0,300..800;1,300..800&family=JetBrains+Mono:wght@400..700&display=swap"
        />
      </head>
      <body className="font-sans antialiased">
        <ViewModeProvider>
          <AppSidebar />
          <main className="ml-[64px] min-h-screen bg-bg">
            {children}
          </main>
        </ViewModeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
