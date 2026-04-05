"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return <div className="fixed top-5 right-5 z-50 w-10 h-10 rounded-full glass" />;

    const isDark = theme === "dark";

    return (
        <motion.button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="fixed top-5 right-5 z-50 w-10 h-10 rounded-full glass flex items-center justify-center cursor-pointer"
            style={{ border: "1px solid var(--border)" }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle theme"
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={isDark ? "dark" : "light"}
                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.22 }}
                >
                    {isDark
                        ? <Sun size={17} style={{ color: "var(--brand)" }} />
                        : <Moon size={17} style={{ color: "var(--purple)" }} />
                    }
                </motion.div>
            </AnimatePresence>
        </motion.button>
    );
}
