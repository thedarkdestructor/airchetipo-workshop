"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Feed", icon: Home, isFab: false },
  { href: "/scan", label: "Scan", icon: Camera, isFab: true },
  { href: "/profile", label: "Profilo", icon: User, isFab: false },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-1/2 z-50 flex w-full max-w-[390px]",
        "-translate-x-1/2 items-center justify-around",
        "border-t border-[oklch(0.88_0.005_50)] bg-white",
        "h-[60px] pb-[env(safe-area-inset-bottom,0px)]"
      )}
    >
      {navItems.map(({ href, label, icon: Icon, isFab }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href);

        if (isFab) {
          return (
            <Link
              key={href}
              href={href}
              className="relative -top-3 flex flex-col items-center gap-[2px]"
            >
              <span
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full",
                  "bg-[oklch(0.55_0.22_25)] text-white",
                  "shadow-[0_4px_16px_oklch(0.55_0.22_25/0.35)]",
                  "transition-transform hover:scale-[1.08]"
                )}
              >
                <Icon size={24} />
              </span>
              <span
                className={cn(
                  "mt-1 text-[11px] font-semibold",
                  isActive
                    ? "text-[oklch(0.55_0.22_25)]"
                    : "text-[oklch(0.75_0.005_50)]"
                )}
              >
                {label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-[2px] rounded-lg px-3 py-1",
              "text-[11px] transition-colors",
              isActive
                ? "text-[oklch(0.55_0.22_25)]"
                : "text-[oklch(0.75_0.005_50)]"
            )}
          >
            <Icon size={22} />
            <span className={cn("leading-none", isActive && "font-semibold")}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
