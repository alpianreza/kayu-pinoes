import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Panel admin — Kayu Pinoes",
  description: "Panel pengelolaan produk Kayu Pinoes.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
