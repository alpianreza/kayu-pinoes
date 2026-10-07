"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  FolderTree,
  Grid2X2,
  Layers,
  LogOut,
  Package,
  Settings,
  TreePine,
  X,
} from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: Grid2X2 },
  { href: "/admin/products", label: "Produk", icon: Package },
  { href: "/admin/categories", label: "Kategori", icon: FolderTree },
  { href: "/admin/master-data", label: "Master Data", icon: Layers },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export function AdminMobileNav({
  isOpen,
  userEmail,
  onClose,
  onSignOut,
}: {
  isOpen: boolean;
  userEmail: string | null;
  onClose: () => void;
  onSignOut: () => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="kp-modal-backdrop fixed inset-0 z-50 bg-[#1B241E]/60 backdrop-blur-[2px] lg:hidden">
      <div className="fixed inset-y-0 start-0 w-72 max-w-[80vw] bg-[#FBF9F3] p-5 shadow-2xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-[#314B3A]/10">
            <Link href="/admin" onClick={onClose} className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-[#314B3A] text-white">
                <TreePine size={18} />
              </span>
              <div>
                <span className="font-display block text-lg leading-none tracking-[-0.04em] text-[#314B3A]">
                  Kayu Pinoes
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#C76845]">
                  Admin CMS
                </span>
              </div>
            </Link>
            <Button variant="ghost" size="icon" aria-label="Tutup menu" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>

          {/* Nav Items */}
          <nav className="mt-6 space-y-2">
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
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
                    isActive
                      ? "bg-[#314B3A] text-white"
                      : "text-[#405047] hover:bg-[#EEF1E9] hover:text-[#27372D]"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-[#F4C45D]" : "text-[#748077]"} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="space-y-3 pt-5 border-t border-[#314B3A]/10">
          <Link
            href="/products"
            target="_blank"
            onClick={onClose}
            className="flex items-center justify-between rounded-2xl border border-[#314B3A]/12 bg-white px-4 py-3 text-xs font-bold text-[#314B3A]"
          >
            <span>Lihat Situs Publik</span>
            <ExternalLink size={14} className="text-[#C76845]" />
          </Link>

          <div className="flex items-center justify-between rounded-2xl bg-[#EEF1E9] p-3">
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
              onClick={() => {
                onClose();
                onSignOut();
              }}
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
