import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ofora | Confidential bids. Defensible awards.",
  description:
    "Ofora helps organizations keep supplier bids confidential while independently validating procurement awards against locked evaluation policies."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
