import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar"; // yup we imported the navbar here 

export const metadata: Metadata = {
  title: "Movie Explorer",
  description: "Discover your next favorite movie.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar /> 
        {children}
      </body>
    </html>
  );
}
