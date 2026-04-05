"use client";

import { motion } from "framer-motion";
import { Cpu, Wifi } from "lucide-react";
import type { StudentInfo } from "@/lib/studentLookup";

function initials(name: string) {
    return name.split(" ").slice(0, 2).map((w) => w[0]).join("");
}

export default function StudentCard({ student }: { student: StudentInfo }) {
    return (
        <motion.div
            className="glass rounded-2xl p-5 flex items-center gap-4"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
        >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
                <div
                    className="w-13 h-13 rounded-full flex items-center justify-center text-[color:var(--primary-inv)] font-bold text-base"
                    style={{
                        width: 52, height: 52,
                        background: "linear-gradient(135deg, var(--brand), var(--purple))",
                        fontFamily: "var(--font-head)",
                    }}
                >
                    {initials(student.name)}
                </div>
                <span
                    className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2"
                    style={{ background: "#34d399", borderColor: "var(--bg)" }}
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p
                    className="font-bold text-base uppercase tracking-widest truncate"
                    style={{ color: "var(--text-1)", fontFamily: "var(--font-head)" }}
                >
                    {student.name}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className="badge-brand inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono">
                        {student.regNo}
                    </span>
                    <span className="badge-purple inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold" style={{ fontFamily: "var(--font-head)" }}>
                        {student.examTitle}
                    </span>
                </div>
            </div>

            {/* AIML chip */}
            <div className="hidden sm:flex flex-col items-center gap-1 flex-shrink-0">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center glow-blue"
                    style={{ background: "linear-gradient(135deg, var(--blue), var(--purple))" }}
                >
                    <Cpu size={16} className="text-[color:var(--primary-inv)]" />
                </div>
                <span className="text-[9px] font-bold tracking-widest" style={{ color: "var(--text-3)", fontFamily: "var(--font-head)" }}>AIML</span>
            </div>
        </motion.div>
    );
}
