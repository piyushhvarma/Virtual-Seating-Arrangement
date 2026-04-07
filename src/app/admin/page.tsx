"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowLeft, Database, Users, ShieldAlert, CheckCircle2, Server } from "lucide-react";
import Link from "next/link";
import { AnimatedThemeToggler } from "@/components/AnimatedThemeToggler";
import { useTheme } from "next-themes";
import Image from "next/image";

type AdminStats = {
    totalRecords: number;
    allocatedSeats: number;
    pendingProfiles: number;
    totalExamTickets: number;
    examMeta: any;
};

export default function AdminPage() {
    const [password, setPassword] = useState("");
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [stats, setStats] = useState<AdminStats | null>(null);

    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password })
            });

            const data = await res.json();
            
            if (data.success) {
                setStats(data.stats);
                setIsAuth(true);
            } else {
                setError(data.error || "Authentication failed");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-dvh flex flex-col items-center px-4 py-8 sm:py-14" style={{ background: "var(--bg)" }}>
            {/* Top Bar */}
            <div className="absolute top-0 left-0 w-full z-20 flex items-center justify-between px-4 sm:px-6 pt-4">
                <Link href="/" className="pill-btn flex items-center gap-1.5" style={{ background: "var(--card-bg)", color: "var(--text-1)", border: "2px solid var(--card-border)", padding: "8px 16px" }}>
                    <ArrowLeft size={14} /> Back to Search
                </Link>
                <AnimatedThemeToggler
                    className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    style={{ border: "2px solid var(--card-border)", background: "var(--card-bg)" }}
                />
            </div>

            <div className="w-full max-w-2xl flex flex-col items-center gap-6 mt-12 z-10">
                <AnimatePresence mode="wait">
                    {!isAuth ? (
                        <motion.div key="login" className="card p-6 w-full max-w-sm mx-auto flex flex-col gap-5 items-center text-center"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}>
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-50"
                                style={{ border: "2px solid var(--card-border)", background: "var(--card-bg)" }}>
                                <Lock size={24} style={{ color: "var(--text-1)" }} />
                            </div>
                            
                            <div>
                                <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--text-1)", fontFamily: "var(--font-head, sans-serif)" }}>Admin Gateway</h1>
                                <p className="text-sm mt-1" style={{ color: "var(--text-3)", fontFamily: "var(--font-head, sans-serif)" }}>Identify yourself to access the core DB.</p>
                            </div>

                            <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">
                                <input
                                    type="password"
                                    placeholder="Enter master password..."
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none transition-shadow"
                                    style={{
                                        border: "2px solid var(--card-border)",
                                        background: "var(--input-bg)",
                                        color: "var(--text-1)",
                                        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
                                    }}
                                />
                                {error && <p className="text-xs font-bold text-red-500">{error}</p>}
                                <button type="submit" disabled={loading} className="pill-btn w-full mt-2 py-3" style={{ background: "var(--text-1)", color: "var(--bg)" }}>
                                    {loading ? "Decrypting..." : "Unlock Dashboard"}
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div key="dashboard" className="w-full flex flex-col gap-8"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            
                            <div className="text-center space-y-2 mb-2">
                                <span className="badge-dark mx-auto w-max px-3 py-1 text-xs">Vercel Root Server</span>
                                <h1 className="text-4xl font-black" style={{ color: "var(--text-1)", fontFamily: "var(--font-head, sans-serif)" }}>System Metrics</h1>
                                <p className="text-sm font-semibold" style={{ color: "var(--text-3)" }}>Live database health and orchestration status.</p>
                            </div>

                            {/* Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="card p-5 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 mb-2" style={{ color: "var(--text-2)" }}>
                                        <Users size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Total Master Records</span>
                                    </div>
                                    <p className="text-4xl font-black" style={{ color: "var(--text-1)", fontFamily: "var(--font-head, sans-serif)" }}>
                                        {stats?.totalRecords?.toLocaleString()}
                                    </p>
                                </div>

                                <div className="card p-5 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 mb-2" style={{ color: "var(--text-2)" }}>
                                        <Database size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Aggregated Exam Tickets</span>
                                    </div>
                                    <p className="text-4xl font-black" style={{ color: "var(--text-1)", fontFamily: "var(--font-head, sans-serif)" }}>
                                        {stats?.totalExamTickets?.toLocaleString()}
                                    </p>
                                </div>

                                <div className="card p-5 flex flex-col gap-2" style={{ borderColor: "#10b981" }}>
                                    <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Seated Students</span>
                                    </div>
                                    <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400" style={{ fontFamily: "var(--font-head, sans-serif)" }}>
                                        {stats?.allocatedSeats?.toLocaleString()}
                                    </p>
                                    <p className="text-xs font-bold text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                                        Profiles with ≥ 1 allocated exam payload
                                    </p>
                                </div>

                                <div className="card p-5 flex flex-col gap-2" style={{ borderColor: "#f59e0b" }}>
                                    <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400">
                                        <ShieldAlert size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Pending Datasets</span>
                                    </div>
                                    <p className="text-4xl font-black text-amber-600 dark:text-amber-400" style={{ fontFamily: "var(--font-head, sans-serif)" }}>
                                        {stats?.pendingProfiles?.toLocaleString()}
                                    </p>
                                    <p className="text-xs font-bold text-amber-600/70 dark:text-amber-400/70 mt-1">
                                        Awaiting internal allocation ingestions
                                    </p>
                                </div>
                            </div>
                            
                            <div className="card p-4 mt-2 flex flex-wrap gap-4 items-center justify-between text-xs font-bold" style={{ color: "var(--text-2)", fontFamily: "var(--font-mono, monospace)" }}>
                                <div className="flex items-center gap-2">
                                    <Server size={14} /> ACTIVE META: [{stats?.examMeta?.title}]
                                </div>
                                <div className="flex gap-2">
                                    <span className="badge-light">SECURE CONTEXT</span>
                                    <button onClick={() => { setIsAuth(false); setPassword(""); setStats(null); }} className="px-2 py-0.5 hover:underline" style={{ color: "var(--text-1)" }}>Terminate Session</button>
                                </div>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
