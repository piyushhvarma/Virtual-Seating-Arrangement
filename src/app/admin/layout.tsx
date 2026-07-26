"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminProvider, useAdmin } from "@/providers/AdminProvider";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminCopilot } from "@/components/AdminCopilot";
import { AnimatedThemeToggler } from "@/components/AnimatedThemeToggler";
import { AVAILABLE_YEARS } from "@/lib/adminTypes";
import { Loader2, CheckCircle2, Clock } from "lucide-react";

function YearSelector() {
  const { selectedYear, setSelectedYear, fullData } = useAdmin();

  return (
    <div className="flex items-center gap-1.5">
      {AVAILABLE_YEARS.map((y) => {
        const isActive = selectedYear === y.key;
        const yd = fullData.years[y.key];
        const isPublished = yd?.published || false;
        const studentCount = yd ? Object.keys(yd.students).length : 0;

        return (
          <button
            key={y.key}
            onClick={() => setSelectedYear(y.key)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: isActive ? "var(--pill-bg)" : "var(--card-bg)",
              color: isActive ? "var(--pill-text)" : "var(--text-2)",
              border: `2px solid ${isActive ? "var(--card-border)" : "var(--border)"}`,
              boxShadow: isActive ? "var(--card-shadow-sm)" : "none",
              fontFamily: "var(--font-head, sans-serif)",
            }}
          >
            {isPublished ? (
              <CheckCircle2 size={11} style={{ color: isActive ? "var(--pill-text)" : "#10b981" }} />
            ) : studentCount > 0 ? (
              <Clock size={11} style={{ color: isActive ? "var(--pill-text)" : "#f59e0b", opacity: 0.7 }} />
            ) : null}
            {y.label}
            {studentCount > 0 && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                style={{
                  background: isActive ? "rgba(255,255,255,0.15)" : "var(--badge-light-bg)",
                  color: isActive ? "var(--pill-text)" : "var(--text-3)",
                }}
              >
                {studentCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function AdminContent({ children }: { children: React.ReactNode }) {
  const { lastSaved, yearLabel } = useAdmin();
  const router = useRouter();

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    router.replace("/admin");
  };

  return (
    <div className="min-h-dvh" style={{ background: "var(--bg)" }}>
      <AdminSidebar onLogout={handleLogout} />

      {/* Main content area */}
      <div className="ml-[240px] transition-all duration-250">
        {/* Top bar with year selector */}
        <div
          className="sticky top-0 z-20 flex items-center justify-between px-6 py-3"
          style={{
            background: "var(--bg)",
            borderBottom: "2px solid var(--border)",
          }}
        >
          <YearSelector />
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span
                className="text-[10px] font-semibold"
                style={{ color: "var(--text-3)" }}
              >
                Saved {lastSaved}
              </span>
            )}
            <AnimatedThemeToggler
              className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
              style={{
                border: "2px solid var(--card-border)",
                background: "var(--card-bg)",
              }}
            />
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin";

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_token");
    if (stored) {
      setToken(stored);
    } else if (!isLoginPage) {
      router.replace("/admin");
    }
    setChecking(false);
  }, [router, isLoginPage]);

  // Login page — render directly without admin shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state
  if (checking || !token) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <Loader2
          size={28}
          className="anim-spin"
          style={{ color: "var(--text-3)" }}
        />
      </div>
    );
  }

  return (
    <AdminProvider token={token}>
      <AdminContent>{children}</AdminContent>
      <AdminCopilot />
    </AdminProvider>
  );
}
