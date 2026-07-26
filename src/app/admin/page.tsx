"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatedThemeToggler } from "@/components/AnimatedThemeToggler";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (token) {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success && data.token) {
        sessionStorage.setItem("admin_token", data.token);
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-dvh flex flex-col items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full z-20 flex items-center justify-between px-4 sm:px-6 pt-4">
        <Link
          href="/"
          className="pill-btn flex items-center gap-1.5"
          style={{
            background: "var(--card-bg)",
            color: "var(--text-1)",
            border: "2px solid var(--card-border)",
            padding: "8px 16px",
          }}
        >
          <ArrowLeft size={14} /> Back to Search
        </Link>
        <AnimatedThemeToggler
          className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
          style={{
            border: "2px solid var(--card-border)",
            background: "var(--card-bg)",
          }}
        />
      </div>

      <motion.div
        className="card p-8 w-full max-w-sm flex flex-col gap-6 items-center text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            border: "2.5px solid var(--card-border)",
            background: "var(--card-bg)",
          }}
        >
          <Lock size={28} style={{ color: "var(--text-1)" }} />
        </div>

        <div>
          <h1
            className="text-2xl font-black tracking-tight"
            style={{
              color: "var(--text-1)",
              fontFamily: "var(--font-head, sans-serif)",
            }}
          >
            Admin Dashboard
          </h1>
          <p
            className="text-sm mt-1.5"
            style={{
              color: "var(--text-3)",
              fontFamily: "var(--font-head, sans-serif)",
            }}
          >
            Seating management for MUJ AIML Department
          </p>
        </div>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">
          <input
            type="password"
            placeholder="Enter admin password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none transition-shadow"
            style={{
              border: "2px solid var(--card-border)",
              background: "var(--input-bg)",
              color: "var(--text-1)",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
            }}
          />
          <AnimatePresence>
            {error && (
              <motion.p
                className="text-xs font-bold text-red-500"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
          <motion.button
            type="submit"
            disabled={loading || !password}
            className="pill-btn w-full mt-1 py-3"
            style={{ background: "var(--text-1)", color: "var(--bg)" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? (
              <Loader2 size={16} className="anim-spin" />
            ) : (
              "Unlock Dashboard"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
