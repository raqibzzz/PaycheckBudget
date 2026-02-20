import type { Metadata } from "next";
import PasswordGate from "../components/PasswordGate";
import "./globals.css";

export const metadata: Metadata = {
  title: "Raqib's Budget Tracker",
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
      <body>
        <PasswordGate>{children}</PasswordGate>
      </body>
    </html>
  );
}
