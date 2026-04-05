"use client";

import { useState, useRef, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchBarProps {
    onSearch: (regNo: string) => void;
    isLoading?: boolean;
}

export default function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
    const [value, setValue] = useState("");
    const [focused, setFocused] = useState(false);

    const handleSubmit = useCallback(() => {
        if (value.trim()) onSearch(value.trim());
    }, [value, onSearch]);

    return (
        <div className="w-full">
            <label
                htmlFor="reg-input"
                className="block text-[10px] font-semibold tracking-[0.2em] mb-2 uppercase"
                style={{ color: "var(--text-3)", fontFamily: "var(--font-head)" }}
            >
                MUJ Registration No.
            </label>

            <motion.div
                className="flex items-center gap-2 rounded-2xl p-1.5"
                style={{
                    background: "var(--input-bg)",
                    border: focused
                        ? "1.5px solid var(--brand)"
                        : "1.5px solid var(--border)",
                    boxShadow: focused ? "0 0 0 4px rgba(16, 185, 129,0.12)" : "none",
                    transition: "border-color 0.25s, box-shadow 0.25s",
                }}
                animate={focused ? { scale: 1.01 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
            >
                <input
                    id="reg-input"
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="e.g. 23FE10CAI00019"
                    maxLength={14}
                    autoComplete="off"
                    spellCheck={false}
                    className="flex-1 px-3 py-2.5 text-sm bg-transparent border-none outline-none font-mono tracking-wider"
                    style={{
                        color: "var(--text-1)",
                        fontFamily: "var(--font-mono)",
                    }}
                />

                <motion.button
                    onClick={handleSubmit}
                    disabled={isLoading || !value.trim()}
                    className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-[color:var(--primary-inv)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        background: value.trim()
                            ? "linear-gradient(135deg, var(--brand) 0%, var(--brand-dim) 100%)"
                            : "var(--border)",
                        fontFamily: "var(--font-head)",
                    }}
                    whileHover={value.trim() ? { scale: 1.04 } : {}}
                    whileTap={value.trim() ? { scale: 0.95 } : {}}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {isLoading ? (
                            <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <Loader2 size={15} className="animate-spin" />
                            </motion.div>
                        ) : (
                            <motion.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                                <Search size={15} />
                                <span className="hidden sm:inline">Search</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </motion.div>

            {/* Demo chips */}
            <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="text-[10px] tracking-wide" style={{ color: "var(--text-3)", fontFamily: "var(--font-head)" }}>Try:</span>
                {["23FE10CAI00019", "23FE10CAI00524", "23FE10CAI00153"].map((d) => (
                    <button
                        key={d}
                        onClick={() => { setValue(d); onSearch(d); }}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md cursor-pointer badge-brand hover:opacity-80 transition-opacity"
                    >
                        {d}
                    </button>
                ))}
            </div>
        </div>
    );
}
