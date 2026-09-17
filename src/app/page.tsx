"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Loader2, MapPin, Clock, BookOpen,
  ArrowRight, ArrowLeft, Heart, Flame, Sparkles,
  ChevronDown, ChevronUp, GraduationCap, Cpu, Check,
  SearchX, AlertTriangle, ShieldCheck, Award, Zap, History
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePostHog } from "posthog-js/react";

import { lookupStudent, type StudentInfo, type LookupError } from "@/lib/studentLookup";
import { parseSeatLabel } from "@/lib/getSeatCoordinates";
import { FlickeringGrid } from "@/components/FlickeringGrid";
import { AnimatedThemeToggler } from "@/components/AnimatedThemeToggler";

function Background() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" style={{ minHeight: "100dvh" }}>
      <FlickeringGrid
        className="absolute inset-0 w-full h-full"
        squareSize={4}
        gridGap={6}
        color={isDark ? "#ffffff" : "#000000"}
        maxOpacity={isDark ? 0.08 : 0.05}
        flickerChance={0.03}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   FLOATING PARTICLES ON UPVOTE
──────────────────────────────────────────────────────── */
function VoteParticles({ triggerKey }: { triggerKey: number }) {
  if (triggerKey === 0) return null;

  const particles = Array.from({ length: 12 });
  const symbols = ["❤️", "🔥", "🕊️", "✨", "❤️", "⚡"];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center">
      {particles.map((_, i) => {
        const angle = (i / particles.length) * 2 * Math.PI;
        const radius = 60 + Math.random() * 50;
        const destX = Math.cos(angle) * radius;
        const destY = Math.sin(angle) * radius - 40;
        const symbol = symbols[i % symbols.length];

        return (
          <motion.span
            key={`${triggerKey}-${i}`}
            className="absolute text-lg select-none"
            initial={{ opacity: 1, scale: 0.4, x: 0, y: 0 }}
            animate={{
              opacity: [1, 1, 0],
              scale: [0.4, 1.3, 0.8],
              x: destX,
              y: destY,
              rotate: (Math.random() - 0.5) * 60,
            }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            {symbol}
          </motion.span>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   UPVOTE CARD COMPONENT
──────────────────────────────────────────────────────── */
function UpvoteSection() {
  const [count, setCount] = useState<number>(412);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [burstKey, setBurstKey] = useState<number>(0);
  const posthog = usePostHog();

  useEffect(() => {
    // Check if user already voted in local storage
    const voted = localStorage.getItem("has_voted_primary_portal");
    if (voted === "true") {
      setHasVoted(true);
    }

    // Fetch live count from API
    fetch("/api/upvote")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && typeof data.count === "number") {
          setCount(data.count);
        }
      })
      .catch(() => {});
  }, []);

  const handleVote = async () => {
    if (hasVoted || isSubmitting) return;

    setIsSubmitting(true);
    // Optimistic increment
    setCount((prev) => prev + 1);
    setHasVoted(true);
    setBurstKey((prev) => prev + 1);
    localStorage.setItem("has_voted_primary_portal", "true");

    try {
      posthog?.capture("portal_upvote_clicked", { previousCount: count });
      const res = await fetch("/api/upvote", { method: "POST" });
      const data = await res.json();
      if (data.success && typeof data.count === "number") {
        setCount(data.count);
      }
    } catch (err) {
      console.error("Upvote error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="card p-6 sm:p-8 w-full relative overflow-hidden text-center"
      style={{
        border: "2.5px solid var(--card-border)",
        background: "var(--card-bg)",
        boxShadow: "var(--card-shadow)",
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <VoteParticles triggerKey={burstKey} />

      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="badge-dark px-3 py-1 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Flame size={13} className="text-amber-400" /> Student Voice Poll
        </span>
      </div>

      <h2
        className="text-2xl sm:text-3xl font-black mb-2 tracking-tight"
        style={{ fontFamily: "var(--font-head, sans-serif)", color: "var(--text-1)" }}
      >
        Should this website remain our primary go-to exam portal?
      </h2>

      <p className="text-xs sm:text-sm max-w-md mx-auto mb-6" style={{ color: "var(--text-2)" }}>
        The department built their own system, but if you want this student-made portal to be the primary portal for upcoming exams, cast your upvote.
      </p>

      {/* Upvote Button */}
      <div className="flex flex-col items-center gap-3">
        <motion.button
          onClick={handleVote}
          disabled={hasVoted || isSubmitting}
          className="relative group px-7 py-3.5 rounded-full font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-all duration-300"
          style={{
            background: hasVoted ? "rgba(16, 185, 129, 0.15)" : "var(--pill-bg)",
            color: hasVoted ? "#10b981" : "var(--pill-text)",
            border: hasVoted ? "2.5px solid #10b981" : "2.5px solid var(--card-border)",
            cursor: hasVoted ? "default" : "pointer",
            boxShadow: hasVoted ? "none" : "var(--card-shadow-sm)",
          }}
          whileHover={!hasVoted ? { scale: 1.04 } : {}}
          whileTap={!hasVoted ? { scale: 0.96 } : {}}
        >
          {hasVoted ? (
            <>
              <Check size={20} className="text-emerald-500 animate-bounce" />
              <span>You Upvoted! Thank You ❤️</span>
              <span className="badge-dark px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500 text-black">
                {count.toLocaleString()}
              </span>
            </>
          ) : (
            <>
              <motion.span
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Heart size={18} className="fill-red-500 text-red-500" />
              </motion.span>
              <span>Upvote for This Portal</span>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold"
                style={{ background: "rgba(255,255,255,0.2)", color: "inherit" }}
              >
                {count.toLocaleString()}
              </span>
            </>
          )}
        </motion.button>

        <p className="text-[11px] font-medium" style={{ color: "var(--text-3)" }}>
          {hasVoted
            ? "Your support is recorded! Share this link with your batchmates so our voice is heard."
            : "One click to vote. Stored instantly in the hall of fame."}
        </p>
      </div>

      {/* Progress / Backing bar */}
      <div className="mt-6 pt-5 border-t border-dashed" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
          <span>Support Tally</span>
          <span className="font-mono text-emerald-500 font-bold">{count.toLocaleString()} Student Backers</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500"
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min(100, Math.max(15, (count / 600) * 100))}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────
   SEARCH BAR COMPONENT
──────────────────────────────────────────────────────── */
function SearchBar({ onSearch, isLoading }: { onSearch: (r: string) => void; isLoading: boolean }) {
  const [val, setVal] = useState("");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const savedReg = localStorage.getItem("last_searched_reg");
    if (savedReg) {
      setVal(savedReg);
    }
  }, []);

  const submit = useCallback(() => {
    const trimmed = val.trim();
    if (trimmed) {
      localStorage.setItem("last_searched_reg", trimmed);
      onSearch(trimmed);
    }
  }, [val, onSearch]);

  return (
    <div className="w-full">
      <label
        htmlFor="reg-input"
        className="block text-[11px] font-bold tracking-[0.15em] mb-2 uppercase"
        style={{ color: "var(--text-3)", fontFamily: "var(--font-head, sans-serif)" }}
      >
        Registration Number
      </label>

      <div
        className="flex items-center gap-2 rounded-2xl p-1.5 transition-all duration-200"
        style={{
          background: "var(--input-bg)",
          border: focused ? "2px solid var(--card-border)" : "2px solid var(--input-border)",
          boxShadow: focused ? "var(--card-shadow-sm)" : "none",
        }}
      >
        <input
          id="reg-input"
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="e.g. 23FE10CAI00019"
          maxLength={14}
          autoComplete="off"
          spellCheck={false}
          className="flex-1 px-3 py-2 text-sm bg-transparent border-none outline-none tracking-wider"
          style={{ color: "var(--text-1)", fontFamily: "var(--font-mono, monospace)" }}
        />
        <motion.button
          onClick={submit}
          disabled={isLoading || !val.trim()}
          className="pill-btn text-[13px] px-5 py-2.5"
          whileHover={val.trim() ? { scale: 1.03 } : {}}
          whileTap={val.trim() ? { scale: 0.95 } : {}}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isLoading ? (
              <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Loader2 size={15} className="anim-spin" />
              </motion.div>
            ) : (
              <motion.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                <Search size={15} />
                <span className="hidden sm:inline">Search</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2.5 items-center">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
          Quick Prefix:
        </span>
        {["23FE10CAI00"].map((prefix) => (
          <button
            key={prefix}
            onClick={() => {
              setVal(prefix);
              document.getElementById("reg-input")?.focus();
            }}
            className="badge-dark px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer hover:opacity-70 transition-opacity"
          >
            {prefix}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   STUDENT TICKET
──────────────────────────────────────────────────────── */
function StudentTicket({
  student,
  onLocate,
  hideLocate,
}: {
  student: StudentInfo;
  onLocate?: () => void;
  hideLocate?: boolean;
}) {
  const initials = student.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <motion.div
      className="card overflow-hidden w-full text-left"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div
        className="px-5 py-2.5 text-center text-[11px] font-bold tracking-[0.18em] uppercase"
        style={{
          background: "var(--pill-bg)",
          color: "var(--pill-text)",
          fontFamily: "var(--font-head, sans-serif)",
          borderBottom: "var(--card-border-w) solid var(--card-border)",
        }}
      >
        {student.examTitle}
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-black text-base"
            style={{
              background: "var(--pill-bg)",
              color: "var(--pill-text)",
              fontFamily: "var(--font-head, sans-serif)",
              border: "2px solid var(--card-border)",
            }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="font-black text-base uppercase tracking-wider truncate"
              style={{ color: "var(--text-1)", fontFamily: "var(--font-head, sans-serif)" }}
            >
              {student.name}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <span className="badge-dark text-[10px] font-mono">{student.regNo}</span>
              <span className="badge-light text-[10px]" style={{ fontFamily: "var(--font-head, sans-serif)" }}>
                Sec {student.section}
              </span>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-center gap-1 flex-shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--pill-bg)", color: "var(--pill-text)", border: "2px solid var(--card-border)" }}
            >
              <Cpu size={16} />
            </div>
            <span className="text-[8px] font-black tracking-widest" style={{ color: "var(--text-3)" }}>
              AIML
            </span>
          </div>
        </div>

        <hr className="dashed-sep my-2" />

        <div className="card-inner p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <BookOpen size={18} style={{ color: "var(--brand)", flexShrink: 0 }} />
            <p
              className="font-black text-base sm:text-lg leading-snug truncate"
              style={{ color: "var(--text-1)", fontFamily: "var(--font-head, sans-serif)" }}
            >
              {student.subject}
            </p>
          </div>
          <span className="badge-brand text-[11px] font-bold flex-shrink-0 px-3 py-1.5">
            {student.subjectCode}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="card-inner p-3 flex flex-col gap-0.5">
            <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest mb-0.5" style={{ color: "var(--text-3)" }}>
              <MapPin size={9} />Room
            </div>
            <p className="text-lg sm:text-xl font-black" style={{ color: "var(--text-1)", fontFamily: "var(--font-head, sans-serif)" }}>
              {student.room}
            </p>
          </div>

          <div
            className="p-3 flex flex-col gap-0.5 anim-pulse"
            style={{
              background: "rgba(16, 185, 129,0.06)",
              border: "2px solid var(--brand)",
              borderRadius: "14px",
            }}
          >
            <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest mb-0.5" style={{ color: "var(--brand)" }}>
              <MapPin size={9} />Seat
            </div>
            <p className="text-lg sm:text-xl font-black" style={{ color: "var(--brand)", fontFamily: "var(--font-head, sans-serif)" }}>
              {student.seatLabel}
            </p>
          </div>

          <div className="card-inner p-3 flex flex-col gap-0.5">
            <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest mb-0.5" style={{ color: "var(--text-3)" }}>
              <Clock size={9} />Date
            </div>
            <p className="text-[11px] sm:text-xs font-black leading-tight truncate" style={{ fontFamily: "var(--font-head, sans-serif)", color: "var(--text-1)" }}>
              {student.examDate}
            </p>
            <p className="text-[9px]" style={{ color: "var(--text-3)" }}>
              {student.examTime}
            </p>
          </div>
        </div>

        <hr className="dashed-sep" />

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <ul className="text-[11px] space-y-0.5 list-none" style={{ color: "var(--text-3)" }}>
            <li>· Report 15 mins before exam</li>
            <li>· Carry your Physical ID Card</li>
            <li>· No mobile devices inside hall</li>
          </ul>
          {!hideLocate && (
            <motion.button
              onClick={onLocate}
              className="pill-btn text-[13px] flex-shrink-0"
              style={{ background: "var(--brand)" }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
            >
              <MapPin size={14} /> Locate Seat <ArrowRight size={12} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────
   SEAT MAP
──────────────────────────────────────────────────────── */
function SeatMap({ rows, cols, targetSeat, room }: { rows: number; cols: number; targetSeat: string; room: string }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const { row: tr, col: tc } = parseSeatLabel(targetSeat);

  return (
    <motion.div
      className="card overflow-hidden w-full text-left"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
    >
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-black" style={{ color: "var(--text-1)", fontFamily: "var(--font-head, sans-serif)" }}>
              {room}
            </h2>
            <p className="text-xs" style={{ color: "var(--text-3)" }}>
              Interactive Hall Map — hover any desk
            </p>
          </div>
          <div
            className="badge-dark anim-pulse flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold"
            style={{ fontFamily: "var(--font-head, sans-serif)", background: "var(--brand)", color: "#fff", borderRadius: "999px" }}
          >
            <MapPin size={12} />
            {targetSeat}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 text-[11px]" style={{ color: "var(--text-3)" }}>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "var(--brand)" }}>
              <MapPin size={9} className="text-white" />
            </div>
            Your Seat
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md" style={{ background: "var(--card-bg)", border: "1.5px solid var(--border)" }} />
            Other Seats
          </div>
        </div>
      </div>

      <div className="px-5 pb-3 flex justify-center">
        <div className="badge-dark px-5 py-1.5 text-[10px] tracking-widest uppercase flex items-center gap-1.5">
          <GraduationCap size={10} />Invigilator Desk · Front
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="card-inner p-3 overflow-auto">
          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(44px, 1fr))`, minWidth: `${cols * 52}px` }}
          >
            {Array.from({ length: rows }).map((_, rIdx) =>
              Array.from({ length: cols }).map((_, cIdx) => {
                const r = rIdx + 1,
                  c = cIdx + 1;
                const label = `R${r}C${c}`;
                const isTarget = r === tr && c === tc;
                return (
                  <div key={label} className="seat-cell" onMouseEnter={() => setHovered(label)} onMouseLeave={() => setHovered(null)}>
                    {isTarget ? (
                      <motion.div
                        className="w-full h-full rounded-lg flex flex-col items-center justify-center relative"
                        style={{ background: "var(--brand)", border: "2px solid var(--card-border)" }}
                        animate={{ boxShadow: ["0 0 0 0px rgba(16, 185, 129,0.7)", "0 0 0 8px rgba(16, 185, 129,0)", "0 0 0 0px rgba(16, 185, 129,0)"] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                      >
                        <MapPin size={14} className="text-white" />
                      </motion.div>
                    ) : (
                      <motion.div
                        className="w-full h-full rounded-lg flex items-center justify-center relative"
                        style={{ background: "var(--card-bg)", border: "1.5px solid var(--border)" }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.1 }}
                      >
                        <span className="text-[8px]" style={{ color: "var(--text-3)", fontFamily: "var(--font-mono, monospace)" }}>
                          {label}
                        </span>
                        <AnimatePresence>
                          {hovered === label && (
                            <motion.div
                              className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-[8px] font-bold z-20 pointer-events-none whitespace-nowrap"
                              style={{ background: "var(--pill-bg)", color: "var(--pill-text)", fontFamily: "var(--font-mono, monospace)" }}
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
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────
   ERROR STATE
──────────────────────────────────────────────────────── */
function ErrorState({ error }: { error: LookupError }) {
  return (
    <motion.div
      className="card p-8 text-center w-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-center mb-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: error.type === "NOT_FOUND" ? "rgba(239,68,68,0.06)" : "rgba(234,179,8,0.06)",
            border: `2px solid ${error.type === "NOT_FOUND" ? "rgba(239,68,68,0.3)" : "rgba(234,179,8,0.3)"}`,
          }}
        >
          {error.type === "NOT_FOUND" ? (
            <SearchX size={26} style={{ color: "#ef4444" }} />
          ) : (
            <AlertTriangle size={26} style={{ color: "#eab308" }} />
          )}
        </div>
      </div>
      <h3 className="text-base font-bold mb-1.5" style={{ color: "var(--text-1)", fontFamily: "var(--font-head, sans-serif)" }}>
        {error.type === "NOT_FOUND" ? "Student Not Found" : "Invalid Format"}
      </h3>
      <p className="text-sm max-w-xs mx-auto" style={{ color: "var(--text-3)" }}>
        {error.message}
      </p>
      {error.type === "NOT_FOUND" && (
        <p className="mt-4 text-xs" style={{ color: "var(--text-3)" }}>
          Try sample: <code className="badge-light text-[11px]" style={{ fontFamily: "monospace", color: "var(--brand)" }}>23FE10CAI00019</code>
        </p>
      )}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────
   MAIN PAGE
──────────────────────────────────────────────────────── */
type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "found"; name: string; data: StudentInfo[] }
  | { status: "error"; error: LookupError };

export default function Page() {
  const [state, setState] = useState<SearchState>({ status: "idle" });
  const [selectedExam, setSelectedExam] = useState<StudentInfo | null>(null);
  const [showArchiveSearch, setShowArchiveSearch] = useState<boolean>(false);
  const seatMapRef = useRef<HTMLDivElement>(null);
  const archiveSearchRef = useRef<HTMLDivElement>(null);
  const posthog = usePostHog();

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSearch = useCallback(
    async (regNo: string) => {
      setState({ status: "loading" });
      const result = await lookupStudent(regNo);

      if (result.success) {
        posthog?.identify(regNo, { name: result.name });
        posthog?.capture("student_search_success", {
          regNo,
          name: result.name,
          exam_count: result.data.length,
        });
      } else {
        posthog?.capture("student_search_fail", {
          regNo,
          error_type: result.error.type,
          error_message: result.error.message,
        });
      }

      setState(
        result.success
          ? { status: "found", name: result.name, data: result.data }
          : { status: "error", error: result.error }
      );
      setSelectedExam(null);
    },
    [posthog]
  );

  const handleLocate = useCallback(
    (exam: StudentInfo) => {
      posthog?.capture("seat_located", {
        subject: exam.subject,
        room: exam.room,
        seat: exam.seatLabel,
      });
      setSelectedExam(exam);
      setTimeout(() => {
        seatMapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    },
    [posthog]
  );

  const toggleArchive = () => {
    setShowArchiveSearch((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          archiveSearchRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
      return next;
    });
  };

  return (
    <div className="relative min-h-dvh" style={{ background: "var(--bg)" }}>
      <Background />

      {/* ── Top Navigation Bar ── */}
      <div className="relative z-20 flex items-center justify-between px-4 sm:px-8 pt-5">
        <div className="relative flex-shrink-0 min-w-[150px] min-h-[34px] flex items-center gap-3">
          {mounted && (
            <Image
              src={resolvedTheme === "dark" ? "/muj-logo-darkmode-removebg-preview.png" : "/muj-logo.svg"}
              alt="MUJ Logo"
              width={140}
              height={32}
              className="object-contain"
              priority
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          <div
            className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full"
            style={{
              background: "var(--card-bg)",
              border: "1.5px solid var(--border)",
              color: "var(--text-3)",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            Project Sunset · Final Chapter
          </div>

          <AnimatedThemeToggler
            className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
            style={{ border: "2px solid var(--card-border)", background: "var(--card-bg)" }}
          />
        </div>
      </div>

      {/* ── Main Container ── */}
      <div className="relative z-10 flex flex-col items-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-2xl flex flex-col items-center gap-8">

          {/* ── MEMORIAL HERO ── */}
          <div className="text-center space-y-4 max-w-xl">
            {/* Rest in Peace Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-sm"
              style={{
                background: "rgba(244, 63, 94, 0.1)",
                color: "#f43f5e",
                border: "2px solid rgba(244, 63, 94, 0.3)",
                fontFamily: "var(--font-head, sans-serif)",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span>🕊️</span>
              <span>REST IN PEACE · 2024 — 2026</span>
              <span>🕊️</span>
            </motion.div>

            {/* Giant REST IN PEACE Headline */}
            <motion.h1
              className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.02]"
              style={{ fontFamily: "var(--font-head, 'Space Grotesk', sans-serif)", color: "var(--text-1)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              REST IN PEACE
            </motion.h1>

            <motion.p
              className="text-base sm:text-xl font-bold tracking-tight"
              style={{ color: "var(--text-2)", fontFamily: "var(--font-head, sans-serif)" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
            >
              This project is done since the department has built their own thing.
              <br className="hidden sm:inline" />
              <span className="text-rose-500 font-black"> So here I end.</span>
            </motion.p>
          </div>

          {/* ── EMOTIONAL FAREWELL LETTER ── */}
          <motion.div
            className="card p-6 sm:p-8 w-full relative overflow-hidden text-left"
            style={{
              border: "2.5px solid var(--card-border)",
              background: "var(--card-bg)",
              boxShadow: "var(--card-shadow)",
            }}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            {/* Top decorative header */}
            <div className="flex items-center justify-between border-b pb-4 mb-5" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ background: "var(--pill-bg)", color: "var(--pill-text)" }}
                >
                  ✉️
                </div>
                <div>
                  <h3
                    className="font-black text-sm sm:text-base leading-none"
                    style={{ color: "var(--text-1)", fontFamily: "var(--font-head, sans-serif)" }}
                  >
                    A Farewell Note to Fellow Students & Friends
                  </h3>
                  <p className="text-[10px] mt-1" style={{ color: "var(--text-3)" }}>
                    Written with genuine love, late nights, and zero regrets.
                  </p>
                </div>
              </div>
              <span className="badge-dark text-[10px] font-mono font-bold hidden sm:inline-block">
                Final Commit
              </span>
            </div>

            {/* Letter Body */}
            <div
              className="space-y-4 text-xs sm:text-sm leading-relaxed"
              style={{ color: "var(--text-2)" }}
            >
              <p>
                When this project started, exam mornings at MUJ were absolute chaos. We’ve all been there: standing in the crowded corridors of the academic block at 8:55 AM, frantically pinching and zooming through a 40-page PDF table on spotty hostel 4G, while invigilators yelled <em>&ldquo;Last entry in 5 minutes!&rdquo;</em>
              </p>

              <p>
                I couldn&apos;t stand seeing my classmates and friends panic right before an exam that they had studied all night for. So I sat down and spent long nights writing parsers, deciphering column-major seat numbers, debugging hall matrices, and creating a portal where you could just type your registration number and know your exact room, row, and seat in less than 200 milliseconds.
              </p>

              <p>
                Over the semesters, this little server answered thousands of frantic searches. Together, we helped <strong style={{ color: "var(--text-1)" }}>548+ students</strong> navigate <strong style={{ color: "var(--text-1)" }}>2,182+ exam tickets</strong> across 27 halls with zero seat clashes. Every text saying <em>&ldquo;Bhai tera portal bacha liya&rdquo;</em> made every sleepless night worth it.
              </p>

              <p>
                Now, the department people have officially built their own thing and rolled it out. While it is bittersweet to close this chapter, my purpose here is fulfilled. We proved that a student can build fast, humane, stress-free software for their peers when it matters most.
              </p>

              <p className="font-semibold" style={{ color: "var(--text-1)" }}>
                Thank you for every search, every bookmark, and for trusting my code with your exam mornings. So here I end. 🕊️
              </p>

              {/* Developer Sign-off */}
              <div className="pt-3 flex items-center justify-between flex-wrap gap-2 border-t border-dashed" style={{ borderColor: "var(--border)" }}>
                <div>
                  <p className="font-bold text-xs" style={{ color: "var(--text-1)", fontFamily: "var(--font-head, sans-serif)" }}>
                    — Your Batchmate & Developer
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-3)" }}>
                    AIML Department · Manipal University Jaipur
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: "var(--text-3)" }}>
                  <span>Made with</span>
                  <Heart size={13} className="text-red-500 fill-red-500" />
                  <span>for the mates</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── UPVOTE CARD: STUDENT VOICE ── */}
          <UpvoteSection />

          {/* ── LEGACY STATS CARDS ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
            {[
              { label: "Students Assisted", val: "548+", icon: <GraduationCap size={16} className="text-blue-500" /> },
              { label: "Exam Tickets Handled", val: "2,182+", icon: <Award size={16} className="text-amber-500" /> },
              { label: "Exam Halls Mapped", val: "27 Rooms", icon: <MapPin size={16} className="text-emerald-500" /> },
              { label: "Search Latency", val: "<200ms", icon: <Zap size={16} className="text-purple-500" /> },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="card-inner p-3.5 flex flex-col justify-between"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
                    {stat.label}
                  </span>
                  {stat.icon}
                </div>
                <p
                  className="text-xl font-black"
                  style={{ color: "var(--text-1)", fontFamily: "var(--font-head, sans-serif)" }}
                >
                  {stat.val}
                </p>
              </motion.div>
            ))}
          </div>

          {/* ── ARCHIVE ACCORDION / TOGGLE ── */}
          <div className="w-full" ref={archiveSearchRef}>
            <motion.button
              onClick={toggleArchive}
              className="w-full card p-4 flex items-center justify-between transition-all duration-200 cursor-pointer"
              style={{
                border: "2px solid var(--card-border)",
                background: "var(--card-bg)",
                boxShadow: "var(--card-shadow-sm)",
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-2.5 text-left">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--pill-bg)", color: "var(--pill-text)" }}
                >
                  <History size={16} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: "var(--text-1)", fontFamily: "var(--font-head, sans-serif)" }}>
                    Need to look up past records or test the search?
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
                    {showArchiveSearch ? "Click to collapse seating archive" : "Access the interactive seat locator & hall map archive"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge-dark text-[10px] font-mono hidden sm:inline">
                  {showArchiveSearch ? "HIDE" : "EXPLORE ARCHIVE"}
                </span>
                {showArchiveSearch ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </motion.button>

            <AnimatePresence>
              {showArchiveSearch && (
                <motion.div
                  className="w-full flex flex-col items-center gap-5 mt-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Search card */}
                  <div
                    className="card p-5 w-full"
                    style={{
                      border: "2px solid var(--card-border)",
                      background: "var(--card-bg)",
                    }}
                  >
                    <SearchBar onSearch={handleSearch} isLoading={state.status === "loading"} />
                  </div>

                  {/* Results Container */}
                  <div className="w-full">
                    <AnimatePresence mode="wait">
                      {state.status === "idle" && (
                        <motion.div
                          key="idle"
                          className="flex flex-col items-center gap-2 py-6 text-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <p className="font-bold text-xs" style={{ color: "var(--text-3)", fontFamily: "var(--font-head, sans-serif)" }}>
                            Enter your registration number above to retrieve your past allocated ticket &amp; room plan
                          </p>
                        </motion.div>
                      )}

                      {state.status === "loading" && (
                        <motion.div
                          key="loading"
                          className="flex flex-col items-center gap-3 py-8"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div
                            className="w-8 h-8 rounded-full border-2 border-t-transparent anim-spin"
                            style={{ borderColor: "var(--card-border)", borderTopColor: "transparent" }}
                          />
                          <p className="text-xs font-semibold" style={{ color: "var(--text-3)", fontFamily: "var(--font-head, sans-serif)" }}>
                            Looking up historical records…
                          </p>
                        </motion.div>
                      )}

                      {state.status === "found" && !selectedExam && (
                        <motion.div
                          key="found-multi"
                          className="flex flex-col gap-4 w-full"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className="px-1 mb-1 text-left">
                            <p className="font-bold text-lg" style={{ color: "var(--text-1)", fontFamily: "var(--font-head, sans-serif)" }}>
                              Welcome back, {state.name}!
                            </p>
                            <p className="font-medium text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                              Found {state.data.length} allocated exams in archive:
                            </p>
                          </div>
                          {state.data.map((exam, idx) => (
                            <StudentTicket key={idx} student={exam} onLocate={() => handleLocate(exam)} />
                          ))}
                        </motion.div>
                      )}

                      {state.status === "found" && selectedExam && (
                        <motion.div
                          key="found-single"
                          className="flex flex-col gap-4 w-full"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <button
                            onClick={() => setSelectedExam(null)}
                            className="pill-btn self-start flex items-center gap-1.5 text-xs py-2 px-3"
                            style={{ background: "var(--card-bg)", color: "var(--text-1)", border: "2px solid var(--card-border)" }}
                          >
                            <ArrowLeft size={13} /> Back to All Tickets
                          </button>
                          <StudentTicket student={selectedExam} hideLocate />
                          <div ref={seatMapRef}>
                            <SeatMap
                              rows={selectedExam.rows}
                              cols={selectedExam.cols}
                              targetSeat={selectedExam.seatLabel}
                              room={selectedExam.room}
                            />
                          </div>
                        </motion.div>
                      )}

                      {state.status === "error" && (
                        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <ErrorState error={state.error} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── FOOTER ── */}
          <div className="flex flex-col items-center gap-3 pt-6 pb-12 text-center w-full">
            <div className="h-0.5 w-16 rounded-full" style={{ background: "var(--border)" }} />

            <p className="text-[11px] font-bold tracking-widest uppercase opacity-70" style={{ color: "var(--text-3)" }}>
              REST IN PEACE · MUJ AIML SEATING PORTAL · 2024 — 2026
            </p>

            <p className="text-xs" style={{ color: "var(--text-2)" }}>
              Built with dedication by a student, for the students.{" "}
              <a
                href="https://drive.google.com/drive/folders/1yHIUgj_pHTUJw3fN_uLP2hSzlklbSOco?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 decoration-rose-500/40 hover:text-rose-500 transition-colors cursor-pointer font-medium"
              >
                Access Raw Exam PDFs Drive ↗
              </a>
            </p>

            <div className="flex items-center gap-4 text-[10px] mt-2" style={{ color: "var(--text-3)" }}>
              <Link href="/admin" className="hover:underline transition-all">
                Faculty Admin Panel
              </Link>
              <span>·</span>
              <span>Final Version 2.4</span>
              <span>·</span>
              <span>Always in our hearts</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
