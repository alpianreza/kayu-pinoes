"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ExternalLink, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const ROUTE_LABELS: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Produk",
  "/admin/categories": "Kategori",
  "/admin/master-data": "Master Data",
  "/admin/settings": "Pengaturan",
};

export function AdminHeader({
  onOpenMobileNav,
}: {
  onOpenMobileNav: () => void;
}) {
  const pathname = usePathname();
  const currentTitle = ROUTE_LABELS[pathname] ?? "Admin CMS";

  return (
    <header className="sticky top-0 z-20 border-b border-[#314B3A]/10 bg-[#FBF9F3]/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-8 lg:px-10">
        {/* Mobile menu trigger & Breadcrumb */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Buka menu navigasi"
            onClick={onOpenMobileNav}
          >
            <Menu size={20} />
          </Button>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-bold text-[#6B766E]" aria-label="Breadcrumb">
            <Link href="/admin" className="hover:text-[#314B3A]">
              CMS Admin
            </Link>
            {pathname !== "/admin" ? (
              <>
                <ChevronRight size={14} className="text-[#8A948C]" />
                <span className="text-[#27372D]">{currentTitle}</span>
              </>
            ) : null}
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/products" target="_blank">
              <ExternalLink size={14} /> Lihat Situs Publik
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
