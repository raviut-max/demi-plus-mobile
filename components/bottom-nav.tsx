"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, BarChart3, Target, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home", label: "หน้าหลัก", icon: Home },
  { href: "/record", label: "บันทึก", icon: ClipboardList },
  { href: "/progress", label: "ความคืบหน้า", icon: BarChart3 },
  { href: "/goals", label: "เป้าหมาย", icon: Target },
  { href: "/profile", label: "โปรไฟล์", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                isActive
                  ? "text-[#3B82F6] font-semibold"
                  : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-[#3B82F6]")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}