"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Grid3X3,
  Eye,
  FileDown,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/students", icon: Users, label: "Students" },
  { href: "/admin/exams", icon: BookOpen, label: "Exams" },
  { href: "/admin/assign", icon: Grid3X3, label: "Assign Seats" },
  { href: "/admin/rooms", icon: Eye, label: "Room View" },
  { href: "/admin/export", icon: FileDown, label: "Export PDF" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function AdminSidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      className="fixed left-0 top-0 h-dvh z-30 flex flex-col"
      style={{
        background: "var(--card-bg)",
        borderRight: "2.5px solid var(--card-border)",
      }}
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-5"
        style={{ borderBottom: "2px solid var(--border)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "var(--pill-bg)",
            color: "var(--pill-text)",
          }}
        >
          <Shield size={18} />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-hidden"
          >
            <p
              className="text-sm font-black tracking-tight"
              style={{
                color: "var(--text-1)",
                fontFamily: "var(--font-head, sans-serif)",
              }}
            >
              Admin Panel
            </p>
            <p
              className="text-[10px] font-semibold"
              style={{ color: "var(--text-3)" }}
            >
              AIML Seating
            </p>
          </motion.div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 group relative"
              style={{
                background: isActive
                  ? "var(--pill-bg)"
                  : "transparent",
                color: isActive ? "var(--pill-text)" : "var(--text-2)",
                fontFamily: "var(--font-head, sans-serif)",
              }}
            >
              <item.icon
                size={18}
                className="flex-shrink-0"
                style={{
                  color: isActive ? "var(--pill-text)" : "var(--text-3)",
                }}
              />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {collapsed && (
                <div
                  className="absolute left-full ml-2 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
                  style={{
                    background: "var(--pill-bg)",
                    color: "var(--pill-text)",
                  }}
                >
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div
        className="px-2 py-3 space-y-1"
        style={{ borderTop: "2px solid var(--border)" }}
      >
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all hover:opacity-70"
          style={{
            color: "#ef4444",
            fontFamily: "var(--font-head, sans-serif)",
          }}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center rounded-xl py-2 transition-all hover:opacity-70"
          style={{ color: "var(--text-3)" }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}
