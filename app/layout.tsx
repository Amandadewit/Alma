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
    <html lang="en" className="bg-[#F7F6F3]">
      <body className="font-sans antialiased">
        <ViewModeProvider>
          <AppSidebar />
          <main className="ml-[220px] min-h-screen bg-[#F7F6F3]">
            {children}
          </main>
        </ViewModeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
