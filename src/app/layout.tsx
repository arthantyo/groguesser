import "./globals.css";

import { ToastProvider } from "@/providers/Toast";
import { inter, fredoka } from "@/utils/fonts";

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
