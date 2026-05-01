"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Loader2, MapPin, Clock, BookOpen,
  ArrowRight, ArrowLeft, Sparkles, Brain, Zap,
  Sun, Moon, SearchX, AlertTriangle, GraduationCap, Cpu
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { usePostHog } from 'posthog-js/react'

import { lookupStudent, type StudentInfo, type LookupError } from "@/lib/studentLookup";
import { parseSeatLabel } from "@/lib/getSeatCoordinates";

import { FlickeringGrid } from "@/components/FlickeringGrid";

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
        maxOpacity={0.1}
        flickerChance={0.05}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   THEME TOGGLE — clean bordered circle
──────────────────────────────────────────────────────── */
import { AnimatedThemeToggler } from "@/components/AnimatedThemeToggler";

/* ────────────────────────────────────────────────────────
   SEARCH BAR — clean bordered input
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
      <label htmlFor="reg-input" className="block text-[11px] font-bold tracking-[0.15em] mb-2.5 uppercase"
        style={{ color: "var(--text-3)", fontFamily: "var(--font-head, 'Space Grotesk', sans-serif)" }}>
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
          id="reg-input" type="text" value={val}
          onChange={e => setVal(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === "Enter" && submit()}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder="e.g. 23FE10CAI00019"
          maxLength={14} autoComplete="off" spellCheck={false}
          className="flex-1 px-3 py-2.5 text-sm bg-transparent border-none outline-none tracking-wider"
          style={{ color: "var(--text-1)", fontFamily: "var(--font-mono, monospace)" }}
        />
        <motion.button
          onClick={submit} disabled={isLoading || !val.trim()}
          className="pill-btn text-[13px] px-5 py-2.5"
          whileHover={val.trim() ? { scale: 1.03 } : {}} whileTap={val.trim() ? { scale: 0.95 } : {}}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isLoading
              ? <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Loader2 size={15} className="anim-spin" /></motion.div>
              : <motion.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5"><Search size={15} /><span className="hidden sm:inline">Search</span></motion.div>
            }
          </AnimatePresence>
        </motion.button>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3 items-center">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>Quick Prefix:</span>
        {["23FE10CAI00"].map(prefix => (
          <button key={prefix} onClick={() => { 
            setVal(prefix); 
            document.getElementById("reg-input")?.focus(); 
          }}
          className="badge-dark px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer hover:opacity-70 transition-opacity">{prefix}</button>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   STUDENT TICKET — thick bordered card
──────────────────────────────────────────────────────── */
function StudentTicket({ student, onLocate, hideLocate }: { student: StudentInfo; onLocate?: () => void; hideLocate?: boolean }) {
  const initials = student.name.split(" ").slice(0, 2).map(w => w[0]).join("");
  return (
    <motion.div className="card overflow-hidden w-full"
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}>

      {/* Top accent bar */}
      <div className="px-5 py-2.5 text-center text-[11px] font-bold tracking-[0.18em] uppercase"
        style={{
          background: "var(--pill-bg)",
          color: "var(--pill-text)",
          fontFamily: "var(--font-head, sans-serif)",
          borderBottom: "var(--card-border-w) solid var(--card-border)"
        }}>
        {student.examTitle}
      </div>

      <div className="p-5 space-y-4">
        {/* Student identity */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-[color:var(--primary-inv)] font-black text-base"
            style={{ background: "var(--pill-bg)", color: "var(--pill-text)", fontFamily: "var(--font-head, sans-serif)", border: "2px solid var(--card-border)" }}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-black text-base uppercase tracking-wider truncate"
              style={{ color: "var(--text-1)", fontFamily: "var(--font-head, sans-serif)" }}>{student.name}</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <span className="badge-dark text-[10px] font-mono">{student.regNo}</span>
              <span className="badge-light text-[10px]"
                style={{ fontFamily: "var(--font-head, sans-serif)" }}>Sec {student.section}</span>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--pill-bg)", color: "var(--pill-text)", border: "2px solid var(--card-border)" }}>
              <Cpu size={16} />
            </div>
            <span className="text-[8px] font-black tracking-widest" style={{ color: "var(--text-3)" }}>AIML</span>
          </div>
        </div>

        {/* Dashed separator */}
        <hr className="dashed-sep my-2" />

        {/* Subject */}
        <div className="card-inner p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <BookOpen size={18} style={{ color: "var(--brand)", flexShrink: 0 }} />
            <p className="font-black text-lg leading-snug truncate" style={{ color: "var(--text-1)", fontFamily: "var(--font-head, sans-serif)", paddingTop: '1px' }}>
              {student.subject}
            </p>
          </div>
          <span className="badge-brand text-[11px] font-bold flex-shrink-0 px-3 py-1.5">{student.subjectCode}</span>
        </div>

        {/* Room + Seat + Date */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Room */}
          <div className="card-inner p-3 flex flex-col gap-0.5">
            <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest mb-0.5" style={{ color: "var(--text-3)" }}>
              <MapPin size={9} />Room
            </div>
            <p className="text-xl font-black" style={{ color: "var(--text-1)", fontFamily: "var(--font-head, sans-serif)" }}>{student.room}</p>
          </div>
          {/* Seat — highlighted */}
          <div className="p-3 flex flex-col gap-0.5 anim-pulse" style={{
            background: "rgba(16, 185, 129,0.06)",
            border: "2px solid var(--brand)",
            borderRadius: "14px",
          }}>
            <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest mb-0.5" style={{ color: "var(--brand)" }}>
              <MapPin size={9} />Seat
            </div>
            <p className="text-xl font-black" style={{ color: "var(--brand)", fontFamily: "var(--font-head, sans-serif)" }}>{student.seatLabel}</p>
          </div>
          {/* Date */}
          <div className="card-inner p-3 flex flex-col gap-0.5">
            <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest mb-0.5" style={{ color: "var(--text-3)" }}>
              <Clock size={9} />Date
            </div>
            <p className="text-xs font-black leading-tight" style={{ fontFamily: "var(--font-head, sans-serif)", color: "var(--text-1)" }}>{student.examDate}</p>
            <p className="text-[9px]" style={{ color: "var(--text-3)" }}>{student.examTime}</p>
          </div>
        </div>

        {/* Dashed separator */}
        <hr className="dashed-sep" />

        {/* Instructions + Locate */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <ul className="text-[11px] space-y-0.5 list-none" style={{ color: "var(--text-3)" }}>
            <li>· Report 15 mins before exam</li>
            <li>· Carry your ID Card</li>
            <li>· No electronic devices</li>
          </ul>
          {!hideLocate && (
            <motion.button onClick={onLocate}
              className="pill-btn text-[13px] flex-shrink-0"
              style={{ background: "var(--brand)" }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}>
              <MapPin size={14} /> Locate Seat <ArrowRight size={12} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────
   SEAT MAP — bordered card
──────────────────────────────────────────────────────── */
function SeatMap({ rows, cols, targetSeat, room }: { rows: number; cols: number; targetSeat: string; room: string }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const { row: tr, col: tc } = parseSeatLabel(targetSeat);

  return (
    <motion.div className="card overflow-hidden w-full"
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}>

      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-black" style={{ color: "var(--text-1)", fontFamily: "var(--font-head, sans-serif)" }}>{room}</h2>
            <p className="text-xs" style={{ color: "var(--text-3)" }}>Interactive Seat Map — hover any seat</p>
          </div>
          <div className="badge-dark anim-pulse flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold"
            style={{ fontFamily: "var(--font-head, sans-serif)", background: "var(--brand)", color: "#fff", borderRadius: "999px" }}>
            <MapPin size={12} />{targetSeat}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 text-[11px]" style={{ color: "var(--text-3)" }}>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "var(--brand)" }}>
              <MapPin size={9} className="text-[color:var(--primary-inv)]" />
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
          <div className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(44px, 1fr))`, minWidth: `${cols * 52}px` }}>
            {Array.from({ length: rows }).map((_, rIdx) =>
              Array.from({ length: cols }).map((_, cIdx) => {
                const r = rIdx + 1, c = cIdx + 1;
                const label = `R${r}C${c}`;
                const isTarget = r === tr && c === tc;
                return (
                  <div key={label} className="seat-cell"
                    onMouseEnter={() => setHovered(label)} onMouseLeave={() => setHovered(null)}>
                    {isTarget ? (
                      <motion.div className="w-full h-full rounded-lg flex flex-col items-center justify-center relative"
                        style={{ background: "var(--brand)", border: "2px solid var(--card-border)" }}
                        animate={{ boxShadow: ["0 0 0 0px rgba(16, 185, 129,0.7)", "0 0 0 8px rgba(16, 185, 129,0)", "0 0 0 0px rgba(16, 185, 129,0)"] }}
                        transition={{ duration: 1.8, repeat: Infinity }}>
                        <MapPin size={14} className="text-[color:var(--primary-inv)]" />
                      </motion.div>
                    ) : (
                      <motion.div className="w-full h-full rounded-lg flex items-center justify-center relative"
                        style={{ background: "var(--card-bg)", border: "1.5px solid var(--border)" }}
                        whileHover={{ scale: 1.1 }} transition={{ duration: 0.1 }}>
                        <span className="text-[8px]" style={{ color: "var(--text-3)", fontFamily: "var(--font-mono, monospace)" }}>{label}</span>
                        <AnimatePresence>
                          {hovered === label && (
                            <motion.div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-[8px] font-bold z-20 pointer-events-none whitespace-nowrap"
                              style={{ background: "var(--pill-bg)", color: "var(--pill-text)", fontFamily: "var(--font-mono, monospace)" }}
                              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}>
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
        <p className="mt-2.5 text-center text-[10px]" style={{ color: "var(--text-3)" }}>
          Please verify the room & block before entering the exam hall.
        </p>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────
   ERROR STATE — bordered card
──────────────────────────────────────────────────────── */
function ErrorState({ error }: { error: LookupError }) {
  return (
    <motion.div className="card p-8 text-center w-full"
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
      <motion.div className="flex justify-center mb-4"
        animate={{ x: [0, -6, 6, -6, 6, 0] }} transition={{ duration: 0.45, delay: 0.1 }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: error.type === "NOT_FOUND" ? "rgba(239,68,68,0.06)" : "rgba(234,179,8,0.06)",
            border: `2px solid ${error.type === "NOT_FOUND" ? "rgba(239,68,68,0.3)" : "rgba(234,179,8,0.3)"}`,
          }}>
          {error.type === "NOT_FOUND"
            ? <SearchX size={26} style={{ color: "#ef4444" }} />
            : <AlertTriangle size={26} style={{ color: "#eab308" }} />}
        </div>
      </motion.div>
      <h3 className="text-base font-bold mb-1.5" style={{ color: "var(--text-1)", fontFamily: "var(--font-head, sans-serif)" }}>
        {error.type === "NOT_FOUND" ? "Student Not Found" : "Invalid Format"}
      </h3>
      <p className="text-sm max-w-xs mx-auto" style={{ color: "var(--text-3)" }}>{error.message}</p>
      {error.type === "NOT_FOUND" && (
        <p className="mt-4 text-xs" style={{ color: "var(--text-3)" }}>
          Try: <code className="badge-light text-[11px]" style={{ fontFamily: "monospace", color: "var(--brand)" }}>23FE10CAI00019</code>
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
  const seatMapRef = useRef<HTMLDivElement>(null);
  const posthog = usePostHog();

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSearch = useCallback(async (regNo: string) => {
    setState({ status: "loading" });
    const result = await lookupStudent(regNo);
    
    // Tracking
    if (result.success) {
      // Identify the user by their registration number for deep analytics
      posthog.identify(regNo, {
        name: result.name,
      });
      posthog.capture('student_search_success', {
        regNo,
        name: result.name,
        exam_count: result.data.length
      });
    } else {
      posthog.capture('student_search_fail', {
        regNo,
        error_type: result.error.type,
        error_message: result.error.message
      });
    }

    setState(result.success
      ? { status: "found", name: result.name, data: result.data }
      : { status: "error", error: result.error }
    );
    setSelectedExam(null);
  }, [posthog]);

  const handleLocate = useCallback((exam: StudentInfo) => {
    posthog.capture('seat_located', {
      subject: exam.subject,
      room: exam.room,
      seat: exam.seatLabel
    });
    setSelectedExam(exam);
    setTimeout(() => {
      seatMapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, [posthog]);

  return (
    <div className="relative min-h-dvh" style={{ background: "var(--bg)" }}>
      <Background />

      {/* ── Top bar ── */}
      <div className="relative z-20 flex items-center justify-between px-4 sm:px-6 pt-4">
        <div className="relative flex-shrink-0 min-w-[160px] min-h-[36px]">
          {mounted && (
            <Image
              src={resolvedTheme === "dark" ? "/muj-logo-darkmode-removebg-preview.png" : "/muj-logo.svg"}
              alt="MUJ Logo"
              width={160} height={36}
              className="object-contain"
              priority
            />
          )}
        </div>
        <AnimatedThemeToggler
          className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
          style={{ border: "2px solid var(--card-border)", background: "var(--card-bg)" }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-lg flex flex-col items-center gap-6">

          {/* Live badge */}
          <motion.div
            className="badge-green flex items-center gap-2 px-4 py-1.5 text-[11px] font-bold"
            style={{ fontFamily: "var(--font-head, sans-serif)" }}
            animate={{ opacity: [1, 0.55, 1] }} transition={{ duration: 2.2, repeat: Infinity }}
            initial={{ opacity: 0 }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ETE APR 2026 · Seats Allocated
          </motion.div>

          {/* Heading */}
          <motion.div className="text-center space-y-3"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.1]"
              style={{ fontFamily: "var(--font-head, 'Space Grotesk', sans-serif)", color: "var(--text-1)" }}>
              Exam Seating Portal
            </h1>
            <p className="text-sm sm:text-base" style={{ color: "var(--text-2)" }}>
              Find your seat, room &amp; schedule instantly.
            </p>
          </motion.div>

          {/* Search card */}
          <motion.div className="card p-5 w-full"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}>
            <SearchBar onSearch={handleSearch} isLoading={state.status === "loading"} />
          </motion.div>

          {/* ── Results ── */}
          <div className="w-full">
            <AnimatePresence mode="wait">
              {state.status === "idle" && (
                <motion.div key="idle" className="flex flex-col items-center gap-3 py-8 text-center"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div className="w-16 h-16 rounded-2xl flex items-center justify-center anim-float"
                    style={{
                      border: "2px dashed var(--border)",
                      background: "var(--card-bg)",
                    }}>
                    <GraduationCap size={28} style={{ color: "var(--brand)" }} />
                  </motion.div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "var(--text-2)", fontFamily: "var(--font-head, sans-serif)" }}>Your examinations seating will be listed here</p>
                  </div>
                </motion.div>
              )}

              {state.status === "loading" && (
                <motion.div key="loading" className="flex flex-col items-center gap-4 py-12"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="w-10 h-10 rounded-full border-2 border-t-transparent anim-spin"
                    style={{ borderColor: "var(--card-border)", borderTopColor: "transparent" }} />
                  <p className="text-sm font-semibold" style={{ color: "var(--text-3)", fontFamily: "var(--font-head, sans-serif)" }}>Looking up your seat…</p>
                </motion.div>
              )}

              {state.status === "found" && !selectedExam && (
                <motion.div key="found-multi" className="flex flex-col gap-4 w-full anim-slide"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="px-1 mb-1">
                    <p className="font-bold text-xl" style={{ color: "var(--text-1)", fontFamily: "var(--font-head, sans-serif)" }}>
                        Welcome, {state.name}!
                    </p>
                    {state.data.length > 0 ? (
                        <p className="font-bold text-sm mt-1" style={{ color: "var(--text-2)", fontFamily: "var(--font-head, sans-serif)" }}>
                            Found {state.data.length} allocated exams:
                        </p>
                    ) : (
                        <p className="font-bold text-sm mt-1" style={{ color: "var(--text-3)", fontFamily: "var(--font-head, sans-serif)" }}>
                            No active exam seating allocated yet. Check back soon.
                        </p>
                    )}
                  </div>
                  {state.data.map((exam, idx) => (
                    <StudentTicket key={idx} student={exam} onLocate={() => handleLocate(exam)} />
                  ))}
                </motion.div>
              )}

              {state.status === "found" && selectedExam && (
                <motion.div key="found-single" className="flex flex-col gap-5 w-full anim-slide"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <button onClick={() => setSelectedExam(null)} className="pill-btn self-start mb-1 flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95"
                    style={{ background: "var(--card-bg)", color: "var(--text-1)", border: "2px solid var(--card-border)" }}>
                    <ArrowLeft size={14} /> Back to Tickets
                  </button>
                  <StudentTicket student={selectedExam} hideLocate />
                  <div ref={seatMapRef}>
                    <SeatMap rows={selectedExam.rows} cols={selectedExam.cols}
                      targetSeat={selectedExam.seatLabel} room={selectedExam.room} />
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

          {/* Footer */}
          <div className="flex flex-col items-center gap-2 pb-8 mt-auto">
            <p className="text-[10px] text-center font-medium tracking-wide uppercase opacity-60" style={{ color: "var(--text-3)" }}>
              Built by your mate, for the mates — Good luck on your exams!
            </p>
            <p className="text-center font-medium text-[11px]" style={{ color: "var(--text-2)", fontFamily: "var(--font-head)" }}>
              Trust me we got good accuracy. Still a question?{" "}
              <a 
                href="https://drive.google.com/drive/folders/1yHIUgj_pHTUJw3fN_uLP2hSzlklbSOco?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline decoration-[var(--brand)]/30 underline-offset-4 hover:text-[var(--brand)] hover:decoration-[var(--brand)] transition-all duration-300 cursor-pointer"
              >
                Check yourself here.
              </a>
            </p>
            <div className="flex flex-col items-center gap-1 mt-1 opacity-70">
              <p className="text-[9px] text-center font-medium" style={{ color: "var(--text-3)" }}>
                PWC Trainees, Hons. & special students: Strictly follow instructions by the department.
              </p>
              <p className="text-[9px] text-center font-medium italic" style={{ color: "var(--text-3)" }}>
                We do not take authority for any data mismatch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
