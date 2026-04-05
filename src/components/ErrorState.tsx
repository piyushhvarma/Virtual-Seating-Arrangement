"use client";

import { motion } from "framer-motion";
import { SearchX, AlertTriangle } from "lucide-react";
import type { LookupError } from "@/lib/studentLookup";

export default function ErrorState({ error }: { error: LookupError }) {
    return (
        <motion.div
            className="glass rounded-2xl p-8 text-center"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
        >
            <motion.div
                animate={{ x: [0, -7, 7, -7, 7, 0] }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="flex justify-center mb-4"
            >
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                        background: error.type === "NOT_FOUND" ? "rgba(239,68,68,0.1)" : "rgba(234,179,8,0.1)",
                        border: error.type === "NOT_FOUND" ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(234,179,8,0.3)",
                    }}
                >
                    {error.type === "NOT_FOUND"
                        ? <SearchX size={26} style={{ color: "#f87171" }} />
                        : <AlertTriangle size={26} style={{ color: "#fde047" }} />
                    }
                </div>
            </motion.div>

            <h3
                className="text-base font-bold mb-1.5"
                style={{ color: "var(--text-1)", fontFamily: "var(--font-head)" }}
            >
                {error.type === "NOT_FOUND" ? "Student Not Found" : "Invalid Format"}
            </h3>
            <p className="text-sm max-w-xs mx-auto" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>
                {error.message}
            </p>

            {error.type === "NOT_FOUND" && (
                <p className="mt-4 text-xs" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>
                    Try:{" "}
                    <code
                        className="px-1.5 py-0.5 rounded font-mono"
                        style={{ background: "rgba(16, 185, 129,0.1)", color: "var(--brand)" }}
                    >
                        23FE10CAI00019
                    </code>
                </p>
            )}
        </motion.div>
    );
}
