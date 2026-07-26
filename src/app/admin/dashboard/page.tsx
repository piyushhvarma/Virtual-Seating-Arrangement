"use client";

import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  Grid3X3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  Zap,
  Globe,
} from "lucide-react";
import { useAdmin } from "@/providers/AdminProvider";
import { detectConflicts } from "@/lib/conflictDetector";
import { AVAILABLE_YEARS } from "@/lib/adminTypes";

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="card p-5 flex flex-col gap-2"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      style={accent ? { borderColor: accent } : undefined}
    >
      <div
        className="flex items-center gap-2 mb-1"
        style={{ color: accent || "var(--text-2)" }}
      >
        <Icon size={16} />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p
        className="text-3xl font-black"
        style={{
          color: accent || "var(--text-1)",
          fontFamily: "var(--font-head, sans-serif)",
        }}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { data, loading, lastSaved, yearLabel, fullData, selectedYear } = useAdmin();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent anim-spin"
          style={{
            borderColor: "var(--card-border)",
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  const totalStudents = Object.keys(data.students).length;
  const totalSubjects = data.subjects.length;
  const totalRooms = data.roomAssignments.length;

  const assignedSet = new Set<string>();
  let totalTickets = 0;
  data.roomAssignments.forEach((r) => {
    r.assignments.forEach((a) => {
      assignedSet.add(a.regNo);
      totalTickets++;
    });
  });
  const assignedCount = assignedSet.size;
  const pendingCount = totalStudents - assignedCount;

  const conflicts = totalStudents > 0 ? detectConflicts(data) : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <span
            className="badge-dark px-3 py-1 text-[10px] flex items-center gap-1.5"
            style={{
              background: "var(--pill-bg)",
              color: "var(--pill-text)",
            }}
          >
            {yearLabel}
          </span>
          <span
            className="badge-dark px-3 py-1 text-[10px] flex items-center gap-1.5"
            style={
              data.published
                ? { background: "#10b981", color: "#fff" }
                : { background: "#f59e0b", color: "#fff" }
            }
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#fff" }}
            />
            {data.published ? "PUBLISHED" : "DRAFT"}
          </span>
        </div>
        <h1
          className="text-3xl font-black tracking-tight"
          style={{
            color: "var(--text-1)",
            fontFamily: "var(--font-head, sans-serif)",
          }}
        >
          {data.examMeta.title || "Exam Dashboard"}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
          {data.examMeta.department} · {data.examMeta.season}
          {lastSaved && (
            <span className="ml-3 text-[11px]">
              Last saved: {lastSaved}
            </span>
          )}
        </p>
      </motion.div>

      {/* Global Year Overview */}
      <motion.div
        className="card p-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.02 }}
      >
        <h3
          className="text-[10px] font-bold uppercase tracking-wider mb-3"
          style={{ color: "var(--text-3)", fontFamily: "var(--font-head)" }}
        >
          All Years Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {AVAILABLE_YEARS.map((y) => {
            const yd = fullData.years[y.key];
            const sc = yd ? Object.keys(yd.students).length : 0;
            const subCount = yd?.subjects?.length || 0;
            const roomCount = yd?.roomAssignments?.length || 0;
            const isActive = selectedYear === y.key;

            return (
              <div
                key={y.key}
                className="p-3 rounded-xl flex items-center justify-between transition-all"
                style={{
                  background: isActive ? "var(--pill-bg)" : "var(--input-bg)",
                  color: isActive ? "var(--pill-text)" : "var(--text-1)",
                  border: `1.5px solid ${isActive ? "transparent" : "var(--border)"}`,
                }}
              >
                <div>
                  <p
                    className="text-xs font-black"
                    style={{ fontFamily: "var(--font-head)" }}
                  >
                    {y.label}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ opacity: 0.7 }}>
                    {sc} students · {subCount} subjects · {roomCount} rooms
                  </p>
                </div>
                {yd?.published ? (
                  <CheckCircle2 size={14} style={{ color: isActive ? "var(--pill-text)" : "#10b981" }} />
                ) : sc > 0 ? (
                  <Clock size={14} style={{ opacity: 0.4 }} />
                ) : null}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Stats Grid — scoped to selected year */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Students" value={totalStudents} delay={0.05} />
        <StatCard icon={BookOpen} label="Subjects" value={totalSubjects} delay={0.1} />
        <StatCard icon={Grid3X3} label="Rooms" value={totalRooms} delay={0.15} />
        <StatCard icon={Database} label="Exam Tickets" value={totalTickets} delay={0.2} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={CheckCircle2}
          label="Students Seated"
          value={assignedCount}
          accent="#10b981"
          delay={0.25}
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={pendingCount}
          accent={pendingCount > 0 ? "#f59e0b" : "#10b981"}
          delay={0.3}
        />
        <StatCard
          icon={AlertTriangle}
          label="Conflicts"
          value={conflicts.length}
          accent={conflicts.length > 0 ? "#ef4444" : "#10b981"}
          delay={0.35}
        />
      </div>

      {/* Getting Started */}
      {totalStudents === 0 && (
        <motion.div
          className="card p-8 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              border: "2px dashed var(--border)",
              background: "var(--card-bg)",
            }}
          >
            <Zap size={28} style={{ color: "var(--text-3)" }} />
          </div>
          <h3
            className="text-lg font-black mb-2"
            style={{
              color: "var(--text-1)",
              fontFamily: "var(--font-head, sans-serif)",
            }}
          >
            Get Started with {yearLabel}
          </h3>
          <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-3)" }}>
            Upload the {yearLabel} student master list in the{" "}
            <strong>Students</strong> tab, then create exam subjects in{" "}
            <strong>Exams</strong>, and assign rooms in <strong>Assign Seats</strong>.
          </p>
        </motion.div>
      )}

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <motion.div
          className="card overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div
            className="px-5 py-3 flex items-center gap-2"
            style={{
              background: "rgba(239,68,68,0.06)",
              borderBottom: "2px solid var(--border)",
            }}
          >
            <AlertTriangle size={16} style={{ color: "#ef4444" }} />
            <span
              className="text-sm font-bold"
              style={{ color: "#ef4444", fontFamily: "var(--font-head, sans-serif)" }}
            >
              {conflicts.length} Conflict{conflicts.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
            {conflicts.map((c, i) => (
              <div key={i} className="card-inner p-3 flex items-start gap-3">
                <span
                  className="badge-dark text-[9px] flex-shrink-0 mt-0.5"
                  style={{
                    background: c.type === "SCHEDULE_CLASH" ? "#f59e0b" : "#ef4444",
                    color: "#fff",
                  }}
                >
                  {c.type === "SCHEDULE_CLASH" ? "CLASH" : "COLLISION"}
                </span>
                <div>
                  <p className="text-xs font-bold" style={{ color: "var(--text-1)" }}>
                    {c.studentName}{" "}
                    <span style={{ color: "var(--text-3)" }}>({c.regNo})</span>
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>
                    {c.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
