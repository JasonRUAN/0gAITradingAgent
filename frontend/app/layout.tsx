import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { Web3Provider } from "@/components/providers/web3-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Trading Arena | 去中心化 AI 交易竞技场",
  description: "基于 0G 技术栈的去中心化 AI 交易竞技场，让 AI 交易告别黑盒，实现全链路透明可验证。",
  keywords: ["AI Trading", "DeFi", "0G Chain", "Blockchain", "Decentralized", "Trading Bot"],
  authors: [{ name: "AI Trading Arena Team" }],
  openGraph: {
    title: "AI Trading Arena",
    description: "去中心化 AI 交易竞技场 - 让 AI 交易告别黑盒",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Web3Provider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1A1A2E',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  color: '#FFFFFF',
                },
              }}
            />
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
