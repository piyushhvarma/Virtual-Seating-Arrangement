"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, BookOpen, AlertCircle, ArrowRight } from "lucide-react";
import type { StudentInfo } from "@/lib/studentLookup";

export default function StudentTicket({
    student,
    onLocateSeat,
}: {
    student: StudentInfo;
    onLocateSeat: () => void;
}) {
    return (
        <motion.div
            className="glass rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.22)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12, ease: "easeOut" }}
        >
            {/* Gradient top stripe */}
            <div
                className="px-5 py-2 text-center text-[11px] font-bold tracking-[0.2em] uppercase text-[color:var(--primary-inv)]"
                style={{ background: "linear-gradient(90deg, var(--brand) 0%, var(--purple) 50%, var(--blue) 100%)" }}
            >
                {student.examTitle}
            </div>

            <div className="p-5 space-y-4">
                {/* Subject + Date */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                        <span
                            className="badge-brand inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold mb-1.5"
                            style={{ fontFamily: "var(--font-head)" }}
                        >
                            {student.subjectCode}
                        </span>
                        <div className="flex items-center gap-2">
                            <BookOpen size={14} style={{ color: "var(--brand)", flexShrink: 0 }} />
                            <p className="text-lg font-bold leading-snug" style={{ color: "var(--text-1)", fontFamily: "var(--font-head)" }}>
                                {student.subject}
                            </p>
                        </div>
                        <p className="mt-0.5 text-xs" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>
                            Section {student.section} · {student.department}
                        </p>
                    </div>

                    {/* Date badge */}
                    <div
                        className="badge-blue flex-shrink-0 px-4 py-2.5 rounded-xl text-center min-w-[130px]"
                    >
                        <p className="font-bold text-base" style={{ color: "var(--text-1)", fontFamily: "var(--font-head)" }}>
                            {student.examDate}
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-0.5 text-[11px]" style={{ color: "var(--text-3)" }}>
                            <Clock size={10} />
                            <span>{student.examTime}</span>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ borderTop: "1px solid var(--border)" }} />

                {/* Room + Seat */}
                <div className="grid grid-cols-2 gap-3">
                    <div
                        className="rounded-xl p-3.5 flex flex-col gap-0.5"
                        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                    >
                        <div
                            className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.15em] mb-0.5"
                            style={{ color: "var(--text-3)", fontFamily: "var(--font-head)" }}
                        >
                            <MapPin size={10} /> Allocated Room
                        </div>
                        <p
                            className="text-2xl font-black tracking-tight"
                            style={{ color: "var(--text-1)", fontFamily: "var(--font-head)" }}
                        >
                            {student.room}
                        </p>
                    </div>

                    <div
                        className="rounded-xl p-3.5 flex flex-col gap-0.5"
                        style={{
                            background: "rgba(16, 185, 129,0.07)",
                            border: "1px solid rgba(16, 185, 129,0.22)",
                        }}
                    >
                        <div
                            className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.15em] mb-0.5"
                            style={{ color: "var(--brand)", fontFamily: "var(--font-head)" }}
                        >
                            <MapPin size={10} /> Your Seat
                        </div>
                        <p
                            className="text-2xl font-black tracking-tight"
                            style={{ color: "var(--brand)", fontFamily: "var(--font-head)" }}
                        >
                            {student.seatLabel}
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ borderTop: "1px solid var(--border)" }} />

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <div
                            className="flex items-center gap-1 mb-1.5 text-[10px] font-semibold uppercase tracking-widest"
                            style={{ color: "var(--text-3)", fontFamily: "var(--font-head)" }}
                        >
                            <AlertCircle size={10} /> Instructions
                        </div>
                        <ul className="text-xs space-y-0.5" style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}>
                            <li>· Report 15 mins early</li>
                            <li>· Carry your ID Card</li>
                            <li>· No electronic devices</li>
                        </ul>
                    </div>

                    <motion.button
                        onClick={onLocateSeat}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[color:var(--primary-inv)] cursor-pointer glow-brand flex-shrink-0"
                        style={{
                            background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-dim) 100%)",
                            fontFamily: "var(--font-head)",
                        }}
                        whileHover={{ scale: 1.04, boxShadow: "0 0 32px rgba(16, 185, 129,0.55)" }}
                        whileTap={{ scale: 0.96 }}
                    >
                        <MapPin size={15} />
                        Locate My Seat
                        <ArrowRight size={13} />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
