import "./globals.css";

import { Inter, Fredoka } from "next/font/google";
import { ToastProvider } from "@/providers/Toast";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
});

export const metadata = {
  title: "GroGuesser",
  description:
    "Discover every corner of Zernike campus in this exciting geoguesser adventure!",
  icons: {
    icon: "/favicon.png", // primary favicon
    shortcut: "/favicon.png", // optional
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* <script
          crossOrigin="anonymous"
          src="//unpkg.com/react-scan/dist/auto.global.js"
        /> */}
      </head>
      <body className={` ${fredoka.variable} ${inter.variable} antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
