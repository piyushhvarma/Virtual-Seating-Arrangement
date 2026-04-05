"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, GraduationCap } from "lucide-react";
import { parseSeatLabel } from "@/lib/getSeatCoordinates";

interface SeatMapProps {
    rows: number;
    cols: number;
    targetSeat: string;
    room: string;
}

export default function SeatMap({ rows, cols, targetSeat, room }: SeatMapProps) {
    const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);
    const { row: tr, col: tc } = parseSeatLabel(targetSeat);

    return (
        <motion.div
            className="glass rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.22)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
        >
            {/* Header */}
            <div className="px-5 pt-5 pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <h2 className="text-xl font-black" style={{ color: "var(--text-1)", fontFamily: "var(--font-head)" }}>
                            {room}
                        </h2>
                        <p className="text-xs" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>
                            Interactive Seat Map
                        </p>
                    </div>
                    <div
                        className="badge-brand anim-pulse flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
                        style={{ fontFamily: "var(--font-head)" }}
                    >
                        <MapPin size={13} />
                        {targetSeat}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-3 text-[11px]" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "var(--brand)" }}>
                            <MapPin size={9} className="text-[color:var(--primary-inv)]" />
                        </div>
                        Your Seat
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }} />
                        Other Seats
                    </div>
                </div>
            </div>

            {/* Front of room */}
            <div className="px-5 pb-2 flex justify-center">
                <div
                    className="badge-blue px-6 py-1.5 rounded-xl text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5"
                    style={{ fontFamily: "var(--font-head)" }}
                >
                    <GraduationCap size={11} />
                    Invigilator Desk · Front of Room
                </div>
            </div>

            {/* Grid */}
            <div className="px-5 pb-5 pt-3">
                <div
                    className="rounded-xl p-3 overflow-auto"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                >
                    <div
                        className="grid gap-1.5"
                        style={{
                            gridTemplateColumns: `repeat(${cols}, minmax(46px, 1fr))`,
                            minWidth: `${cols * 54}px`,
                        }}
                    >
                        {Array.from({ length: rows }).map((_, rIdx) =>
                            Array.from({ length: cols }).map((_, cIdx) => {
                                const r = rIdx + 1;
                                const c = cIdx + 1;
                                const label = `R${r}C${c}`;
                                const isTarget = r === tr && c === tc;
                                const isHov = hoveredSeat === label;

                                return (
                                    <div
                                        key={label}
                                        className="seat-cell"
                                        onMouseEnter={() => setHoveredSeat(label)}
                                        onMouseLeave={() => setHoveredSeat(null)}
                                    >
                                        {isTarget ? (
                                            <motion.div
                                                className="w-full h-full rounded-lg flex flex-col items-center justify-center text-[color:var(--primary-inv)] relative"
                                                style={{
                                                    background: "linear-gradient(135deg, var(--brand), var(--brand-dim))",
                                                    aspectRatio: "1",
                                                }}
                                                animate={{
                                                    boxShadow: [
                                                        "0 0 0 0px rgba(16, 185, 129,0.7)",
                                                        "0 0 0 8px rgba(16, 185, 129,0)",
                                                        "0 0 0 0px rgba(16, 185, 129,0)",
                                                    ],
                                                }}
                                                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                                            >
                                                <MapPin size={16} className="text-[color:var(--primary-inv)]" />
                                                <motion.span
                                                    className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold whitespace-nowrap"
                                                    style={{ color: "var(--brand)", fontFamily: "var(--font-head)" }}
                                                    animate={{ opacity: [1, 0.5, 1] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                >
                                                    {label}
                                                </motion.span>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                className="w-full h-full rounded-lg flex items-center justify-center relative"
                                                style={{
                                                    aspectRatio: "1",
                                                    background: "var(--surface-2)",
                                                    border: "1px solid var(--border)",
                                                }}
                                                whileHover={{ scale: 1.1 }}
                                                transition={{ duration: 0.12 }}
                                            >
                                                <span className="text-[9px] font-mono" style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                                                    {label}
                                                </span>

                                                <AnimatePresence>
                                                    {isHov && (
                                                        <motion.div
                                                            className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-[9px] font-bold text-[color:var(--primary-inv)] whitespace-nowrap z-20 pointer-events-none"
                                                            style={{ background: "#1a1a30", border: "1px solid #333360", fontFamily: "var(--font-mono)" }}
                                                            initial={{ opacity: 0, y: 4 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: 4 }}
                                                        >
                                                            {label}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <p className="mt-3 text-center text-[11px]" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>
                    Please verify the room number and block before entering.
                </p>
            </div>
        </motion.div>
    );
}
