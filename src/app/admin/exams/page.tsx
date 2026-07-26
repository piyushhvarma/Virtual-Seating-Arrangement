"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Clock,
  Users,
  X,
  CheckCircle2,
  Save,
  Upload,
  FileSpreadsheet,
  Tag,
} from "lucide-react";
import { useAdmin } from "@/providers/AdminProvider";
import type { Subject, SubjectType } from "@/lib/adminTypes";
import { generateId } from "@/lib/adminTypes";

export default function ExamsPage() {
  const { data, setData, saveData, examMeta, saveExamMeta, yearLabel } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const electiveFileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("1:30 PM – 4:30 PM");
  const [formType, setFormType] = useState<SubjectType>("core");
  const [formSections, setFormSections] = useState<string[]>([]);
  const [formEnrolled, setFormEnrolled] = useState<string[]>([]);
  const [enrollUploadStatus, setEnrollUploadStatus] = useState<string | null>(null);

  // Available sections from student data
  const availableSections = useMemo(() => {
    const s = new Set<string>();
    Object.values(data.students).forEach((st) => {
      if (st.section) s.add(st.section);
    });
    return [...s].sort();
  }, [data.students]);

  // ── Meta Editor (global, shared across all years) ──
  const [metaTitle, setMetaTitle] = useState(examMeta.title);
  const [metaDept, setMetaDept] = useState(examMeta.department);
  const [metaSeason, setMetaSeason] = useState(examMeta.season);

  const saveMeta = async () => {
    await saveExamMeta({
      title: metaTitle,
      department: metaDept,
      season: metaSeason,
    });
  };

  // ── Subject CRUD ─────────────────────────────────
  const openForm = (subject?: Subject) => {
    if (subject) {
      setEditingId(subject.id);
      setFormCode(subject.code);
      setFormName(subject.name);
      setFormDate(subject.date);
      setFormTime(subject.time);
      setFormType(subject.type || "core");
      setFormSections([...subject.sections]);
      setFormEnrolled([...(subject.enrolledStudents || [])]);
    } else {
      setEditingId(null);
      setFormCode("");
      setFormName("");
      setFormDate("");
      setFormTime("1:30 PM – 4:30 PM");
      setFormType("core");
      setFormSections([...availableSections]); // Auto-select all sections for core
      setFormEnrolled([]);
    }
    setEnrollUploadStatus(null);
    setShowForm(true);
  };

  const toggleSection = (sec: string) => {
    setFormSections((prev) =>
      prev.includes(sec) ? prev.filter((s) => s !== sec) : [...prev, sec]
    );
  };

  // ── Elective enrollment Excel upload ─────────────
  const handleElectiveUpload = useCallback(
    async (file: File) => {
      setEnrollUploadStatus("Parsing...");
      try {
        const XLSX = await import("xlsx");
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });

        const enrolled = new Set<string>();
        let colWarning: string | null = null;

        const REG_ALIASES = [
          "Registration No", "Reg No", "RegNo", "Registration Number",
          "Enrollment No", "Enroll No", "EnrollmentNo",
          "Student Reg No", "StudentRegNo", "StudentRegtNo",
          "Regd No", "RegdNo", "Roll No", "RollNo",
          "registration_no", "reg_no", "enrollment_no", "roll_no",
        ];

        function looksLikeMujRegNo(val: string): boolean {
          return /^\d{2}FE\d{2}[A-Z0-9]{2,6}\d{3,6}$/i.test(val.trim());
        }

        function pickRegNo(row: Record<string, any>, detectedCol: string): string {
          // Try detected column first, then aliases
          const keys = [detectedCol, ...REG_ALIASES];
          for (const key of keys) {
            const val = String(row[key] ?? "").trim();
            if (val) return val;
          }
          return "";
        }

        function detectRegCol(rows: Record<string, any>[]): string | null {
          // 1. Alias match (case-insensitive)
          const allKeys = Object.keys(rows[0] || {});
          const aliasMatch = REG_ALIASES.find((a) =>
            allKeys.some((k) => k.trim().toLowerCase() === a.toLowerCase())
          );
          if (aliasMatch) return aliasMatch;
          // 2. Scan values in first 10 rows
          for (const row of rows.slice(0, 10)) {
            for (const key of Object.keys(row)) {
              if (looksLikeMujRegNo(String(row[key] ?? "").trim())) return key;
            }
          }
          return null;
        }

        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
          if (rows.length === 0) continue;

          const detectedCol = detectRegCol(rows);
          if (!detectedCol) {
            colWarning = `Sheet "${sheetName}": no reg-no column found. Columns: ${Object.keys(rows[0]).join(", ")}`;
            continue;
          }

          for (const row of rows) {
            const raw = pickRegNo(row, detectedCol).toUpperCase();
            if (!raw || !looksLikeMujRegNo(raw)) continue;
            enrolled.add(raw);
          }
        }

        const enrolledArr = [...enrolled].sort();
        setFormEnrolled(enrolledArr);

        if (colWarning) {
          setEnrollUploadStatus(`⚠️ ${colWarning}`);
        } else {
          // Show how many matched master list vs total found
          const matched = enrolledArr.filter((r) => data.students[r]).length;
          setEnrollUploadStatus(
            `✅ ${enrolledArr.length} reg numbers loaded (${matched} matched master list, ${enrolledArr.length - matched} new)`
          );
        }
      } catch (err) {
        setEnrollUploadStatus(
          `❌ Error: ${err instanceof Error ? err.message : "Failed to parse"}`
        );
      }
    },
    [data.students]
  );

  const saveSubject = async () => {
    if (!formCode || !formName) return;

    const newSubjects = [...data.subjects];

    const subjectData: Omit<Subject, "id"> = {
      code: formCode,
      name: formName,
      date: formDate,
      time: formTime,
      type: formType,
      sections: formType === "core" ? formSections.sort() : [],
      enrolledStudents: formType === "elective" ? formEnrolled : [],
    };

    if (editingId) {
      const idx = newSubjects.findIndex((s) => s.id === editingId);
      if (idx !== -1) {
        newSubjects[idx] = { ...newSubjects[idx], ...subjectData };
      }
    } else {
      newSubjects.push({ id: generateId(), ...subjectData });
    }

    const newData = { ...data, subjects: newSubjects };
    setData(newData);
    await saveData(newData);
    setShowForm(false);
  };

  const deleteSubject = async (id: string) => {
    const newSubjects = data.subjects.filter((s) => s.id !== id);
    const newRooms = data.roomAssignments.filter((r) => r.subjectId !== id);
    const newData = { ...data, subjects: newSubjects, roomAssignments: newRooms };
    setData(newData);
    await saveData(newData);
  };

  // Count students for a subject
  const countStudents = (subject: Subject) => {
    if (subject.type === "elective" && subject.enrolledStudents?.length > 0) {
      return subject.enrolledStudents.filter((r) => data.students[r]).length;
    }
    return Object.values(data.students).filter((s) =>
      subject.sections.includes(s.section)
    ).length;
  };

  // Count assigned students for a subject
  const countAssigned = (subject: Subject) => {
    const rooms = data.roomAssignments.filter(
      (r) => r.subjectId === subject.id
    );
    const assigned = new Set<string>();
    rooms.forEach((r) => r.assignments.forEach((a) => assigned.add(a.regNo)));
    return assigned.size;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
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
          Exam Session — {yearLabel}
        </h1>
        <p className="text-sm" style={{ color: "var(--text-3)" }}>
          Configure subjects, dates, and section mappings for {yearLabel}
        </p>
      </motion.div>

      {/* Exam Meta Card */}
      <motion.div
        className="card p-5 space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <h2
          className="text-sm font-bold uppercase tracking-wider"
          style={{ color: "var(--text-2)", fontFamily: "var(--font-head)" }}
        >
          Session Info
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label
              className="block text-[10px] font-bold uppercase tracking-wider mb-1"
              style={{ color: "var(--text-3)" }}
            >
              Title
            </label>
            <input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none"
              style={{
                border: "1.5px solid var(--border)",
                background: "var(--input-bg)",
                color: "var(--text-1)",
              }}
            />
          </div>
          <div>
            <label
              className="block text-[10px] font-bold uppercase tracking-wider mb-1"
              style={{ color: "var(--text-3)" }}
            >
              Department
            </label>
            <input
              value={metaDept}
              onChange={(e) => setMetaDept(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none"
              style={{
                border: "1.5px solid var(--border)",
                background: "var(--input-bg)",
                color: "var(--text-1)",
              }}
            />
          </div>
          <div>
            <label
              className="block text-[10px] font-bold uppercase tracking-wider mb-1"
              style={{ color: "var(--text-3)" }}
            >
              Season
            </label>
            <input
              value={metaSeason}
              onChange={(e) => setMetaSeason(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none"
              style={{
                border: "1.5px solid var(--border)",
                background: "var(--input-bg)",
                color: "var(--text-1)",
              }}
            />
          </div>
        </div>
        <button
          onClick={saveMeta}
          className="pill-btn text-xs px-4 py-2"
          style={{
            background: "var(--card-bg)",
            color: "var(--text-1)",
            border: "2px solid var(--card-border)",
          }}
        >
          <Save size={13} /> Save Session Info
        </button>
      </motion.div>

      {/* Subjects */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2
          className="text-lg font-black"
          style={{
            color: "var(--text-1)",
            fontFamily: "var(--font-head, sans-serif)",
          }}
        >
          Subjects ({data.subjects.length})
        </h2>
        <motion.button
          className="pill-btn text-xs px-4 py-2"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => openForm()}
        >
          <Plus size={14} /> Add Subject
        </motion.button>
      </motion.div>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.subjects.map((subject, i) => {
          const total = countStudents(subject);
          const assigned = countAssigned(subject);
          const progress = total > 0 ? Math.round((assigned / total) * 100) : 0;
          const isElective = subject.type === "elective";

          return (
            <motion.div
              key={subject.id}
              className="card p-5 space-y-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="badge-dark text-[10px]">
                      {subject.code}
                    </span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                      style={{
                        background: isElective
                          ? "rgba(139,92,246,0.1)"
                          : "rgba(59,130,246,0.1)",
                        color: isElective ? "#8b5cf6" : "#3b82f6",
                        border: `1px solid ${isElective ? "rgba(139,92,246,0.3)" : "rgba(59,130,246,0.3)"}`,
                      }}
                    >
                      {isElective ? "ELECTIVE" : "CORE"}
                    </span>
                  </div>
                  <h3
                    className="text-base font-black leading-tight"
                    style={{
                      color: "var(--text-1)",
                      fontFamily: "var(--font-head)",
                    }}
                  >
                    {subject.name}
                  </h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openForm(subject)}
                    className="p-1.5 rounded-lg transition-all hover:opacity-70"
                    style={{
                      color: "var(--text-2)",
                      background: "var(--input-bg)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <Edit3 size={12} />
                  </button>
                  <button
                    onClick={() => deleteSubject(subject.id)}
                    className="p-1.5 rounded-lg transition-all hover:opacity-70"
                    style={{
                      color: "#ef4444",
                      background: "rgba(239,68,68,0.06)",
                      border: "1px solid rgba(239,68,68,0.2)",
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-[11px]">
                <div
                  className="flex items-center gap-1"
                  style={{ color: "var(--text-2)" }}
                >
                  <Calendar size={12} />
                  <span className="font-semibold">
                    {subject.date || "No date"}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1"
                  style={{ color: "var(--text-2)" }}
                >
                  <Clock size={12} />
                  <span className="font-semibold">{subject.time}</span>
                </div>
                <div
                  className="flex items-center gap-1"
                  style={{ color: "var(--text-2)" }}
                >
                  <Users size={12} />
                  <span className="font-semibold">{total} students</span>
                </div>
              </div>

              {/* Sections or Enrollment info */}
              <div className="flex flex-wrap gap-1">
                {isElective ? (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                    style={{
                      background: "rgba(139,92,246,0.08)",
                      color: "#8b5cf6",
                      border: "1px solid rgba(139,92,246,0.2)",
                    }}
                  >
                    {subject.enrolledStudents?.length || 0} enrolled via Excel
                  </span>
                ) : (
                  <>
                    {subject.sections.map((sec) => (
                      <span key={sec} className="badge-light text-[10px]">
                        Sec {sec}
                      </span>
                    ))}
                    {subject.sections.length === 0 && (
                      <span
                        className="text-[10px] font-semibold"
                        style={{ color: "var(--text-3)" }}
                      >
                        No sections assigned
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span style={{ color: "var(--text-3)" }}>
                    Seats Assigned
                  </span>
                  <span
                    style={{
                      color: progress === 100 ? "#10b981" : "var(--text-2)",
                    }}
                  >
                    {assigned}/{total} ({progress}%)
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: "var(--border)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      background:
                        progress === 100 ? "#10b981" : "var(--text-1)",
                    }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {data.subjects.length === 0 && (
        <motion.div
          className="card p-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <BookOpen
            size={32}
            className="mx-auto mb-3"
            style={{ color: "var(--text-3)" }}
          />
          <p
            className="text-sm font-bold"
            style={{ color: "var(--text-3)" }}
          >
            No subjects yet. Add your exam subjects to get started.
          </p>
        </motion.div>
      )}

      {/* Add/Edit Subject Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              className="card p-6 w-full max-w-md max-h-[85vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2
                  className="text-lg font-black"
                  style={{
                    color: "var(--text-1)",
                    fontFamily: "var(--font-head)",
                  }}
                >
                  {editingId ? "Edit Subject" : "Add Subject"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  style={{ color: "var(--text-3)" }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Subject Type Toggle */}
                <div>
                  <label
                    className="block text-[10px] font-bold uppercase tracking-wider mb-2"
                    style={{ color: "var(--text-3)" }}
                  >
                    Subject Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setFormType("core");
                        setFormSections([...availableSections]);
                      }}
                      className="flex-1 px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      style={{
                        background:
                          formType === "core"
                            ? "rgba(59,130,246,0.1)"
                            : "var(--input-bg)",
                        color:
                          formType === "core" ? "#3b82f6" : "var(--text-2)",
                        border: `2px solid ${formType === "core"
                            ? "#3b82f6"
                            : "var(--border)"
                          }`,
                      }}
                    >
                      <Users size={13} />
                      Core
                      <span
                        className="text-[9px] font-normal"
                        style={{ opacity: 0.6 }}
                      >
                        (by section)
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setFormType("elective");
                        setFormSections([]);
                      }}
                      className="flex-1 px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      style={{
                        background:
                          formType === "elective"
                            ? "rgba(139,92,246,0.1)"
                            : "var(--input-bg)",
                        color:
                          formType === "elective"
                            ? "#8b5cf6"
                            : "var(--text-2)",
                        border: `2px solid ${formType === "elective"
                            ? "#8b5cf6"
                            : "var(--border)"
                          }`,
                      }}
                    >
                      <Tag size={13} />
                      Elective
                      <span
                        className="text-[9px] font-normal"
                        style={{ opacity: 0.6 }}
                      >
                        (by student)
                      </span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className="block text-[10px] font-bold uppercase tracking-wider mb-1"
                      style={{ color: "var(--text-3)" }}
                    >
                      Subject Code
                    </label>
                    <input
                      placeholder="e.g. AIM3201"
                      value={formCode}
                      onChange={(e) =>
                        setFormCode(e.target.value.toUpperCase())
                      }
                      className="w-full rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none"
                      style={{
                        border: "2px solid var(--card-border)",
                        background: "var(--input-bg)",
                        color: "var(--text-1)",
                        fontFamily: "var(--font-mono)",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-[10px] font-bold uppercase tracking-wider mb-1"
                      style={{ color: "var(--text-3)" }}
                    >
                      Exam Date
                    </label>
                    <input
                      placeholder="DD-MM-YYYY"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none"
                      style={{
                        border: "2px solid var(--card-border)",
                        background: "var(--input-bg)",
                        color: "var(--text-1)",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-[10px] font-bold uppercase tracking-wider mb-1"
                    style={{ color: "var(--text-3)" }}
                  >
                    Subject Name
                  </label>
                  <input
                    placeholder="e.g. Deep Learning"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none"
                    style={{
                      border: "2px solid var(--card-border)",
                      background: "var(--input-bg)",
                      color: "var(--text-1)",
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-[10px] font-bold uppercase tracking-wider mb-1"
                    style={{ color: "var(--text-3)" }}
                  >
                    Exam Time
                  </label>
                  <input
                    placeholder="e.g. 1:30 PM – 4:30 PM"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none"
                    style={{
                      border: "2px solid var(--card-border)",
                      background: "var(--input-bg)",
                      color: "var(--text-1)",
                    }}
                  />
                </div>

                {/* Core: Section Picker */}
                {formType === "core" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: "var(--text-3)" }}
                      >
                        Sections Taking This Subject
                      </label>
                      {availableSections.length > 0 && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => setFormSections([...availableSections])}
                            className="text-[9px] font-bold px-2 py-0.5 rounded-md transition-all"
                            style={{
                              color: "var(--text-2)",
                              background: "var(--input-bg)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            Select All
                          </button>
                          <button
                            onClick={() => setFormSections([])}
                            className="text-[9px] font-bold px-2 py-0.5 rounded-md transition-all"
                            style={{
                              color: "var(--text-2)",
                              background: "var(--input-bg)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableSections.length > 0 ? (
                        availableSections.map((sec) => (
                          <button
                            key={sec}
                            onClick={() => toggleSection(sec)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                            style={{
                              background: formSections.includes(sec)
                                ? "var(--pill-bg)"
                                : "var(--input-bg)",
                              color: formSections.includes(sec)
                                ? "var(--pill-text)"
                                : "var(--text-2)",
                              border: `2px solid ${formSections.includes(sec)
                                  ? "var(--card-border)"
                                  : "var(--border)"
                                }`,
                            }}
                          >
                            {formSections.includes(sec) && (
                              <CheckCircle2
                                size={11}
                                className="inline mr-1"
                              />
                            )}
                            Sec {sec}
                          </button>
                        ))
                      ) : (
                        <p
                          className="text-[11px]"
                          style={{ color: "var(--text-3)" }}
                        >
                          Upload students first — sections will be auto-detected from the Excel.
                        </p>
                      )}
                    </div>
                    {formSections.length > 0 && (
                      <p
                        className="text-[10px] font-semibold mt-2"
                        style={{ color: "var(--text-3)" }}
                      >
                        {formSections.length === availableSections.length
                          ? "All sections selected"
                          : `${formSections.length} of ${availableSections.length} sections`}
                        {" · "}
                        {
                          Object.values(data.students).filter((s) =>
                            formSections.includes(s.section)
                          ).length
                        }{" "}
                        students
                      </p>
                    )}
                  </div>
                )}

                {/* Elective: Upload Enrollment */}
                {formType === "elective" && (
                  <div>
                    <label
                      className="block text-[10px] font-bold uppercase tracking-wider mb-2"
                      style={{ color: "var(--text-3)" }}
                    >
                      Enrolled Students (via Excel Upload)
                    </label>

                    <div
                      className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all hover:opacity-70"
                      style={{
                        borderColor: formEnrolled.length > 0
                          ? "rgba(139,92,246,0.4)"
                          : "var(--border)",
                        background: formEnrolled.length > 0
                          ? "rgba(139,92,246,0.04)"
                          : "var(--input-bg)",
                      }}
                      onClick={() => electiveFileRef.current?.click()}
                    >
                      {formEnrolled.length > 0 ? (
                        <>
                          <CheckCircle2
                            size={24}
                            className="mx-auto mb-2"
                            style={{ color: "#8b5cf6" }}
                          />
                          <p
                            className="text-sm font-black"
                            style={{ color: "#8b5cf6" }}
                          >
                            {formEnrolled.length} students enrolled
                          </p>
                          <p
                            className="text-[10px] mt-1"
                            style={{ color: "var(--text-3)" }}
                          >
                            Click to upload a different file
                          </p>
                        </>
                      ) : (
                        <>
                          <FileSpreadsheet
                            size={24}
                            className="mx-auto mb-2"
                            style={{ color: "var(--text-3)" }}
                          />
                          <p
                            className="text-xs font-bold"
                            style={{ color: "var(--text-1)" }}
                          >
                            Upload Elective Allocation Excel
                          </p>
                          <p
                            className="text-[10px] mt-1"
                            style={{ color: "var(--text-3)" }}
                          >
                            Excel with &quot;Registration No&quot; column for
                            students taking this elective
                          </p>
                        </>
                      )}
                      <input
                        ref={electiveFileRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleElectiveUpload(file);
                        }}
                      />
                    </div>

                    {enrollUploadStatus && (
                      <p
                        className="text-[11px] font-semibold mt-2"
                        style={{ color: "var(--text-2)" }}
                      >
                        {enrollUploadStatus}
                      </p>
                    )}

                    <p
                      className="text-[10px] mt-2 p-2 rounded-lg"
                      style={{
                        color: "var(--text-3)",
                        background: "var(--input-bg)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <strong>Tip:</strong> Upload the PE/OE allocation
                      sheet from your department. The system will match
                      Registration Numbers against the master student list
                      for this year.
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowForm(false)}
                    className="pill-btn flex-1 text-xs py-2.5"
                    style={{
                      background: "var(--card-bg)",
                      color: "var(--text-1)",
                      border: "2px solid var(--card-border)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveSubject}
                    disabled={!formCode || !formName}
                    className="pill-btn flex-1 text-xs py-2.5"
                  >
                    <CheckCircle2 size={14} />
                    {editingId ? "Update" : "Add Subject"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
