import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paycheck Budget Planner",
  description: "Biweekly paycheck planner with debt payoff tracking.",
  themeColor: "#0b1110"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
