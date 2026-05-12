import { Geist, Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/Providers"
import { cn } from "@workspace/ui/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}>
        <ClerkProvider>
          <Providers>
              {children}
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  )
}
