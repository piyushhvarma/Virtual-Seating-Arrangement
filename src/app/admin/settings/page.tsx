"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Save,
  Trash2,
  Download,
  Upload,
  Globe,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Loader2,
  Info,
  Clock,
} from "lucide-react";
import { useAdmin } from "@/providers/AdminProvider";
import { createEmptyAdminData, AVAILABLE_YEARS } from "@/lib/adminTypes";

export default function SettingsPage() {
  const { data, setData, saveData, token, yearLabel, selectedYear, fullData } = useAdmin();
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearSeats, setShowClearSeats] = useState(false);

  // ── Publish this year ────────────────────────────
  const handlePublish = useCallback(async () => {
    setPublishing(true);
    setPublishResult(null);
    try {
      // First, mark this year as published
      const newData = { ...data, published: true };
      setData(newData);
      await saveData(newData);

      // Then trigger the server-side compile
      const res = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setPublishResult(
          `✅ ${yearLabel} published! ${json.stats.studentsPublished} students with ${json.stats.examTickets} exam tickets are now live.`
        );
      } else {
        setPublishResult(`❌ Failed: ${json.error}`);
      }
    } catch {
      setPublishResult("❌ Network error. Please try again.");
    } finally {
      setPublishing(false);
    }
  }, [token, data, setData, saveData, yearLabel]);

  // ── Unpublish this year ──────────────────────────
  const handleUnpublish = useCallback(async () => {
    const newData = { ...data, published: false };
    setData(newData);
    await saveData(newData);

    // Re-compile to remove this year from live data
    try {
      await fetch("/api/admin/publish", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Non-critical
    }

    setPublishResult(`${yearLabel} is now in draft mode.`);
  }, [data, setData, saveData, yearLabel, token]);

  // ── Clear Seat Assignments (this year only) ──────
  const clearSeats = useCallback(async () => {
    const newData = { ...data, roomAssignments: [], published: false };
    setData(newData);
    await saveData(newData);
    setShowClearSeats(false);
  }, [data, setData, saveData]);

  // ── Full Reset (this year only) ──────────────────
  const fullReset = useCallback(async () => {
    const newData = {
      ...data,
      students: {},
      subjects: [],
      roomAssignments: [],
      published: false,
      lastModified: new Date().toISOString(),
    };
    setData(newData);
    await saveData(newData);
    setShowResetConfirm(false);
  }, [data, setData, saveData]);

  // ── Backup Download (full data, all years) ───────
  const downloadBackup = useCallback(() => {
    const blob = new Blob([JSON.stringify(fullData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-backup-all-years-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [fullData]);

  // ── Restore Backup ───────────────────────────────
  const restoreBackup = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (parsed.version && parsed.years) {
          // Full v2 backup — restore via the API directly
          const res = await fetch("/api/admin/data", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ data: parsed }),
          });
          if (res.ok) {
            window.location.reload();
          }
        }
      } catch {
        // Silently fail
      }
    },
    [token]
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1
          className="text-2xl font-black tracking-tight"
          style={{
            color: "var(--text-1)",
            fontFamily: "var(--font-head, sans-serif)",
          }}
        >
          Settings
        </h1>
        <p className="text-sm" style={{ color: "var(--text-3)" }}>
          Publish, backup, and manage portal settings
        </p>
      </motion.div>

      {/* Per-Year Publish Status Overview */}
      <motion.div
        className="card p-5 space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03 }}
      >
        <div className="flex items-center gap-2">
          <Globe size={16} style={{ color: "var(--text-2)" }} />
          <h2
            className="text-sm font-bold uppercase tracking-wider"
            style={{ color: "var(--text-2)", fontFamily: "var(--font-head)" }}
          >
            Publish Status — All Years
          </h2>
        </div>
        <div className="space-y-2">
          {AVAILABLE_YEARS.map((y) => {
            const yd = fullData.years[y.key];
            const sc = yd ? Object.keys(yd.students).length : 0;
            const isPublished = yd?.published || false;
            const isCurrent = selectedYear === y.key;

            return (
              <div
                key={y.key}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{
                  background: isCurrent ? "var(--pill-bg)" : "var(--input-bg)",
                  color: isCurrent ? "var(--pill-text)" : "var(--text-1)",
                  border: `1.5px solid ${isCurrent ? "transparent" : "var(--border)"}`,
                }}
              >
                <div className="flex items-center gap-2">
                  {isPublished ? (
                    <CheckCircle2 size={14} style={{ color: isCurrent ? "var(--pill-text)" : "#10b981" }} />
                  ) : (
                    <Clock size={14} style={{ opacity: 0.5 }} />
                  )}
                  <span className="text-xs font-black" style={{ fontFamily: "var(--font-head)" }}>
                    {y.label}
                  </span>
                  <span className="text-[10px] font-semibold" style={{ opacity: 0.6 }}>
                    {sc} students
                  </span>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                  style={{
                    background: isPublished
                      ? isCurrent ? "rgba(255,255,255,0.15)" : "rgba(16,185,129,0.1)"
                      : isCurrent ? "rgba(255,255,255,0.1)" : "rgba(245,158,11,0.1)",
                    color: isPublished
                      ? isCurrent ? "var(--pill-text)" : "#10b981"
                      : isCurrent ? "var(--pill-text)" : "#f59e0b",
                  }}
                >
                  {isPublished ? "LIVE" : sc > 0 ? "DRAFT" : "EMPTY"}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Current Year Publish Section */}
      <motion.div
        className="card p-5 space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        style={{
          borderColor: data.published ? "#10b981" : "var(--card-border)",
        }}
      >
        <div className="flex items-center gap-3">
          <Globe size={20} style={{ color: data.published ? "#10b981" : "var(--text-2)" }} />
          <div>
            <h2
              className="text-base font-black"
              style={{
                color: "var(--text-1)",
                fontFamily: "var(--font-head)",
              }}
            >
              Publish {yearLabel}
            </h2>
            <p className="text-xs" style={{ color: "var(--text-3)" }}>
              {data.published
                ? `${yearLabel} is LIVE — students can search their seating.`
                : `${yearLabel} is in DRAFT mode. Publish to make it searchable.`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {data.published ? (
            <motion.button
              className="pill-btn text-xs px-5 py-2.5"
              style={{ background: "#ef4444", color: "#fff" }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleUnpublish}
            >
              Unpublish {yearLabel}
            </motion.button>
          ) : (
            <motion.button
              className="pill-btn text-xs px-5 py-2.5"
              style={{ background: "#10b981", color: "#fff" }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePublish}
              disabled={publishing}
            >
              {publishing ? (
                <Loader2 size={14} className="anim-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              Publish {yearLabel} to Students
            </motion.button>
          )}
        </div>

        {publishResult && (
          <p className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>
            {publishResult}
          </p>
        )}
      </motion.div>

      {/* Backup & Restore */}
      <motion.div
        className="card p-5 space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2
          className="text-sm font-bold uppercase tracking-wider"
          style={{ color: "var(--text-2)", fontFamily: "var(--font-head)" }}
        >
          Data Management
        </h2>
        <div className="flex flex-wrap gap-2">
          <motion.button
            className="pill-btn text-xs px-4 py-2"
            style={{
              background: "var(--card-bg)",
              color: "var(--text-1)",
              border: "2px solid var(--card-border)",
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={downloadBackup}
          >
            <Download size={13} /> Download Full Backup (All Years)
          </motion.button>
          <label>
            <motion.span
              className="pill-btn text-xs px-4 py-2 cursor-pointer inline-flex"
              style={{
                background: "var(--card-bg)",
                color: "var(--text-1)",
                border: "2px solid var(--card-border)",
              }}
            >
              <Upload size={13} /> Restore Backup
            </motion.span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) restoreBackup(f);
              }}
            />
          </label>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        className="card p-5 space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{ borderColor: "#ef4444" }}
      >
        <h2
          className="text-sm font-bold uppercase tracking-wider flex items-center gap-2"
          style={{ color: "#ef4444", fontFamily: "var(--font-head)" }}
        >
          <AlertTriangle size={14} /> Danger Zone — {yearLabel} Only
        </h2>
        <div className="flex flex-wrap gap-2">
          <motion.button
            className="pill-btn text-xs px-4 py-2"
            style={{
              background: "rgba(239,68,68,0.06)",
              color: "#ef4444",
              border: "2px solid rgba(239,68,68,0.3)",
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowClearSeats(true)}
          >
            <Trash2 size={13} /> Clear {yearLabel} Seat Assignments
          </motion.button>
          <motion.button
            className="pill-btn text-xs px-4 py-2"
            style={{ background: "#ef4444", color: "#fff" }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowResetConfirm(true)}
          >
            <Trash2 size={13} /> Reset {yearLabel} (Everything)
          </motion.button>
        </div>

        {showClearSeats && (
          <div
            className="p-3 rounded-xl flex items-center justify-between"
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1.5px solid rgba(239,68,68,0.3)",
            }}
          >
            <span className="text-xs font-bold" style={{ color: "#ef4444" }}>
              This will remove all room assignments for {yearLabel}. Students will be kept.
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearSeats(false)}
                className="text-xs font-bold px-3 py-1 rounded-lg"
                style={{ color: "var(--text-2)" }}
              >
                Cancel
              </button>
              <button
                onClick={clearSeats}
                className="text-xs font-bold px-3 py-1 rounded-lg"
                style={{ background: "#ef4444", color: "#fff" }}
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {showResetConfirm && (
          <div
            className="p-3 rounded-xl flex items-center justify-between"
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1.5px solid rgba(239,68,68,0.3)",
            }}
          >
            <span className="text-xs font-bold" style={{ color: "#ef4444" }}>
              This will delete ALL {yearLabel} data: students, subjects, and assignments.
              Other years are NOT affected.
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="text-xs font-bold px-3 py-1 rounded-lg"
                style={{ color: "var(--text-2)" }}
              >
                Cancel
              </button>
              <button
                onClick={fullReset}
                className="text-xs font-bold px-3 py-1 rounded-lg"
                style={{ background: "#ef4444", color: "#fff" }}
              >
                Delete {yearLabel}
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Handover Guide */}
      <motion.div
        className="card p-5 space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <Info size={16} style={{ color: "var(--text-2)" }} />
          <h2
            className="text-sm font-bold uppercase tracking-wider"
            style={{ color: "var(--text-2)", fontFamily: "var(--font-head)" }}
          >
            Faculty Handover Guide
          </h2>
        </div>
        <div
          className="space-y-3 text-xs leading-relaxed"
          style={{ color: "var(--text-2)" }}
        >
          <div className="card-inner p-3">
            <p className="font-bold mb-1" style={{ color: "var(--text-1)" }}>
              Step 1: Select a Year
            </p>
            <p>
              Use the year pills at the top bar to switch between{" "}
              <strong>2nd Year</strong>, <strong>3rd Year</strong>, and{" "}
              <strong>4th Year</strong>. Each year is a separate workspace.
            </p>
          </div>
          <div className="card-inner p-3">
            <p className="font-bold mb-1" style={{ color: "var(--text-1)" }}>
              Step 2: Upload Students
            </p>
            <p>
              In the <strong>Students</strong> tab, upload the Excel file for that
              year. Each year has its own student list — no need to merge files.
            </p>
          </div>
          <div className="card-inner p-3">
            <p className="font-bold mb-1" style={{ color: "var(--text-1)" }}>
              Step 3: Create Subjects
            </p>
            <p>
              In <strong>Exams</strong>, add each subject with its code, name,
              date/time, and which sections take it.
            </p>
          </div>
          <div className="card-inner p-3">
            <p className="font-bold mb-1" style={{ color: "var(--text-1)" }}>
              Step 4: Assign Rooms
            </p>
            <p>
              In <strong>Assign Seats</strong>, select a subject → enter room name
              + grid size → click Auto-Assign. Repeat until all students are seated.
            </p>
          </div>
          <div className="card-inner p-3">
            <p className="font-bold mb-1" style={{ color: "var(--text-1)" }}>
              Step 5: Publish Independently
            </p>
            <p>
              Each year can be published separately. If 2nd year exams are
              scheduled first, publish just 2nd year — 3rd and 4th year can stay
              in draft until they&apos;re ready.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
