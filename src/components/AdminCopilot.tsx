"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot } from "lucide-react";
import { useAdmin } from "@/providers/AdminProvider";

export function AdminCopilot() {
    const { token, yearLabel } = useAdmin();
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const { messages, status, sendMessage } = useChat({
        // @ts-expect-error bypass SDK config signature bug
        api: "/api/chat",
        fetch: async (url: any, options: any) => {
            const reqHeaders = new Headers(options?.headers);
            reqHeaders.set("Authorization", `Bearer ${token}`);
            return fetch(url, { ...options, headers: reqHeaders });
        },
    });

    const isLoading = status === "submitted" || status === "streaming";

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;
        sendMessage({ text: inputValue });
        setInputValue("");
    };

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all flex items-center justify-center"
                style={{ background: "#8b5cf6", color: "#fff" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                title="Admin Copilot"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed bottom-24 right-6 z-50 w-80 sm:w-[400px] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                        style={{
                            height: "550px",
                            maxHeight: "80vh",
                            background: "var(--card-bg)",
                            border: "1px solid var(--card-border)",
                        }}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    >
                        {/* Header */}
                        <div
                            className="p-4 flex items-center justify-between shadow-sm"
                            style={{ background: "linear-gradient(135deg, #8b5cf6, #a855f7)", color: "#fff" }}
                        >
                            <div className="flex items-center gap-2">
                                <Bot size={22} />
                                <div>
                                    <h3 className="font-black text-sm" style={{ fontFamily: "var(--font-head)" }}>
                                        Admin Copilot
                                    </h3>
                                    <p className="text-[10px] opacity-80 font-semibold uppercase tracking-wider">
                                        Context: {yearLabel}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center mt-12">
                                    <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3" style={{ background: "rgba(139,92,246,0.1)" }}>
                                        <Bot size={28} style={{ color: "#8b5cf6" }} />
                                    </div>
                                    <p className="text-sm font-black mb-1" style={{ color: "var(--text-1)" }}>
                                        Ready to Assist
                                    </p>
                                    <p className="text-xs font-semibold" style={{ color: "var(--text-3)" }}>
                                        I can help you coordinate exams, navigate the dashboard, and manage configurations.
                                    </p>
                                </div>
                            )}
                            {messages.map((m: any) => (
                                <div
                                    key={m.id}
                                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] px-4 py-2.5 text-sm ${m.role === "user"
                                            ? "rounded-2xl rounded-tr-none"
                                            : "rounded-2xl rounded-tl-none"
                                            }`}
                                        style={{
                                            background: m.role === "user" ? "#8b5cf6" : "var(--badge-light-bg)",
                                            color: m.role === "user" ? "#fff" : "var(--text-1)",
                                            border: m.role === "assistant" ? "1px solid var(--border)" : "none",
                                            boxShadow: m.role === "user" ? "0 4px 14px 0 rgba(139,92,246,0.39)" : "none"
                                        }}
                                    >
                                        <div
                                            className="whitespace-pre-wrap leading-relaxed font-semibold text-[13px]"
                                            // Applying subtle styling to markdown-like lists if needed
                                            dangerouslySetInnerHTML={{
                                                __html: (m.content || m.text || "") // <-- FALLBACK FOR TEXT IF AI SDK USED m.text 
                                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                    .replace(/\n\s*-\s/g, '<br/>• ') // Basic list bullet
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div
                                        className="max-w-[85%] rounded-2xl rounded-tl-none px-4 py-3"
                                        style={{ background: "var(--badge-light-bg)", border: "1px solid var(--border)" }}
                                    >
                                        <div className="flex items-center gap-1.5 opacity-60">
                                            <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0.15s" }} />
                                            <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0.3s" }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]"
                            style={{ background: "var(--card-bg)" }}
                        >
                            <div
                                className="flex items-center gap-2 px-4 py-2 rounded-2xl transition-all"
                                style={{
                                    background: "var(--input-bg)",
                                    border: "2px solid var(--card-border)",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.02) inset"
                                }}
                            >
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    placeholder="Ask Admin Copilot..."
                                    className="flex-1 bg-transparent py-1.5 text-sm font-semibold focus:outline-none placeholder:opacity-50"
                                    style={{ color: "var(--text-1)" }}
                                />
                                <button
                                    type="submit"
                                    disabled={!(inputValue || "").trim() || isLoading}
                                    className="p-1.5 rounded-lg transition-transform hover:scale-105"
                                    style={{
                                        color: (inputValue || "").trim() && !isLoading ? "#8b5cf6" : "var(--text-3)",
                                        opacity: (inputValue || "").trim() && !isLoading ? 1 : 0.4,
                                    }}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
