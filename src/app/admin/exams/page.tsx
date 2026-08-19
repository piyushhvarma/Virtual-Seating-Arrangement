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
  FileSpreadsheet,
  Tag,
  Layers,
  FolderOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAdmin } from "@/providers/AdminProvider";
import type {
  Subject,
  SubjectType,
  ElectiveEnrollment,
  ElectiveGroup,
} from "@/lib/adminTypes";
import { generateId } from "@/lib/adminTypes";
import {
  REG_ALIASES,
  PE_ALIASES,
  looksLikeMujRegNo,
  pickField,
  detectRegCol,
  detectPeCol,
} from "@/lib/excelParser";

// ─── helper: group color ─────────────────────────────────────────────────────
const GROUP_COLORS = [
  { bg: "rgba(139,92,246,0.1)", text: "#8b5cf6", border: "rgba(139,92,246,0.3)" },
  { bg: "rgba(59,130,246,0.1)", text: "#3b82f6", border: "rgba(59,130,246,0.3)" },
  { bg: "rgba(16,185,129,0.1)", text: "#10b981", border: "rgba(16,185,129,0.3)" },
  { bg: "rgba(245,158,11,0.1)", text: "#f59e0b", border: "rgba(245,158,11,0.3)" },
  { bg: "rgba(239,68,68,0.1)", text: "#ef4444", border: "rgba(239,68,68,0.3)" },
  { bg: "rgba(236,72,153,0.1)", text: "#ec4899", border: "rgba(236,72,153,0.3)" },
];

function groupColor(idx: number) {
  return GROUP_COLORS[idx % GROUP_COLORS.length];
}

export default function ExamsPage() {
  const { data, setData, saveData, examMeta, saveExamMeta, yearLabel } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const electiveFileRef = useRef<HTMLInputElement>(null);

  // ── Group modal state ─────────────────────────────
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupNameError, setGroupNameError] = useState("");
  const isSavingGroup = useRef(false);
  // Expanded group IDs (collapsed/expanded in the groups list)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  // Expanded discrepancy detail panels (per group id in the coverage section)
  const [expandedDiscrepancy, setExpandedDiscrepancy] = useState<Set<string>>(new Set());
  const toggleDiscrepancy = (groupId: string) =>
    setExpandedDiscrepancy((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId); else next.add(groupId);
      return next;
    });

  // ── Subject form state ───────────────────────────
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("1:30 PM – 4:30 PM");
  const [formType, setFormType] = useState<SubjectType>("core");
  const [formSections, setFormSections] = useState<string[]>([]);
  const [formEnrolled, setFormEnrolled] = useState<ElectiveEnrollment[]>([]);
  const [enrollUploadStatus, setEnrollUploadStatus] = useState<string | null>(null);
  // Which group this subject belongs to (group id or "")
  const [formGroupId, setFormGroupId] = useState<string>("");

  // Available sections from student data
  const availableSections = useMemo(() => {
    const s = new Set<string>();
    Object.values(data.students).forEach((st) => {
      if (st.section) s.add(st.section);
    });
    return [...s].sort();
  }, [data.students]);

  const electiveGroups: ElectiveGroup[] = data.electiveGroups ?? [];

  // ── Meta Editor ────────────────────────────────
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

  // ── Group CRUD ──────────────────────────────────
  const openGroupModal = (group?: ElectiveGroup) => {
    if (group) {
      setEditingGroupId(group.id);
      setGroupName(group.name);
    } else {
      setEditingGroupId(null);
      setGroupName("");
    }
    setGroupNameError("");
    isSavingGroup.current = false;
    setShowGroupModal(true);
  };

  const saveGroup = async () => {
    const trimmed = groupName.trim();
    if (!trimmed) return;
    // Guard against double-submit (rapid Enter presses)
    if (isSavingGroup.current) return;
    isSavingGroup.current = true;

    // Duplicate name check (case-insensitive, skip self when renaming)
    const isDuplicate = electiveGroups.some(
      (g) => g.name.trim().toLowerCase() === trimmed.toLowerCase() && g.id !== editingGroupId
    );
    if (isDuplicate) {
      setGroupNameError(`A group named "${trimmed}" already exists.`);
      isSavingGroup.current = false;
      return;
    }
    setGroupNameError("");

    const groups = [...electiveGroups];
    if (editingGroupId) {
      const idx = groups.findIndex((g) => g.id === editingGroupId);
      if (idx !== -1) groups[idx] = { ...groups[idx], name: trimmed };
    } else {
      groups.push({ id: generateId(), name: trimmed, subjectIds: [] });
    }

    const newData = { ...data, electiveGroups: groups };
    setData(newData);
    await saveData(newData);
    setShowGroupModal(false);
    isSavingGroup.current = false;
  };

  const deleteGroup = async (groupId: string) => {
    const groups = electiveGroups.filter((g) => g.id !== groupId);
    const newData = { ...data, electiveGroups: groups };
    setData(newData);
    await saveData(newData);
  };

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  // ── Subject CRUD ────────────────────────────────
  /** Returns the shared date+time from any existing subject in a group, or null */
  const getGroupDateTime = (groupId: string): { date: string; time: string } | null => {
    if (!groupId) return null;
    const group = electiveGroups.find((g) => g.id === groupId);
    if (!group || group.subjectIds.length === 0) return null;
    const sibling = data.subjects.find((s) => group.subjectIds.includes(s.id));
    return sibling ? { date: sibling.date, time: sibling.time } : null;
  };

  const openForm = (subject?: Subject, preGroupId?: string) => {
    if (subject) {
      setEditingId(subject.id);
      setFormCode(subject.code);
      setFormName(subject.name);
      setFormDate(subject.date);
      setFormTime(subject.time);
      setFormType(subject.type || "core");
      setFormSections([...subject.sections]);
      setFormEnrolled([...(subject.enrolledStudents || [])]);
      // Find which group this subject belongs to
      const ownerGroup = electiveGroups.find((g) => g.subjectIds.includes(subject.id));
      setFormGroupId(ownerGroup?.id ?? "");
    } else {
      setEditingId(null);
      setFormCode("");
      setFormName("");
      // Auto-fill date/time from any existing sibling in the pre-selected group
      const groupDT = preGroupId ? getGroupDateTime(preGroupId) : null;
      setFormDate(groupDT?.date ?? "");
      setFormTime(groupDT?.time ?? "1:30 PM \u2013 4:30 PM");
      setFormType(preGroupId ? "elective" : "core");
      setFormSections([...availableSections]);
      setFormEnrolled([]);
      setFormGroupId(preGroupId ?? "");
    }
    setEnrollUploadStatus(null);
    setShowForm(true);
  };

  const toggleSection = (sec: string) => {
    setFormSections((prev) =>
      prev.includes(sec) ? prev.filter((s) => s !== sec) : [...prev, sec]
    );
  };

  // ── Elective enrollment Excel upload ──────────────
  const handleElectiveUpload = useCallback(
    async (file: File) => {
      setEnrollUploadStatus("Parsing...");
      try {
        const XLSX = await import("xlsx");
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });

        const enrolledMap = new Map<string, string>();
        let colWarning: string | null = null;

        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const rawRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" });
          if (rawRows.length === 0) continue;

          let headerRowIdx = -1;
          for (let i = 0; i < Math.min(rawRows.length, 20); i++) {
            const row = rawRows[i];
            if (!Array.isArray(row)) continue;
            const hasRegAlias = row.some((cell) => {
              const val = String(cell).trim().toLowerCase();
              return REG_ALIASES.some((a) => a.toLowerCase() === val);
            });
            if (hasRegAlias) { headerRowIdx = i; break; }
          }

          let rows: Record<string, any>[] = [];
          if (headerRowIdx !== -1) {
            const headers = rawRows[headerRowIdx].map((c, idx) => String(c).trim() || `__EMPTY_${idx}`);
            for (let i = headerRowIdx + 1; i < rawRows.length; i++) {
              const rowArr = rawRows[i];
              if (!Array.isArray(rowArr)) continue;
              const rowObj: Record<string, any> = {};
              rowArr.forEach((cell, idx) => { if (idx < headers.length) rowObj[headers[idx]] = cell; });
              rows.push(rowObj);
            }
          } else {
            rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
          }
          if (rows.length === 0) continue;

          const detectedRegCol = detectRegCol(rows);
          if (!detectedRegCol) {
            colWarning = (colWarning ? colWarning + " | " : "") + `Sheet "${sheetName}": no reg-no col found.`;
            continue;
          }
          const detectedPeCol = detectPeCol(rows, detectedRegCol);
          if (!detectedPeCol) {
            colWarning = (colWarning ? colWarning + " | " : "") + `Sheet "${sheetName}": no section col found.`;
          }
          for (const row of rows) {
            const raw = pickField(row, [detectedRegCol, ...REG_ALIASES]).toUpperCase();
            if (!raw || !looksLikeMujRegNo(raw)) continue;
            const aliasesToTry = detectedPeCol ? [detectedPeCol, ...PE_ALIASES] : PE_ALIASES;
            const peSection = pickField(row, aliasesToTry).toUpperCase() || "";
            enrolledMap.set(raw, peSection);
          }
        }

        const enrolledArr: ElectiveEnrollment[] = [...enrolledMap.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([regNo, peSection]) => ({ regNo, peSection }));
        setFormEnrolled(enrolledArr);

        if (colWarning) {
          setEnrollUploadStatus(`⚠️ ${colWarning}`);
        } else {
          const matched = enrolledArr.filter((e) => data.students[e.regNo]).length;
          const sectionCounts = new Map<string, number>();
          enrolledArr.forEach((e) => {
            const s = e.peSection || "(no section)";
            sectionCounts.set(s, (sectionCounts.get(s) ?? 0) + 1);
          });
          const secSummary = [...sectionCounts.entries()].map(([s, n]) => `${s}=${n}`).join(", ");
          setEnrollUploadStatus(
            `✅ ${enrolledArr.length} students loaded (${matched} in master list) • sections: ${secSummary || "none"}`
          );
        }
      } catch (err) {
        setEnrollUploadStatus(`❌ Error: ${err instanceof Error ? err.message : "Failed to parse"}`);
      }
    },
    [data.students]
  );

  const saveSubject = async () => {
    if (!formCode || !formName) return;

    const subjectData: Omit<Subject, "id"> = {
      code: formCode,
      name: formName,
      date: formDate,
      time: formTime,
      type: formType,
      electiveCategory: undefined,
      sections: formType === "core" ? formSections.sort() : [],
      enrolledStudents: formType === "elective" ? formEnrolled : [],
    };

    const newSubjects = [...data.subjects];
    let subjectId: string;

    if (editingId) {
      const idx = newSubjects.findIndex((s) => s.id === editingId);
      if (idx !== -1) newSubjects[idx] = { ...newSubjects[idx], ...subjectData };
      subjectId = editingId;
    } else {
      subjectId = generateId();
      newSubjects.push({ id: subjectId, ...subjectData });
    }

    // Update group membership
    let newGroups = electiveGroups.map((g) => {
      const withoutThis = g.subjectIds.filter((sid) => sid !== subjectId);
      if (g.id === formGroupId) {
        return { ...g, subjectIds: [...withoutThis, subjectId] };
      }
      return { ...g, subjectIds: withoutThis };
    });

    // Sync date+time to all siblings in the same group (PE subjects share one slot)
    if (formGroupId) {
      const targetGroup = newGroups.find((g) => g.id === formGroupId);
      if (targetGroup) {
        targetGroup.subjectIds.forEach((sid) => {
          if (sid === subjectId) return; // already updated above
          const idx = newSubjects.findIndex((s) => s.id === sid);
          if (idx !== -1) {
            newSubjects[idx] = { ...newSubjects[idx], date: formDate, time: formTime };
          }
        });
      }
    }

    const newData = { ...data, subjects: newSubjects, electiveGroups: newGroups };
    setData(newData);
    await saveData(newData);
    setShowForm(false);
  };

  const deleteSubject = async (id: string) => {
    const newSubjects = data.subjects.filter((s) => s.id !== id);
    const newRooms = data.roomAssignments.filter((r) => r.subjectId !== id);
    // Remove from any groups
    const newGroups = electiveGroups.map((g) => ({
      ...g,
      subjectIds: g.subjectIds.filter((sid) => sid !== id),
    }));
    const newData = { ...data, subjects: newSubjects, roomAssignments: newRooms, electiveGroups: newGroups };
    setData(newData);
    await saveData(newData);
  };

  const countStudents = (subject: Subject) => {
    if (subject.type === "elective" && subject.enrolledStudents?.length > 0) {
      return subject.enrolledStudents.filter((e) => data.students[e.regNo]).length;
    }
    return Object.values(data.students).filter((s) => subject.sections.includes(s.section)).length;
  };

  const countAssigned = (subject: Subject) => {
    const rooms = data.roomAssignments.filter((r) => r.subjectId === subject.id);
    const assigned = new Set<string>();
    rooms.forEach((r) => r.assignments.forEach((a) => assigned.add(a.regNo)));
    return assigned.size;
  };

  // ── Global elective coverage (all elective subjects combined) ──
  const electiveCoverage = useMemo(() => {
    const electiveSubjects = data.subjects.filter((s) => s.type === "elective");
    if (electiveSubjects.length === 0) return null;
    const covered = new Set<string>();
    electiveSubjects.forEach((s) => s.enrolledStudents.forEach((e) => covered.add(e.regNo)));
    const allRegNos = Object.keys(data.students);
    const uncovered = allRegNos.filter((r) => !covered.has(r));
    return { covered: covered.size, total: allRegNos.length, uncovered };
  }, [data.subjects, data.students]);

  // ── Per-group coverage validation ──────────────────
  // Rule: within one PE group, every master student must appear in EXACTLY ONE subject.
  //   - Missing  = in master list but not enrolled in any subject of this group
  //   - Duplicate = in more than one subject of this group
  const groupCoverage = useMemo(() => {
    const allRegNos = Object.keys(data.students);
    if (allRegNos.length === 0 || electiveGroups.length === 0) return [];

    return electiveGroups.map((group) => {
      const groupSubjects = group.subjectIds
        .map((sid) => data.subjects.find((s) => s.id === sid))
        .filter(Boolean) as Subject[];

      // Only run check if at least one subject has enrollment data
      const hasEnrollment = groupSubjects.some((s) => s.enrolledStudents.length > 0);
      if (!hasEnrollment) return { group, ok: null, missing: [], duplicates: [] };

      // Count how many subjects each student appears in within this group
      const countMap = new Map<string, number>();
      groupSubjects.forEach((s) => {
        s.enrolledStudents.forEach((e) => {
          countMap.set(e.regNo, (countMap.get(e.regNo) ?? 0) + 1);
        });
      });

      const missing = allRegNos.filter((r) => !countMap.has(r));
      const duplicates = [...countMap.entries()]
        .filter(([, cnt]) => cnt > 1)
        .map(([regNo]) => regNo);

      const ok = missing.length === 0 && duplicates.length === 0;
      return { group, ok, missing, duplicates };
    });
  }, [electiveGroups, data.subjects, data.students]);

  // ── Ungrouped subjects ─────────────────────────
  const groupedSubjectIds = new Set(electiveGroups.flatMap((g) => g.subjectIds));
  const ungroupedSubjects = data.subjects.filter((s) => !groupedSubjectIds.has(s.id));

  // ─── Subject card ──────────────────────────────
  function SubjectCard({
    subject,
    delay = 0,
    groupColor: gc,
  }: {
    subject: Subject;
    delay?: number;
    groupColor?: { bg: string; text: string; border: string };
  }) {
    const total = countStudents(subject);
    const assigned = countAssigned(subject);
    const progress = total > 0 ? Math.round((assigned / total) * 100) : 0;
    const isElective = subject.type === "elective";

    return (
      <motion.div
        className="card p-4 space-y-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="badge-dark text-[10px]">{subject.code}</span>
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                style={{
                  background: gc ? gc.bg : isElective ? "rgba(139,92,246,0.1)" : "rgba(59,130,246,0.1)",
                  color: gc ? gc.text : isElective ? "#8b5cf6" : "#3b82f6",
                  border: `1px solid ${gc ? gc.border : isElective ? "rgba(139,92,246,0.3)" : "rgba(59,130,246,0.3)"}`,
                }}
              >
                {isElective ? "ELECTIVE" : "CORE"}
              </span>
            </div>
            <h3
              className="text-sm font-black leading-tight"
              style={{ color: "var(--text-1)", fontFamily: "var(--font-head)" }}
            >
              {subject.name}
            </h3>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => openForm(subject)}
              className="p-1.5 rounded-lg transition-all hover:opacity-70"
              style={{ color: "var(--text-2)", background: "var(--input-bg)", border: "1px solid var(--border)" }}
            >
              <Edit3 size={11} />
            </button>
            <button
              onClick={() => deleteSubject(subject.id)}
              className="p-1.5 rounded-lg transition-all hover:opacity-70"
              style={{ color: "#ef4444", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-[10px]">
          <div className="flex items-center gap-1" style={{ color: "var(--text-2)" }}>
            <Calendar size={10} />
            <span className="font-semibold">{subject.date || "No date"}</span>
          </div>
          <div className="flex items-center gap-1" style={{ color: "var(--text-2)" }}>
            <Clock size={10} />
            <span className="font-semibold">{subject.time}</span>
          </div>
          <div className="flex items-center gap-1" style={{ color: "var(--text-2)" }}>
            <Users size={10} />
            <span className="font-semibold">{total} students</span>
          </div>
        </div>

        {/* Sections / PE breakdown */}
        <div className="flex flex-wrap gap-1">
          {isElective ? (() => {
            const secMap = new Map<string, number>();
            (subject.enrolledStudents || []).forEach((e) => {
              const s = e.peSection || "(no sec)";
              secMap.set(s, (secMap.get(s) ?? 0) + 1);
            });
            const entries = [...secMap.entries()];
            if (entries.length === 0) return (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                style={{ background: "rgba(139,92,246,0.08)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.2)" }}
              >
                {subject.enrolledStudents?.length || 0} enrolled
              </span>
            );
            return entries.map(([sec, count]) => (
              <span
                key={sec}
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                style={{ background: "rgba(139,92,246,0.08)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.2)" }}
              >
                PE-{sec}: {count}
              </span>
            ));
          })() : (
            <>
              {subject.sections.map((sec) => (
                <span key={sec} className="badge-light text-[9px]">Sec {sec}</span>
              ))}
              {subject.sections.length === 0 && (
                <span className="text-[9px] font-semibold" style={{ color: "var(--text-3)" }}>No sections</span>
              )}
            </>
          )}
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-[9px] font-bold mb-1">
            <span style={{ color: "var(--text-3)" }}>Seats Assigned</span>
            <span style={{ color: progress === 100 ? "#10b981" : "var(--text-2)" }}>
              {assigned}/{total} ({progress}%)
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: progress === 100 ? "#10b981" : "var(--text-1)" }}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1
          className="text-2xl font-black tracking-tight"
          style={{ color: "var(--text-1)", fontFamily: "var(--font-head, sans-serif)" }}
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
        <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text-2)", fontFamily: "var(--font-head)" }}>
          Session Info
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Title", value: metaTitle, setter: setMetaTitle },
            { label: "Department", value: metaDept, setter: setMetaDept },
            { label: "Season", value: metaSeason, setter: setMetaSeason },
          ].map(({ label, value, setter }) => (
            <div key={label}>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>
                {label}
              </label>
              <input
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none"
                style={{ border: "1.5px solid var(--border)", background: "var(--input-bg)", color: "var(--text-1)" }}
              />
            </div>
          ))}
        </div>
        <button
          onClick={saveMeta}
          className="pill-btn text-xs px-4 py-2"
          style={{ background: "var(--card-bg)", color: "var(--text-1)", border: "2px solid var(--card-border)" }}
        >
          <Save size={13} /> Save Session Info
        </button>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          ELECTIVE GROUPS SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <div>
          <h2
            className="text-lg font-black"
            style={{ color: "var(--text-1)", fontFamily: "var(--font-head, sans-serif)" }}
          >
            <Layers size={16} className="inline mr-1.5 mb-0.5" />
            Elective Groups ({electiveGroups.length})
          </h2>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>
            Create PE / OE groups first, then add subjects inside them.
          </p>
        </div>
        <motion.button
          className="pill-btn text-xs px-4 py-2"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => openGroupModal()}
        >
          <Plus size={14} /> Add Group
        </motion.button>
      </motion.div>

      {electiveGroups.length === 0 ? (
        <motion.div
          className="card p-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <FolderOpen size={28} className="mx-auto mb-2" style={{ color: "var(--text-3)" }} />
          <p className="text-sm font-bold" style={{ color: "var(--text-3)" }}>
            No elective groups yet. Start by adding PE1, PE2, etc.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {electiveGroups.map((group, gi) => {
            const gc = groupColor(gi);
            const groupSubjects = group.subjectIds
              .map((sid) => data.subjects.find((s) => s.id === sid))
              .filter(Boolean) as Subject[];
            const isExpanded = expandedGroups.has(group.id);

            return (
              <motion.div
                key={group.id}
                className="card overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + gi * 0.05 }}
              >
                {/* Group header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => toggleGroupExpand(group.id)}
                  style={{ borderBottom: isExpanded ? "1px solid var(--border)" : "none" }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-black px-3 py-1 rounded-full"
                      style={{ background: gc.bg, color: gc.text, border: `1.5px solid ${gc.border}` }}
                    >
                      {group.name}
                    </span>
                    <span className="text-[11px] font-semibold" style={{ color: "var(--text-3)" }}>
                      {groupSubjects.length} subject{groupSubjects.length !== 1 ? "s" : ""}
                    </span>
                    {/* Subject name chips (collapsed preview) */}
                    {!isExpanded && groupSubjects.map((s) => (
                      <span
                        key={s.id}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md hidden sm:inline-block"
                        style={{ background: gc.bg, color: gc.text, border: `1px solid ${gc.border}` }}
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); openForm(undefined, group.id); }}
                      className="pill-btn text-[10px] px-2.5 py-1"
                      title="Add subject to this group"
                    >
                      <Plus size={11} /> Add Subject
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openGroupModal(group); }}
                      className="p-1.5 rounded-lg transition-all hover:opacity-70"
                      style={{ color: "var(--text-2)", background: "var(--input-bg)", border: "1px solid var(--border)" }}
                      title="Rename group"
                    >
                      <Edit3 size={11} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteGroup(group.id); }}
                      className="p-1.5 rounded-lg transition-all hover:opacity-70"
                      style={{ color: "#ef4444", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}
                      title="Delete group"
                    >
                      <Trash2 size={11} />
                    </button>
                    <span style={{ color: "var(--text-3)" }}>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  </div>
                </div>

                {/* Expanded subject cards */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 pt-3"
                    >
                      {groupSubjects.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-[11px] font-semibold" style={{ color: "var(--text-3)" }}>
                            No subjects yet — click "Add Subject" above.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {groupSubjects.map((subject, si) => (
                            <SubjectCard
                              key={subject.id}
                              subject={subject}
                              delay={si * 0.04}
                              groupColor={gc}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          ALL SUBJECTS SECTION (flat list — includes ungrouped + shows all)
      ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <h2
          className="text-lg font-black"
          style={{ color: "var(--text-1)", fontFamily: "var(--font-head, sans-serif)" }}
        >
          All Subjects ({data.subjects.length})
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
          const ownerGroupIdx = electiveGroups.findIndex((g) => g.subjectIds.includes(subject.id));
          const gc = ownerGroupIdx >= 0 ? groupColor(ownerGroupIdx) : undefined;
          return (
            <SubjectCard
              key={subject.id}
              subject={subject}
              delay={0.12 + i * 0.04}
              groupColor={gc}
            />
          );
        })}
      </div>

      {data.subjects.length === 0 && (
        <motion.div className="card p-10 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <BookOpen size={32} className="mx-auto mb-3" style={{ color: "var(--text-3)" }} />
          <p className="text-sm font-bold" style={{ color: "var(--text-3)" }}>
            No subjects yet. Add your exam subjects to get started.
          </p>
        </motion.div>
      )}

      {/* Coverage Check */}
      {electiveCoverage && (
        <motion.div className="card p-5 space-y-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider" style={{ color: "var(--text-2)", fontFamily: "var(--font-head)" }}>
              Elective Coverage Check
            </h2>
            <span
              className="text-[11px] font-bold px-2 py-1 rounded-lg"
              style={{
                background: electiveCoverage.uncovered.length === 0 ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                color: electiveCoverage.uncovered.length === 0 ? "#10b981" : "#f59e0b",
                border: `1px solid ${electiveCoverage.uncovered.length === 0 ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
              }}
            >
              {electiveCoverage.covered}/{electiveCoverage.total} students covered
            </span>
          </div>
          {electiveCoverage.uncovered.length === 0 ? (
            <p className="text-sm font-semibold" style={{ color: "#10b981" }}>
              ✅ All {electiveCoverage.total} students enrolled in at least one elective.
            </p>
          ) : (
            <>
              <p className="text-[11px] font-semibold" style={{ color: "#f59e0b" }}>
                ⚠️ {electiveCoverage.uncovered.length} students not enrolled in any elective:
              </p>
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                {electiveCoverage.uncovered.map((regNo) => (
                  <span
                    key={regNo}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                    style={{
                      background: "rgba(245,158,11,0.08)",
                      color: "#f59e0b",
                      border: "1px solid rgba(245,158,11,0.2)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {regNo}
                  </span>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* ══ PE GROUP COVERAGE VALIDATION ══════════════════════════════════════
          Rule: within each PE group, every master student must appear in
          exactly ONE subject (no missing, no duplicates).
      ══════════════════════════════════════════════════════════════════════ */}
      {groupCoverage.filter((gc) => gc.ok !== null).length > 0 && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2
            className="text-sm font-black uppercase tracking-wider"
            style={{ color: "var(--text-2)", fontFamily: "var(--font-head)" }}
          >
            PE Group Coverage Validation
          </h2>
          <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
            Each student must be enrolled in exactly one subject per group. Missing = not in any subject · Duplicate = in more than one.
          </p>

          {groupCoverage
            .filter((gc) => gc.ok !== null)
            .map(({ group, ok, missing, duplicates }, gi) => {
              const totalStudents = Object.keys(data.students).length;
              const coveredCount = totalStudents - missing.length;
              const hasIssues = !ok;

              return (
                <motion.div
                  key={group.id}
                  className="card p-5 space-y-3"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.05 }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-black px-2.5 py-1 rounded-full"
                        style={{
                          background: groupColor(gi).bg,
                          color: groupColor(gi).text,
                          border: `1.5px solid ${groupColor(gi).border}`,
                        }}
                      >
                        {group.name}
                      </span>
                      <span className="text-[11px] font-semibold" style={{ color: "var(--text-3)" }}>
                        {group.subjectIds.map((sid) => data.subjects.find((s) => s.id === sid)?.name).filter(Boolean).join(" + ")}
                      </span>
                    </div>
                    <span
                      className="text-[11px] font-bold px-2 py-1 rounded-lg"
                      style={{
                        background: ok ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                        color: ok ? "#10b981" : "#ef4444",
                        border: `1px solid ${ok ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                      }}
                    >
                      {ok ? "✅ Complete" : `${coveredCount}/${totalStudents} covered`}
                    </span>
                  </div>

                  {ok ? (
                    <p className="text-sm font-semibold" style={{ color: "#10b981" }}>
                      ✅ All {totalStudents} students are enrolled in exactly one subject of {group.name}. No duplicates.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {/* Summary line */}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-3 text-[11px] font-semibold">
                          {missing.length > 0 && (
                            <span style={{ color: "#ef4444" }}>
                              ❌ {missing.length} missing
                            </span>
                          )}
                          {duplicates.length > 0 && (
                            <span style={{ color: "#f59e0b" }}>
                              ⚠️ {duplicates.length} duplicate{duplicates.length !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => toggleDiscrepancy(group.id)}
                          className="text-[10px] font-black px-3 py-1 rounded-lg transition-all hover:opacity-80 flex items-center gap-1"
                          style={{
                            background: expandedDiscrepancy.has(group.id) ? "rgba(239,68,68,0.1)" : "var(--input-bg)",
                            color: expandedDiscrepancy.has(group.id) ? "#ef4444" : "var(--text-2)",
                            border: `1.5px solid ${expandedDiscrepancy.has(group.id) ? "rgba(239,68,68,0.35)" : "var(--border)"}`,
                          }}
                        >
                          {expandedDiscrepancy.has(group.id) ? "▲ Hide" : "▼ See Discrepancies"}
                        </button>
                      </div>

                      {/* Expandable detail table */}
                      <AnimatePresence>
                        {expandedDiscrepancy.has(group.id) && (() => {
                          // Build unified row list: missing + duplicates
                          type DiscrepancyRow = { regNo: string; name: string; section: string; issues: { label: string; color: string; bg: string }[] };
                          const rowMap = new Map<string, DiscrepancyRow>();

                          missing.forEach((regNo) => {
                            const st = data.students[regNo];
                            rowMap.set(regNo, {
                              regNo,
                              name: st?.name ?? "—",
                              section: st?.section ?? "—",
                              issues: [{ label: `Missing in ${group.name}`, color: "#ef4444", bg: "rgba(239,68,68,0.1)" }],
                            });
                          });

                          duplicates.forEach((regNo) => {
                            const st = data.students[regNo];
                            // Find which subjects they appear in within this group
                            const groupSubjectNames = group.subjectIds
                              .map((sid) => data.subjects.find((s) => s.id === sid))
                              .filter(Boolean)
                              .filter((s) => s!.enrolledStudents.some((e) => e.regNo === regNo))
                              .map((s) => s!.name);
                            const existing = rowMap.get(regNo);
                            const dupeIssue = { label: `Duplicate in ${group.name} (${groupSubjectNames.join(", ")})`, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" };
                            if (existing) {
                              existing.issues.push(dupeIssue);
                            } else {
                              rowMap.set(regNo, {
                                regNo,
                                name: st?.name ?? "—",
                                section: st?.section ?? "—",
                                issues: [dupeIssue],
                              });
                            }
                          });

                          const rows = [...rowMap.values()].sort((a, b) => a.regNo.localeCompare(b.regNo));

                          return (
                            <motion.div
                              key="disc-table"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.18 }}
                              style={{ overflow: "hidden" }}
                            >
                              <div
                                className="rounded-xl overflow-hidden"
                                style={{ border: "1px solid var(--border)", background: "var(--input-bg)" }}
                              >
                                {/* Table header */}
                                <div
                                  className="grid text-[9px] font-black uppercase tracking-wider px-3 py-2"
                                  style={{
                                    gridTemplateColumns: "1fr 2fr 60px 2fr",
                                    color: "var(--text-3)",
                                    borderBottom: "1px solid var(--border)",
                                    background: "var(--card-bg)",
                                  }}
                                >
                                  <span>Reg No</span>
                                  <span>Name</span>
                                  <span>Sec</span>
                                  <span>Issue</span>
                                </div>
                                {/* Rows */}
                                <div className="max-h-64 overflow-y-auto divide-y" style={{ borderColor: "var(--border)" }}>
                                  {rows.map((row) => (
                                    <div
                                      key={row.regNo}
                                      className="grid items-start px-3 py-2 gap-1"
                                      style={{ gridTemplateColumns: "1fr 2fr 60px 2fr" }}
                                    >
                                      <span
                                        className="text-[10px] font-bold"
                                        style={{ color: "var(--text-1)", fontFamily: "var(--font-mono)" }}
                                      >
                                        {row.regNo}
                                      </span>
                                      <span className="text-[10px] font-semibold" style={{ color: "var(--text-1)" }}>
                                        {row.name}
                                      </span>
                                      <span className="text-[10px] font-semibold" style={{ color: "var(--text-2)" }}>
                                        {row.section}
                                      </span>
                                      <div className="flex flex-col gap-1">
                                        {row.issues.map((issue, ii) => (
                                          <span
                                            key={ii}
                                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-md w-fit"
                                            style={{
                                              background: issue.bg,
                                              color: issue.color,
                                              border: `1px solid ${issue.color}44`,
                                            }}
                                          >
                                            {issue.label}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div
                                  className="px-3 py-1.5 text-[10px] font-semibold"
                                  style={{ color: "var(--text-3)", borderTop: "1px solid var(--border)" }}
                                >
                                  {rows.length} student{rows.length !== 1 ? "s" : ""} with discrepancies · Re-upload the allocation Excel to fix.
                                </div>
                              </div>
                            </motion.div>
                          );
                        })()}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              );
            })}
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          ADD / EDIT GROUP MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showGroupModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGroupModal(false)}
          >
            <motion.div
              className="card p-6 w-full max-w-sm"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black" style={{ color: "var(--text-1)", fontFamily: "var(--font-head)" }}>
                  {editingGroupId ? "Rename Group" : "Add Elective Group"}
                </h2>
                <button onClick={() => setShowGroupModal(false)} style={{ color: "var(--text-3)" }}>
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>
                    Group Name
                  </label>
                  <input
                    autoFocus
                    placeholder="e.g. PE1, PE2, OE1"
                    value={groupName}
                    onChange={(e) => { setGroupName(e.target.value); setGroupNameError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveGroup(); } }}
                    className="w-full rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none"
                    style={{
                      border: `2px solid ${groupNameError ? "#ef4444" : "var(--card-border)"}`,
                      background: "var(--input-bg)",
                      color: "var(--text-1)",
                    }}
                  />
                  {groupNameError ? (
                    <p className="text-[10px] mt-1.5 font-bold" style={{ color: "#ef4444" }}>
                      ⚠ {groupNameError}
                    </p>
                  ) : (
                    <p className="text-[10px] mt-1.5" style={{ color: "var(--text-3)" }}>
                      A short name like "PE1" or "Program Elective 1". You can add subjects to this group after saving.
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowGroupModal(false)}
                    className="pill-btn flex-1 text-xs py-2.5"
                    style={{ background: "var(--card-bg)", color: "var(--text-1)", border: "2px solid var(--card-border)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveGroup}
                    disabled={!groupName.trim()}
                    className="pill-btn flex-1 text-xs py-2.5"
                  >
                    <CheckCircle2 size={14} />
                    {editingGroupId ? "Save" : "Create Group"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════════
          ADD / EDIT SUBJECT MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
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
              className="card p-6 w-full max-w-md max-h-[88vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black" style={{ color: "var(--text-1)", fontFamily: "var(--font-head)" }}>
                  {editingId ? "Edit Subject" : "Add Subject"}
                </h2>
                <button onClick={() => setShowForm(false)} style={{ color: "var(--text-3)" }}>
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Subject Type Toggle */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-3)" }}>
                    Subject Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setFormType("core"); setFormSections([...availableSections]); }}
                      className="flex-1 px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      style={{
                        background: formType === "core" ? "rgba(59,130,246,0.1)" : "var(--input-bg)",
                        color: formType === "core" ? "#3b82f6" : "var(--text-2)",
                        border: `2px solid ${formType === "core" ? "#3b82f6" : "var(--border)"}`,
                      }}
                    >
                      <Users size={13} /> Core
                      <span className="text-[9px] font-normal" style={{ opacity: 0.6 }}>(by section)</span>
                    </button>
                    <button
                      onClick={() => { setFormType("elective"); setFormSections([]); }}
                      className="flex-1 px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      style={{
                        background: formType === "elective" ? "rgba(139,92,246,0.1)" : "var(--input-bg)",
                        color: formType === "elective" ? "#8b5cf6" : "var(--text-2)",
                        border: `2px solid ${formType === "elective" ? "#8b5cf6" : "var(--border)"}`,
                      }}
                    >
                      <Tag size={13} /> Elective
                      <span className="text-[9px] font-normal" style={{ opacity: 0.6 }}>(by student)</span>
                    </button>
                  </div>
                </div>

                {/* Belongs to PE Group dropdown */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>
                    Belongs to Group (Optional)
                  </label>
                  <select
                    value={formGroupId}
                    onChange={(e) => {
                      const gid = e.target.value;
                      setFormGroupId(gid);
                      // Auto-fill date+time from any existing sibling when switching to a group
                      const groupDT = getGroupDateTime(gid);
                      if (groupDT) {
                        setFormDate(groupDT.date);
                        setFormTime(groupDT.time);
                      }
                    }}
                    className="w-full rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none appearance-none cursor-pointer border-2"
                    style={{ borderColor: "var(--card-border)", background: "var(--input-bg)", color: "var(--text-1)" }}
                  >
                    <option value="">— None / Ungrouped —</option>
                    {electiveGroups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  {formGroupId && (() => {
                    const groupDT = getGroupDateTime(formGroupId);
                    return groupDT ? (
                      <p className="text-[10px] mt-1 font-semibold" style={{ color: "var(--text-3)" }}>
                        📅 Date &amp; time locked to group: <strong>{groupDT.date}</strong> · <strong>{groupDT.time}</strong>
                      </p>
                    ) : null;
                  })()}
                </div>



                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>
                      Subject Code
                    </label>
                    <input
                      placeholder="e.g. AIM3201"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                      className="w-full rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none"
                      style={{ border: "2px solid var(--card-border)", background: "var(--input-bg)", color: "var(--text-1)", fontFamily: "var(--font-mono)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>
                      Exam Date
                    </label>
                    <input
                      placeholder="DD-MM-YYYY"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none"
                      style={{ border: "2px solid var(--card-border)", background: "var(--input-bg)", color: "var(--text-1)" }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>
                    Subject Name
                  </label>
                  <input
                    placeholder="e.g. Deep Learning"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none"
                    style={{ border: "2px solid var(--card-border)", background: "var(--input-bg)", color: "var(--text-1)" }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>
                    Exam Time
                  </label>
                  <input
                    placeholder="e.g. 1:30 PM – 4:30 PM"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none"
                    style={{ border: "2px solid var(--card-border)", background: "var(--input-bg)", color: "var(--text-1)" }}
                  />
                </div>

                {/* Core: Section Picker */}
                {formType === "core" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
                        Sections Taking This Subject
                      </label>
                      {availableSections.length > 0 && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => setFormSections([...availableSections])}
                            className="text-[9px] font-bold px-2 py-0.5 rounded-md transition-all"
                            style={{ color: "var(--text-2)", background: "var(--input-bg)", border: "1px solid var(--border)" }}
                          >
                            Select All
                          </button>
                          <button
                            onClick={() => setFormSections([])}
                            className="text-[9px] font-bold px-2 py-0.5 rounded-md transition-all"
                            style={{ color: "var(--text-2)", background: "var(--input-bg)", border: "1px solid var(--border)" }}
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
                              background: formSections.includes(sec) ? "var(--pill-bg)" : "var(--input-bg)",
                              color: formSections.includes(sec) ? "var(--pill-text)" : "var(--text-2)",
                              border: `2px solid ${formSections.includes(sec) ? "var(--card-border)" : "var(--border)"}`,
                            }}
                          >
                            {formSections.includes(sec) && <CheckCircle2 size={11} className="inline mr-1" />}
                            Sec {sec}
                          </button>
                        ))
                      ) : (
                        <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
                          Upload students first — sections will be auto-detected.
                        </p>
                      )}
                    </div>
                    {formSections.length > 0 && (
                      <p className="text-[10px] font-semibold mt-2" style={{ color: "var(--text-3)" }}>
                        {formSections.length === availableSections.length ? "All sections selected" : `${formSections.length} of ${availableSections.length} sections`}
                        {" · "}
                        {Object.values(data.students).filter((s) => formSections.includes(s.section)).length} students
                      </p>
                    )}
                  </div>
                )}

                {/* Elective: Upload Enrollment */}
                {formType === "elective" && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-3)" }}>
                      Enrolled Students (via Excel Upload)
                    </label>
                    <div
                      className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all hover:opacity-70"
                      style={{
                        borderColor: formEnrolled.length > 0 ? "rgba(139,92,246,0.4)" : "var(--border)",
                        background: formEnrolled.length > 0 ? "rgba(139,92,246,0.04)" : "var(--input-bg)",
                      }}
                      onClick={() => electiveFileRef.current?.click()}
                    >
                      {formEnrolled.length > 0 ? (
                        <>
                          <CheckCircle2 size={24} className="mx-auto mb-2" style={{ color: "#8b5cf6" }} />
                          <p className="text-sm font-black" style={{ color: "#8b5cf6" }}>
                            {formEnrolled.length} students enrolled
                          </p>
                          <p className="text-[10px] mt-1" style={{ color: "var(--text-3)" }}>Click to upload a different file</p>
                        </>
                      ) : (
                        <>
                          <FileSpreadsheet size={24} className="mx-auto mb-2" style={{ color: "var(--text-3)" }} />
                          <p className="text-xs font-bold" style={{ color: "var(--text-1)" }}>Upload Elective Allocation Excel</p>
                          <p className="text-[10px] mt-1" style={{ color: "var(--text-3)" }}>
                            Excel with &quot;Registration No&quot; column
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
                      <p className="text-[11px] font-semibold mt-2" style={{ color: "var(--text-2)" }}>
                        {enrollUploadStatus}
                      </p>
                    )}
                    <p
                      className="text-[10px] mt-2 p-2 rounded-lg"
                      style={{ color: "var(--text-3)", background: "var(--input-bg)", border: "1px solid var(--border)" }}
                    >
                      <strong>Expected columns:</strong>{" "}
                      <span style={{ fontFamily: "var(--font-mono)" }}>Registration No</span>
                      {" "}+{" "}
                      <span style={{ fontFamily: "var(--font-mono)" }}>PE Section</span>
                      . Column names are auto-detected.
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowForm(false)}
                    className="pill-btn flex-1 text-xs py-2.5"
                    style={{ background: "var(--card-bg)", color: "var(--text-1)", border: "2px solid var(--card-border)" }}
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
