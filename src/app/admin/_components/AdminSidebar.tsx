"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderTree,
  Grid2X2,
  ExternalLink,
  Layers,
  LogOut,
  Package,
  Settings,
  TreePine,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: Grid2X2 },
  { href: "/admin/products", label: "Produk", icon: Package },
  { href: "/admin/categories", label: "Kategori", icon: FolderTree },
  { href: "/admin/master-data", label: "Master Data", icon: Layers },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export function AdminSidebar({
  userEmail,
  onSignOut,
}: {
  userEmail: string | null;
  onSignOut: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 flex-col border-e border-[#314B3A]/12 bg-[#FBF9F3] lg:flex">
      {/* Brand Header */}
      <div className="flex h-20 items-center justify-between border-b border-[#314B3A]/10 px-6">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-[#314B3A] text-white shadow-[0_6px_16px_rgba(49,75,58,0.2)]">
            <TreePine size={20} />
          </span>
          <div>
            <span className="font-display block text-xl leading-none tracking-[-0.05em] text-[#314B3A]">
              Kayu Pinoes
            </span>
            <span className="mt-1 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#C76845]">
              Catalog CMS
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
        <div className="px-3 pb-2 pt-1">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8A948C]">
            Menu Utama
          </span>
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
                isActive
                  ? "bg-[#314B3A] text-white shadow-[0_8px_20px_rgba(49,75,58,0.18)]"
                  : "text-[#405047] hover:bg-[#EEF1E9] hover:text-[#27372D]"
              }`}
            >
              <Icon size={18} className={isActive ? "text-[#F4C45D]" : "text-[#748077]"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick link to public site */}
      <div className="px-4 py-2">
        <Link
          href="/products"
          target="_blank"
          className="flex items-center justify-between rounded-2xl border border-[#314B3A]/12 bg-white px-4 py-3 text-xs font-bold text-[#314B3A] shadow-xs transition hover:border-[#314B3A]/30 hover:bg-[#F7F3EB]"
        >
          <span className="flex items-center gap-2">
            Lihat Situs Publik
          </span>
          <ExternalLink size={14} className="text-[#C76845]" />
        </Link>
      </div>

      {/* Footer / User Session */}
      <div className="border-t border-[#314B3A]/10 p-4">
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-[#EEF1E9] p-3">
          <div className="min-w-0 flex-1">
            <span className="block truncate text-xs font-bold text-[#27372D]">
              {userEmail ?? "Admin"}
            </span>
            <span className="block text-[10px] font-semibold text-[#6B766E]">Super Admin</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-xl text-[#B23C22] hover:bg-[#F9E7DF]"
            title="Keluar"
            aria-label="Keluar dari akun admin"
            onClick={onSignOut}
          >
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </aside>
  );
}
