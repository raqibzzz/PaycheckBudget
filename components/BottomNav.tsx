"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <Link className={pathname === "/" ? "active" : ""} href="/">
        Dashboard
      </Link>
      <Link className={pathname === "/settings" ? "active" : ""} href="/settings">
        Settings
      </Link>
    </nav>
  );
}

