"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/ui/BottomNav";

// Pages where the BottomNav should be hidden 
// (full-screen experiences like the AI Concierge or Admin Dashboard)
const HIDDEN_ROUTES = ["/ai", "/admin"];

export default function BottomNavWrapper() {
  const pathname = usePathname();
  const isHidden = HIDDEN_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (isHidden) return null;
  return <BottomNav />;
}
